"""
Seed Course Generations Table
==============================

Script to initialize the course_generations table in the database.

Run: python seed_course_generations_table.py
"""

import sys
from sqlalchemy.orm import Session

# Fix encoding on Windows
if sys.platform.startswith('win'):
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

from app.database import SessionLocal, Base, engine
from app.models.course_generation import CourseGeneration


def init_course_generations_table():
    """Initialize the course_generations table."""
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # Check if table exists and is empty
        count = db.query(CourseGeneration).count()
        print(f"[INFO] Course generations table initialized. Current records: {count}")
    except Exception as e:
        print(f"[ERROR] Error initializing course generations table: {str(e)}")
    finally:
        db.close()


if __name__ == "__main__":
    init_course_generations_table()
