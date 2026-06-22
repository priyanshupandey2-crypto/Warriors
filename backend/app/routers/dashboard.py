"""
Dashboard API Router

Provides the /api/dashboard endpoint for the AuraLearn dashboard.
Currently returns mock data while backend infrastructure is being built.

Uses the service layer to separate business logic from HTTP handling.
"""

from fastapi import APIRouter
from app.schemas.dashboard import DashboardResponse
from app.services.dashboard_service import DashboardService

router = APIRouter(prefix="/api/v1", tags=["dashboard"])


@router.get("/dashboard", response_model=DashboardResponse)
async def get_dashboard() -> DashboardResponse:
    """
    Get complete dashboard data for authenticated user.

    Returns all dashboard sections:
    - User statistics (enrolled courses, completed courses, learning hours, streak)
    - Weekly activity (7-day chart data)
    - Weekly goal progress (current hours vs target)
    - Monthly consistency (heatmap data)
    - Upcoming milestones (deadlines)
    - Enrolled courses (in-progress courses with progress)
    - Recently completed courses

    **Note**: Currently returns mock data. Will be replaced with database queries
    when authentication and database layer are implemented.

    Returns:
        DashboardResponse: Complete dashboard data with all sections

    Raises:
        HTTPException 500: If mock data cannot be loaded
    """
    return DashboardService.get_dashboard()
