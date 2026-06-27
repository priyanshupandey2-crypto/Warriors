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
from datetime import datetime, timedelta

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
    import sys
    for enrollment in enrollments:
        course = db.query(Course).filter(Course.id == enrollment.course_id).first()
        if course:
            sys.stderr.write(f"DEBUG: Course {course.id} title: {course.title} thumbnail_url: {course.thumbnail_url}\n")
            sys.stderr.flush()
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
                    thumbnail_url=course.thumbnail_url,
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


@router.get("/upcoming-sections")
def get_upcoming_sections(request: Request, db: Session = Depends(get_db)):
    """Get incomplete lessons and quizzes from enrolled courses."""
    current_user = getattr(request.state, "user", None)
    if not current_user:
        raise HTTPException(status_code=401, detail="User not authenticated")

    user_id = int(current_user.get("sub"))

    # Get all enrolled courses
    enrollments = db.query(UserCourse).filter(UserCourse.user_id == user_id).all()

    upcoming = []

    for enrollment in enrollments:
        course = db.query(Course).filter(Course.id == enrollment.course_id).first()
        if not course:
            continue

        # Get all lessons for this course
        lessons = db.query(Lesson).filter(Lesson.course_id == course.id).all()
        for lesson in lessons:
            # Check if lesson is incomplete
            progress = db.query(UserLessonProgress).filter(
                UserLessonProgress.user_id == user_id,
                UserLessonProgress.lesson_id == lesson.id,
                UserLessonProgress.is_completed == True,
            ).first()

            if not progress:
                upcoming.append({
                    "id": lesson.id,
                    "type": "lesson",
                    "title": lesson.title,
                    "courseName": course.title,
                    "icon": "description",
                })

        # Get all quizzes for this course
        quizzes = db.query(Quiz).filter(Quiz.course_id == course.id).all()
        for quiz in quizzes:
            # Check if quiz has ANY passing submission (even if there are failed attempts)
            passed_submission = db.query(QuizSubmission).filter(
                QuizSubmission.user_id == user_id,
                QuizSubmission.quiz_id == quiz.id,
                QuizSubmission.passed == True,
            ).order_by(QuizSubmission.submitted_at.desc()).first()

            # Only add quiz to upcoming if user has never passed it
            if not passed_submission:
                upcoming.append({
                    "id": quiz.id,
                    "type": "quiz",
                    "title": quiz.title,
                    "courseName": course.title,
                    "icon": "quiz",
                })

    # Return only first 2 items
    return upcoming[:2]


@router.get("/streak")
def get_user_streak(request: Request, db: Session = Depends(get_db)):
    """Get current learning streak (consecutive days with activity)."""
    current_user = getattr(request.state, "user", None)
    if not current_user:
        raise HTTPException(status_code=401, detail="User not authenticated")

    user_id = int(current_user.get("sub"))

    # Get all activity dates (completed lessons and passed quizzes)
    today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)

    # Get completed lessons
    completed_lessons = db.query(UserLessonProgress).filter(
        UserLessonProgress.user_id == user_id,
        UserLessonProgress.is_completed == True,
    ).all()

    # Get passed quizzes
    passed_quizzes = db.query(QuizSubmission).filter(
        QuizSubmission.user_id == user_id,
        QuizSubmission.passed == True,
    ).all()

    # Collect all activity dates
    activity_dates = set()

    for lesson in completed_lessons:
        if lesson.completed_at:
            activity_dates.add(lesson.completed_at.replace(hour=0, minute=0, second=0, microsecond=0).date())

    for quiz in passed_quizzes:
        if quiz.submitted_at:
            activity_dates.add(quiz.submitted_at.replace(hour=0, minute=0, second=0, microsecond=0).date())

    # Calculate streak (count consecutive days backward from today)
    streak = 0
    current_date = today.date()

    while current_date in activity_dates:
        streak += 1
        current_date -= timedelta(days=1)

    return {
        "streak": streak,
        "last_activity_date": max(activity_dates) if activity_dates else None,
    }


