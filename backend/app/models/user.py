"""
DATABASE INTEGRATION - Phase 3: User Model
============================================

Table: users
Purpose: Stores learner/user information

Maps to your schema:
    users
    -----
    id PK
    name
    email
    created_at

Used by Dashboard Widget:
    - "Hello, Alex Chen" greeting
    - User profile information
    - Authentication context

Relationships:
    - One user has many courses (via UserCourse)
    - One user has many learning activities
    - One user has many goals
    - One user has many milestones
"""

from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
from app.database import Base


class User(Base):
    """
    Represents a learner/user in the system.

    Attributes:
        id: Unique user identifier (Primary Key)
        name: User's full name (e.g., "Alex Chen")
        email: User's email address (unique, used for authentication)
        created_at: Account creation timestamp
    """

    __tablename__ = "users"

    # DATABASE INTEGRATION - Phase 3: Primary Key
    # Auto-incrementing integer ID
    id = Column(Integer, primary_key=True, index=True)

    # DATABASE INTEGRATION - Phase 3: User Information
    # Name of the learner (displayed in dashboard greeting)
    name = Column(String(255), nullable=False)

    # Email address - unique identifier for authentication
    email = Column(String(255), unique=True, nullable=False, index=True)

    # DATABASE INTEGRATION - Phase 3: Timestamps
    # Account creation date (set automatically when record is created)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # DATABASE INTEGRATION - Phase 3: Relationships
    # These create convenient access patterns (optional, for convenience)
    # user.courses → all courses this user is enrolled in
    # user.learning_activities → all activities this user has done
    user_courses = relationship("UserCourse", back_populates="user")
    learning_activities = relationship("LearningActivity", back_populates="user")
    user_goals = relationship("UserGoal", back_populates="user")
    milestones = relationship("Milestone", back_populates="user")

    def __repr__(self):
        return f"<User(id={self.id}, name='{self.name}', email='{self.email}')>"
