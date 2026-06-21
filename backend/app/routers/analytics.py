import json
from fastapi import APIRouter, HTTPException, status
from pathlib import Path
from typing import Dict, Any, List

router = APIRouter(prefix="/api/user", tags=["analytics"])

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


@router.get("/dashboard", response_model=Dict[str, Any])
async def get_dashboard(user_id: str = "user-123") -> Dict[str, Any]:
    """Get user dashboard with all analytics."""
    data = load_json_file("userDashboard.json")
    return data


@router.get("/analytics/activity", response_model=Dict[str, Any])
async def get_activity(user_id: str = "user-123") -> Dict[str, Any]:
    """Get user activity for the week."""
    data = load_json_file("userDashboard.json")
    return {
        "user_id": user_id,
        "weekly_activity": data.get("weekly_activity", {}),
        "total_minutes_this_week": data.get("weekly_activity", {}).get("total_minutes_learned", 0)
    }


@router.get("/analytics/consistency", response_model=Dict[str, Any])
async def get_consistency(user_id: str = "user-123") -> Dict[str, Any]:
    """Get learning consistency metrics and heatmap."""
    data = load_json_file("userDashboard.json")
    return {
        "user_id": user_id,
        "learning_consistency": data.get("learning_consistency", {}),
        "consistency_score": data.get("learning_consistency", {}).get("consistency_score", 0),
        "average_daily_minutes": data.get("learning_consistency", {}).get("average_daily_minutes", 0)
    }


@router.get("/milestones", response_model=List[Dict[str, Any]])
async def get_milestones(user_id: str = "user-123") -> List[Dict[str, Any]]:
    """Get upcoming milestones for user."""
    data = load_json_file("userDashboard.json")
    return data.get("upcoming_milestones", [])


@router.get("/achievements", response_model=List[Dict[str, Any]])
async def get_achievements(user_id: str = "user-123") -> List[Dict[str, Any]]:
    """Get user achievements and badges."""
    data = load_json_file("userDashboard.json")
    return data.get("achievements", [])


@router.get("/progress/overview", response_model=Dict[str, Any])
async def get_progress_overview(user_id: str = "user-123") -> Dict[str, Any]:
    """Get overall progress overview."""
    data = load_json_file("userDashboard.json")
    stats = data.get("dashboard_stats", {})
    enrolled_courses = data.get("enrolled_courses", [])

    return {
        "user_id": user_id,
        "total_enrolled": stats.get("enrolled_courses", 0),
        "total_completed": stats.get("completed_courses", 0),
        "in_progress": stats.get("in_progress_courses", 0),
        "total_learning_hours": stats.get("total_learning_hours", 0),
        "courses": enrolled_courses,
        "recommendations": data.get("recommended_next_steps", [])
    }


@router.get("/stats", response_model=Dict[str, Any])
async def get_stats(user_id: str = "user-123") -> Dict[str, Any]:
    """Get detailed user statistics."""
    data = load_json_file("userDashboard.json")
    stats = data.get("dashboard_stats", {})

    return {
        "user_id": user_id,
        "enrolled_courses": stats.get("enrolled_courses", 0),
        "completed_courses": stats.get("completed_courses", 0),
        "in_progress_courses": stats.get("in_progress_courses", 0),
        "total_learning_hours": stats.get("total_learning_hours", 0),
        "total_points_earned": stats.get("total_points_earned", 0),
        "current_streak_days": stats.get("current_streak_days", 0),
        "longest_streak_days": stats.get("longest_streak_days", 0)
    }


@router.get("/completed-courses", response_model=List[Dict[str, Any]])
async def get_completed_courses(user_id: str = "user-123") -> List[Dict[str, Any]]:
    """Get list of completed courses."""
    data = load_json_file("userDashboard.json")
    return data.get("completed_courses", [])