@router.get("/total-learning-hours")
def get_total_learning_hours(request: Request, db: Session = Depends(get_db)):
    """Get total learning hours for the user based on estimated duration."""
    current_user = getattr(request.state, "user", None)
    if not current_user:
        raise HTTPException(status_code=401, detail="User not authenticated")

    user_id = int(current_user.get("sub"))

    # Get all completed lessons for the user
    completed_lessons = db.query(UserLessonProgress).filter(
        UserLessonProgress.user_id == user_id,
        UserLessonProgress.is_completed == True,
    ).all()

    # Get all passed quizzes for the user
    passed_quizzes = db.query(QuizSubmission).filter(
        QuizSubmission.user_id == user_id,
        QuizSubmission.passed == True,
    ).all()

    # Calculate total time from lessons
    lesson_minutes = 0
    for lesson_progress in completed_lessons:
        lesson = db.query(Lesson).filter(Lesson.id == lesson_progress.lesson_id).first()
        if lesson:
            lesson_minutes += lesson.duration_minutes or 0

    # Calculate total time from quizzes
    quiz_minutes = 0
    for quiz_submission in passed_quizzes:
        quiz = db.query(Quiz).filter(Quiz.id == quiz_submission.quiz_id).first()
        if quiz:
            quiz_minutes += quiz.duration_minutes or 0

    # Convert to hours
    total_minutes = lesson_minutes + quiz_minutes
    total_hours = total_minutes / 60

    return {
        "total_minutes": total_minutes,
        "total_hours": round(total_hours, 1),
    }


@router.get("/activity/last-7-days")
def get_last_7_days_activity(request: Request, db: Session = Depends(get_db)):
    """Get last 7 days activity with time spent per day."""
    current_user = getattr(request.state, "user", None)
    if not current_user:
        raise HTTPException(status_code=401, detail="User not authenticated")

    user_id = int(current_user.get("sub"))

    # Get last 7 days starting from today
    today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    seven_days_ago = today - timedelta(days=6)

    # Get completed lessons in last 7 days
    completed_lessons = db.query(UserLessonProgress).filter(
        UserLessonProgress.user_id == user_id,
        UserLessonProgress.is_completed == True,
        UserLessonProgress.completed_at >= seven_days_ago,
        UserLessonProgress.completed_at < today + timedelta(days=1),
    ).all()

    # Get completed quizzes in last 7 days
    completed_quizzes = db.query(QuizSubmission).filter(
        QuizSubmission.user_id == user_id,
        QuizSubmission.passed == True,
        QuizSubmission.submitted_at >= seven_days_ago,
        QuizSubmission.submitted_at < today + timedelta(days=1),
    ).all()

    # Initialize activity for each day (using dates as keys to avoid collisions)
    activity = {}
    for i in range(7):
        day = seven_days_ago + timedelta(days=i)
        activity[day.date()] = {"day": day.strftime("%a"), "mins": 0, "pct": 0}

    # Calculate time for lessons
    for lesson_progress in completed_lessons:
        day = lesson_progress.completed_at.replace(hour=0, minute=0, second=0, microsecond=0).date()
        lesson = db.query(Lesson).filter(Lesson.id == lesson_progress.lesson_id).first()
        if lesson and day in activity:
            activity[day]["mins"] += lesson.duration_minutes or 0

    # Calculate time for quizzes
    for quiz_submission in completed_quizzes:
        day = quiz_submission.submitted_at.replace(hour=0, minute=0, second=0, microsecond=0).date()
        quiz = db.query(Quiz).filter(Quiz.id == quiz_submission.quiz_id).first()
        if quiz and day in activity:
            activity[day]["mins"] += quiz.duration_minutes or 0

    # Calculate percentages (assume max 240 mins per day = 100%)
    max_mins = 240
    for day_data in activity.values():
        day_data["pct"] = min(int((day_data["mins"] / max_mins) * 100), 100)

    # Return in chronological order (7 days ago to today)
    result = [
        {
            "day": activity[date]["day"],
            "mins": activity[date]["mins"],
            "pct": activity[date]["pct"],
        }
        for date in sorted(activity.keys())
    ]

    return result
