"""
Course progress and enrollment tracking endpoints
"""

from fastapi import APIRouter, HTTPException, status, Depends, Request
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user_course import UserCourse
from app.models.lesson import Lesson
from app.models.user_lesson_progress import UserLessonProgress
from app.models.course import Course
from app.schemas.progress_schemas import (
    CourseEnrollRequest,
    CourseEnrollResponse,
    UserEnrolledCourses,
    UserCourseProgress,
    CourseProgressResponse,
    LessonProgressCreate,
    LessonCompletionRequest,
    LessonProgress,
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

    # Get total lessons in course
    total_lessons = db.query(Lesson).filter(Lesson.course_id == course_id).count()

    # Create enrollment
    enrollment = UserCourse(
        user_id=user_id,
        course_id=course_id,
        status="ENROLLED",
        progress_percentage=0,
        completed_lessons=0,
        total_lessons=total_lessons,
        enrolled_at=datetime.utcnow(),
    )

    db.add(enrollment)
    db.commit()
    db.refresh(enrollment)

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

    # Update course progress
    all_lessons = db.query(Lesson).filter(Lesson.course_id == lesson.course_id).all()
    completed_count = db.query(UserLessonProgress).filter(
        UserLessonProgress.user_id == user_id,
        UserLessonProgress.course_id == lesson.course_id,
        UserLessonProgress.is_completed == True,
    ).count()

    progress_percentage = (completed_count / len(all_lessons) * 100) if all_lessons else 0

    # Update enrollment
    enrollment = db.query(UserCourse).filter(
        UserCourse.user_id == user_id, UserCourse.course_id == lesson.course_id
    ).first()

    if enrollment:
        enrollment.completed_lessons = completed_count
        enrollment.progress_percentage = int(progress_percentage)
        enrollment.last_accessed_at = datetime.utcnow()

        # Mark as in progress if not already
        if enrollment.status == "ENROLLED":
            enrollment.status = "IN_PROGRESS"

        # Mark as completed if all lessons done
        if completed_count == len(all_lessons):
            enrollment.status = "COMPLETED"
            enrollment.completed_at = datetime.utcnow()

        db.commit()

    return {
        "status": "success",
        "message": "Lesson marked as complete",
        "progress_percentage": int(progress_percentage),
        "completed_lessons": completed_count,
        "total_lessons": len(all_lessons),
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
        }

    return {
        "is_completed": progress.is_completed,
        "time_spent_minutes": progress.time_spent_minutes,
        "completed_at": progress.completed_at,
    }
