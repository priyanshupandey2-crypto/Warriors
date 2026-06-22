import json
from fastapi import APIRouter, HTTPException, status
from pathlib import Path
from app.schemas.course_schemas import CourseGenerateRequest, CoursePreview, FeaturedCourse
from typing import List

router = APIRouter(prefix="/api/courses", tags=["courses"])

DATA_DIR = Path(__file__).parent.parent / "data"


def load_json_file(filename: str):
    """Load JSON file from data directory."""
    file_path = DATA_DIR / filename
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Mock data file not found: {filename}"
        )
    except json.JSONDecodeError:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Invalid JSON in mock data: {filename}"
        )


@router.get("/featured", response_model=List[FeaturedCourse])
def get_featured_courses() -> List[FeaturedCourse]:
    """Get featured courses for landing page."""
    data = load_json_file("featuredCourses.json")
    courses = data.get("courses", [])
    return [FeaturedCourse(**course) for course in courses]


@router.get("/", response_model=List[FeaturedCourse])
def browse_courses(skip: int = 0, limit: int = 10) -> List[FeaturedCourse]:
    """Browse all courses with pagination."""
    data = load_json_file("featuredCourses.json")
    courses = data.get("courses", [])
    paginated = courses[skip : skip + limit]
    return [FeaturedCourse(**course) for course in paginated]


@router.post("/generate", response_model=dict)
def generate_course(request: CourseGenerateRequest) -> dict:
    """Generate a new course (mock - returns preview)."""
    if not request.topic or not request.difficulty_level:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Topic and difficulty level are required"
        )

    return {
        "status": "success",
        "message": f"Course generation started for topic: {request.topic}",
        "course_id": f"course-gen-{hash(request.topic) % 10000}",
        "estimated_time_minutes": 120
    }


@router.get("/{course_id}/preview", response_model=CoursePreview)
def get_course_preview(course_id: str) -> CoursePreview:
    """Get course preview with modules and lessons."""
    data = load_json_file("coursePreview.json")
    return CoursePreview(**data)


@router.post("/{course_id}/enroll", response_model=dict)
def enroll_in_course(course_id: str) -> dict:
    """Enroll user in a course."""
    return {
        "status": "success",
        "message": f"Successfully enrolled in course {course_id}",
        "enrollment_id": f"enroll-{course_id}",
        "enrollment_date": "2026-06-21T16:00:00Z"
    }
