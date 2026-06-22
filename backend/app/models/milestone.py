"""
DATABASE INTEGRATION - Phase 3: Milestone Model
===============================================

Table: milestones
Purpose: Track upcoming deadlines and assignments

Maps to your schema:
    milestones
    ----------
    id PK
    user_id FK
    course_id FK
    title
    description
    due_date
    status (PENDING, COMPLETED)

Used by Dashboard Widget:
    - Upcoming Milestones (title, due_date, days_remaining)
    - Shows next 5 pending milestones sorted by due_date

Query Example:
    SELECT * FROM milestones
    WHERE user_id = ? AND status = 'PENDING'
    ORDER BY due_date ASC
    LIMIT 5
"""

from datetime import datetime, date
from sqlalchemy import Column, Integer, String, Text, Date, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class Milestone(Base):
    """
    Represents a course assignment, deadline, or milestone.

    Attributes:
        id: Unique milestone ID
        user_id: Reference to users table
        course_id: Reference to courses table (which course this milestone belongs to)
        title: Milestone name (e.g., "UX Design Sprint")
        description: Detailed description of the milestone
        due_date: When this milestone is due (YYYY-MM-DD)
        status: PENDING or COMPLETED
    """

    __tablename__ = "milestones"

    # DATABASE INTEGRATION - Phase 3: Primary Key
    # Unique milestone ID
    id = Column(Integer, primary_key=True, index=True)

    # DATABASE INTEGRATION - Phase 3: Foreign Keys
    # Which user this milestone belongs to
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    # Which course this milestone belongs to
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=True, index=True)

    # DATABASE INTEGRATION - Phase 3: Milestone Information
    # Title/name of the milestone
    # Example: "UX Design Sprint", "Python Basics Final"
    # Displayed in dashboard widget
    title = Column(String(255), nullable=False)

    # Detailed description of what needs to be done
    # Optional detailed information about the assignment
    description = Column(Text, nullable=True)

    # DATABASE INTEGRATION - Phase 3: Deadline
    # When this milestone/assignment is due
    # Format: YYYY-MM-DD (date only, no time)
    # Used to calculate "Due in 2 days", "Due tomorrow"
    due_date = Column(Date, nullable=False, index=True)

    # DATABASE INTEGRATION - Phase 3: Completion Status
    # Two states:
    # - PENDING: Assignment not yet completed, show in dashboard
    # - COMPLETED: Assignment finished, can hide from dashboard
    # Query for dashboard: WHERE status = 'PENDING' only
    status = Column(String(50), default="PENDING", nullable=False, index=True)

    # DATABASE INTEGRATION - Phase 3: Relationships
    user = relationship("User", back_populates="milestones")
    course = relationship("Course", back_populates="milestones")

    def __repr__(self):
        return f"<Milestone(id={self.id}, title='{self.title}', due_date={self.due_date}, status='{self.status}')>"
