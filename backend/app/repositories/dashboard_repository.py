"""
DATABASE INTEGRATION - Phase 5: Dashboard Repository
====================================================

Purpose:
    Data access layer for dashboard operations.
    Contains all SQL queries needed by the dashboard service.
    Queries PostgreSQL and returns structured data.

Architecture:
    Routes (routers/dashboard.py)
        ↓
    Service (services/dashboard_service.py)
        ↓
    Repository (repositories/dashboard_repository.py) ← YOU ARE HERE
        ↓
    Database (PostgreSQL)

Methods:
    - get_stats(): Enrolled/Completed/Hours/Streak
    - get_weekly_activity(): 7-day chart data
    - get_weekly_goal(): Weekly target progress
    - get_monthly_consistency(): Monthly heatmap
    - get_milestones(): Upcoming deadlines
    - get_enrolled_courses(): In-progress courses
    - get_recently_completed(): Completed courses

Each method queries PostgreSQL and returns a dictionary
that maps directly to the DashboardResponse schema.
"""

from datetime import datetime, timedelta, date
from typing import Dict, List, Any
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_
from app.models import User, Course, UserCourse, LearningActivity, UserGoal, Milestone


class DashboardRepository:
    """
    Repository for all dashboard-related database operations.
    Handles querying PostgreSQL and returning formatted data.
    """

    def __init__(self, db: Session):
        """
        Initialize repository with database session.

        Args:
            db: SQLAlchemy database session
        """
        self.db = db

    # ========================================================================
    # SECTION 0: USER GREETING
    # ========================================================================

    def get_user_greeting(self, user_id: int) -> str:
        """
        DATABASE INTEGRATION - Phase 5: Get User Greeting
        Returns: "Hello, {user_name}"

        Query Logic:
        SELECT name FROM users WHERE id = user_id

        Args:
            user_id: The user to get greeting for

        Returns:
            str: Greeting message (e.g., "Hello, Alex Chen")
        """

        # DATABASE INTEGRATION - Phase 5: Query User Name
        # Get user from users table
        user = self.db.query(User).filter(User.id == user_id).first()

        if user:
            return f"Hello, {user.name}"
        else:
            # Fallback if user not found
            return "Hello, Learner"

    # ========================================================================
    # SECTION 1: STATS (Enrolled, Completed, Hours, Streak)
    # ========================================================================

    def get_stats(self, user_id: int) -> Dict[str, Any]:
        """
        DATABASE INTEGRATION - Phase 5: Calculate User Statistics
        Calculates: enrolled courses, completed courses, total hours, streak

        Query Logic:
        1. Enrolled courses = COUNT(user_courses WHERE status IN ['ENROLLED','IN_PROGRESS'])
        2. Completed courses = COUNT(user_courses WHERE status = 'COMPLETED')
        3. Learning hours = SUM(learning_activities.minutes_spent) / 60
        4. Streak = Count consecutive days with activity >= threshold

        Args:
            user_id: The user to get stats for

        Returns:
            dict: {
                "enrolled_courses": 12,
                "completed_courses": 4,
                "learning_hours": 84.5,
                "streak_days": 7
            }
        """

        # DATABASE INTEGRATION - Phase 5: Count Enrolled Courses
        # Includes both 'ENROLLED' and 'IN_PROGRESS' status
        enrolled_count = self.db.query(func.count(UserCourse.id)).filter(
            and_(
                UserCourse.user_id == user_id,
                UserCourse.status.in_(["ENROLLED", "IN_PROGRESS"])
            )
        ).scalar() or 0

        # DATABASE INTEGRATION - Phase 5: Count Completed Courses
        # Only 'COMPLETED' status
        completed_count = self.db.query(func.count(UserCourse.id)).filter(
            and_(
                UserCourse.user_id == user_id,
                UserCourse.status == "COMPLETED"
            )
        ).scalar() or 0

        # DATABASE INTEGRATION - Phase 5: Calculate Total Learning Hours
        # SUM all minutes_spent and convert to hours
        total_minutes = self.db.query(func.sum(LearningActivity.minutes_spent)).filter(
            LearningActivity.user_id == user_id
        ).scalar() or 0

        learning_hours = round(total_minutes / 60, 1) if total_minutes > 0 else 0

        # DATABASE INTEGRATION - Phase 5: Calculate Learning Streak
        # Count consecutive days with learning activity
        streak_days = self._calculate_streak(user_id)

        return {
            "enrolled_courses": enrolled_count,
            "completed_courses": completed_count,
            "learning_hours": learning_hours,
            "streak_days": streak_days
        }

    # ========================================================================
    # SECTION 2: WEEKLY ACTIVITY (7-day chart)
    # ========================================================================

    def get_weekly_activity(self, user_id: int) -> Dict[str, List[Dict[str, Any]]]:
        """
        DATABASE INTEGRATION - Phase 5: Get Weekly Activity Data
        Returns: Minutes spent on each day of the current week

        Query Logic:
        SELECT SUM(minutes_spent), activity_date
        FROM learning_activities
        WHERE user_id = ? AND activity_date >= Monday AND activity_date <= Sunday
        GROUP BY activity_date

        Args:
            user_id: The user to get activity for

        Returns:
            dict: {
                "week_data": [
                    {"day": "Mon", "minutes": 45},
                    {"day": "Tue", "minutes": 60},
                    ...
                ]
            }
        """

        # DATABASE INTEGRATION - Phase 5: Calculate Week Boundaries
        # Get current week (Monday to Sunday)
        today = datetime.utcnow().date()
        monday = today - timedelta(days=today.weekday())
        sunday = monday + timedelta(days=6)

        # DATABASE INTEGRATION - Phase 5: Query Weekly Activity
        # Get minutes spent per day this week
        activities = self.db.query(
            LearningActivity.activity_date,
            func.sum(LearningActivity.minutes_spent).label("total_minutes")
        ).filter(
            and_(
                LearningActivity.user_id == user_id,
                LearningActivity.activity_date >= monday,
                LearningActivity.activity_date <= sunday
            )
        ).group_by(
            LearningActivity.activity_date
        ).all()

        # DATABASE INTEGRATION - Phase 5: Format Response
        # Create a map of date to minutes
        activity_map = {act[0]: act[1] or 0 for act in activities}

        # Map day numbers to day names
        day_names = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
        week_data = []

        # Generate data for each day of the week
        for i in range(7):
            current_date = monday + timedelta(days=i)
            day_name = day_names[i]
            minutes = activity_map.get(current_date, 0)

            week_data.append({
                "day": day_name,
                "minutes": minutes
            })

        return {
            "week_data": week_data
        }

    # ========================================================================
    # SECTION 3: WEEKLY GOAL (Target progress)
    # ========================================================================

    def get_weekly_goal(self, user_id: int) -> Dict[str, Any]:
        """
        DATABASE INTEGRATION - Phase 5: Get Weekly Goal Progress
        Returns: Current learning hours vs weekly target

        Query Logic:
        1. Get user's goal for current week
        2. Sum learning_activities.minutes_spent for this week
        3. Calculate percentage: (current / target) * 100

        Args:
            user_id: The user to get goal for

        Returns:
            dict: {
                "completed_hours": 12.0,
                "target_hours": 15.0,
                "percentage": 80
            }
        """

        # DATABASE INTEGRATION - Phase 5: Get Current Week Goal
        today = datetime.utcnow().date()
        goal = self.db.query(UserGoal).filter(
            and_(
                UserGoal.user_id == user_id,
                UserGoal.week_start <= today,
                UserGoal.week_end >= today
            )
        ).first()

        if not goal:
            # Default goal if not set
            target_hours = 15.0
        else:
            target_hours = goal.target_hours

        # DATABASE INTEGRATION - Phase 5: Calculate Current Week's Hours
        monday = today - timedelta(days=today.weekday())
        sunday = monday + timedelta(days=6)

        total_minutes = self.db.query(func.sum(LearningActivity.minutes_spent)).filter(
            and_(
                LearningActivity.user_id == user_id,
                LearningActivity.activity_date >= monday,
                LearningActivity.activity_date <= sunday
            )
        ).scalar() or 0

        completed_hours = round(total_minutes / 60, 1)

        # DATABASE INTEGRATION - Phase 5: Calculate Percentage
        percentage = int((completed_hours / target_hours) * 100) if target_hours > 0 else 0
        percentage = min(percentage, 100)  # Cap at 100%

        return {
            "completed_hours": completed_hours,
            "target_hours": target_hours,
            "percentage": percentage
        }

    # ========================================================================
    # SECTION 4: MONTHLY CONSISTENCY (Heatmap)
    # ========================================================================

    def get_monthly_consistency(self, user_id: int) -> Dict[str, List[Dict[str, Any]]]:
        """
        DATABASE INTEGRATION - Phase 5: Get Monthly Activity Heatmap Data
        Returns: Minutes spent on each day of the current month

        Query Logic:
        SELECT activity_date, SUM(minutes_spent)
        FROM learning_activities
        WHERE user_id = ? AND MONTH = current_month AND YEAR = current_year
        GROUP BY activity_date
        ORDER BY activity_date

        Args:
            user_id: The user to get consistency for

        Returns:
            dict: {
                "consistency_data": [
                    {"date": "2026-06-01", "minutes": 0},
                    {"date": "2026-06-02", "minutes": 120},
                    ...
                ]
            }
        """

        # DATABASE INTEGRATION - Phase 5: Get Current Month Boundaries
        today = datetime.utcnow().date()
        first_day = today.replace(day=1)
        if today.month == 12:
            last_day = first_day.replace(year=first_day.year + 1, month=1, day=1) - timedelta(days=1)
        else:
            last_day = first_day.replace(month=first_day.month + 1, day=1) - timedelta(days=1)

        # DATABASE INTEGRATION - Phase 5: Query Monthly Activity
        activities = self.db.query(
            LearningActivity.activity_date,
            func.sum(LearningActivity.minutes_spent).label("total_minutes")
        ).filter(
            and_(
                LearningActivity.user_id == user_id,
                LearningActivity.activity_date >= first_day,
                LearningActivity.activity_date <= last_day
            )
        ).group_by(
            LearningActivity.activity_date
        ).order_by(
            LearningActivity.activity_date
        ).all()

        # DATABASE INTEGRATION - Phase 5: Format Response
        # Create activity map for quick lookup
        activity_map = {act[0]: act[1] or 0 for act in activities}

        consistency_data = []
        current_date = first_day
        while current_date <= last_day:
            consistency_data.append({
                "date": current_date.isoformat(),
                "minutes": activity_map.get(current_date, 0)
            })
            current_date += timedelta(days=1)

        return {
            "consistency_data": consistency_data
        }

    # ========================================================================
    # SECTION 5: MILESTONES (Upcoming deadlines)
    # ========================================================================

    def get_milestones(self, user_id: int, limit: int = 5) -> Dict[str, List[Dict[str, Any]]]:
        """
        DATABASE INTEGRATION - Phase 5: Get Upcoming Milestones
        Returns: Next pending milestones sorted by due date

        Query Logic:
        SELECT * FROM milestones
        WHERE user_id = ? AND status = 'PENDING'
        ORDER BY due_date ASC
        LIMIT 5

        Args:
            user_id: The user to get milestones for
            limit: Maximum milestones to return (default 5)

        Returns:
            dict: {
                "milestones_list": [
                    {
                        "id": 1,
                        "title": "UX Design Sprint",
                        "due_date": "2026-06-25",
                        "status": "pending"
                    },
                    ...
                ]
            }
        """

        # DATABASE INTEGRATION - Phase 5: Query Pending Milestones
        milestones = self.db.query(Milestone).filter(
            and_(
                Milestone.user_id == user_id,
                Milestone.status == "PENDING"
            )
        ).order_by(
            Milestone.due_date.asc()
        ).limit(limit).all()

        # DATABASE INTEGRATION - Phase 5: Format Response
        milestones_list = [
            {
                "id": m.id,
                "title": m.title,
                "due_date": m.due_date.isoformat(),
                "status": m.status.lower()
            }
            for m in milestones
        ]

        return {
            "milestones_list": milestones_list
        }

    # ========================================================================
    # SECTION 6: ENROLLED COURSES (In-progress)
    # ========================================================================

    def get_enrolled_courses(self, user_id: int, limit: int = 10) -> Dict[str, List[Dict[str, Any]]]:
        """
        DATABASE INTEGRATION - Phase 5: Get Enrolled/In-Progress Courses
        Returns: User's active courses with progress details

        Query Logic:
        SELECT uc.*, c.*
        FROM user_courses uc
        JOIN courses c ON uc.course_id = c.id
        WHERE uc.user_id = ? AND uc.status = 'IN_PROGRESS'
        ORDER BY uc.last_accessed_at DESC
        LIMIT 10

        Args:
            user_id: The user to get courses for
            limit: Maximum courses to return (default 10)

        Returns:
            dict: {
                "courses_list": [
                    {
                        "id": 2,
                        "title": "Python for Data Science",
                        "difficulty": "Intermediate",
                        "thumbnail_url": "...",
                        "current_module": "Module 2: Pandas & NumPy",
                        "progress_percentage": 32,
                        "completed_lessons": 4,
                        "total_lessons": 12,
                        "status": "in_progress"
                    },
                    ...
                ]
            }
        """

        # DATABASE INTEGRATION - Phase 5: Query In-Progress Courses
        courses = self.db.query(UserCourse, Course).join(Course).filter(
            and_(
                UserCourse.user_id == user_id,
                UserCourse.status == "IN_PROGRESS"
            )
        ).order_by(
            UserCourse.last_accessed_at.desc()
        ).limit(limit).all()

        # DATABASE INTEGRATION - Phase 5: Format Response
        courses_list = [
            {
                "id": c[1].id,
                "title": c[1].title,
                "difficulty": c[1].difficulty,
                "thumbnail_url": c[1].thumbnail_url,
                "current_module": f"Module {self._get_current_module(c[0].completed_lessons, c[0].total_lessons)}: {self._get_module_name()}",
                "progress_percentage": c[0].progress_percentage,
                "completed_lessons": c[0].completed_lessons,
                "total_lessons": c[0].total_lessons,
                "status": "in_progress"
            }
            for c in courses
        ]

        return {
            "courses_list": courses_list
        }

    # ========================================================================
    # SECTION 7: RECENTLY COMPLETED (Certificates)
    # ========================================================================

    def get_recently_completed(self, user_id: int, limit: int = 10) -> Dict[str, List[Dict[str, Any]]]:
        """
        DATABASE INTEGRATION - Phase 5: Get Recently Completed Courses
        Returns: User's completed courses with certificate info

        Query Logic:
        SELECT uc.*, c.*
        FROM user_courses uc
        JOIN courses c ON uc.course_id = c.id
        WHERE uc.user_id = ? AND uc.status = 'COMPLETED'
        ORDER BY uc.completed_at DESC
        LIMIT 10

        Args:
            user_id: The user to get courses for
            limit: Maximum courses to return (default 10)

        Returns:
            dict: {
                "completed_list": [
                    {
                        "id": 1,
                        "course_name": "AI Foundations",
                        "certificate_earned": true,
                        "completion_date": "2026-06-20"
                    },
                    ...
                ]
            }
        """

        # DATABASE INTEGRATION - Phase 5: Query Completed Courses
        courses = self.db.query(UserCourse, Course).join(Course).filter(
            and_(
                UserCourse.user_id == user_id,
                UserCourse.status == "COMPLETED"
            )
        ).order_by(
            UserCourse.completed_at.desc()
        ).limit(limit).all()

        # DATABASE INTEGRATION - Phase 5: Format Response
        completed_list = [
            {
                "id": c[1].id,
                "course_name": c[1].title,
                "certificate_earned": True,  # All completed courses get certificate
                "completion_date": c[0].completed_at.date().isoformat() if c[0].completed_at else None
            }
            for c in courses
        ]

        return {
            "completed_list": completed_list
        }

    # ========================================================================
    # HELPER METHODS
    # ========================================================================

    def _calculate_streak(self, user_id: int, min_minutes: int = 10) -> int:
        """
        DATABASE INTEGRATION - Phase 5: Calculate Learning Streak
        Counts consecutive days with learning activity >= min_minutes

        Logic:
        1. Get all activity dates ordered DESC (newest first)
        2. Start from today, work backwards
        3. Count consecutive days with activity
        4. Stop when we hit a gap (day with 0 activity)

        Args:
            user_id: The user to calculate streak for
            min_minutes: Minimum minutes needed to count as active day (default 10)

        Returns:
            int: Number of consecutive active days
        """

        # Get all activity dates for this user, sorted newest first
        activities = self.db.query(
            LearningActivity.activity_date,
            func.sum(LearningActivity.minutes_spent).label("total_minutes")
        ).filter(
            LearningActivity.user_id == user_id
        ).group_by(
            LearningActivity.activity_date
        ).order_by(
            LearningActivity.activity_date.desc()
        ).all()

        if not activities:
            return 0

        # Count consecutive days from today backwards
        streak = 0
        today = datetime.utcnow().date()
        current_check_date = today

        for activity_date, total_minutes in activities:
            # If this date matches expected date (consecutive)
            if activity_date == current_check_date and (total_minutes or 0) >= min_minutes:
                streak += 1
                current_check_date -= timedelta(days=1)
            elif activity_date < current_check_date:
                # Gap found, stop counting
                break

        return streak

    def _get_current_module(self, completed: int, total: int) -> int:
        """
        DATABASE INTEGRATION - Phase 5: Calculate Current Module Number
        Example: If 4/12 lessons done, probably on module 2

        Args:
            completed: Lessons completed
            total: Total lessons

        Returns:
            int: Approximate module number
        """
        if total == 0:
            return 1
        return (completed // (total // 4)) + 1

    def _get_module_name(self) -> str:
        """
        DATABASE INTEGRATION - Phase 5: Get Module Name
        For now, returns generic names. Could be enhanced to pull from database.

        Returns:
            str: Module topic name
        """
        # This would ideally come from a modules table
        # For now, return placeholder
        return "Module Content"
