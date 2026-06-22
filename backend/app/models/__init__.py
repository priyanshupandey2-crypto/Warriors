# DATABASE INTEGRATION - Phase 3: SQLAlchemy Models
# This package contains all database models (tables) for the application

from .user import User
from .course import Course
from .user_course import UserCourse
from .learning_activity import LearningActivity
from .user_goal import UserGoal
from .milestone import Milestone

__all__ = ["User", "Course", "UserCourse", "LearningActivity", "UserGoal", "Milestone"]
