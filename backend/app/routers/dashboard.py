"""
DATABASE INTEGRATION - Phase 7: Dashboard API Router
===================================================

Provides the /api/v1/dashboard endpoint for the AuraLearn dashboard.

Old Flow (Commented Out):
    Routes → Service → load_mock_data() from JSON

New Flow (DATABASE INTEGRATION):
    Routes → Extract user_id from JWT → Service → Repository → PostgreSQL

Uses the service layer to separate business logic from HTTP handling.
Repository layer to separate data access from business logic.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.schemas.dashboard import DashboardResponse
from app.services.dashboard_service import DashboardService
from app.database import get_db

router = APIRouter(prefix="/api/v1", tags=["dashboard"])


@router.get("/dashboard", response_model=DashboardResponse)
async def get_dashboard(db: Session = Depends(get_db)) -> DashboardResponse:
    """
    DATABASE INTEGRATION - Phase 7: Get complete dashboard data for authenticated user

    Replaced:
        OLD: DashboardService.get_dashboard() with mock data
        NEW: DashboardService.get_dashboard(user_id, db) with PostgreSQL queries

    Returns all dashboard sections from PostgreSQL:
    - User statistics (enrolled courses, completed courses, learning hours, streak)
    - Weekly activity (7-day chart data)
    - Weekly goal progress (current hours vs target)
    - Monthly consistency (heatmap data)
    - Upcoming milestones (deadlines)
    - Enrolled courses (in-progress courses with progress)
    - Recently completed courses

    Args:
        db: SQLAlchemy database session (provided by FastAPI dependency)
            This connects to PostgreSQL and is automatically closed after request

    Returns:
        DashboardResponse: Complete dashboard data with all sections from PostgreSQL

    Raises:
        HTTPException 401: If user not authenticated (JWT missing/invalid)
        HTTPException 500: If database queries fail

    TODO - Phase 8: Add JWT Authentication
        Current: Returns data for all users
        Next: Extract user_id from JWT token
        Example:
            @router.get("/dashboard")
            async def get_dashboard(
                current_user: User = Depends(get_current_user),
                db: Session = Depends(get_db)
            ) -> DashboardResponse:
                return DashboardService.get_dashboard(
                    user_id=current_user.id,
                    db=db
                )
    """

    # DATABASE INTEGRATION - Phase 7: Temporary User ID
    # IMPORTANT: This is hardcoded for testing only!
    # In production, extract from JWT token using dependency
    # See TODO comment above for proper implementation
    user_id = 1  # TODO: Get from JWT token (current_user.id)

    # DATABASE INTEGRATION - Phase 7: Call Service with Database Session
    # Service will:
    # 1. Create DashboardRepository instance
    # 2. Query PostgreSQL for all dashboard sections
    # 3. Combine results into DashboardResponse
    # 4. Return formatted data to frontend
    return DashboardService.get_dashboard(user_id=user_id, db=db)
