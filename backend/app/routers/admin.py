from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database import get_db
from app.utils.dependencies import get_admin_user
from app.utils.audit import log_audit
from app.logger import get_logger

logger = get_logger(__name__)
router = APIRouter(prefix="/api/admin", tags=["admin"])


class CourseUpdateRequest(BaseModel):
    title: str
    description: str
    difficulty: str
    duration_hours: int
    category: str
    thumbnail_url: str = ""
    modules: list = []

    model_config = {"extra": "ignore"}


class LessonRequest(BaseModel):
    title: str
    content_markdown: str
    duration_minutes: int
    learning_objectives: str
    key_concepts: str


class QuizRequest(BaseModel):
    title: str
    description: str
    passing_score: int
    total_points: int
    duration_minutes: int


class SubmissionReviewRequest(BaseModel):
    status: str
    feedback: str


class DeletionRequest(BaseModel):
    feedback: str = ""


class AdminAction(BaseModel):
    action: str
    message: str


@router.get("/dashboard")
def admin_dashboard(admin: dict = Depends(get_admin_user)):
    """
    Admin-only dashboard endpoint.
    Only accessible by users with admin role.
    """
    logger.info(f"Admin dashboard accessed by: {admin.get('email')}")
    return {
        "message": "Welcome to admin dashboard",
        "admin_email": admin.get("email"),
        "user_id": admin.get("sub")
    }


@router.get("/users-count")
def get_users_count(admin: dict = Depends(get_admin_user), db: Session = Depends(get_db)):
    """
    Admin-only endpoint to get total users count.
    Only accessible by users with admin role.
    """
    from app.models.user import User

    try:
        total_users = db.query(User).count()

        logger.info(f"Admin {admin.get('email')} accessed users count")
        return {
            "total_users": total_users,
            "accessed_by": admin.get("email")
        }
    except Exception as e:
        logger.error(f"Error getting users count: {str(e)}")
        return {"error": "Failed to get users count"}


@router.post("/action")
def admin_action(action: AdminAction, admin: dict = Depends(get_admin_user)):
    """
    Admin-only endpoint to perform admin actions.
    Only accessible by users with admin role.
    """
    logger.info(f"Admin action '{action.action}' performed by: {admin.get('email')}")
    return {
        "status": "success",
        "action": action.action,
        "message": action.message,
        "performed_by": admin.get("email")
    }


@router.get("/info")
def admin_info(admin: dict = Depends(get_admin_user)):
    """
    Get admin user information.
    Only accessible by users with admin role.
    """
    return {
        "role": "admin",
        "email": admin.get("email"),
        "user_id": admin.get("sub")
    }


@router.get("/test")
def admin_test(admin: dict = Depends(get_admin_user)):
    """
    Test endpoint to verify admin protection is working.
    Only accessible by users with admin role.

    Returns full JWT payload to verify role and other claims.
    """
    logger.info(f"Admin test endpoint accessed by: {admin.get('email')}")
    return {
        "status": "success",
        "message": "Admin protection is working!",
        "jwt_claims": {
            "user_id": admin.get("sub"),
            "email": admin.get("email"),
            "role": admin.get("role"),
            "issued_at": admin.get("iat"),
            "expires_at": admin.get("exp")
        }
    }


@router.get("/dashboard-stats")
def get_dashboard_stats(admin: dict = Depends(get_admin_user), db: Session = Depends(get_db)):
    """
    Get admin dashboard statistics.
    Only accessible by users with admin role.
    """
    from app.models.course import Course
    from app.models.user import User
    from app.models.user_course import UserCourse
    from app.models.user_lesson_progress import UserLessonProgress
    from sqlalchemy import func

    try:
        # Total courses
        total_courses = db.query(Course).count()

        # Total enrollments
        total_enrollments = db.query(UserCourse).count()

        # Average completion rate
        completion_rates = db.query(
            func.avg(UserCourse.progress_percentage).label("avg_completion")
        ).first()
        avg_completion = round(completion_rates.avg_completion or 0, 1)

        logger.info(f"Admin {admin.get('email')} accessed dashboard stats")
        return {
            "total_courses": total_courses,
            "total_enrollments": total_enrollments,
            "avg_completion": avg_completion
        }
    except Exception as e:
        logger.error(f"Error getting dashboard stats: {str(e)}", exc_info=True)
        return {
            "error": "Failed to get dashboard stats",
            "total_courses": 0,
            "total_enrollments": 0,
            "avg_completion": 0
        }


