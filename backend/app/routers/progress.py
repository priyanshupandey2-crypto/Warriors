"""
Course progress and enrollment tracking endpoints
"""

from fastapi import APIRouter, HTTPException, status, Depends, Request
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from app.database import get_db
from app.models.user_course import UserCourse
from app.models.lesson import Lesson
from app.models.user_lesson_progress import UserLessonProgress
from app.models.course import Course
from app.models.quiz import Quiz, QuizSubmission
from app.schemas.progress_schemas import (
    CourseEnrollRequest,
    CourseEnrollResponse,
    UserEnrolledCourses,
    UserCourseProgress,
    CourseProgressResponse,
    LessonProgressCreate,
    LessonCompletionRequest,
    LessonProgress,
    LessonRevisitRequest,
)
from datetime import datetime

router = APIRouter(prefix="/api/progress", tags=["progress"])


@router.post("/enroll", response_model=CourseEnrollResponse)
def enroll_in_course(
    request_body: CourseEnrollRequest,
    request: Request,
    db: Session = Depends(get_db),
):
    """Enroll user in a course."""
    current_user = getattr(request.state, "user", None)
    if not current_user:
        raise HTTPException(status_code=401, detail="User not authenticated")

    user_id = int(current_user.get("sub"))
    course_id = request_body.course_id

    # Check if course exists
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    # Check if already enrolled
    existing = db.query(UserCourse).filter(
        UserCourse.user_id == user_id, UserCourse.course_id == course_id
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail="Already enrolled in this course")

    # Get total lessons and quizzes in course
    total_lessons = db.query(Lesson).filter(Lesson.course_id == course_id).count()
    total_quizzes = db.query(Quiz).filter(Quiz.course_id == course_id).count()
    total_sections = total_lessons + total_quizzes

    # Create enrollment
    enrollment = UserCourse(
        user_id=user_id,
        course_id=course_id,
        status="ENROLLED",
        progress_percentage=0,
        completed_lessons=0,
        total_lessons=total_sections,
        enrolled_at=datetime.utcnow(),
    )

    db.add(enrollment)
    try:
        db.commit()
        db.refresh(enrollment)
    except IntegrityError as e:
        db.rollback()
        # Check if it's a foreign key violation for user_id
        if "user_id" in str(e):
            raise HTTPException(status_code=401, detail="User not found. Please log in again.")
        raise HTTPException(status_code=400, detail="Failed to enroll in course")

    return enrollment


@router.get("/my-courses", response_model=UserEnrolledCourses)
def get_user_enrolled_courses(request: Request, db: Session = Depends(get_db)):
    """Get all enrolled courses for the current user."""
    current_user = getattr(request.state, "user", None)
    if not current_user:
        raise HTTPException(status_code=401, detail="User not authenticated")

    user_id = int(current_user.get("sub"))

    # Get all enrollments
    enrollments = db.query(UserCourse).filter(UserCourse.user_id == user_id).all()

    # Build response with course details
    courses = []
    for enrollment in enrollments:
        course = db.query(Course).filter(Course.id == enrollment.course_id).first()
        if course:
            courses.append(
                UserCourseProgress(
                    id=enrollment.id,
                    course_id=enrollment.course_id,
                    course_title=course.title,
                    status=enrollment.status,
                    progress_percentage=enrollment.progress_percentage,
                    completed_lessons=enrollment.completed_lessons,
                    total_lessons=enrollment.total_lessons,
                    enrolled_at=enrollment.enrolled_at,
                    last_accessed_at=enrollment.last_accessed_at,
                    completed_at=enrollment.completed_at,
                )
            )

    enrolled_count = sum(1 for c in courses if c.status in ["ENROLLED", "IN_PROGRESS"])
    in_progress_count = sum(1 for c in courses if c.status == "IN_PROGRESS")
    completed_count = sum(1 for c in courses if c.status == "COMPLETED")

    return UserEnrolledCourses(
        enrolled_count=enrolled_count,
        in_progress_count=in_progress_count,
        completed_count=completed_count,
        courses=courses,
    )


@router.get("/course/{course_id}", response_model=CourseProgressResponse)
def get_course_progress(
    course_id: int, request: Request, db: Session = Depends(get_db)
):
    """Get progress for a specific course."""
    current_user = getattr(request.state, "user", None)
    if not current_user:
        raise HTTPException(status_code=401, detail="User not authenticated")

    user_id = int(current_user.get("sub"))

    # Get enrollment
    enrollment = db.query(UserCourse).filter(
        UserCourse.user_id == user_id, UserCourse.course_id == course_id
    ).first()

    if not enrollment:
        raise HTTPException(status_code=404, detail="Not enrolled in this course")

    # Get course
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    # Get lesson progress
    lesson_progress = db.query(UserLessonProgress).filter(
        UserLessonProgress.user_id == user_id,
        UserLessonProgress.course_id == course_id,
    ).all()

    return CourseProgressResponse(
        course_id=course_id,
        course_title=course.title,
        status=enrollment.status,
        progress_percentage=enrollment.progress_percentage,
        completed_lessons=enrollment.completed_lessons,
        total_lessons=enrollment.total_lessons,
        lesson_progress=[LessonProgress.from_orm(lp) for lp in lesson_progress],
    )


