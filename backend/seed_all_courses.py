"""
Seed multiple diverse courses into the database
================================================

This script seeds 5 diverse courses across different domains.

Run: python seed_all_courses.py
"""

import sys
import json
from datetime import datetime

# Fix encoding on Windows
if sys.platform.startswith('win'):
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

from sqlalchemy.orm import Session
from app.database import SessionLocal, Base, engine
from app.models.course import Course
from app.models.module import Module
from app.models.lesson import Lesson
from app.models.quiz import Quiz, QuizQuestion, QuestionOption

# Ensure tables exist
Base.metadata.create_all(bind=engine)


COURSES_DATA = [
    {
        "title": "Python for Data Science",
        "description": "Learn Python programming for data analysis, visualization, and machine learning applications. Master pandas, NumPy, and scikit-learn.",
        "difficulty": "Beginner",
        "duration_hours": 40,
        "category": "Computer Science",
        "modules": [
            {
                "title": "Python Basics and Data Types",
                "description": "Introduction to Python syntax and fundamental data types",
                "lessons": [
                    {"title": "Variables and Data Types", "content": "# Python Data Types\n\nPython supports various data types including integers, floats, strings, lists, tuples, and dictionaries. Understanding these is fundamental to programming.", "duration": 20},
                    {"title": "Control Flow", "content": "# Control Structures\n\nLearn if-else statements, loops, and how to control program flow effectively.", "duration": 25},
                ]
            },
            {
                "title": "Data Manipulation with Pandas",
                "description": "Working with data using pandas DataFrames",
                "lessons": [
                    {"title": "Creating and Loading Data", "content": "# Pandas Basics\n\nLearn to create DataFrames and load data from various sources.", "duration": 30},
                    {"title": "Data Cleaning", "content": "# Cleaning Data\n\nHandle missing values, duplicates, and data inconsistencies.", "duration": 35},
                ]
            },
        ]
    },
    {
        "title": "Web Design with HTML & CSS",
        "description": "Master modern web design principles. Learn semantic HTML5 and advanced CSS3 techniques including flexbox and grid layouts.",
        "difficulty": "Beginner",
        "duration_hours": 30,
        "category": "Creative Design",
        "modules": [
            {
                "title": "HTML5 Fundamentals",
                "description": "Learn semantic HTML5 and proper document structure",
                "lessons": [
                    {"title": "HTML Document Structure", "content": "# HTML Structure\n\nUnderstand the basic structure of HTML documents and semantic elements.", "duration": 20},
                    {"title": "Forms and Input", "content": "# HTML Forms\n\nCreate interactive forms with various input types and validation.", "duration": 25},
                ]
            },
            {
                "title": "CSS3 Styling and Layouts",
                "description": "Advanced CSS techniques for modern layouts",
                "lessons": [
                    {"title": "Flexbox Layouts", "content": "# Flexbox\n\nCreate flexible and responsive layouts using flexbox.", "duration": 30},
                    {"title": "CSS Grid", "content": "# CSS Grid\n\nBuild complex grid-based layouts with CSS Grid.", "duration": 35},
                ]
            },
        ]
    },
    {
        "title": "Digital Marketing Strategy",
        "description": "Comprehensive guide to digital marketing. Learn SEO, content marketing, social media strategy, and analytics.",
        "difficulty": "Intermediate",
        "duration_hours": 35,
        "category": "Marketing",
        "modules": [
            {
                "title": "SEO Fundamentals",
                "description": "Search engine optimization techniques and best practices",
                "lessons": [
                    {"title": "Keyword Research", "content": "# SEO Basics\n\nUnderstand how to research and target the right keywords.", "duration": 25},
                    {"title": "On-Page Optimization", "content": "# On-Page SEO\n\nOptimize your web pages for search engines.", "duration": 30},
                ]
            },
            {
                "title": "Content Marketing",
                "description": "Creating and distributing valuable content",
                "lessons": [
                    {"title": "Content Strategy", "content": "# Content Planning\n\nDevelop a comprehensive content strategy for your audience.", "duration": 30},
                    {"title": "Copywriting", "content": "# Writing Copy\n\nWrite compelling copy that converts readers to customers.", "duration": 35},
                ]
            },
        ]
    },
    {
        "title": "Business Strategy & Leadership",
        "description": "Develop strategic thinking and leadership skills. Learn frameworks for decision-making and organizational management.",
        "difficulty": "Intermediate",
        "duration_hours": 45,
        "category": "Business & Strategy",
        "modules": [
            {
                "title": "Strategic Planning",
                "description": "Creating and executing business strategies",
                "lessons": [
                    {"title": "SWOT Analysis", "content": "# Strategic Analysis\n\nLearn to analyze strengths, weaknesses, opportunities, and threats.", "duration": 30},
                    {"title": "Business Models", "content": "# Business Model Canvas\n\nUnderstand different business models and their applications.", "duration": 35},
                ]
            },
            {
                "title": "Leadership Essentials",
                "description": "Core leadership principles and practices",
                "lessons": [
                    {"title": "Team Management", "content": "# Managing Teams\n\nLead and manage high-performing teams effectively.", "duration": 35},
                    {"title": "Decision Making", "content": "# Strategic Decisions\n\nMake informed decisions using data and intuition.", "duration": 40},
                ]
            },
        ]
    },
    {
        "title": "UI/UX Design Fundamentals",
        "description": "Learn user-centered design principles. Create intuitive interfaces and compelling user experiences.",
        "difficulty": "Beginner",
        "duration_hours": 35,
        "category": "Creative Design",
        "modules": [
            {
                "title": "Design Principles",
                "description": "Fundamental principles of effective design",
                "lessons": [
                    {"title": "Visual Hierarchy", "content": "# Design Hierarchy\n\nUnderstand how to guide user attention through visual design.", "duration": 25},
                    {"title": "Color Theory", "content": "# Color in Design\n\nLearn color psychology and how to use color effectively.", "duration": 25},
                ]
            },
            {
                "title": "User Experience Design",
                "description": "Creating seamless user experiences",
                "lessons": [
                    {"title": "User Research", "content": "# Understanding Users\n\nConduct research to understand your users' needs and behaviors.", "duration": 30},
                    {"title": "Prototyping & Testing", "content": "# Testing Designs\n\nCreate prototypes and test them with real users.", "duration": 35},
                ]
            },
        ]
    },
]


