from fastapi import APIRouter, HTTPException, status, Depends, Body, Request
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models.course import Course
from app.models.lesson import Lesson
from app.models.module import Module
from app.models.quiz import Quiz
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
def browse_courses(skip: int = 0, limit: int = 9, search: str = None, difficulty: str = None, categories: str = None, sort_by: str = "newest", db: Session = Depends(get_db)) -> PaginatedCoursesResponse:
    """Browse all courses with pagination and optional filters."""
    # Build base query
    query = db.query(Course).filter(Course.status == "published")

    # Apply search filter if provided
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            (Course.title.ilike(search_term)) | (Course.description.ilike(search_term))
        )

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
            func.count(UserCourse.id).desc()
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

    # Get all lessons for this course (for lesson_sequence)
    lessons = db.query(Lesson).filter(Lesson.course_id == course.id).order_by(Lesson.order).all()

    # Get all modules for this course, ordered by order
    db_modules = db.query(Module).filter(Module.course_id == course.id).order_by(Module.order).all()

    # Build modules structure with lessons and quizzes
    modules = []
    print(f"DEBUG: Building modules for course {course.id}, total modules: {len(db_modules)}")
    for module in db_modules:
        module_lessons = db.query(Lesson).filter(
            Lesson.module_id == module.id
        ).order_by(Lesson.order).all()

        module_quizzes = db.query(Quiz).filter(
            Quiz.module_id == module.id
        ).order_by(Quiz.order).all()

        modules.append({
            "title": module.title,
            "description": module.description or f"Learn {module.title.lower()}",
            "lessons": [
                {
                    "id": lesson.id,
                    "title": lesson.title,
                    "duration_minutes": lesson.duration_minutes,
                    "content_markdown": lesson.content_markdown,
                    "order": lesson.order,
                }
                for lesson in module_lessons
            ],
            "quizzes": [
                {
                    "id": quiz.id,
                    "title": quiz.title,
                    "description": quiz.description,
                    "passing_score": quiz.passing_score,
                    "total_points": quiz.total_points,
                    "question_count": len(quiz.questions),
                }
                for quiz in module_quizzes
            ],
        })

    return {
        "id": str(course.id),
        "title": course.title,
        "description": course.description,
        "difficulty_level": course.difficulty,
        "total_duration_hours": course.duration_hours,
        "learning_objectives": [
            f"Master {course.title}",
            f"Understand core concepts of {course.title}",
            f"Apply {course.title} in real-world scenarios"
        ],
        "overview": course.description,
        "modules": modules,
        "lesson_sequence": [
            {
                "id": lesson.id,
                "title": lesson.title,
                "duration_minutes": lesson.duration_minutes,
                "order": lesson.order,
                "content_markdown": lesson.content_markdown,
            }
            for lesson in lessons
        ],
        "learning_roadmap": f"Complete all {len(lessons)} lessons to master {course.title}"
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
