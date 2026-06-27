"""
DATABASE INTEGRATION - Phase 3: Learning Activity Model
========================================================

Table: learning_activities
Purpose: Track daily learner activity (study sessions)

Maps to your schema:
    learning_activities
    -------------------
    id PK
    user_id FK
    course_id FK
    activity_date
    minutes_spent
    lessons_completed
    created_at

Used by Dashboard Widgets:
    - Learning Hours Card (SUM(minutes_spent) / 60)
    - Streak Days Card (Count consecutive days with activity)
    - Weekly Activity Chart (GROUP BY day, SUM(minutes_spent) for this week)
    - Monthly Consistency Heatmap (GROUP BY date, SUM(minutes_spent) for this month)

Query Examples:
    1. Total learning hours: SUM(minutes_spent) / 60 WHERE user_id = ?
    2. Weekly activity: SUM(minutes_spent) GROUP BY activity_date WHERE WEEK = current_week
    3. Monthly heatmap: SUM(minutes_spent) GROUP BY activity_date WHERE MONTH = current_month
    4. Streak calculation: COUNT(DISTINCT activity_date) WHERE activity_date IS CONSECUTIVE
"""

from datetime import datetime, date
from sqlalchemy import Column, Integer, Date, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class LearningActivity(Base):
    """
    Represents a user's learning activity for a specific date.
    Records how much time a user spent on a course on a given day.

    Attributes:
        id: Unique activity record ID
        user_id: Reference to users table
        course_id: Reference to courses table
        activity_date: Date of the activity (YYYY-MM-DD)
        minutes_spent: Minutes spent learning (e.g., 45, 90, 120)
        lessons_completed: Number of lessons finished on this date
        created_at: When this record was created
    """

    __tablename__ = "learning_activities"

    # DATABASE INTEGRATION - Phase 3: Primary Key
    # Unique activity record ID
    id = Column(Integer, primary_key=True, index=True)

    # DATABASE INTEGRATION - Phase 3: Foreign Keys
    # Which user performed this activity
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    # Which course was being studied
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False, index=True)

    # DATABASE INTEGRATION - Phase 3: Activity Tracking
    # Date when activity occurred (not timestamp, just date)
    # This allows one activity record per user per course per day
    activity_date = Column(Date, nullable=False, index=True)

    # DATABASE INTEGRATION - Phase 3: Time Tracking
    # How many minutes user spent learning on this date
    # Examples: 45 min (short session), 90 min (medium), 120 min (long)
    # Used for calculations:
    #   - Total learning hours = SUM(minutes_spent) / 60
    #   - Weekly chart = SUM(minutes_spent) GROUP BY day
    #   - Monthly heatmap = SUM(minutes_spent) GROUP BY date
    minutes_spent = Column(Integer, default=0, nullable=False)

    # DATABASE INTEGRATION - Phase 3: Lesson Completion
    # Number of lessons completed in this learning session
    # Used for streak calculation and achievement tracking
    lessons_completed = Column(Integer, default=0, nullable=False)

    # DATABASE INTEGRATION - Phase 3: Record Creation Timestamp
    # When this activity record was created (auto-set)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # DATABASE INTEGRATION - Phase 3: Relationships
    # Access related user and course objects
    user = relationship("User", back_populates="learning_activities")
    course = relationship("Course", back_populates="learning_activities")

    def __repr__(self):
        return f"<LearningActivity(user_id={self.user_id}, course_id={self.course_id}, date={self.activity_date}, minutes={self.minutes_spent})>"
