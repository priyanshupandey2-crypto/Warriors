"""
User Lesson Progress Model
Track individual lesson completion status for each user
"""

from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from app.database import Base


class UserLessonProgress(Base):
    """
    Tracks a user's progress through individual lessons in a course.

    Attributes:
        id: Unique progress record ID
        user_id: Reference to users table
        lesson_id: Reference to lessons table
        course_id: Reference to courses table
        is_completed: Whether the lesson is completed
        completed_at: When the lesson was completed
        last_accessed_at: When the lesson was last viewed
        time_spent_minutes: Total time spent on this lesson
    """

    __tablename__ = "user_lesson_progress"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    lesson_id = Column(Integer, ForeignKey("lessons.id"), nullable=False, index=True)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False, index=True)

    is_completed = Column(Boolean, default=False)
    completed_at = Column(DateTime, nullable=True)
    last_accessed_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    time_spent_minutes = Column(Integer, default=0)
    marked_to_revisit = Column(Boolean, default=False)
    revisit_marked_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="lesson_progress")
    lesson = relationship("Lesson")
    course = relationship("Course")

    def __repr__(self):
        return f"<UserLessonProgress(user_id={self.user_id}, lesson_id={self.lesson_id}, completed={self.is_completed})>"
