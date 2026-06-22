"""
Dashboard Service Layer

Handles business logic for dashboard operations.
Currently uses mock data; will be replaced with database queries later.

This separation allows the API layer to remain clean and makes it
easy to swap mock data with real database queries without changing routes.
"""

import json
from pathlib import Path
from typing import Dict, Any
from fastapi import HTTPException, status

from app.schemas.dashboard import DashboardResponse

DATA_DIR = Path(__file__).parent.parent / "data"


class DashboardService:
    """Service for dashboard operations"""

    @staticmethod
    def load_mock_data() -> Dict[str, Any]:
        """
        Load mock dashboard data from JSON file.

        This is a temporary implementation. In Phase 2 (Database Integration),
        this will be replaced with database queries.
        """
        file_path = DATA_DIR / "dashboard.json"
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except FileNotFoundError:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Mock data file not found: dashboard.json"
            )
        except json.JSONDecodeError:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Invalid JSON in mock data: dashboard.json"
            )

    @classmethod
    def get_dashboard(cls) -> DashboardResponse:
        """
        Get complete dashboard data for a user.

        Returns:
            DashboardResponse: Contains all dashboard sections
                - Stats: User summary statistics
                - Weekly Activity: 7-day activity chart
                - Weekly Goal: Weekly learning goal progress
                - Monthly Consistency: Monthly activity heatmap
                - Milestones: Upcoming deadlines
                - Enrolled Courses: In-progress courses
                - Recently Completed: Recently completed courses

        Raises:
            HTTPException: If data file cannot be loaded
        """
        data = cls.load_mock_data()
        return DashboardResponse(**data)

    @classmethod
    def get_stats(cls) -> Dict[str, Any]:
        """
        Get user statistics (enrolled, completed, hours, streak).

        Returns:
            dict: Statistics data

        TODO: Replace with database query when available
        """
        data = cls.load_mock_data()
        return data.get("stats", {})

    @classmethod
    def get_weekly_activity(cls) -> Dict[str, Any]:
        """
        Get weekly activity data (7-day chart).

        Returns:
            dict: Weekly activity with day-by-day minutes

        TODO: Replace with database query when available
        """
        data = cls.load_mock_data()
        return data.get("weekly_activity", {})

    @classmethod
    def get_weekly_goal(cls) -> Dict[str, Any]:
        """
        Get weekly goal progress (completed hours vs target).

        Returns:
            dict: Goal data with completed, target, and percentage

        TODO: Replace with database query when available
        """
        data = cls.load_mock_data()
        return data.get("weekly_goal", {})

    @classmethod
    def get_monthly_consistency(cls) -> Dict[str, Any]:
        """
        Get monthly consistency data (heatmap).

        Returns:
            dict: Monthly activity by date

        TODO: Replace with database query when available
        """
        data = cls.load_mock_data()
        return data.get("monthly_consistency", {})

    @classmethod
    def get_milestones(cls) -> Dict[str, Any]:
        """
        Get upcoming milestones/deadlines.

        Returns:
            dict: List of upcoming milestones

        TODO: Replace with database query when available
        """
        data = cls.load_mock_data()
        return data.get("milestones", {})

    @classmethod
    def get_enrolled_courses(cls) -> Dict[str, Any]:
        """
        Get enrolled courses with progress.

        Returns:
            dict: List of enrolled courses with progress data

        TODO: Replace with database query when available
        """
        data = cls.load_mock_data()
        return data.get("enrolled_courses", {})

    @classmethod
    def get_recently_completed(cls) -> Dict[str, Any]:
        """
        Get recently completed courses.

        Returns:
            dict: List of recently completed courses

        TODO: Replace with database query when available
        """
        data = cls.load_mock_data()
        return data.get("recently_completed", {})
