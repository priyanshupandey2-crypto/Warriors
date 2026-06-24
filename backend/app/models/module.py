from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class Module(Base):
    """Represents a module within a course."""

    __tablename__ = "modules"

    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    order = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    course = relationship("Course", back_populates="modules_list")
    lessons = relationship("Lesson", back_populates="module")
    quizzes = relationship("Quiz", back_populates="module")

    def __repr__(self):
        return f"<Module(id={self.id}, course_id={self.course_id}, title='{self.title}')>"
