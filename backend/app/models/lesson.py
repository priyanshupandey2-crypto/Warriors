from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class Lesson(Base):
    """Represents a lesson within a course."""

    __tablename__ = "lessons"

    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False, index=True)
    module_id = Column(Integer, ForeignKey("modules.id"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    order = Column(Integer, nullable=False)
    content_markdown = Column(Text, nullable=True)
    duration_minutes = Column(Integer, default=0)
    learning_objectives = Column(Text, nullable=True)
    key_concepts = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    course = relationship("Course", back_populates="lessons")
    module = relationship("Module", back_populates="lessons")

    def __repr__(self):
        return f"<Lesson(id={self.id}, course_id={self.course_id}, title='{self.title}')>"
