"""
Dashboard API Schemas

Defines Pydantic models for all dashboard endpoints.
These schemas serve as the API contract between frontend and backend.
"""

from pydantic import BaseModel, Field
from typing import List
from datetime import date as dateType


# ============================================================================
# SECTION 1: USER STATS
# ============================================================================

class Stats(BaseModel):
    """User summary statistics displayed as cards"""

    enrolled_courses: int = Field(..., ge=0, description="Total courses user is enrolled in")
    completed_courses: int = Field(..., ge=0, description="Number of completed courses")
    learning_hours: float = Field(..., ge=0, description="Total cumulative learning hours")
    streak_days: int = Field(..., ge=0, description="Current consecutive days learning streak")

    class Config:
        json_schema_extra = {
            "example": {
                "enrolled_courses": 12,
                "completed_courses": 4,
                "learning_hours": 84.5,
                "streak_days": 7
            }
        }


# ============================================================================
# SECTION 2: WEEKLY ACTIVITY
# ============================================================================

class DayActivity(BaseModel):
    """Learning activity for a single day"""

    day: str = Field(..., pattern="^(Mon|Tue|Wed|Thu|Fri|Sat|Sun)$", description="Day of week")
    minutes: int = Field(..., ge=0, description="Learning minutes on that day")

    class Config:
        json_schema_extra = {
            "example": {
                "day": "Wed",
                "minutes": 10
            }
        }


class WeeklyActivity(BaseModel):
    """Weekly activity data - 7 days of learning minutes"""

    week_data: List[DayActivity] = Field(..., min_length=7, max_length=7, description="Activity for each day of week")

    class Config:
        json_schema_extra = {
            "example": {
                "week_data": [
                    {"day": "Mon", "minutes": 45},
                    {"day": "Tue", "minutes": 60},
                    {"day": "Wed", "minutes": 10},
                    {"day": "Thu", "minutes": 75},
                    {"day": "Fri", "minutes": 50},
                    {"day": "Sat", "minutes": 40},
                    {"day": "Sun", "minutes": 30}
                ]
            }
        }


# ============================================================================
# SECTION 3: WEEKLY GOAL
# ============================================================================

class WeeklyGoal(BaseModel):
    """Weekly learning goal progress"""

    completed_hours: float = Field(..., ge=0, description="Hours learned this week")
    target_hours: float = Field(..., gt=0, description="Weekly learning goal in hours")
    percentage: int = Field(..., ge=0, le=100, description="Progress percentage (0-100)")

    class Config:
        json_schema_extra = {
            "example": {
                "completed_hours": 12.0,
                "target_hours": 15.0,
                "percentage": 80
            }
        }


# ============================================================================
# SECTION 4: MONTHLY CONSISTENCY
# ============================================================================

class DayConsistency(BaseModel):
    """Activity for a single day in monthly heatmap"""

    date: dateType = Field(..., description="Date in YYYY-MM-DD format")
    minutes: int = Field(..., ge=0, description="Learning minutes on that day")

    class Config:
        json_schema_extra = {
            "example": {
                "date": "2026-06-15",
                "minutes": 120
            }
        }


class MonthlyConsistency(BaseModel):
    """Monthly activity heatmap data"""

    consistency_data: List[DayConsistency] = Field(..., description="Activity for each day of month")

    class Config:
        json_schema_extra = {
            "example": {
                "consistency_data": [
                    {"date": "2026-06-01", "minutes": 0},
                    {"date": "2026-06-02", "minutes": 120},
                    {"date": "2026-06-03", "minutes": 85}
                ]
            }
        }


# ============================================================================
# SECTION 5: UPCOMING MILESTONES
# ============================================================================

class Milestone(BaseModel):
    """Individual milestone/deadline"""

    id: int = Field(..., gt=0, description="Unique milestone identifier")
    title: str = Field(..., min_length=1, max_length=255, description="Milestone title")
    due_date: dateType = Field(..., description="Due date in YYYY-MM-DD format")
    status: str = Field(..., pattern="^(pending|completed|overdue)$", description="Milestone status")

    class Config:
        json_schema_extra = {
            "example": {
                "id": 1,
                "title": "UX Design Sprint",
                "due_date": "2026-06-25",
                "status": "pending"
            }
        }


class Milestones(BaseModel):
    """Collection of upcoming milestones"""

    milestones_list: List[Milestone] = Field(..., description="List of milestones sorted by due_date")

    class Config:
        json_schema_extra = {
            "example": {
                "milestones_list": [
                    {
                        "id": 1,
                        "title": "UX Design Sprint",
                        "due_date": "2026-06-25",
                        "status": "pending"
                    },
                    {
                        "id": 2,
                        "title": "Python Basics Final",
                        "due_date": "2026-06-23",
                        "status": "pending"
                    }
                ]
            }
        }


# ============================================================================
# SECTION 6: ENROLLED COURSES
# ============================================================================

