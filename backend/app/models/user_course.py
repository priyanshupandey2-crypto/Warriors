"""
DATABASE INTEGRATION - Phase 3: User-Course Enrollment Model
=============================================================

Table: user_courses
Purpose: Represents enrollment relationship between users and courses
         This is the MOST IMPORTANT table for the dashboard

Maps to your schema:
    user_courses
    ------------
    id PK
    user_id FK
    course_id FK
    status (ENROLLED, IN_PROGRESS, COMPLETED)
    progress_percentage
    completed_lessons
    total_lessons
    enrolled_at
    last_accessed_at
    completed_at

Used by Dashboard Widgets:
    - Enrolled Courses Count (WHERE status IN ['ENROLLED', 'IN_PROGRESS'])
    - Completed Courses Count (WHERE status = 'COMPLETED')
    - Continue Learning Section (WHERE status = 'IN_PROGRESS')
    - Recently Completed Section (WHERE status = 'COMPLETED' ORDER BY completed_at)
    - Enrolled Courses Details (progress_percentage, completed_lessons/total_lessons)

Query Examples:
    1. Count enrolled courses: COUNT(*) WHERE status != 'COMPLETED'
    2. Count completed courses: COUNT(*) WHERE status = 'COMPLETED'
    3. Get in-progress courses: WHERE status = 'IN_PROGRESS' LIMIT 3
    4. Get completed courses: WHERE status = 'COMPLETED' ORDER BY completed_at DESC
"""

from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class UserCourse(Base):
    """
    Represents a user's enrollment in a course.
    Tracks progress, completion status, and access history.

    Attributes:
        id: Unique enrollment identifier
        user_id: Reference to users table (who is enrolled)
        course_id: Reference to courses table (which course)
        status: Enrollment status (ENROLLED, IN_PROGRESS, COMPLETED)
        progress_percentage: Overall course completion % (0-100)
        completed_lessons: Number of lessons finished by user
        total_lessons: Total lessons in the course
        enrolled_at: When user enrolled in this course
        last_accessed_at: When user last accessed this course
        completed_at: When user finished this course (NULL if not completed)
    """

    __tablename__ = "user_courses"

    # DATABASE INTEGRATION - Phase 3: Primary Key
    # Unique enrollment record ID
    id = Column(Integer, primary_key=True, index=True)

    # DATABASE INTEGRATION - Phase 3: Foreign Keys
    # Which user is enrolled
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    # Which course the user is taking
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False, index=True)

    # DATABASE INTEGRATION - Phase 3: Enrollment Status
    # Three possible states:
    # - ENROLLED: User just enrolled, hasn't started
    # - IN_PROGRESS: User is actively learning
    # - COMPLETED: User finished all lessons
    # Used to calculate:
    #   - Enrolled courses count (ENROLLED + IN_PROGRESS)
    #   - Completed courses count (COMPLETED)
    #   - Continue learning section (IN_PROGRESS only)
    status = Column(String(50), default="ENROLLED", nullable=False, index=True)

    # DATABASE INTEGRATION - Phase 3: Progress Tracking
    # Percentage of course completed (0-100)
    # Calculated from: (completed_lessons / total_lessons) * 100
    # Displayed in "65% Complete" on dashboard
    progress_percentage = Column(Integer, default=0)

    # DATABASE INTEGRATION - Phase 3: Lesson Tracking
    # How many lessons user has finished in this course
    completed_lessons = Column(Integer, default=0)

    # Total lessons in this course
    # Used to calculate progress: "12/18 Lessons" display
    total_lessons = Column(Integer, nullable=False)

    # DATABASE INTEGRATION - Phase 3: Timestamps
    # When user enrolled in this course
    enrolled_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Last time user accessed this course
    # Used to sort "Continue Learning" section (most recent first)
    last_accessed_at = Column(DateTime, nullable=True)

    # When user completed this course
    # Only set when status = 'COMPLETED'
    # Used to sort "Recently Completed" section (newest first)
    completed_at = Column(DateTime, nullable=True)

    # DATABASE INTEGRATION - Phase 3: Relationships
    # Access related user and course objects
    user = relationship("User", back_populates="user_courses")
    course = relationship("Course", back_populates="user_courses")

    def __repr__(self):
        return f"<UserCourse(user_id={self.user_id}, course_id={self.course_id}, status='{self.status}')>"
