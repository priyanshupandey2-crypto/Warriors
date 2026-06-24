from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database import get_db
from app.utils.dependencies import get_admin_user
from app.logger import get_logger

logger = get_logger(__name__)
router = APIRouter(prefix="/api/admin", tags=["admin"])


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
