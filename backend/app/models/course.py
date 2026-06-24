"""
DATABASE INTEGRATION - Phase 3: Course Model
=============================================

Table: courses
Purpose: Master table for all published/generated courses

Maps to your schema:
    courses
    -------
    id PK
    title
    description
    difficulty
    duration_hours
    thumbnail_url
    status
    created_by
    created_at

Used by Dashboard Widgets:
    - Enrolled Courses (course title, difficulty, thumbnail, progress)
    - Continue Learning (course metadata)
    - Recently Completed (course name, certificate status)

Relationships:
    - One course has many user_courses (enrollment records)
    - One course has many learning_activities
    - One course has many milestones
"""

from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from app.database import Base


class Course(Base):
    """
    Represents a course in the learning platform.

    Attributes:
        id: Unique course identifier (Primary Key)
        title: Course name (e.g., "Python for Data Science")
        description: Detailed course description
        difficulty: Skill level (Beginner, Intermediate, Advanced)
        duration_hours: Total course duration in hours
        thumbnail_url: URL to course preview image
        status: Published status (draft, published, archived)
        created_by: User ID of course creator
        created_at: Course creation timestamp
    """

    __tablename__ = "courses"

    # DATABASE INTEGRATION - Phase 3: Primary Key
    # Auto-incrementing integer ID
    id = Column(Integer, primary_key=True, index=True)

    # DATABASE INTEGRATION - Phase 3: Course Metadata
    # Course title/name
    title = Column(String(255), nullable=False, index=True)

    # Detailed description of the course
    description = Column(Text, nullable=True)

    # DATABASE INTEGRATION - Phase 3: Difficulty Level
    # ENUM: 'Beginner', 'Intermediate', 'Advanced'
    # Used in dashboard to display course difficulty badge
    difficulty = Column(String(50), nullable=False)  # Beginner, Intermediate, Advanced

    # Total hours to complete this course
    duration_hours = Column(Integer, nullable=True)

    # DATABASE INTEGRATION - Phase 3: Course Image
    # URL to course thumbnail (displayed in enrolled courses widget)
    thumbnail_url = Column(String(500), nullable=True)

    # DATABASE INTEGRATION - Phase 3: Course Status
    # draft: In development, hidden from users
    # published: Visible to users, can enroll
    # archived: Old courses, no new enrollments
    status = Column(String(50), default="published", nullable=False)

    # Course category (Computer Science, Business & Strategy, Creative Design, Marketing)
    category = Column(String(100), nullable=True)

    # DATABASE INTEGRATION - Phase 3: Course Author
    # Foreign key to users table (who created this course)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)

    # DATABASE INTEGRATION - Phase 3: Timestamps
    # When this course was created
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # DATABASE INTEGRATION - Phase 3: Relationships
    # user_courses: All enrollments for this course
    # learning_activities: All activity records for this course
    # milestones: All assignments/deadlines for this course
    # lessons: All lessons in this course
    # quizzes: All quizzes in this course
    user_courses = relationship("UserCourse", back_populates="course")
    learning_activities = relationship("LearningActivity", back_populates="course")
    milestones = relationship("Milestone", back_populates="course")
    lessons = relationship("Lesson", back_populates="course")
    quizzes = relationship("Quiz", back_populates="course")

    def __repr__(self):
        return f"<Course(id={self.id}, title='{self.title}', difficulty='{self.difficulty}')>"
