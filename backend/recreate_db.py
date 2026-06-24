"""
Recreate database tables with updated models
Run: python recreate_db.py
"""

from app.database import Base, engine
from app.models.user import User
from app.models.course import Course
from app.models.user_course import UserCourse
from app.models.learning_activity import LearningActivity
from app.models.milestone import Milestone
from app.models.lesson import Lesson
from app.models.quiz import Quiz

print("[INFO] Dropping all tables...")
Base.metadata.drop_all(bind=engine)

print("[INFO] Creating all tables...")
Base.metadata.create_all(bind=engine)

print("[SUCCESS] Database tables recreated!")
