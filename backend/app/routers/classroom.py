import json
from fastapi import APIRouter, HTTPException, status
from pathlib import Path
from app.schemas.classroom_schemas import (
    ClassroomWorkspace,
    LessonContent,
    QuizStructure,
    CapstoneSpecs,
    BookmarkItem
)
from typing import List

router = APIRouter(prefix="/api/classroom", tags=["classroom"])

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


@router.get("/{course_id}", response_model=ClassroomWorkspace)
def get_classroom_workspace(course_id: str) -> ClassroomWorkspace:
    """Get complete classroom workspace for a course."""
    data = load_json_file("classroomWorkspace.json")
    return ClassroomWorkspace(**data)


@router.get("/{course_id}/lessons", response_model=List[LessonContent])
def get_course_lessons(course_id: str) -> List[LessonContent]:
    """Get all lessons in a course."""
    data = load_json_file("classroomWorkspace.json")
    lessons = data.get("lessons", [])
    return [LessonContent(**lesson) for lesson in lessons]


@router.get("/{course_id}/lessons/{lesson_id}", response_model=LessonContent)
def get_lesson_content(course_id: str, lesson_id: str) -> LessonContent:
    """Get specific lesson content with markdown."""
    data = load_json_file("classroomWorkspace.json")
    lessons = data.get("lessons", [])

    lesson = next((l for l in lessons if l["id"] == lesson_id), None)
    if not lesson:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Lesson {lesson_id} not found"
        )

    return LessonContent(**lesson)


@router.get("/{course_id}/quizzes", response_model=List[QuizStructure])
def get_course_quizzes(course_id: str) -> List[QuizStructure]:
    """Get all quizzes in a course."""
    data = load_json_file("classroomWorkspace.json")
    quizzes = data.get("quizzes", [])
    return [QuizStructure(**quiz) for quiz in quizzes]


@router.get("/{course_id}/quizzes/{quiz_id}", response_model=QuizStructure)
def get_quiz(course_id: str, quiz_id: str) -> QuizStructure:
    """Get specific quiz with questions."""
    data = load_json_file("classroomWorkspace.json")
    quizzes = data.get("quizzes", [])

    quiz = next((q for q in quizzes if q["id"] == quiz_id), None)
    if not quiz:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Quiz {quiz_id} not found"
        )

    return QuizStructure(**quiz)


@router.post("/{course_id}/quizzes/{quiz_id}/submit", response_model=dict)
def submit_quiz(course_id: str, quiz_id: str, answers: dict) -> dict:
    """Submit quiz answers (mock evaluation)."""
    return {
        "status": "submitted",
        "quiz_id": quiz_id,
        "score": 85,
        "passing_score": 70,
        "passed": True,
        "feedback": "Great job! You passed the quiz."
    }


@router.get("/{course_id}/capstone", response_model=CapstoneSpecs)
def get_capstone(course_id: str) -> CapstoneSpecs:
    """Get capstone project specifications."""
    data = load_json_file("classroomWorkspace.json")
    capstone = data.get("capstone", {})
    return CapstoneSpecs(**capstone)


@router.post("/{course_id}/capstone/start", response_model=dict)
def start_capstone(course_id: str) -> dict:
    """Start working on capstone project."""
    return {
        "status": "started",
        "capstone_id": f"capstone-{course_id}",
        "started_at": "2026-06-21T16:00:00Z",
        "deadline": "2026-07-21T23:59:59Z"
    }


@router.post("/{course_id}/capstone/submit", response_model=dict)
def submit_capstone(course_id: str, submission_data: dict) -> dict:
    """Submit capstone project."""
    return {
        "status": "submitted",
        "capstone_id": f"capstone-{course_id}",
        "submitted_at": "2026-06-21T17:30:00Z",
        "message": "Capstone submitted successfully. Review will be completed within 5 days."
    }


@router.post("/progress/complete", response_model=dict)
def mark_lesson_complete(course_id: str, lesson_id: str) -> dict:
    """Mark a lesson as complete."""
    return {
        "status": "success",
        "lesson_id": lesson_id,
        "course_id": course_id,
        "completed_at": "2026-06-21T16:15:00Z",
        "points_earned": 10,
        "message": "Lesson marked as complete!"
    }


@router.post("/bookmarks/toggle", response_model=dict)
def toggle_bookmark(lesson_id: str, course_id: str, notes: str = "") -> dict:
    """Toggle bookmark for a lesson."""
    return {
        "status": "bookmarked",
        "lesson_id": lesson_id,
        "course_id": course_id,
        "bookmarked_at": "2026-06-21T16:20:00Z",
        "notes": notes
    }


@router.get("/bookmarks/", response_model=List[BookmarkItem])
def get_bookmarks() -> List[BookmarkItem]:
    """Get all bookmarked lessons for user."""
    data = load_json_file("bookmarks.json")
    bookmarks = data.get("bookmarks", [])
    return [BookmarkItem(**bookmark) for bookmark in bookmarks]
