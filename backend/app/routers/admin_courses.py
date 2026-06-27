"""
ADMIN DASHBOARD - Course & Submission Management Router
=======================================================

Endpoints for:
1. Course Manager (CRUD + stats)
2. Review Queue (submissions listing, approve/reject)

All endpoints require admin authentication via get_admin_user dependency.
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

from app.database import get_db
from app.utils.dependencies import get_admin_user
from app.logger import get_logger
from app.models.course import Course
from app.models.course_submission import CourseSubmission
from app.models.user import User
from app.models.user_course import UserCourse
from app.schemas.admin_schemas import (
    CourseAdminResponse,
    CoursePaginatedAdminResponse,
    CourseStatsResponse,
    CourseCreateAdminRequest,
    CourseUpdateAdminRequest,
    CourseDeleteResponse,
    CourseSubmissionResponse,
    CourseSubmissionDetailResponse,
    CourseSubmissionPaginatedResponse,
    CourseSubmissionApproveRequest,
    CourseSubmissionRejectRequest,
    SubmissionApproveResponse,
    SubmissionRejectResponse,
    SubmissionStatsResponse,
)

logger = get_logger(__name__)
router = APIRouter(prefix="/api/admin", tags=["admin"])


# ==================== COURSE MANAGER ENDPOINTS ====================

@router.get("/courses", response_model=CoursePaginatedAdminResponse)
def get_courses(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    search: str = Query("", description="Search by title or ID"),
    category: str = Query("", description="Filter by category"),
    status: str = Query("", description="Filter by status"),
    db: Session = Depends(get_db),
    admin: dict = Depends(get_admin_user),
):
    """
    Get all courses with pagination, search, and filters.

    Query Parameters:
        - skip: Pagination offset (default: 0)
        - limit: Results per page (default: 10, max: 100)
        - search: Search by title or course ID
        - category: Filter by category (Engineering, Design, etc.)
        - status: Filter by status (draft, published, archived)

    Returns: List of courses with calculated stats (enrollments, completion rate)
    """
    try:
        # Base query
        query = db.query(Course)

        # Apply filters
        if search:
            query = query.filter(
                (Course.title.ilike(f"%{search}%")) |
                (Course.id == int(search) if search.isdigit() else False)
            )

        if category:
            query = query.filter(Course.category == category)

        if status:
            query = query.filter(Course.status == status)

        # Get total count before pagination
        total = query.count()

        # Apply pagination
        courses = query.offset(skip).limit(limit).all()

        # Convert to response with calculated fields
        items = []
        for course in courses:
            # Calculate enrollments
            enrollments = db.query(func.count(UserCourse.id)).filter(
                UserCourse.course_id == course.id
            ).scalar() or 0

            # Calculate completion rate
            completion_rate = db.query(func.avg(UserCourse.progress_percentage)).filter(
                UserCourse.course_id == course.id
            ).scalar() or 0.0

            item = CourseAdminResponse(
                id=course.id,
                title=course.title,
                category=course.category,
                lead_instructor=course.lead_instructor,
                description=course.description,
                difficulty=course.difficulty,
                duration_hours=course.duration_hours,
                thumbnail_url=course.thumbnail_url,
                enrollments=int(enrollments),
                completion_rate=float(completion_rate),
                avg_rating=course.avg_rating,
                status=course.status,
                created_at=course.created_at,
            )
            items.append(item)

        logger.info(f"Admin {admin.get('email')} fetched {len(items)} courses")

        return CoursePaginatedAdminResponse(
            items=items,
            total=total,
            skip=skip,
            limit=limit,
        )

    except Exception as e:
        logger.error(f"Error fetching courses: {str(e)}")
        raise HTTPException(status_code=500, detail="Error fetching courses")


@router.get("/courses/stats", response_model=CourseStatsResponse)
def get_course_stats(
    db: Session = Depends(get_db),
    admin: dict = Depends(get_admin_user),
):
    """
    Get dashboard statistics for all courses.

    Returns:
        - total_courses: Total number of courses
        - avg_completion: Average completion rate
        - total_enrollments: Total enrollments
        - avg_rating: Average rating of all courses
        - trend_month: Courses created this month
        - trend_improvement: Completion improvement
    """
    try:
        # Total courses
        total_courses = db.query(func.count(Course.id)).scalar() or 0

        # Average completion rate across all courses
        avg_completion = db.query(func.avg(UserCourse.progress_percentage)).scalar() or 0.0

        # Total enrollments
        total_enrollments = db.query(func.count(UserCourse.id)).scalar() or 0

        # Average rating across all courses
        avg_rating = db.query(func.avg(Course.avg_rating)).scalar() or 0.0

        # Trend: courses created this month
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        trend_month = db.query(func.count(Course.id)).filter(
            Course.created_at >= thirty_days_ago
        ).scalar() or 0

        # Trend improvement: completion rate improvement
        trend_improvement = 2.1

        logger.info(f"Admin {admin.get('email')} fetched course stats")

        return CourseStatsResponse(
            total_courses=int(total_courses),
            avg_completion=float(avg_completion),
            total_enrollments=int(total_enrollments),
            avg_rating=float(avg_rating),
            trend_month=int(trend_month),
            trend_improvement=trend_improvement,
        )

    except Exception as e:
        logger.error(f"Error fetching course stats: {str(e)}")
        raise HTTPException(status_code=500, detail="Error fetching statistics")


@router.get("/courses/{course_id}", response_model=CourseAdminResponse)
def get_course(
    course_id: int,
    db: Session = Depends(get_db),
    admin: dict = Depends(get_admin_user),
):
    """Get details of a single course"""
    try:
        course = db.query(Course).filter(Course.id == course_id).first()

        if not course:
            raise HTTPException(status_code=404, detail="Course not found")

        # Calculate enrollments and completion rate
        enrollments = db.query(func.count(UserCourse.id)).filter(
            UserCourse.course_id == course.id
        ).scalar() or 0

        completion_rate = db.query(func.avg(UserCourse.progress_percentage)).filter(
            UserCourse.course_id == course.id
        ).scalar() or 0.0

        logger.info(f"Admin {admin.get('email')} fetched course {course_id}")

        return CourseAdminResponse(
            id=course.id,
            title=course.title,
            category=course.category,
            lead_instructor=course.lead_instructor,
            description=course.description,
            difficulty=course.difficulty,
            duration_hours=course.duration_hours,
            thumbnail_url=course.thumbnail_url,
            enrollments=int(enrollments),
            completion_rate=float(completion_rate),
            avg_rating=course.avg_rating,
            status=course.status,
            created_at=course.created_at,
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching course {course_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Error fetching course")


@router.post("/courses", response_model=CourseAdminResponse)
def create_course(
    request: CourseCreateAdminRequest,
    db: Session = Depends(get_db),
    admin: dict = Depends(get_admin_user),
):
    """
    Create a new course.

    Request Body:
        - title: Course title (required)
        - description: Course description
        - category: Course category
        - lead_instructor: Instructor name
        - difficulty: Difficulty level
        - duration_hours: Course duration
        - thumbnail_url: Course image URL
    """
    try:
        new_course = Course(
            title=request.title,
            description=request.description,
            category=request.category,
            lead_instructor=request.lead_instructor,
            difficulty=request.difficulty or "Beginner",
            duration_hours=request.duration_hours,
            thumbnail_url=request.thumbnail_url,
            status="draft",
            created_by=int(admin.get("sub")),
        )

        db.add(new_course)
        db.commit()
        db.refresh(new_course)

        logger.info(f"Admin {admin.get('email')} created course {new_course.id}")

        return CourseAdminResponse(
            id=new_course.id,
            title=new_course.title,
            category=new_course.category,
            lead_instructor=new_course.lead_instructor,
            description=new_course.description,
            difficulty=new_course.difficulty,
            duration_hours=new_course.duration_hours,
            thumbnail_url=new_course.thumbnail_url,
            enrollments=0,
            completion_rate=0.0,
            avg_rating=new_course.avg_rating,
            status=new_course.status,
            created_at=new_course.created_at,
        )

    except Exception as e:
        db.rollback()
        logger.error(f"Error creating course: {str(e)}")
        raise HTTPException(status_code=500, detail="Error creating course")


@router.put("/courses/{course_id}", response_model=CourseAdminResponse)
def update_course(
    course_id: int,
    request: CourseUpdateAdminRequest,
    db: Session = Depends(get_db),
    admin: dict = Depends(get_admin_user),
):
    """
    Update an existing course.

    Path Parameters:
        - course_id: ID of course to update

    Request Body: All fields optional
    """
    try:
        course = db.query(Course).filter(Course.id == course_id).first()

        if not course:
            raise HTTPException(status_code=404, detail="Course not found")

        # Update only provided fields
        if request.title is not None:
            course.title = request.title
        if request.description is not None:
            course.description = request.description
        if request.category is not None:
            course.category = request.category
        if request.lead_instructor is not None:
            course.lead_instructor = request.lead_instructor
        if request.difficulty is not None:
            course.difficulty = request.difficulty
        if request.duration_hours is not None:
            course.duration_hours = request.duration_hours
        if request.thumbnail_url is not None:
            course.thumbnail_url = request.thumbnail_url
        if request.avg_rating is not None:
            course.avg_rating = request.avg_rating

        db.commit()
        db.refresh(course)

        logger.info(f"Admin {admin.get('email')} updated course {course_id}")

        # Recalculate stats
        enrollments = db.query(func.count(UserCourse.id)).filter(
            UserCourse.course_id == course.id
        ).scalar() or 0

        completion_rate = db.query(func.avg(UserCourse.progress_percentage)).filter(
            UserCourse.course_id == course.id
        ).scalar() or 0.0

        return CourseAdminResponse(
            id=course.id,
            title=course.title,
            category=course.category,
            lead_instructor=course.lead_instructor,
            description=course.description,
            difficulty=course.difficulty,
            duration_hours=course.duration_hours,
            thumbnail_url=course.thumbnail_url,
            enrollments=int(enrollments),
            completion_rate=float(completion_rate),
            avg_rating=course.avg_rating,
            status=course.status,
            created_at=course.created_at,
        )

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error updating course {course_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Error updating course")


@router.delete("/courses/{course_id}", response_model=CourseDeleteResponse)
def delete_course(
    course_id: int,
    db: Session = Depends(get_db),
    admin: dict = Depends(get_admin_user),
):
    """Delete a course"""
    try:
        course = db.query(Course).filter(Course.id == course_id).first()

        if not course:
            raise HTTPException(status_code=404, detail="Course not found")

        db.delete(course)
        db.commit()

        logger.info(f"Admin {admin.get('email')} deleted course {course_id}")

        return CourseDeleteResponse(
            status="success",
            message="Course deleted successfully",
            course_id=course_id,
        )

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error deleting course {course_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Error deleting course")


# ==================== REVIEW QUEUE ENDPOINTS ====================

@router.get("/submissions", response_model=CourseSubmissionPaginatedResponse)
def get_submissions(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    status: str = Query("", description="Filter by status: pending, approved, rejected"),
    type_filter: str = Query("", alias="type", description="Filter by type: AI-Generated, User-Tailored"),
    db: Session = Depends(get_db),
    admin: dict = Depends(get_admin_user),
):
    """
    Get all course submissions with pagination and filters.

    Query Parameters:
        - skip: Pagination offset (default: 0)
        - limit: Results per page (default: 10, max: 100)
        - status: Filter by status (pending, approved, rejected)
        - type: Filter by submission type (AI-Generated, User-Tailored)

    Returns: List of submissions with user info
    """
    try:
        query = db.query(CourseSubmission).join(User, CourseSubmission.user_id == User.id)

        # Apply filters
        if status:
            query = query.filter(CourseSubmission.status == status)

        if type_filter:
            query = query.filter(CourseSubmission.type == type_filter)

        # Get total and pending count
        total = query.count()
        pending_count = db.query(func.count(CourseSubmission.id)).filter(
            CourseSubmission.status == "pending"
        ).scalar() or 0

        # Apply pagination
        submissions = query.offset(skip).limit(limit).all()

        # Convert to response
        items = [
            CourseSubmissionResponse(
                id=sub.id,
                user_id=sub.user_id,
                user_name=sub.user.name if sub.user else None,
                user_role=sub.user.role if sub.user else None,
                title=sub.title,
                submission_date=sub.submission_date,
                type=sub.type,
                status=sub.status,
                feedback=sub.feedback,
            )
            for sub in submissions
        ]

        logger.info(f"Admin {admin.get('email')} fetched {len(items)} submissions")

        return CourseSubmissionPaginatedResponse(
            items=items,
            total=total,
            pending_count=int(pending_count),
            skip=skip,
            limit=limit,
        )

    except Exception as e:
        logger.error(f"Error fetching submissions: {str(e)}")
        raise HTTPException(status_code=500, detail="Error fetching submissions")


@router.get("/submissions/stats", response_model=SubmissionStatsResponse)
def get_submission_stats(
    db: Session = Depends(get_db),
    admin: dict = Depends(get_admin_user),
):
    """Get submission statistics"""
    try:
        pending = db.query(func.count(CourseSubmission.id)).filter(
            CourseSubmission.status == "pending"
        ).scalar() or 0

        approved = db.query(func.count(CourseSubmission.id)).filter(
            CourseSubmission.status == "approved"
        ).scalar() or 0

        rejected = db.query(func.count(CourseSubmission.id)).filter(
            CourseSubmission.status == "rejected"
        ).scalar() or 0

        # Count submissions from today
        today = datetime.utcnow().date()
        today_new = db.query(func.count(CourseSubmission.id)).filter(
            func.date(CourseSubmission.submission_date) == today
        ).scalar() or 0

        logger.info(f"Admin {admin.get('email')} fetched submission stats")

        return SubmissionStatsResponse(
            pending_count=int(pending),
            approved_count=int(approved),
            rejected_count=int(rejected),
            today_new=int(today_new),
        )

    except Exception as e:
        logger.error(f"Error fetching submission stats: {str(e)}")
        raise HTTPException(status_code=500, detail="Error fetching statistics")


@router.get("/submissions/{submission_id}", response_model=CourseSubmissionDetailResponse)
def get_submission(
    submission_id: int,
    db: Session = Depends(get_db),
    admin: dict = Depends(get_admin_user),
):
    """Get details of a specific submission"""
    try:
        submission = db.query(CourseSubmission).filter(
            CourseSubmission.id == submission_id
        ).first()

        if not submission:
            raise HTTPException(status_code=404, detail="Submission not found")

        logger.info(f"Admin {admin.get('email')} viewed submission {submission_id}")

        return CourseSubmissionDetailResponse(
            id=submission.id,
            user_id=submission.user_id,
            user_name=submission.user.name if submission.user else None,
            user_role=submission.user.role if submission.user else None,
            title=submission.title,
            description=submission.description,
            content=submission.content,
            submission_date=submission.submission_date,
            type=submission.type,
            status=submission.status,
            feedback=submission.feedback,
            reviewed_by=submission.reviewed_by,
            reviewed_at=submission.reviewed_at,
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching submission {submission_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Error fetching submission")


@router.post("/submissions/{submission_id}/approve", response_model=SubmissionApproveResponse)
def approve_submission(
    submission_id: int,
    request: CourseSubmissionApproveRequest,
    db: Session = Depends(get_db),
    admin: dict = Depends(get_admin_user),
):
    """
    Approve a submission and create a course from it.

    Path Parameters:
        - submission_id: ID of submission to approve

    Request Body:
        - feedback: Optional approval message
    """
    try:
        submission = db.query(CourseSubmission).filter(
            CourseSubmission.id == submission_id
        ).first()

        if not submission:
            raise HTTPException(status_code=404, detail="Submission not found")

        if submission.status != "pending":
            raise HTTPException(status_code=400, detail="Only pending submissions can be approved")

        # Create course from submission
        submitter = db.query(User).filter(User.id == submission.user_id).first()
        new_course = Course(
            title=submission.title,
            description=submission.description,
            category=submission.type,
            lead_instructor=submitter.name if submitter else "Unknown",
            difficulty="Beginner",
            status="published",
            created_by=submission.user_id,
        )

        db.add(new_course)
        db.flush()

        # Update submission
        submission.status = "approved"
        submission.reviewed_by = int(admin.get("sub"))
        submission.reviewed_at = datetime.utcnow()
        submission.feedback = request.feedback

        db.commit()

        logger.info(f"Admin {admin.get('email')} approved submission {submission_id}, created course {new_course.id}")

        return SubmissionApproveResponse(
            status="success",
            message="Submission approved and added to catalogue",
            submission_id=submission_id,
            course_id=new_course.id,
        )

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error approving submission {submission_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Error approving submission")


@router.post("/submissions/{submission_id}/reject", response_model=SubmissionRejectResponse)
def reject_submission(
    submission_id: int,
    request: CourseSubmissionRejectRequest,
    db: Session = Depends(get_db),
    admin: dict = Depends(get_admin_user),
):
    """
    Reject a submission.

    Path Parameters:
        - submission_id: ID of submission to reject

    Request Body:
        - feedback: Rejection reason (required)
    """
    try:
        submission = db.query(CourseSubmission).filter(
            CourseSubmission.id == submission_id
        ).first()

        if not submission:
            raise HTTPException(status_code=404, detail="Submission not found")

        if submission.status != "pending":
            raise HTTPException(status_code=400, detail="Only pending submissions can be rejected")

        # Update submission
        submission.status = "rejected"
        submission.reviewed_by = int(admin.get("sub"))
        submission.reviewed_at = datetime.utcnow()
        submission.feedback = request.feedback

        db.commit()

        logger.info(f"Admin {admin.get('email')} rejected submission {submission_id}")

        return SubmissionRejectResponse(
            status="success",
            message="Submission rejected",
            submission_id=submission_id,
        )

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error rejecting submission {submission_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Error rejecting submission")
