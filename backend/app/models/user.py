from sqlalchemy import Column, Integer, String, ARRAY
from sqlalchemy.orm import relationship
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(50), default="learner")
    courses_enrolled = Column(ARRAY(Integer), default=[], nullable=False)

    user_courses = relationship("UserCourse", back_populates="user")
    lesson_progress = relationship("UserLessonProgress", back_populates="user")
    learning_activities = relationship("LearningActivity", back_populates="user")
    user_goals = relationship("UserGoal", back_populates="user")
    milestones = relationship("Milestone", back_populates="user")
    quiz_submissions = relationship("QuizSubmission", back_populates="user")
