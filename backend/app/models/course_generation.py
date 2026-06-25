"""
Course Generation Model
=======================

Table: course_generations
Purpose: Stores course generation requests from users
         Tracks the status through generation pipeline until admin review

Relationships:
    - Belongs to a user (who requested the generation)
    - May be related to a course (after approval)
"""

from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship
from app.database import Base


class CourseGeneration(Base):
    """
    Represents a user's course generation request.

    Attributes:
        id: Unique generation ID (Primary Key)
        user_id: User who requested the course generation (FK to users table)
        topic: Course topic/title
        difficulty_level: Difficulty level - Beginner, Intermediate, Advanced
        learning_duration: Duration - 1 Week, 2 Weeks, 1 Month, Custom
        expertise_domain: Domain/field of expertise
        relevant_tags: Tags related to the course
        status: Current status - pending, generating, generated, published, failed
        generated_course_data: Complete generated course structure (JSON format)
        created_course_id: If approved, ID of the created course (FK to courses table, optional)
        created_at: When the request was created
        updated_at: Last update timestamp
        generation_started_at: When AI generation started (optional)
        generation_completed_at: When AI generation completed (optional)
        error_message: If generation failed, the error details
    """

    __tablename__ = "course_generations"

    # Primary Key
    id = Column(Integer, primary_key=True, index=True)

    # Foreign Keys
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    created_course_id = Column(Integer, ForeignKey("courses.id"), nullable=True)

    # Course Details from User Input
    topic = Column(String(255), nullable=False)
    difficulty_level = Column(String(50), nullable=False)
    learning_duration = Column(String(50), nullable=False)
    expertise_domain = Column(String(255), nullable=True)
    relevant_tags = Column(String(500), nullable=True)

    # Generation Pipeline Status
    status = Column(String(50), default="pending", nullable=False, index=True)
    # Values: pending (awaiting AI generation), generating (in progress),
    #         generated (ready for review), published (approved by admin),
    #         failed (generation error)

    # Generated Course Data
    generated_course_data = Column(Text, nullable=True)
    # Stores complete course structure as JSON: {modules: [...], lessons: [...], quizzes: [...]}

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    generation_started_at = Column(DateTime, nullable=True)
    generation_completed_at = Column(DateTime, nullable=True)

    # Error Tracking
    error_message = Column(Text, nullable=True)

    # Queue Processing (for workflow: pending -> generating -> generated -> published/rejected)
    retry_count = Column(Integer, default=0)
    last_error = Column(Text, nullable=True)
    next_retry_at = Column(DateTime, nullable=True)
    attempt_number = Column(Integer, default=1)
    max_attempts = Column(Integer, default=3)

    # Admin Review
    approved_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    approved_at = Column(DateTime, nullable=True)
    reviewed_feedback = Column(Text, nullable=True)

    # Relationships
    user = relationship("User", foreign_keys=[user_id])
    created_course = relationship("Course", foreign_keys=[created_course_id])
    admin = relationship("User", foreign_keys=[approved_by])

    # Index for common queries
    __table_args__ = (
        Index("idx_user_status", "user_id", "status"),
        Index("idx_status_created", "status", "created_at"),
    )

    def __repr__(self):
        return f"<CourseGeneration(id={self.id}, topic='{self.topic}', status='{self.status}')>"
