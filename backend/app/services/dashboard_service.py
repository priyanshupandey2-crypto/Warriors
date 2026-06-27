"""
DATABASE INTEGRATION - Phase 6: Dashboard Service Layer
========================================================

Purpose:
    Handles business logic for dashboard operations.
    Acts as intermediary between API routes and database repository.
    Currently COMMENTED OUT: Uses mock data for testing
    Will use database queries via repository layer

Architecture:
    Routes (routers/dashboard.py)
        ↓
    Service (services/dashboard_service.py) ← YOU ARE HERE
        ↓
    Repository (repositories/dashboard_repository.py)
        ↓
    Database (PostgreSQL)

Migration Status:
    OLD (Commented Out): load_mock_data() from dashboard.json
    NEW (Ready): get_dashboard(user_id) with repository queries
"""

from typing import Dict, Any
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.schemas.dashboard import DashboardResponse
from app.repositories.dashboard_repository import DashboardRepository


class DashboardService:
    """
    DATABASE INTEGRATION - Phase 6: Service for dashboard operations

    Routes call this service with user_id.
    Service creates repository instance.
    Repository queries PostgreSQL.
    Returns formatted DashboardResponse.
    """

    # DATABASE INTEGRATION - Phase 6: COMMENTED OUT MOCK DATA
    # This loads from dashboard.json file (old method)
    # Keeping for reference during transition to database

    # @staticmethod
    # def load_mock_data() -> Dict[str, Any]:
    #     """
    #     DEPRECATED - Commented out for PostgreSQL migration
    #     This loaded mock dashboard data from JSON file.
    #
    #     Old file path: backend/app/data/dashboard.json
    #     Reason commented: Database Integration Phase - using real data from PostgreSQL
    #     """
    #     file_path = DATA_DIR / "dashboard.json"
    #     try:
    #         with open(file_path, 'r', encoding='utf-8') as f:
    #             return json.load(f)
    #     except FileNotFoundError:
    #         raise HTTPException(
    #             status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
    #             detail=f"Mock data file not found: dashboard.json"
    #         )
    #     except json.JSONDecodeError:
    #         raise HTTPException(
    #             status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
    #             detail=f"Invalid JSON in mock data: dashboard.json"
    #         )

    @classmethod
    def get_dashboard(cls, user_id: int, db: Session) -> DashboardResponse:
        """
        DATABASE INTEGRATION - Phase 6: Get complete dashboard data for a user

        Replaced: load_mock_data() with repository queries

        Flow:
        1. Create DashboardRepository instance with database session
        2. Call repository methods to get each section
        3. Combine results into DashboardResponse
        4. Return to API route

        Args:
            user_id: The authenticated user's ID (from JWT token)
            db: SQLAlchemy database session (from FastAPI dependency)

        Returns:
            DashboardResponse: Contains all dashboard sections from PostgreSQL
                - Greeting: User greeting message
                - Stats: User summary statistics
                - Weekly Activity: 7-day activity chart
                - Weekly Goal: Weekly learning goal progress
                - Monthly Consistency: Monthly activity heatmap
                - Milestones: Upcoming deadlines
                - Enrolled Courses: In-progress courses
                - Recently Completed: Recently completed courses

        Raises:
            HTTPException: If database queries fail
        """

        # DATABASE INTEGRATION - Phase 6: Initialize Repository
        # Repository will handle all PostgreSQL queries
        repo = DashboardRepository(db)

        try:
            # DATABASE INTEGRATION - Phase 6: Query User Greeting
            # Gets user name from users table and creates greeting message
            greeting = repo.get_user_greeting(user_id)

            # DATABASE INTEGRATION - Phase 6: Query Each Dashboard Section
            # Repository methods query PostgreSQL and return formatted data
            stats = repo.get_stats(user_id)
            weekly_activity = repo.get_weekly_activity(user_id)
            weekly_goal = repo.get_weekly_goal(user_id)
            monthly_consistency = repo.get_monthly_consistency(user_id)
            milestones = repo.get_milestones(user_id)
            enrolled_courses = repo.get_enrolled_courses(user_id)
            recently_completed = repo.get_recently_completed(user_id)

            # DATABASE INTEGRATION - Phase 6: Combine Results
            # Create DashboardResponse object with all sections
            dashboard_data = DashboardResponse(
                greeting=greeting,
                stats=stats,
                weekly_activity=weekly_activity,
                weekly_goal=weekly_goal,
                monthly_consistency=monthly_consistency,
                milestones=milestones,
                enrolled_courses=enrolled_courses,
                recently_completed=recently_completed
            )

            return dashboard_data

        except Exception as e:
            # DATABASE INTEGRATION - Phase 6: Error Handling
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to fetch dashboard data: {str(e)}"
            )

    # DATABASE INTEGRATION - Phase 6: COMMENTED OUT MOCK METHODS
    # These all used to call load_mock_data()
    # Replaced by single get_dashboard() method above

    # @classmethod
    # def get_stats(cls) -> Dict[str, Any]:
    #     """DEPRECATED - Use get_dashboard() instead"""
    #     data = cls.load_mock_data()
    #     return data.get("stats", {})

    # @classmethod
    # def get_weekly_activity(cls) -> Dict[str, Any]:
    #     """DEPRECATED - Use get_dashboard() instead"""
    #     data = cls.load_mock_data()
    #     return data.get("weekly_activity", {})

    # @classmethod
    # def get_weekly_goal(cls) -> Dict[str, Any]:
    #     """DEPRECATED - Use get_dashboard() instead"""
    #     data = cls.load_mock_data()
    #     return data.get("weekly_goal", {})

    # @classmethod
    # def get_monthly_consistency(cls) -> Dict[str, Any]:
    #     """DEPRECATED - Use get_dashboard() instead"""
    #     data = cls.load_mock_data()
    #     return data.get("monthly_consistency", {})

    # @classmethod
    # def get_milestones(cls) -> Dict[str, Any]:
    #     """DEPRECATED - Use get_dashboard() instead"""
    #     data = cls.load_mock_data()
    #     return data.get("milestones", {})

    # @classmethod
    # def get_enrolled_courses(cls) -> Dict[str, Any]:
    #     """DEPRECATED - Use get_dashboard() instead"""
    #     data = cls.load_mock_data()
    #     return data.get("enrolled_courses", {})

    # @classmethod
    # def get_recently_completed(cls) -> Dict[str, Any]:
    #     """DEPRECATED - Use get_dashboard() instead"""
    #     data = cls.load_mock_data()
    #     return data.get("recently_completed", {})
