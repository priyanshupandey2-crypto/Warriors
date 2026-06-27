from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from app.database import Base


class Quiz(Base):
    """Represents a quiz within a module."""

    __tablename__ = "quizzes"

    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False, index=True)
    module_id = Column(Integer, ForeignKey("modules.id"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    passing_score = Column(Integer, default=70)
    total_points = Column(Integer, default=100)
    duration_minutes = Column(Integer, default=30)
    order = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    course = relationship("Course", back_populates="quizzes")
    module = relationship("Module", back_populates="quizzes")
    questions = relationship("QuizQuestion", back_populates="quiz")
    submissions = relationship("QuizSubmission", back_populates="quiz")

    def __repr__(self):
        return f"<Quiz(id={self.id}, course_id={self.course_id}, title='{self.title}')>"


class QuizQuestion(Base):
    """Represents a question in a quiz."""

    __tablename__ = "quiz_questions"

    id = Column(Integer, primary_key=True, index=True)
    quiz_id = Column(Integer, ForeignKey("quizzes.id"), nullable=False, index=True)
    question_text = Column(Text, nullable=False)
    question_type = Column(String(50), default="multiple_choice")
    explanation = Column(Text, nullable=True)
    difficulty = Column(String(50), default="medium")
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    quiz = relationship("Quiz", back_populates="questions")
    options = relationship("QuestionOption", back_populates="question")

    def __repr__(self):
        return f"<QuizQuestion(id={self.id}, quiz_id={self.quiz_id})>"


class QuestionOption(Base):
    """Represents an answer option for a quiz question."""

    __tablename__ = "question_options"

    id = Column(Integer, primary_key=True, index=True)
    question_id = Column(Integer, ForeignKey("quiz_questions.id"), nullable=False, index=True)
    text = Column(Text, nullable=False)
    is_correct = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    question = relationship("QuizQuestion", back_populates="options")

    def __repr__(self):
        return f"<QuestionOption(id={self.id}, question_id={self.question_id})>"


class QuizSubmission(Base):
    """Represents a user's quiz submission."""

    __tablename__ = "quiz_submissions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    quiz_id = Column(Integer, ForeignKey("quizzes.id"), nullable=False, index=True)
    score = Column(Integer, nullable=True)
    passed = Column(Boolean, default=False)
    time_spent_minutes = Column(Integer, default=0)
    submitted_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="quiz_submissions")
    quiz = relationship("Quiz", back_populates="submissions")

    def __repr__(self):
        return f"<QuizSubmission(id={self.id}, user_id={self.user_id}, quiz_id={self.quiz_id})>"
