from fastapi import APIRouter, HTTPException, status, Depends, Request
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.lesson import Lesson
from app.models.quiz import Quiz, QuizQuestion, QuestionOption, QuizSubmission
from app.models.course import Course
from app.schemas.classroom_schemas import (
    LessonContent,
    QuizStructure,
    QuizQuestion as QuizQuestionSchema,
    QuestionOption as QuestionOptionSchema
)
from app.utils.jwt_handler import get_current_user
from typing import List, Dict, Any
from datetime import datetime

router = APIRouter(prefix="/api/classroom", tags=["classroom"])


@router.get("/{course_id}", response_model=Dict[str, Any])
def get_classroom_workspace(course_id: int, db: Session = Depends(get_db)):
    """Get complete classroom workspace for a course."""
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Course {course_id} not found"
        )

    lessons = db.query(Lesson).filter(Lesson.course_id == course_id).order_by(Lesson.order).all()
    quizzes = db.query(Quiz).filter(Quiz.course_id == course_id).all()

    return {
        "course_id": str(course.id),
        "course_title": course.title,
        "lessons": [
            {
                "id": str(lesson.id),
                "title": lesson.title,
                "order": lesson.order,
                "content_markdown": lesson.content_markdown or "",
                "duration_minutes": lesson.duration_minutes,
                "learning_objectives": lesson.learning_objectives.split(",") if lesson.learning_objectives else [],
                "key_concepts": lesson.key_concepts.split(",") if lesson.key_concepts else []
            }
            for lesson in lessons
        ],
        "quizzes": [
            {
                "id": str(quiz.id),
                "title": quiz.title,
                "description": quiz.description,
                "passing_score": quiz.passing_score,
                "total_points": quiz.total_points,
                "questions": []
            }
            for quiz in quizzes
        ],
        "assessments": [],
        "capstone": {},
        "progress": {}
    }


@router.get("/{course_id}/lessons", response_model=List[LessonContent])
def get_course_lessons(course_id: int, db: Session = Depends(get_db)) -> List[LessonContent]:
    """Get all lessons in a course."""
    lessons = db.query(Lesson).filter(Lesson.course_id == course_id).order_by(Lesson.order).all()

    if not lessons:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No lessons found for course {course_id}"
        )

    return [
        LessonContent(
            id=str(lesson.id),
            title=lesson.title,
            order=lesson.order,
            content_markdown=lesson.content_markdown or "",
            duration_minutes=lesson.duration_minutes,
            learning_objectives=lesson.learning_objectives.split(",") if lesson.learning_objectives else [],
            key_concepts=lesson.key_concepts.split(",") if lesson.key_concepts else []
        )
        for lesson in lessons
    ]


@router.get("/{course_id}/lessons/{lesson_id}", response_model=LessonContent)
def get_lesson_content(course_id: int, lesson_id: int, db: Session = Depends(get_db)) -> LessonContent:
    """Get specific lesson content with markdown."""
    lesson = db.query(Lesson).filter(
        Lesson.id == lesson_id,
        Lesson.course_id == course_id
    ).first()

    if not lesson:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Lesson {lesson_id} not found"
        )

    return LessonContent(
        id=str(lesson.id),
        title=lesson.title,
        order=lesson.order,
        content_markdown=lesson.content_markdown or "",
        duration_minutes=lesson.duration_minutes,
        learning_objectives=lesson.learning_objectives.split(",") if lesson.learning_objectives else [],
        key_concepts=lesson.key_concepts.split(",") if lesson.key_concepts else []
    )


@router.get("/{course_id}/quizzes", response_model=List[QuizStructure])
def get_course_quizzes(course_id: int, db: Session = Depends(get_db)) -> List[QuizStructure]:
    """Get all quizzes in a course."""
    quizzes = db.query(Quiz).filter(Quiz.course_id == course_id).all()

    return [
        QuizStructure(
            id=str(quiz.id),
            title=quiz.title,
            description=quiz.description or "",
            questions=[],
            passing_score=quiz.passing_score,
            total_points=quiz.total_points
        )
        for quiz in quizzes
    ]


@router.get("/{course_id}/quizzes/{quiz_id}", response_model=QuizStructure)
def get_quiz(course_id: int, quiz_id: int, db: Session = Depends(get_db)) -> QuizStructure:
    """Get specific quiz with questions."""
    quiz = db.query(Quiz).filter(
        Quiz.id == quiz_id,
        Quiz.course_id == course_id
    ).first()

    if not quiz:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Quiz {quiz_id} not found"
        )

    questions = db.query(QuizQuestion).filter(QuizQuestion.quiz_id == quiz_id).all()

    return QuizStructure(
        id=str(quiz.id),
        title=quiz.title,
        description=quiz.description or "",
        questions=[
            QuizQuestionSchema(
                id=str(q.id),
                question_text=q.question_text,
                question_type=q.question_type,
                options=[
                    QuestionOptionSchema(
                        id=str(opt.id),
                        text=opt.text,
                        is_correct=False
                    )
                    for opt in q.options
                ],
                explanation=None,
                difficulty=q.difficulty
            )
            for q in questions
        ],
        passing_score=quiz.passing_score,
        total_points=quiz.total_points
    )


