"""
Seed Course Generations
=======================

Script to populate the course_generations table with sample data for the review queue.

Run: python seed_course_generations.py
"""

import sys
import json
from datetime import datetime, timedelta

# Fix encoding on Windows
if sys.platform.startswith('win'):
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

from app.database import SessionLocal, Base, engine
from app.models.course_generation import CourseGeneration


def generate_course_data(topic: str, difficulty: str):
    """Generate mock course data structure."""
    return {
        "title": topic,
        "description": f"A {difficulty} level course on {topic}",
        "difficulty": difficulty,
        "duration_hours": 10,
        "category": "Computer Science",
        "modules": [
            {
                "title": f"Module 1: Introduction to {topic}",
                "description": f"Getting started with {topic}",
                "lessons": [
                    {
                        "title": f"Lesson 1: {topic} Basics",
                        "content_markdown": f"# {topic} Basics\n\nThis is an introduction to {topic}.",
                        "duration_minutes": 30,
                        "learning_objectives": f"Understand the fundamentals of {topic}",
                        "key_concepts": "basics, introduction, fundamentals"
                    }
                ],
                "quizzes": [
                    {
                        "title": f"{topic} Basics Quiz",
                        "description": f"Test your knowledge of {topic} basics",
                        "passing_score": 70,
                        "total_points": 100,
                        "duration_minutes": 15
                    }
                ]
            }
        ]
    }


# Mock AI-generated courses (with generated_course_data)
mock_generations = [
    # Awaiting Course Generation (status: pending)
    {
        "user_id": 1,
        "topic": "Machine Learning Fundamentals",
        "difficulty_level": "Beginner",
        "learning_duration": "1 Month",
        "expertise_domain": "Computer Science",
        "relevant_tags": "ML, Python, AI, Algorithms, Data Science",
        "status": "pending",
        "generated_course_data": None,
        "created_at": datetime.utcnow() - timedelta(hours=1),
    },
    {
        "user_id": 2,
        "topic": "Content Marketing Mastery",
        "difficulty_level": "Intermediate",
        "learning_duration": "2 Weeks",
        "expertise_domain": "Marketing",
        "relevant_tags": "Content, Marketing, Copywriting, Strategy, Engagement",
        "status": "pending",
        "generated_course_data": None,
        "created_at": datetime.utcnow() - timedelta(hours=3),
    },
    # Awaiting for Approval (status: generated)
    {
        "user_id": 1,
        "topic": "Python for Web Development",
        "difficulty_level": "Beginner",
        "learning_duration": "1 Month",
        "expertise_domain": "Computer Science",
        "relevant_tags": "Python, Web, Backend, Django, Flask",
        "status": "generated",
        "generated_course_data": json.dumps(generate_course_data("Python for Web Development", "Beginner")),
        "created_at": datetime.utcnow() - timedelta(hours=2),
    },
    {
        "user_id": 2,
        "topic": "Data Analytics and Visualization",
        "difficulty_level": "Intermediate",
        "learning_duration": "2 Weeks",
        "expertise_domain": "Computer Science",
        "relevant_tags": "Data, Analytics, Python, Pandas, Matplotlib",
        "status": "generated",
        "generated_course_data": json.dumps(generate_course_data("Data Analytics and Visualization", "Intermediate")),
        "created_at": datetime.utcnow() - timedelta(hours=4),
    },
    {
        "user_id": 3,
        "topic": "Digital Marketing Strategy",
        "difficulty_level": "Beginner",
        "learning_duration": "2 Weeks",
        "expertise_domain": "Marketing",
        "relevant_tags": "Marketing, SEO, Content, Social Media, Analytics",
        "status": "generated",
        "generated_course_data": json.dumps(generate_course_data("Digital Marketing Strategy", "Beginner")),
        "created_at": datetime.utcnow() - timedelta(hours=5),
    },
    {
        "user_id": 1,
        "topic": "Strategic Business Planning",
        "difficulty_level": "Intermediate",
        "learning_duration": "1 Month",
        "expertise_domain": "Business & Strategy",
        "relevant_tags": "Business, Strategy, Planning, Leadership, Analysis",
        "status": "generated",
        "generated_course_data": json.dumps(generate_course_data("Strategic Business Planning", "Intermediate")),
        "created_at": datetime.utcnow() - timedelta(hours=6),
    },
    {
        "user_id": 2,
        "topic": "UI/UX Design Principles",
        "difficulty_level": "Beginner",
        "learning_duration": "2 Weeks",
        "expertise_domain": "Creative Design",
        "relevant_tags": "Design, UI, UX, Figma, Prototyping, User Research",
        "status": "generated",
        "generated_course_data": json.dumps(generate_course_data("UI/UX Design Principles", "Beginner")),
        "created_at": datetime.utcnow() - timedelta(hours=7),
    },
    {
        "user_id": 3,
        "topic": "Advanced JavaScript Development",
        "difficulty_level": "Advanced",
        "learning_duration": "1 Month",
        "expertise_domain": "Computer Science",
        "relevant_tags": "JavaScript, Advanced, Async, Promises, React, Performance",
        "status": "generated",
        "generated_course_data": json.dumps(generate_course_data("Advanced JavaScript Development", "Advanced")),
        "created_at": datetime.utcnow() - timedelta(hours=8),
    },
]


def seed_course_generations():
    """Seed the database with course generation records."""
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # Clear existing data
        existing_count = db.query(CourseGeneration).count()
        if existing_count > 0:
            print(f"[INFO] Clearing {existing_count} existing course generation records...")
            db.query(CourseGeneration).delete()
            db.commit()

        # Add mock AI-generated courses
        generations_to_add = []
        for gen_data in mock_generations:
            generation = CourseGeneration(**gen_data)
            generations_to_add.append(generation)

        db.add_all(generations_to_add)
        db.commit()
        print(f"[OK] Successfully seeded {len(generations_to_add)} course generation records")
        print(f"     - 2 pending (awaiting generation)")
        print(f"     - 6 generated (awaiting approval)")

    except Exception as e:
        print(f"[ERROR] Error seeding course generations: {str(e)}")
        db.rollback()
        import traceback
        traceback.print_exc()
    finally:
        db.close()


if __name__ == "__main__":
    seed_course_generations()
