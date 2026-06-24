"""
Quiz endpoints for course assessments
"""

from fastapi import APIRouter, HTTPException, status, Depends, Request
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from app.database import get_db
from app.models.quiz import Quiz, QuizQuestion, QuestionOption, QuizSubmission
from app.models.user_course import UserCourse
from app.models.lesson import Lesson
from datetime import datetime
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter(prefix="/api/quiz", tags=["quiz"])


class OptionResponse(BaseModel):
    id: int
    text: str
    is_correct: bool = False

    class Config:
        from_attributes = True


class QuestionResponse(BaseModel):
    id: int
    question_text: str
    question_type: str
    explanation: Optional[str]
    difficulty: str
    options: List[OptionResponse]

    class Config:
        from_attributes = True


class QuizResponse(BaseModel):
    id: int
    course_id: int
    title: str
    description: Optional[str]
    passing_score: int
    total_points: int
    questions: List[QuestionResponse]

    class Config:
        from_attributes = True


class QuizListResponse(BaseModel):
    id: int
    course_id: int
    title: str
    description: Optional[str]
    passing_score: int
    total_points: int
    question_count: int

    class Config:
        from_attributes = True


class AnswerSubmission(BaseModel):
    question_id: int
    selected_option_id: int


class QuizSubmissionRequest(BaseModel):
    quiz_id: int
    answers: List[AnswerSubmission]
    time_spent_minutes: int = 0


class QuizSubmissionResponse(BaseModel):
    id: int
    quiz_id: int
    score: int
    passed: bool
    total_points: int
    correct_answers: int
    submitted_at: datetime

    class Config:
        from_attributes = True


@router.get("/course/{course_id}")
def get_course_quizzes(course_id: int, db: Session = Depends(get_db)):
    """Get all quizzes for a course"""
    quizzes = db.query(Quiz).filter(Quiz.course_id == course_id).all()

    response = []
    for quiz in quizzes:
        response.append(
            QuizListResponse(
                id=quiz.id,
                course_id=quiz.course_id,
                title=quiz.title,
                description=quiz.description,
                passing_score=quiz.passing_score,
                total_points=quiz.total_points,
                question_count=len(quiz.questions),
            )
        )

    return response


@router.get("/{quiz_id}")
def get_quiz(quiz_id: int, db: Session = Depends(get_db)):
    """Get quiz with all questions and options"""
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()

    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")

    return QuizResponse.from_orm(quiz)


@router.post("/submit")
def submit_quiz(
    request_body: QuizSubmissionRequest,
    request: Request,
    db: Session = Depends(get_db),
):
    """Submit quiz answers and calculate score"""
    current_user = getattr(request.state, "user", None)
    if not current_user:
        raise HTTPException(status_code=401, detail="User not authenticated")

    user_id = int(current_user.get("sub"))
    quiz_id = request_body.quiz_id

    # Get quiz
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")

    # Check if user is enrolled in the course
    enrollment = db.query(UserCourse).filter(
        UserCourse.user_id == user_id, UserCourse.course_id == quiz.course_id
    ).first()

    if not enrollment:
        raise HTTPException(status_code=403, detail="Not enrolled in this course")

    # Calculate score
    correct_answers = 0
    total_questions = len(quiz.questions)

    for answer in request_body.answers:
        option = db.query(QuestionOption).filter(
            QuestionOption.id == answer.selected_option_id
        ).first()

        if option and option.is_correct:
            correct_answers += 1

    # Calculate percentage score
    score = int((correct_answers / total_questions * 100)) if total_questions > 0 else 0
    passed = score >= quiz.passing_score

    import sys
    sys.stderr.write(f"DEBUG: Quiz {quiz_id} - correct_answers={correct_answers}/{total_questions}, score={score}, passing_score={quiz.passing_score}, passed={passed}\n")
    sys.stderr.flush()

    # Create submission record
    submission = QuizSubmission(
        user_id=user_id,
        quiz_id=quiz_id,
        score=score,
        passed=passed,
        time_spent_minutes=request_body.time_spent_minutes,
        submitted_at=datetime.utcnow(),
    )

    db.add(submission)
    try:
        db.commit()
        db.refresh(submission)
        sys.stderr.write(f"DEBUG: Submission saved - ID={submission.id}, passed={submission.passed}\n")
        sys.stderr.flush()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=401, detail="User not found. Please log in again.")

    # Update course progress (count lessons + passed quizzes)
    all_lessons = db.query(Lesson).filter(Lesson.course_id == quiz.course_id).all()
    all_quizzes = db.query(Quiz).filter(Quiz.course_id == quiz.course_id).all()

    # Count completed lessons
    from app.models.user_lesson_progress import UserLessonProgress
    completed_lessons = db.query(UserLessonProgress).filter(
        UserLessonProgress.user_id == user_id,
        UserLessonProgress.course_id == quiz.course_id,
        UserLessonProgress.is_completed == True,
    ).count()

    # Count passed quizzes
    completed_quizzes = db.query(QuizSubmission).filter(
        QuizSubmission.user_id == user_id,
        QuizSubmission.quiz_id.in_([q.id for q in all_quizzes]),
        QuizSubmission.passed == True,
    ).count()

    total_sections = len(all_lessons) + len(all_quizzes)
    completed_sections = completed_lessons + completed_quizzes
    progress_percentage = (completed_sections / total_sections * 100) if total_sections > 0 else 0

    # Update enrollment
    enrollment = db.query(UserCourse).filter(
        UserCourse.user_id == user_id, UserCourse.course_id == quiz.course_id
    ).first()

    if enrollment:
        enrollment.completed_lessons = completed_sections
        enrollment.total_lessons = total_sections
        enrollment.progress_percentage = int(progress_percentage)
        enrollment.last_accessed_at = datetime.utcnow()

        # Mark as in progress if not already
        if enrollment.status == "ENROLLED":
            enrollment.status = "IN_PROGRESS"

        # Mark as completed if all sections done
        if completed_sections == total_sections:
            enrollment.status = "COMPLETED"
            enrollment.completed_at = datetime.utcnow()

        db.commit()

    return QuizSubmissionResponse(
        id=submission.id,
        quiz_id=submission.quiz_id,
        score=submission.score,
        passed=submission.passed,
        total_points=quiz.total_points,
        correct_answers=correct_answers,
        submitted_at=submission.submitted_at,
    )


@router.get("/{quiz_id}/my-submission")
def get_my_quiz_submission(
    quiz_id: int, request: Request, db: Session = Depends(get_db)
):
    """Get user's last submission for a quiz"""
    current_user = getattr(request.state, "user", None)
    if not current_user:
        raise HTTPException(status_code=401, detail="User not authenticated")

    user_id = int(current_user.get("sub"))

    submission = (
        db.query(QuizSubmission)
        .filter(QuizSubmission.user_id == user_id, QuizSubmission.quiz_id == quiz_id)
        .order_by(QuizSubmission.submitted_at.desc())
        .first()
    )

    if not submission:
        return None

    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()

    import sys
    sys.stderr.write(f"DEBUG: get_my_submission for quiz {quiz_id} - submission ID={submission.id}, passed={submission.passed}, score={submission.score}\n")
    sys.stderr.flush()

    return QuizSubmissionResponse(
        id=submission.id,
        quiz_id=submission.quiz_id,
        score=submission.score,
        passed=submission.passed,
        total_points=quiz.total_points,
        correct_answers=int(submission.score / 100 * len(quiz.questions)),
        submitted_at=submission.submitted_at,
    )
