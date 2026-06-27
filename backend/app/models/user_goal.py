"""
DATABASE INTEGRATION - Phase 3: User Goal Model
===============================================

Table: user_goals
Purpose: Track weekly learning targets

Maps to your schema:
    user_goals
    ----------
    id PK
    user_id FK
    target_hours
    current_hours
    week_start
    week_end

Used by Dashboard Widget:
    - Weekly Goal Progress (12 / 15 hours = 80%)

Query Example:
    SELECT target_hours, SUM(learning_activities.minutes_spent) / 60 as current_hours
    FROM user_goals
    WHERE user_id = ? AND CURRENT_DATE BETWEEN week_start AND week_end
"""

from datetime import datetime, date
from sqlalchemy import Column, Integer, Float, Date, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class UserGoal(Base):
    """
    Represents a user's weekly learning goal/target.

    Attributes:
        id: Unique goal record ID
        user_id: Reference to users table
        target_hours: How many hours user wants to learn this week (e.g., 15)
        current_hours: How many hours user has learned this week (calculated)
        week_start: Monday of this week (YYYY-MM-DD)
        week_end: Sunday of this week (YYYY-MM-DD)
    """

    __tablename__ = "user_goals"

    # DATABASE INTEGRATION - Phase 3: Primary Key
    # Unique goal record ID
    id = Column(Integer, primary_key=True, index=True)

    # DATABASE INTEGRATION - Phase 3: Foreign Key
    # Which user this goal belongs to
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    # DATABASE INTEGRATION - Phase 3: Weekly Target
    # How many hours user wants to learn this week
    # Example: 15 means "I want to learn 15 hours this week"
    # Displayed as "15" in "15 Hours" widget label
    target_hours = Column(Float, default=15.0, nullable=False)

    # DATABASE INTEGRATION - Phase 3: Current Progress
    # How many hours user has already learned THIS WEEK
    # Calculated from SUM(learning_activities.minutes_spent) / 60
    # WHERE activity_date >= week_start AND activity_date <= week_end
    # Example: 12 means "user has learned 12 hours so far this week"
    # Displayed as "12" in "12 / 15 hours" widget
    current_hours = Column(Float, default=0.0, nullable=False)

    # DATABASE INTEGRATION - Phase 3: Weekly Period
    # Start of the week (typically Monday)
    # Used to group activities into weeks
    week_start = Column(Date, nullable=False, index=True)

    # End of the week (typically Sunday)
    # Used to determine current week and calculate progress
    week_end = Column(Date, nullable=False, index=True)

    # DATABASE INTEGRATION - Phase 3: Relationships
    user = relationship("User", back_populates="user_goals")

    def __repr__(self):
        return f"<UserGoal(user_id={self.user_id}, target_hours={self.target_hours}, current_hours={self.current_hours})>"