@router.get("/courses")
def get_admin_courses(
    skip: int = 0,
    limit: int = 9,
    search: str = "",
    difficulty: str = "",
    category: str = "",
    admin: dict = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """
    Get paginated courses for admin dashboard with optional search and filters.
    Only accessible by users with admin role.

    Args:
        skip: Number of courses to skip (for pagination)
        limit: Number of courses to return per page (default 9)
        search: Search query to filter courses by title, category, or difficulty
        difficulty: Filter by difficulty level (Beginner, Intermediate, Advanced)
        category: Filter by category (Computer Science, Business & Strategy, etc.)
    """
    from app.models.course import Course
    from app.models.user_course import UserCourse
    from sqlalchemy import func

    try:
        # Build base query
        base_query = db.query(
            Course.id,
            Course.title,
            Course.category,
            Course.difficulty,
            Course.thumbnail_url,
            func.count(UserCourse.id).label("enrollments"),
            func.avg(UserCourse.progress_percentage).label("avg_completion")
        ).outerjoin(
            UserCourse, Course.id == UserCourse.course_id
        )

        # Apply search filter if provided
        if search:
            search_lower = search.lower()
            base_query = base_query.filter(
                (Course.title.ilike(f"%{search_lower}%")) |
                (Course.category.ilike(f"%{search_lower}%")) |
                (Course.difficulty.ilike(f"%{search_lower}%"))
            )

        # Apply difficulty filter if provided
        if difficulty:
            base_query = base_query.filter(Course.difficulty.ilike(difficulty))

        # Apply category filter if provided
        if category:
            base_query = base_query.filter(Course.category.ilike(category))

        # Get total count of filtered courses
        total_courses = db.query(
            func.count(func.distinct(Course.id))
        ).outerjoin(
            UserCourse, Course.id == UserCourse.course_id
        )

        if search:
            search_lower = search.lower()
            total_courses = total_courses.filter(
                (Course.title.ilike(f"%{search_lower}%")) |
                (Course.category.ilike(f"%{search_lower}%")) |
                (Course.difficulty.ilike(f"%{search_lower}%"))
            )

        if difficulty:
            total_courses = total_courses.filter(Course.difficulty.ilike(difficulty))

        if category:
            total_courses = total_courses.filter(Course.category.ilike(category))

        total_count = total_courses.scalar() or 0

        # Get paginated courses with enrollment and completion stats
        courses = base_query.group_by(
            Course.id,
            Course.title,
            Course.category,
            Course.difficulty,
            Course.thumbnail_url
        ).order_by(Course.id).offset(skip).limit(limit).all()

        course_list = []
        for course in courses:
            course_list.append({
                "id": course.id,
                "title": course.title,
                "category": course.category,
                "difficulty_level": course.difficulty,
                "enrollments": course.enrollments or 0,
                "completion": round(course.avg_completion or 0, 0),
                "thumbnail_url": course.thumbnail_url
            })

        logger.info(f"Admin {admin.get('email')} accessed courses list - skip: {skip}, limit: {limit}, search: {search}, difficulty: {difficulty}, category: {category}")
        return {
            "courses": course_list,
            "total": total_count,
            "skip": skip,
            "limit": limit,
            "search": search,
            "difficulty": difficulty,
            "category": category
        }
    except Exception as e:
        logger.error(f"Error getting courses: {str(e)}", exc_info=True)
        return {
            "error": "Failed to get courses",
            "courses": [],
            "total": 0,
            "skip": skip,
            "limit": limit,
            "search": search,
            "difficulty": difficulty,
            "category": category
        }


@router.get("/courses/{course_id}/content")
def get_course_content(
    course_id: int,
    admin: dict = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """
    Get all modules, lessons, and quizzes for a course.
    Only accessible by users with admin role.
    """
    from app.models.course import Course
    from app.models.module import Module
    from app.models.lesson import Lesson
    from app.models.quiz import Quiz

    try:
        course = db.query(Course).filter(Course.id == course_id).first()
        if not course:
            return {"error": "Course not found", "status": False}

        modules = db.query(Module).filter(Module.course_id == course_id).order_by(Module.order).all()

        modules_data = []
        for module in modules:
            lessons = db.query(Lesson).filter(Lesson.module_id == module.id).order_by(Lesson.order).all()
            quizzes = db.query(Quiz).filter(Quiz.module_id == module.id).order_by(Quiz.order).all()

            modules_data.append({
                "id": module.id,
                "title": module.title,
                "description": module.description,
                "order": module.order,
                "lessons": [
                    {
                        "id": lesson.id,
                        "title": lesson.title,
                        "duration_minutes": lesson.duration_minutes,
                        "order": lesson.order,
                        "content_markdown": lesson.content_markdown,
                        "learning_objectives": lesson.learning_objectives,
                        "key_concepts": lesson.key_concepts,
                    }
                    for lesson in lessons
                ],
                "quizzes": [
                    {
                        "id": quiz.id,
                        "title": quiz.title,
                        "description": quiz.description,
                        "passing_score": quiz.passing_score,
                        "total_points": quiz.total_points,
                        "duration_minutes": quiz.duration_minutes,
                        "order": quiz.order,
                    }
                    for quiz in quizzes
                ],
            })

        logger.info(f"Admin {admin.get('email')} accessed course content for course {course_id}")
        return {
            "status": True,
            "course_id": course_id,
            "modules": modules_data,
        }
    except Exception as e:
        logger.error(f"Error getting course content: {str(e)}", exc_info=True)
        return {"error": f"Failed to get course content: {str(e)}", "status": False}


@router.put("/lessons/{lesson_id}")
def update_lesson(
    lesson_id: int,
    lesson_data: LessonRequest,
    admin: dict = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """
    Update lesson details.
    Only accessible by users with admin role.
    """
    from app.models.lesson import Lesson

    try:
        lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
        if not lesson:
            return {"error": "Lesson not found", "status": False}

        old_title = lesson.title
        old_duration = lesson.duration_minutes

        lesson.title = lesson_data.title
        lesson.content_markdown = lesson_data.content_markdown
        lesson.duration_minutes = lesson_data.duration_minutes
        lesson.learning_objectives = lesson_data.learning_objectives
        lesson.key_concepts = lesson_data.key_concepts

        db.commit()
        db.refresh(lesson)

        # Log audit action
        changes = []
        if old_title != lesson.title:
            changes.append(f"Title updated")
        if old_duration != lesson.duration_minutes:
            changes.append(f"Duration: {old_duration}min → {lesson.duration_minutes}min")
        if changes:
            log_audit(
                db,
                admin.get("sub"),
                admin.get("email"),
                "UPDATE",
                "Lesson",
                lesson_id,
                lesson.title,
                "Success",
                "Updated lesson " + ("; ".join(changes) if changes else "content and learning objectives")
            )

        logger.info(f"Admin {admin.get('email')} updated lesson {lesson_id}: {lesson.title}")
        return {
            "status": True,
            "message": "Lesson updated successfully",
            "lesson_id": lesson_id,
        }
    except Exception as e:
        db.rollback()
        logger.error(f"Error updating lesson {lesson_id}: {str(e)}", exc_info=True)
        return {"error": f"Failed to update lesson: {str(e)}", "status": False}


@router.put("/quizzes/{quiz_id}")
def update_quiz(
    quiz_id: int,
    quiz_data: QuizRequest,
    admin: dict = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """
    Update quiz details.
    Only accessible by users with admin role.
    """
    from app.models.quiz import Quiz

    try:
        quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
        if not quiz:
            return {"error": "Quiz not found", "status": False}

        old_title = quiz.title
        old_passing_score = quiz.passing_score

        quiz.title = quiz_data.title
        quiz.description = quiz_data.description
        quiz.passing_score = quiz_data.passing_score
        quiz.total_points = quiz_data.total_points
        quiz.duration_minutes = quiz_data.duration_minutes

        db.commit()
        db.refresh(quiz)

        # Log audit action
        changes = []
        if old_title != quiz.title:
            changes.append(f"Title updated")
        if old_passing_score != quiz.passing_score:
            changes.append(f"Passing score: {old_passing_score} → {quiz.passing_score}")
        if changes:
            log_audit(
                db,
                admin.get("sub"),
                admin.get("email"),
                "UPDATE",
                "Quiz",
                quiz_id,
                quiz.title,
                "Success",
                "; ".join(changes) if changes else "Quiz updated"
            )

        logger.info(f"Admin {admin.get('email')} updated quiz {quiz_id}: {quiz.title}")
        return {
            "status": True,
            "message": "Quiz updated successfully",
            "quiz_id": quiz_id,
        }
    except Exception as e:
        db.rollback()
        logger.error(f"Error updating quiz {quiz_id}: {str(e)}", exc_info=True)
        return {"error": f"Failed to update quiz: {str(e)}", "status": False}


@router.get("/courses/{course_id}/edit")
def get_course_for_edit(
    course_id: int,
    admin: dict = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """
    Get course details for editing.
    Only accessible by users with admin role.

    Args:
        course_id: ID of the course to edit
    """
    from app.models.course import Course

    try:
        course = db.query(Course).filter(Course.id == course_id).first()

        if not course:
            logger.warning(f"Admin {admin.get('email')} attempted to edit non-existent course {course_id}")
            return {
                "error": "Course not found",
                "status": False
            }

        logger.info(f"Admin {admin.get('email')} accessed edit form for course {course_id}")
        return {
            "status": True,
            "course": {
                "id": course.id,
                "title": course.title,
                "description": course.description,
                "difficulty": course.difficulty,
                "duration_hours": course.duration_hours,
                "category": course.category,
                "thumbnail_url": course.thumbnail_url,
                "modules": []
            }
        }
    except Exception as e:
        logger.error(f"Error getting course for edit: {str(e)}", exc_info=True)
        return {
            "error": f"Failed to get course details: {str(e)}",
            "status": False
        }


@router.put("/courses/{course_id}")
def update_course(
    course_id: int,
    course_data: CourseUpdateRequest,
    admin: dict = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """
    Update course details.
    Only accessible by users with admin role.

    Args:
        course_id: ID of the course to update
        course_data: Updated course information
    """
    from app.models.course import Course

    try:
        course = db.query(Course).filter(Course.id == course_id).first()

        if not course:
            logger.warning(f"Admin {admin.get('email')} attempted to update non-existent course {course_id}")
            return {
                "error": "Course not found",
                "status": False
            }

        # Store old values for logging
        old_title = course.title
        old_difficulty = course.difficulty

        # Update fields
        course.title = course_data.title
        course.description = course_data.description
        course.difficulty = course_data.difficulty
        course.duration_hours = course_data.duration_hours
        course.category = course_data.category
        course.thumbnail_url = course_data.thumbnail_url

        db.commit()
        db.refresh(course)

        # Log audit action
        changes = []
        if old_title != course.title:
            changes.append(f"Title: '{old_title}' → '{course.title}'")
        if old_difficulty != course.difficulty:
            changes.append(f"Difficulty: '{old_difficulty}' → '{course.difficulty}'")
        if changes:
            log_audit(
                db,
                admin.get("sub"),
                admin.get("email"),
                "UPDATE",
                "Course",
                course_id,
                course.title,
                "Success",
                "; ".join(changes)
            )

        logger.info(f"Admin {admin.get('email')} updated course {course_id}: '{old_title}' -> '{course.title}'")
        return {
            "status": True,
            "message": f"Course updated successfully",
            "course_id": course_id,
            "course": {
                "id": course.id,
                "title": course.title,
                "description": course.description,
                "difficulty": course.difficulty,
                "duration_hours": course.duration_hours,
                "category": course.category,
                "thumbnail_url": course.thumbnail_url
            }
        }
    except Exception as e:
        db.rollback()
        logger.error(f"Error updating course {course_id}: {str(e)}", exc_info=True)
        return {
            "error": f"Failed to update course: {str(e)}",
            "status": False,
            "course_id": course_id
        }


@router.delete("/courses/{course_id}")
def delete_course(
    course_id: int,
    admin: dict = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """
    Delete a course by ID.
    Only accessible by users with admin role.

    Args:
        course_id: ID of the course to delete
    """
    from app.models.course import Course
    from app.models.user_course import UserCourse
    from app.models.lesson import Lesson
    from app.models.quiz import Quiz
    from app.models.module import Module

    try:
        # Find the course
        course = db.query(Course).filter(Course.id == course_id).first()

        if not course:
            logger.warning(f"Admin {admin.get('email')} attempted to delete non-existent course {course_id}")
            return {
                "error": "Course not found",
                "status": False
            }

        course_title = course.title

        # Count related items for logging
        lesson_count = db.query(Lesson).filter(Lesson.course_id == course_id).count()
        quiz_count = db.query(Quiz).filter(Quiz.course_id == course_id).count()

        # Delete all related data in proper order (respecting FK constraints)
        from app.models.course_generation import CourseGeneration
        from app.models.learning_activity import LearningActivity
        from app.models.milestone import Milestone
        from app.models.user_lesson_progress import UserLessonProgress

        # 0. Delete course generation records
        db.query(CourseGeneration).filter(CourseGeneration.created_course_id == course_id).delete()

        # 1. Delete user lesson progress (depends on lessons)
        db.query(UserLessonProgress).filter(UserLessonProgress.course_id == course_id).delete()

        # 2. Delete learning activities
        db.query(LearningActivity).filter(LearningActivity.course_id == course_id).delete()

        # 3. Delete milestones
        db.query(Milestone).filter(Milestone.course_id == course_id).delete()

        # 4. Delete lessons
        db.query(Lesson).filter(Lesson.course_id == course_id).delete()

        # 5. Delete quizzes
        db.query(Quiz).filter(Quiz.course_id == course_id).delete()

        # 6. Delete modules
        db.query(Module).filter(Module.course_id == course_id).delete()

        # 7. Delete user enrollments
        db.query(UserCourse).filter(UserCourse.course_id == course_id).delete()

        # 8. Delete the course itself
        db.delete(course)
        db.commit()

        # Log audit action
        log_audit(
            db,
            admin.get("sub"),
            admin.get("email"),
            "DELETE",
            "Course",
            course_id,
            course_title,
            "Success",
            f"Course deleted along with {lesson_count} lessons and {quiz_count} quizzes"
        )

        logger.info(f"Admin {admin.get('email')} deleted course {course_id}: {course_title}")
        return {
            "status": True,
            "message": f"Course '{course.title}' deleted successfully",
            "course_id": course_id
        }

    except Exception as e:
        db.rollback()
        logger.error(f"Error deleting course {course_id}: {str(e)}", exc_info=True)
        return {
            "error": f"Failed to delete course: {str(e)}",
            "status": False,
            "course_id": course_id
        }


@router.get("/submissions")
def get_pending_submissions(
    skip: int = 0,
    limit: int = 10,
    status: str = "pending",
    admin: dict = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """
    Get pending AI-generated courses for review.
    Only accessible by users with admin role.

    Args:
        skip: Number of submissions to skip (for pagination)
        limit: Number of submissions to return per page (default 10)
        status: Filter by status - generated, published, rejected (default pending shows generated)
    """
    from app.models.course_generation import CourseGeneration
    from sqlalchemy import desc
    import json

    try:
        # Get AI-generated courses
        generations_query = db.query(CourseGeneration)

        # Filter by status - show only "user_submitted" by default (courses submitted by users for admin approval)
        if status == "pending":
            # Show only user_submitted (courses awaiting admin approval after user review)
            generations_query = generations_query.filter(CourseGeneration.status == "user_submitted")
        elif status:
            generations_query = generations_query.filter(CourseGeneration.status == status)

        # Get total count
        total_count = generations_query.count()

        # Get paginated courses
        generations = generations_query.order_by(desc(CourseGeneration.created_at)).offset(skip).limit(limit).all()

        submission_list = []
        for generation in generations:
            course_data = json.loads(generation.generated_course_data) if generation.generated_course_data else {}
            submission_list.append({
                "id": generation.id,
                "user_id": generation.user_id,
                "user_name": generation.user.name if generation.user else "Unknown",
                "user_email": generation.user.email if generation.user else "Unknown",
                "title": generation.topic,
                "description": course_data.get("description", f"A {generation.difficulty_level} level course on {generation.topic}"),
                "submission_date": generation.created_at.isoformat() if generation.created_at else None,
                "status": generation.status,
                "difficulty_level": generation.difficulty_level,
                "learning_duration": generation.learning_duration,
                "expertise_domain": generation.expertise_domain,
                "relevant_tags": generation.relevant_tags,
                "course_data": course_data,
            })

        logger.info(f"Admin {admin.get('email')} accessed review queue")
        return {
            "submissions": submission_list,
            "total": total_count,
            "skip": skip,
            "limit": limit,
            "status": status
        }
    except Exception as e:
        logger.error(f"Error getting submissions: {str(e)}", exc_info=True)
        return {
            "error": "Failed to get submissions",
            "submissions": [],
            "total": 0,
            "skip": skip,
            "limit": limit,
            "status": status
        }


@router.delete("/submissions/{submission_id}")
def delete_course_generation(
    submission_id: int,
    request: DeletionRequest,
    admin: dict = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """
    Delete a pending course generation request.
    Only accessible by users with admin role.

    Args:
        submission_id: ID of the course generation to delete
        request: Contains feedback (deletion reason)
    """
    from app.models.course_generation import CourseGeneration

    try:
        generation = db.query(CourseGeneration).filter(CourseGeneration.id == submission_id).first()

        if not generation:
            logger.warning(f"Admin {admin.get('email')} attempted to delete non-existent submission {submission_id}")
            return {
                "error": "Course generation not found",
                "status": False
            }

        if generation.status not in ["pending", "generated", "failed"]:
            return {
                "error": f"Cannot delete course with status '{generation.status}'",
                "status": False
            }

        course_title = generation.topic
        deletion_reason = request.feedback
        db.delete(generation)
        db.commit()

        # Log audit action with deletion reason
        log_audit(
            db,
            admin.get("sub"),
            admin.get("email"),
            "DELETE",
            "CourseGeneration",
            submission_id,
            course_title,
            "Success",
            f"Pending course generation deleted: {course_title}. Reason: {deletion_reason}"
        )

        logger.info(f"Admin {admin.get('email')} deleted pending course generation {submission_id}: {course_title}. Reason: {deletion_reason}")

        return {
            "status": True,
            "message": "Course generation deleted successfully",
            "submission_id": submission_id
        }

    except Exception as e:
        db.rollback()
        logger.error(f"Error deleting course generation {submission_id}: {str(e)}", exc_info=True)
        return {
            "error": f"Failed to delete course generation: {str(e)}",
            "status": False,
            "submission_id": submission_id
        }


@router.put("/submissions/{submission_id}/update-course")
def update_generated_course(
    submission_id: int,
    course_updates: CourseUpdateRequest,
    admin: dict = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """
    Update the generated course data for an AI-generated course before approval.
    Only accessible by users with admin role.

    Args:
        submission_id: ID of the course generation to update
        course_updates: Updated course data (title, description, difficulty, duration_hours, category, modules)
    """
    from app.models.course_generation import CourseGeneration
    import json

    try:
        generation = db.query(CourseGeneration).filter(CourseGeneration.id == submission_id).first()

        if not generation:
            return {
                "error": "Course generation not found",
                "status": False
            }

        if generation.status != "generated":
            return {
                "error": f"Can only update courses with 'generated' status",
                "status": False
            }

        # Build the updated course data
        current_data = {
            "title": course_updates.title,
            "description": course_updates.description,
            "difficulty": course_updates.difficulty,
            "duration_hours": course_updates.duration_hours,
            "category": course_updates.category,
            "modules": course_updates.modules or []
        }

        # Update both the top-level topic field and the generated_course_data JSON
        generation.topic = course_updates.title
        generation.generated_course_data = json.dumps(current_data)
        db.commit()

        # Log audit action
        log_audit(
            db,
            admin.get("sub"),
            admin.get("email"),
            "UPDATE",
            "CourseGeneration",
            submission_id,
            current_data.get("title", "Unknown"),
            "Success",
            f"Course generation updated: {current_data.get('title', 'Unknown')}"
        )

        logger.info(f"Admin {admin.get('email')} updated course generation {submission_id}")

        return {
            "status": True,
            "message": "Course generation updated successfully",
            "submission_id": submission_id,
            "course_data": current_data
        }

    except Exception as e:
        db.rollback()
        logger.error(f"Error updating course generation {submission_id}: {str(e)}", exc_info=True)
        return {
            "error": f"Failed to update course generation: {str(e)}",
            "status": False,
            "submission_id": submission_id
        }


@router.put("/submissions/{submission_id}/review")
def review_submission(
    submission_id: int,
    review_data: SubmissionReviewRequest,
    admin: dict = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """
    Review and approve/reject an AI-generated course.
    Only accessible by users with admin role.

    Args:
        submission_id: ID of the AI-generated course to review
        review_data: Review status (approved/rejected) and feedback
    """
    from app.models.course_generation import CourseGeneration
    from app.models.course import Course
    from app.models.module import Module
    from app.models.lesson import Lesson
    from app.models.quiz import Quiz
    from datetime import datetime
    import json

    try:
        generation = db.query(CourseGeneration).filter(CourseGeneration.id == submission_id).first()

        if not generation:
            logger.warning(f"Admin {admin.get('email')} attempted to review non-existent submission {submission_id}")
            return {
                "error": "Submission not found",
                "status": False
            }

        created_course_id = None

        # If approved, create the course
        if review_data.status == "approved":
            try:
                # Parse generated course data
                course_data = json.loads(generation.generated_course_data)

                # Create the course
                new_course = Course(
                    title=course_data.get("title", generation.topic),
                    description=course_data.get("description", ""),
                    category=course_data.get("category", "Computer Science"),
                    difficulty=course_data.get("difficulty", generation.difficulty_level),
                    duration_hours=course_data.get("duration_hours", 10),
                    thumbnail_url="https://via.placeholder.com/400x300?text=" + generation.topic.replace(" ", "+")
                )
                db.add(new_course)
                db.flush()
                created_course_id = new_course.id

                # Create modules, lessons, and quizzes from generated data
                for module_data in course_data.get("modules", []):
                    module = Module(
                        course_id=new_course.id,
                        title=module_data.get("title", ""),
                        description=module_data.get("description", ""),
                        order=1
                    )
                    db.add(module)
                    db.flush()

                    # Add lessons to module
                    for lesson_data in module_data.get("lessons", []):
                        lesson = Lesson(
                            course_id=new_course.id,
                            module_id=module.id,
                            title=lesson_data.get("title", ""),
                            content_markdown=lesson_data.get("content_markdown", ""),
                            duration_minutes=lesson_data.get("duration_minutes", 30),
                            learning_objectives=lesson_data.get("learning_objectives", ""),
                            key_concepts=lesson_data.get("key_concepts", ""),
                            order=1
                        )
                        db.add(lesson)

                    # Add quizzes to module
                    for quiz_data in module_data.get("quizzes", []):
                        quiz = Quiz(
                            course_id=new_course.id,
                            module_id=module.id,
                            title=quiz_data.get("title", ""),
                            description=quiz_data.get("description", ""),
                            passing_score=quiz_data.get("passing_score", 70),
                            total_points=quiz_data.get("total_points", 100),
                            duration_minutes=quiz_data.get("duration_minutes", 15),
                            order=1
                        )
                        db.add(quiz)
                        db.flush()

                        # Add questions to quiz
                        from app.models.quiz import QuizQuestion, QuestionOption
                        for q_idx, question_data in enumerate(quiz_data.get("questions", [])):
                            question = QuizQuestion(
                                quiz_id=quiz.id,
                                question_text=question_data.get("question", ""),
                                explanation=question_data.get("explanation", ""),
                                question_type="multiple_choice",
                                difficulty="medium"
                            )
                            db.add(question)
                            db.flush()

                            # Add options for this question
                            for opt_idx, option_text in enumerate(question_data.get("options", [])):
                                is_correct = (opt_idx == question_data.get("correctIndex", -1))
                                option = QuestionOption(
                                    question_id=question.id,
                                    text=option_text,
                                    is_correct=is_correct
                                )
                                db.add(option)

                generation.status = "published"
                generation.created_course_id = created_course_id

                logger.info(f"Admin {admin.get('email')} approved course generation {submission_id} -> Course {created_course_id}")

            except Exception as e:
                db.rollback()
                logger.error(f"Error publishing course generation: {str(e)}", exc_info=True)
                return {
                    "error": f"Failed to publish course: {str(e)}",
                    "status": False
                }
        else:
            generation.status = "rejected"
            logger.info(f"Admin {admin.get('email')} rejected course generation {submission_id}")

        db.commit()
        db.refresh(generation)

        # Log audit action
        log_audit(
            db,
            admin.get("sub"),
            admin.get("email"),
            "APPROVE" if review_data.status == "approved" else "REJECT",
            "CourseGeneration",
            submission_id,
            generation.topic,
            "Success",
            f"Course {'published as course ID ' + str(created_course_id) if review_data.status == 'approved' else 'rejected: ' + review_data.feedback}"
        )

        return {
            "status": True,
            "message": f"Course {'approved' if review_data.status == 'approved' else 'rejected'} successfully",
            "submission_id": submission_id,
            "created_course_id": created_course_id
        }
    except Exception as e:
        db.rollback()
        logger.error(f"Error reviewing course generation {submission_id}: {str(e)}", exc_info=True)
        return {
            "error": f"Failed to review course generation: {str(e)}",
            "status": False,
            "submission_id": submission_id
        }


@router.get("/audit-logs")
def get_audit_logs(
    skip: int = 0,
    limit: int = 10,
    action: str = "",
    admin: dict = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """
    Get audit logs for admin activities.
    Only accessible by users with admin role.

    Args:
        skip: Number of logs to skip (for pagination)
        limit: Number of logs to return per page (default 10)
        action: Filter by action type (CREATE, UPDATE, DELETE, APPROVE, REJECT)
    """
    from app.models.audit_log import AuditLog
    from sqlalchemy import desc

    try:
        # Build base query
        base_query = db.query(AuditLog)

        # Apply action filter if provided
        if action:
            base_query = base_query.filter(AuditLog.action == action)

        # Get total count
        total_count = base_query.count()

        # Get paginated logs
        logs = base_query.order_by(desc(AuditLog.timestamp)).offset(skip).limit(limit).all()

        log_list = []
        for log in logs:
            log_list.append({
                "id": log.id,
                "admin_id": log.admin_id,
                "admin_email": log.admin_email,
                "action": log.action,
                "resource_type": log.resource_type,
                "resource_id": log.resource_id,
                "resource_name": log.resource_name,
                "timestamp": log.timestamp.isoformat() if log.timestamp else None,
                "status": log.status,
                "details": log.details,
                "ip_address": log.ip_address,
            })

        logger.info(f"Admin {admin.get('email')} accessed audit logs - skip: {skip}, limit: {limit}, action: {action}")
        return {
            "logs": log_list,
            "total": total_count,
            "skip": skip,
            "limit": limit,
            "action": action
        }
    except Exception as e:
        logger.error(f"Error getting audit logs: {str(e)}", exc_info=True)
        return {
            "error": "Failed to get audit logs",
            "logs": [],
            "total": 0,
            "skip": skip,
            "limit": limit,
            "action": action
        }
