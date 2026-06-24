"""
Clean up courses from the database
===================================

This script deletes all existing courses and related data.

Run: python cleanup_courses.py
"""

import sys

# Fix encoding on Windows
if sys.platform.startswith('win'):
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

from sqlalchemy.orm import Session
from app.database import SessionLocal, Base, engine
from app.models.course import Course
from app.models.module import Module
from app.models.lesson import Lesson
from app.models.quiz import Quiz, QuizSubmission
from app.models.user_course import UserCourse
from app.models.user_lesson_progress import UserLessonProgress
from app.models.course_generation import CourseGeneration

# Ensure tables exist
Base.metadata.create_all(bind=engine)


def cleanup_courses():
    """Delete all courses and related data from the database."""
    db = SessionLocal()

    try:
        # Delete in order of dependencies
        print("[INFO] Deleting quiz submissions...")
        deleted = db.query(QuizSubmission).delete()
        print(f"[OK] Deleted {deleted} quiz submissions")

        print("[INFO] Deleting user lesson progress...")
        deleted = db.query(UserLessonProgress).delete()
        print(f"[OK] Deleted {deleted} user lesson progress records")

        print("[INFO] Deleting user course enrollments...")
        deleted = db.query(UserCourse).delete()
        print(f"[OK] Deleted {deleted} user course enrollments")

        print("[INFO] Deleting quizzes...")
        deleted = db.query(Quiz).delete()
        print(f"[OK] Deleted {deleted} quizzes")

        print("[INFO] Deleting lessons...")
        deleted = db.query(Lesson).delete()
        print(f"[OK] Deleted {deleted} lessons")

        print("[INFO] Deleting modules...")
        deleted = db.query(Module).delete()
        print(f"[OK] Deleted {deleted} modules")

        print("[INFO] Deleting course generations...")
        deleted = db.query(CourseGeneration).delete()
        print(f"[OK] Deleted {deleted} course generations")

        print("[INFO] Deleting courses...")
        deleted = db.query(Course).delete()
        print(f"[OK] Deleted {deleted} courses")

        db.commit()
        print(f"\n[OK] Successfully cleaned up all courses from the database!")

    except Exception as e:
        print(f"[ERROR] Error cleaning up courses: {str(e)}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    cleanup_courses()