@router.post("/{course_id}/quizzes/{quiz_id}/submit", response_model=dict)
def submit_quiz(
    course_id: int,
    quiz_id: int,
    answers: Dict[str, Any],
    request: Request,
    db: Session = Depends(get_db)
) -> dict:
    """Submit quiz answers and evaluate."""
    current_user = getattr(request.state, "user", None)
    if not current_user:
        raise HTTPException(status_code=401, detail="User not authenticated")
    user_id = int(current_user.get("sub"))

    quiz = db.query(Quiz).filter(
        Quiz.id == quiz_id,
        Quiz.course_id == course_id
    ).first()

    if not quiz:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Quiz {quiz_id} not found"
        )

    questions = db.query(QuizQuestion).filter(QuizQuestion.quiz_id == quiz_id).all()

    score = 0
    points_per_question = quiz.total_points // len(questions) if questions else 0

    for question in questions:
        question_id = str(question.id)
        if question_id in answers:
            selected_option_id = answers[question_id]
            correct_option = db.query(QuestionOption).filter(
                QuestionOption.question_id == question.id,
                QuestionOption.is_correct == True
            ).first()

            if correct_option and str(correct_option.id) == selected_option_id:
                score += points_per_question

    passed = score >= quiz.passing_score

    submission = QuizSubmission(
        user_id=user_id,
        quiz_id=quiz_id,
        score=score,
        passed=passed,
        submitted_at=datetime.utcnow()
    )

    db.add(submission)
    db.commit()
    db.refresh(submission)

    return {
        "status": "submitted",
        "quiz_id": quiz_id,
        "score": score,
        "passing_score": quiz.passing_score,
        "passed": passed,
        "feedback": "Great job! You passed the quiz." if passed else "Please review the material and try again."
    }


@router.post("/{course_id}/capstone/start", response_model=dict)
def start_capstone(course_id: int, db: Session = Depends(get_db), current_user: Dict[str, Any] = Depends(get_current_user)) -> dict:
    """Start working on capstone project."""
    user_id = int(current_user.get("sub"))

    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Course {course_id} not found"
        )

    return {
        "status": "started",
        "capstone_id": f"capstone-{course_id}",
        "started_at": datetime.utcnow().isoformat(),
        "deadline": "2026-07-21T23:59:59Z"
    }


@router.post("/{course_id}/capstone/submit", response_model=dict)
def submit_capstone(
    course_id: int,
    submission_data: Dict[str, Any],
    db: Session = Depends(get_db),
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> dict:
    """Submit capstone project."""
    user_id = int(current_user.get("sub"))

    return {
        "status": "submitted",
        "capstone_id": f"capstone-{course_id}",
        "submitted_at": datetime.utcnow().isoformat(),
        "message": "Capstone submitted successfully. Review will be completed within 5 days."
    }


@router.post("/progress/complete", response_model=dict)
def mark_lesson_complete(
    course_id: int,
    lesson_id: int,
    db: Session = Depends(get_db),
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> dict:
    """Mark a lesson as complete."""
    user_id = int(current_user.get("sub"))

    lesson = db.query(Lesson).filter(
        Lesson.id == lesson_id,
        Lesson.course_id == course_id
    ).first()

    if not lesson:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Lesson {lesson_id} not found"
        )

    return {
        "status": "success",
        "lesson_id": lesson_id,
        "course_id": course_id,
        "completed_at": datetime.utcnow().isoformat(),
        "points_earned": 10,
        "message": "Lesson marked as complete!"
    }


@router.post("/bookmarks/toggle", response_model=dict)
def toggle_bookmark(
    lesson_id: int,
    course_id: int,
    notes: str = "",
    db: Session = Depends(get_db),
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> dict:
    """Toggle bookmark for a lesson."""
    user_id = int(current_user.get("sub"))

    lesson = db.query(Lesson).filter(
        Lesson.id == lesson_id,
        Lesson.course_id == course_id
    ).first()

    if not lesson:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Lesson {lesson_id} not found"
        )

    return {
        "status": "bookmarked",
        "lesson_id": lesson_id,
        "course_id": course_id,
        "bookmarked_at": datetime.utcnow().isoformat(),
        "notes": notes
    }


@router.get("/bookmarks/", response_model=List[Dict[str, Any]])
def get_bookmarks(
    db: Session = Depends(get_db),
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> List[Dict[str, Any]]:
    """Get all bookmarked lessons for user."""
    user_id = int(current_user.get("sub"))

    return []
