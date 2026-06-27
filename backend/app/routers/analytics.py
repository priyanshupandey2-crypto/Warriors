from fastapi import APIRouter, HTTPException, status, Depends, Request
from sqlalchemy.orm import Session
from app.database import get_db
from app.repositories.dashboard_repository import DashboardRepository
from typing import Dict, Any, List

router = APIRouter(prefix="/api/user", tags=["analytics"])


@router.get("/dashboard", response_model=Dict[str, Any])
async def get_dashboard(request: Request, db: Session = Depends(get_db)) -> Dict[str, Any]:
    """Get user dashboard with all analytics."""
    current_user = getattr(request.state, "user", None)
    if not current_user:
        raise HTTPException(status_code=401, detail="User not authenticated")
    user_id = int(current_user.get("sub"))
    repo = DashboardRepository(db)

    return {
        "user_id": user_id,
        "greeting": repo.get_user_greeting(user_id),
        "stats": repo.get_stats(user_id),
        "weekly_activity": repo.get_weekly_activity(user_id),
        "weekly_goal": repo.get_weekly_goal(user_id),
        "milestones": repo.get_milestones(user_id),
        "enrolled_courses": repo.get_enrolled_courses(user_id),
        "completed_courses": repo.get_recently_completed(user_id)
    }


@router.get("/analytics/activity", response_model=Dict[str, Any])
async def get_activity(request: Request, db: Session = Depends(get_db)) -> Dict[str, Any]:
    """Get user activity for the week."""
    current_user = getattr(request.state, "user", None)
    if not current_user:
        raise HTTPException(status_code=401, detail="User not authenticated")
    user_id = int(current_user.get("sub"))
    repo = DashboardRepository(db)
    weekly_activity = repo.get_weekly_activity(user_id)

    return {
        "user_id": user_id,
        "weekly_activity": weekly_activity,
        "total_minutes_this_week": sum(item["minutes"] for item in weekly_activity.get("week_data", []))
    }


@router.get("/analytics/consistency", response_model=Dict[str, Any])
async def get_consistency(request: Request, db: Session = Depends(get_db)) -> Dict[str, Any]:
    """Get learning consistency metrics and heatmap."""
    current_user = getattr(request.state, "user", None)
    if not current_user:
        raise HTTPException(status_code=401, detail="User not authenticated")
    user_id = int(current_user.get("sub"))
    repo = DashboardRepository(db)
    monthly_consistency = repo.get_monthly_consistency(user_id)

    total_minutes = sum(item["minutes"] for item in monthly_consistency.get("consistency_data", []))
    days_with_activity = len([item for item in monthly_consistency.get("consistency_data", []) if item["minutes"] > 0])

    return {
        "user_id": user_id,
        "learning_consistency": monthly_consistency,
        "consistency_score": min((days_with_activity / 30) * 100, 100),
        "average_daily_minutes": total_minutes // 30 if days_with_activity > 0 else 0
    }


@router.get("/milestones", response_model=List[Dict[str, Any]])
async def get_milestones(request: Request, db: Session = Depends(get_db)) -> List[Dict[str, Any]]:
    """Get upcoming milestones for user."""
    current_user = getattr(request.state, "user", None)
    if not current_user:
        raise HTTPException(status_code=401, detail="User not authenticated")
    user_id = int(current_user.get("sub"))
    repo = DashboardRepository(db)
    milestones_data = repo.get_milestones(user_id)

    return milestones_data.get("milestones_list", [])


@router.get("/achievements", response_model=List[Dict[str, Any]])
async def get_achievements(request: Request, db: Session = Depends(get_db)) -> List[Dict[str, Any]]:
    """Get user achievements and badges."""
    current_user = getattr(request.state, "user", None)
    if not current_user:
        raise HTTPException(status_code=401, detail="User not authenticated")
    user_id = int(current_user.get("sub"))
    return []


@router.get("/progress/overview", response_model=Dict[str, Any])
async def get_progress_overview(request: Request, db: Session = Depends(get_db)) -> Dict[str, Any]:
    """Get overall progress overview."""
    current_user = getattr(request.state, "user", None)
    if not current_user:
        raise HTTPException(status_code=401, detail="User not authenticated")
    user_id = int(current_user.get("sub"))
    repo = DashboardRepository(db)
    stats = repo.get_stats(user_id)
    enrolled_courses = repo.get_enrolled_courses(user_id)

    return {
        "user_id": user_id,
        "total_enrolled": stats["enrolled_courses"],
        "total_completed": stats["completed_courses"],
        "in_progress": stats["enrolled_courses"] - stats["completed_courses"],
        "total_learning_hours": stats["learning_hours"],
        "courses": enrolled_courses.get("courses_list", []),
        "recommendations": []
    }


@router.get("/stats", response_model=Dict[str, Any])
async def get_stats(request: Request, db: Session = Depends(get_db)) -> Dict[str, Any]:
    """Get detailed user statistics."""
    current_user = getattr(request.state, "user", None)
    if not current_user:
        raise HTTPException(status_code=401, detail="User not authenticated")
    user_id = int(current_user.get("sub"))
    repo = DashboardRepository(db)
    stats = repo.get_stats(user_id)

    return {
        "user_id": user_id,
        "enrolled_courses": stats["enrolled_courses"],
        "completed_courses": stats["completed_courses"],
        "in_progress_courses": stats["enrolled_courses"] - stats["completed_courses"],
        "total_learning_hours": stats["learning_hours"],
        "total_points_earned": 0,
        "current_streak_days": stats["streak_days"],
        "longest_streak_days": stats["streak_days"]
    }


@router.get("/completed-courses", response_model=List[Dict[str, Any]])
async def get_completed_courses(request: Request, db: Session = Depends(get_db)) -> List[Dict[str, Any]]:
    """Get list of completed courses."""
    current_user = getattr(request.state, "user", None)
    if not current_user:
        raise HTTPException(status_code=401, detail="User not authenticated")
    user_id = int(current_user.get("sub"))
    repo = DashboardRepository(db)
    completed = repo.get_recently_completed(user_id)

    return completed.get("completed_list", [])
