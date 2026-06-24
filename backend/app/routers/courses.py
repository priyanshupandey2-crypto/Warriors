from fastapi import APIRouter, HTTPException, status, Depends, Body, Request
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.course import Course
from app.models.user_course import UserCourse
from app.schemas.course_schemas import CourseGenerateRequest, FeaturedCourse
from typing import List, Dict, Any
from datetime import datetime
from pydantic import BaseModel

router = APIRouter(prefix="/api/courses", tags=["courses"])


class PaginatedCoursesResponse(BaseModel):
    """Response with courses and pagination info"""
    data: List[FeaturedCourse]
    total: int
    skip: int
    limit: int
    has_more: bool


@router.get("/featured", response_model=List[FeaturedCourse])
def get_featured_courses(db: Session = Depends(get_db)) -> List[FeaturedCourse]:
    """Get featured courses for landing page."""
    courses = db.query(Course).filter(
        Course.status == "published"
    ).limit(10).all()

    return [
        FeaturedCourse(
            id=str(course.id),
            title=course.title,
            description=course.description,
            difficulty_level=course.difficulty,
            duration_weeks=course.duration_hours // 7 if course.duration_hours else 0,
            modules_count=0,
            tags=[],
            thumbnail_url=course.thumbnail_url,
            rating=None,
            enrollments=db.query(UserCourse).filter(UserCourse.course_id == course.id).count(),
            category=course.category
        )
        for course in courses
    ]


@router.get("/", response_model=PaginatedCoursesResponse)
def browse_courses(skip: int = 0, limit: int = 9, difficulty: str = None, categories: str = None, sort_by: str = "newest", db: Session = Depends(get_db)) -> PaginatedCoursesResponse:
    """Browse all courses with pagination and optional difficulty and category filters."""
    # Build base query
    query = db.query(Course).filter(Course.status == "published")

    # Apply difficulty filter if provided
    if difficulty:
        query = query.filter(Course.difficulty == difficulty)

    # Apply category filter if provided
    if categories:
        category_list = [c.strip() for c in categories.split(",")]
        query = query.filter(Course.category.in_(category_list))

    # Get total count before sorting (for accurate pagination)
    total = query.count()

    # Apply sorting
    if sort_by == "popular":
        # Sort by enrollments (most popular first)
        query = query.outerjoin(UserCourse).group_by(Course.id).order_by(
            db.func.count(UserCourse.id).desc()
        )
    elif sort_by == "duration":
        # Sort by duration (shortest first)
        query = query.order_by(Course.duration_hours.asc())
    else:
        # Default: newest first (by creation date)
        query = query.order_by(Course.created_at.desc())

    # Get paginated courses
    courses = query.offset(skip).limit(limit).all()

    data = [
        FeaturedCourse(
            id=str(course.id),
            title=course.title,
            description=course.description,
            difficulty_level=course.difficulty,
            duration_weeks=course.duration_hours // 7 if course.duration_hours else 0,
            modules_count=0,
            tags=[],
            thumbnail_url=course.thumbnail_url,
            rating=None,
            enrollments=db.query(UserCourse).filter(UserCourse.course_id == course.id).count(),
            category=course.category
        )
        for course in courses
    ]

    return PaginatedCoursesResponse(
        data=data,
        total=total,
        skip=skip,
        limit=limit,
        has_more=skip + limit < total
    )


@router.post("/generate", response_model=dict)
def generate_course(request: CourseGenerateRequest, db: Session = Depends(get_db)) -> dict:
    """Generate a new course and save to database."""
    if not request.topic or not request.difficulty_level:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Topic and difficulty level are required"
        )

    new_course = Course(
        title=request.topic,
        description=f"AI-generated course: {request.topic} for {request.target_audience}",
        difficulty=request.difficulty_level,
        duration_hours=request.duration_weeks * 7,
        thumbnail_url=None,
        status="draft",
        created_by=None
    )

    db.add(new_course)
    db.commit()
    db.refresh(new_course)

    return {
        "status": "success",
        "message": f"Course generation completed for topic: {request.topic}",
        "course_id": new_course.id,
        "estimated_time_minutes": 120
    }


@router.get("/{course_id}/preview")
def get_course_preview(course_id: int, db: Session = Depends(get_db)):
    """Get course preview with modules and lessons."""
    course = db.query(Course).filter(Course.id == course_id).first()

    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Course {course_id} not found"
        )

    return {
        "id": str(course.id),
        "title": course.title,
        "description": course.description,
        "difficulty_level": course.difficulty,
        "total_duration_hours": course.duration_hours,
        "learning_objectives": [],
        "overview": course.description,
        "modules": [],
        "lesson_sequence": [],
        "learning_roadmap": ""
    }


@router.post("/{cid}/enroll", response_model=dict)
def enroll_in_course(cid: int, request: Request, db: Session = Depends(get_db)) -> dict:
    """Enroll user in a course."""
    current_user = getattr(request.state, "user", None)
    if not current_user:
        raise HTTPException(status_code=401, detail="User not authenticated")
    user_id = int(current_user.get("sub"))

    course = db.query(Course).filter(Course.id == cid).first()
    if not course:
        raise HTTPException(status_code=404, detail=f"Course {cid} not found")

    existing = db.query(UserCourse).filter(
        UserCourse.user_id == user_id,
        UserCourse.course_id == cid
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail="Already enrolled")

    enrollment = UserCourse(
        user_id=user_id,
        course_id=cid,
        status="ENROLLED",
        progress_percentage=0,
        completed_lessons=0,
        total_lessons=0,
        enrolled_at=datetime.utcnow()
    )

    db.add(enrollment)
    db.commit()
    db.refresh(enrollment)

    return {
        "status": "success",
        "message": f"Successfully enrolled in course {cid}",
        "enrollment_id": enrollment.id,
        "enrollment_date": enrollment.enrolled_at.isoformat()
    }