class Course(BaseModel):
    """Course user is enrolled in"""

    id: int = Field(..., gt=0, description="Unique course identifier")
    title: str = Field(..., min_length=1, max_length=255, description="Course title")
    difficulty: str = Field(..., pattern="^(Beginner|Intermediate|Advanced)$", description="Difficulty level")
    thumbnail_url: str = Field(..., description="URL to course thumbnail image")
    current_module: str = Field(..., min_length=1, max_length=255, description="Current module name")
    progress_percentage: int = Field(..., ge=0, le=100, description="Overall course progress (0-100)")
    completed_lessons: int = Field(..., ge=0, description="Number of lessons completed")
    total_lessons: int = Field(..., gt=0, description="Total lessons in course")
    status: str = Field(..., pattern="^(not_started|in_progress|completed)$", description="Course status")

    class Config:
        json_schema_extra = {
            "example": {
                "id": 2,
                "title": "Python for Data Science",
                "difficulty": "Intermediate",
                "thumbnail_url": "https://example.com/python-course.jpg",
                "current_module": "Module 2: Pandas & NumPy",
                "progress_percentage": 32,
                "completed_lessons": 4,
                "total_lessons": 12,
                "status": "in_progress"
            }
        }


class EnrolledCourses(BaseModel):
    """Collection of enrolled courses"""

    courses_list: List[Course] = Field(..., description="List of enrolled courses")

    class Config:
        json_schema_extra = {
            "example": {
                "courses_list": [
                    {
                        "id": 1,
                        "title": "Mastering UX Psychology",
                        "difficulty": "Advanced",
                        "thumbnail_url": "https://example.com/ux-course.jpg",
                        "current_module": "Module 4: Cognitive Biases",
                        "progress_percentage": 65,
                        "completed_lessons": 12,
                        "total_lessons": 18,
                        "status": "in_progress"
                    }
                ]
            }
        }


# ============================================================================
# SECTION 7: RECENTLY COMPLETED
# ============================================================================

class CompletedCourse(BaseModel):
    """Recently completed course"""

    id: int = Field(..., gt=0, description="Unique course identifier")
    course_name: str = Field(..., min_length=1, max_length=255, description="Course title")
    certificate_earned: bool = Field(..., description="Whether user earned a certificate")
    completion_date: dateType = Field(..., description="Date course was completed (YYYY-MM-DD)")

    class Config:
        json_schema_extra = {
            "example": {
                "id": 1,
                "course_name": "AI Foundations",
                "certificate_earned": True,
                "completion_date": "2026-06-20"
            }
        }


class RecentlyCompleted(BaseModel):
    """Collection of recently completed courses"""

    completed_list: List[CompletedCourse] = Field(..., description="Completed courses sorted by most recent")

    class Config:
        json_schema_extra = {
            "example": {
                "completed_list": [
                    {
                        "id": 1,
                        "course_name": "AI Foundations",
                        "certificate_earned": True,
                        "completion_date": "2026-06-20"
                    }
                ]
            }
        }


# ============================================================================
# COMPLETE DASHBOARD RESPONSE
# ============================================================================

class DashboardResponse(BaseModel):
    """
    Complete dashboard response containing all sections.

    This is the main API contract for GET /api/v1/dashboard
    """

    stats: Stats = Field(..., description="User summary statistics")
    weekly_activity: WeeklyActivity = Field(..., description="Weekly activity chart data")
    weekly_goal: WeeklyGoal = Field(..., description="Weekly goal progress")
    monthly_consistency: MonthlyConsistency = Field(..., description="Monthly activity heatmap")
    milestones: Milestones = Field(..., description="Upcoming milestones/deadlines")
    enrolled_courses: EnrolledCourses = Field(..., description="Enrolled courses")
    recently_completed: RecentlyCompleted = Field(..., description="Recently completed courses")

    class Config:
        json_schema_extra = {
            "example": {
                "stats": {
                    "enrolled_courses": 12,
                    "completed_courses": 4,
                    "learning_hours": 84.5,
                    "streak_days": 7
                },
                "weekly_activity": {
                    "week_data": [
                        {"day": "Mon", "minutes": 45},
                        {"day": "Tue", "minutes": 60},
                        {"day": "Wed", "minutes": 10},
                        {"day": "Thu", "minutes": 75},
                        {"day": "Fri", "minutes": 50},
                        {"day": "Sat", "minutes": 40},
                        {"day": "Sun", "minutes": 30}
                    ]
                },
                "weekly_goal": {
                    "completed_hours": 12.0,
                    "target_hours": 15.0,
                    "percentage": 80
                },
                "monthly_consistency": {
                    "consistency_data": [
                        {"date": "2026-06-01", "minutes": 0},
                        {"date": "2026-06-02", "minutes": 120},
                        {"date": "2026-06-03", "minutes": 85}
                    ]
                },
                "milestones": {
                    "milestones_list": [
                        {
                            "id": 1,
                            "title": "UX Design Sprint",
                            "due_date": "2026-06-25",
                            "status": "pending"
                        }
                    ]
                },
                "enrolled_courses": {
                    "courses_list": [
                        {
                            "id": 2,
                            "title": "Python for Data Science",
                            "difficulty": "Intermediate",
                            "thumbnail_url": "https://example.com/python.jpg",
                            "current_module": "Module 2: Pandas & NumPy",
                            "progress_percentage": 32,
                            "completed_lessons": 4,
                            "total_lessons": 12,
                            "status": "in_progress"
                        }
                    ]
                },
                "recently_completed": {
                    "completed_list": [
                        {
                            "id": 1,
                            "course_name": "AI Foundations",
                            "certificate_earned": True,
                            "completion_date": "2026-06-20"
                        }
                    ]
                }
            }
        }