@router.post("/lesson/complete")
def mark_lesson_complete(
    request_body: LessonCompletionRequest,
    request: Request,
    db: Session = Depends(get_db),
):
    """Mark a lesson as complete."""
    current_user = getattr(request.state, "user", None)
    if not current_user:
        raise HTTPException(status_code=401, detail="User not authenticated")

    user_id = int(current_user.get("sub"))
    lesson_id = request_body.lesson_id

    # Get lesson
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")

    # Get or create lesson progress
    progress = db.query(UserLessonProgress).filter(
        UserLessonProgress.user_id == user_id, UserLessonProgress.lesson_id == lesson_id
    ).first()

    if not progress:
        progress = UserLessonProgress(
            user_id=user_id,
            lesson_id=lesson_id,
            course_id=lesson.course_id,
            is_completed=True,
            completed_at=datetime.utcnow(),
            time_spent_minutes=request_body.time_spent_minutes,
        )
        db.add(progress)
    else:
        progress.is_completed = True
        progress.completed_at = datetime.utcnow()
        progress.time_spent_minutes += request_body.time_spent_minutes

    db.commit()

    # Update course progress (count lessons + passed quizzes)
    all_lessons = db.query(Lesson).filter(Lesson.course_id == lesson.course_id).all()
    all_quizzes = db.query(Quiz).filter(Quiz.course_id == lesson.course_id).all()

    # Count completed lessons
    completed_lessons = db.query(UserLessonProgress).filter(
        UserLessonProgress.user_id == user_id,
        UserLessonProgress.course_id == lesson.course_id,
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
        UserCourse.user_id == user_id, UserCourse.course_id == lesson.course_id
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

    return {
        "status": "success",
        "message": "Lesson marked as complete",
        "progress_percentage": int(progress_percentage),
        "completed_lessons": completed_sections,
        "total_lessons": total_sections,
    }


@router.get("/lesson/{lesson_id}/progress")
def get_lesson_progress(
    lesson_id: int, request: Request, db: Session = Depends(get_db)
):
    """Get progress for a specific lesson."""
    current_user = getattr(request.state, "user", None)
    if not current_user:
        raise HTTPException(status_code=401, detail="User not authenticated")

    user_id = int(current_user.get("sub"))

    progress = db.query(UserLessonProgress).filter(
        UserLessonProgress.user_id == user_id, UserLessonProgress.lesson_id == lesson_id
    ).first()

    if not progress:
        return {
            "is_completed": False,
            "time_spent_minutes": 0,
            "completed_at": None,
            "marked_to_revisit": False,
            "revisit_marked_at": None,
        }

    return {
        "is_completed": progress.is_completed,
        "time_spent_minutes": progress.time_spent_minutes,
        "completed_at": progress.completed_at,
        "marked_to_revisit": progress.marked_to_revisit,
        "revisit_marked_at": progress.revisit_marked_at,
    }


@router.post("/lesson/revisit")
def toggle_lesson_revisit(
    request_body: LessonRevisitRequest,
    request: Request,
    db: Session = Depends(get_db),
):
    """Mark or unmark a lesson to revisit later."""
    current_user = getattr(request.state, "user", None)
    if not current_user:
        raise HTTPException(status_code=401, detail="User not authenticated")

    user_id = int(current_user.get("sub"))
    lesson_id = request_body.lesson_id

    # Get lesson
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")

    # Get or create lesson progress
    progress = db.query(UserLessonProgress).filter(
        UserLessonProgress.user_id == user_id, UserLessonProgress.lesson_id == lesson_id
    ).first()

    if not progress:
        progress = UserLessonProgress(
            user_id=user_id,
            lesson_id=lesson_id,
            course_id=lesson.course_id,
            marked_to_revisit=request_body.marked_to_revisit,
            revisit_marked_at=datetime.utcnow() if request_body.marked_to_revisit else None,
        )
        db.add(progress)
    else:
        progress.marked_to_revisit = request_body.marked_to_revisit
        progress.revisit_marked_at = datetime.utcnow() if request_body.marked_to_revisit else None

    db.commit()

    return {
        "status": "success",
        "message": "Lesson marked for revisit" if request_body.marked_to_revisit else "Revisit mark removed",
        "marked_to_revisit": request_body.marked_to_revisit,
    }