def seed_all_courses():
    """Seed all diverse courses into the database."""
    db = SessionLocal()

    try:
        created_count = 0

        for course_data in COURSES_DATA:
            # Check if course already exists
            existing = db.query(Course).filter(Course.title == course_data.get('title')).first()
            if existing:
                print(f"[INFO] Course '{course_data.get('title')}' already exists. Skipping...")
                continue

            # Create Course
            course = Course(
                title=course_data.get('title', 'Untitled Course'),
                description=course_data.get('description', ''),
                difficulty=course_data.get('difficulty', 'Beginner'),
                duration_hours=course_data.get('duration_hours', 0),
                category=course_data.get('category', 'General'),
                status='published',
                created_at=datetime.utcnow()
            )
            db.add(course)
            db.flush()

            print(f"[OK] Created course: {course.title} (ID: {course.id})")

            # Create Modules, Lessons, and Quizzes
            modules_data = course_data.get('modules', [])

            for mod_idx, module_data in enumerate(modules_data, 1):
                module = Module(
                    course_id=course.id,
                    title=module_data.get('title', 'Untitled Module'),
                    description=module_data.get('description', ''),
                    order=mod_idx
                )
                db.add(module)
                db.flush()

                print(f"  [OK] Created module: {module.title}")

                # Create Lessons
                lessons_data = module_data.get('lessons', [])

                for lesson_idx, lesson_data in enumerate(lessons_data, 1):
                    lesson = Lesson(
                        course_id=course.id,
                        module_id=module.id,
                        title=lesson_data.get('title', 'Untitled Lesson'),
                        content_markdown=lesson_data.get('content', ''),
                        duration_minutes=lesson_data.get('duration', 30),
                        learning_objectives=f"Master {lesson_data.get('title', 'this topic')}",
                        key_concepts=lesson_data.get('title', ''),
                        order=lesson_idx
                    )
                    db.add(lesson)
                    db.flush()

                # Create Quiz for module
                quiz = Quiz(
                    course_id=course.id,
                    module_id=module.id,
                    title=f"{module.title} Quiz",
                    description=f"Assessment for {module.title}",
                    passing_score=70,
                    total_points=100,
                    duration_minutes=30,
                    order=1
                )
                db.add(quiz)
                db.flush()

                # Create sample quiz questions
                sample_questions = [
                    {
                        "question": f"What is the main topic of {module.title}?",
                        "options": [
                            module_data.get('description', 'Module content'),
                            "Unrelated topic 1",
                            "Unrelated topic 2",
                            "Unrelated topic 3"
                        ],
                        "correctIndex": 0
                    },
                    {
                        "question": f"Which of the following is covered in {module.title}?",
                        "options": [
                            "First lesson topic",
                            "Second lesson topic",
                            "Both A and B",
                            "None of the above"
                        ],
                        "correctIndex": 2
                    }
                ]

                for q_idx, question_data in enumerate(sample_questions, 1):
                    question = QuizQuestion(
                        quiz_id=quiz.id,
                        question_text=question_data.get('question', ''),
                        explanation="This is the correct answer based on the module content.",
                        question_type="multiple_choice",
                        difficulty="medium"
                    )
                    db.add(question)
                    db.flush()

                    # Create Question Options
                    options = question_data.get('options', [])
                    correct_index = question_data.get('correctIndex', 0)

                    for opt_idx, option_text in enumerate(options):
                        option = QuestionOption(
                            question_id=question.id,
                            text=option_text,
                            is_correct=(opt_idx == correct_index)
                        )
                        db.add(option)
                    db.flush()

            created_count += 1

        # Commit all changes
        db.commit()
        print(f"\n[OK] Successfully seeded {created_count} courses!")
        print(f"[OK] Total courses: {created_count * len(COURSES_DATA[0]['modules'])} modules")
        print(f"[OK] Total lessons: {created_count * sum(len(m['lessons']) for m in COURSES_DATA[0]['modules'])} lessons")

    except Exception as e:
        print(f"[ERROR] Error seeding courses: {str(e)}")
        print(f"[ERROR] {type(e).__name__}: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    seed_all_courses()
