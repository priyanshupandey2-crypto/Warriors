"""
Seed courses from test-output.json into the database
=====================================================

This script reads the AI-generated course data from test-output.json
and seeds it into the courses, modules, lessons, and quizzes tables.

Run: python seed_from_test_output.py
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


def seed_from_test_output():
    """Load course data from test-output.json and seed into database."""
    db = SessionLocal()

    try:
        # Read test-output.json
        with open('test-output.json', 'r', encoding='utf-8') as f:
            data = json.load(f)

        course_data = data.get('course', {})

        # Check if course already exists and delete all courses
        existing = db.query(Course).filter(Course.title == course_data.get('title')).first()
        if existing:
            print(f"[INFO] Deleting all existing courses...")
            # Get all courses to delete
            courses = db.query(Course).all()
            for course in courses:
                # Delete quizzes
                db.query(Quiz).filter(Quiz.course_id == course.id).delete()
                # Delete lessons
                db.query(Lesson).filter(Lesson.course_id == course.id).delete()
                # Delete modules
                db.query(Module).filter(Module.course_id == course.id).delete()
                # Delete the course
                db.delete(course)
            db.commit()
            print(f"[OK] Deleted all courses and related data")

        # Create Course
        course = Course(
            title=course_data.get('title', 'Untitled Course'),
            description=course_data.get('description', ''),
            difficulty=course_data.get('difficulty', 'Intermediate'),
            duration_hours=course_data.get('estimatedHours', 0),
            category=course_data.get('tags', ['General'])[0] if course_data.get('tags') else 'General',
            status='published',
            created_at=datetime.utcnow()
        )
        db.add(course)
        db.flush()  # Flush to get the course ID

        print(f"[OK] Created course: {course.title} (ID: {course.id})")

        # Create Modules, Lessons, and Quizzes
        modules_data = course_data.get('modules', [])

        for idx, module_data in enumerate(modules_data, 1):
            # Extract order from module id (e.g., "m1" -> 1)
            module_id = module_data.get('id', '')
            try:
                order = int(module_id.replace('m', '')) if module_id else idx
            except (ValueError, TypeError):
                order = idx

            module = Module(
                course_id=course.id,
                title=module_data.get('title', 'Untitled Module'),
                description=module_data.get('description', ''),
                order=order
            )
            db.add(module)
            db.flush()

            print(f"  [OK] Created module: {module.title} (ID: {module.id})")

            # Create Lessons
            lessons_data = module_data.get('lessons', [])

            for idx, lesson_data in enumerate(lessons_data, 1):
                content = lesson_data.get('content', '')

                # Extract order from lesson id (e.g., "m1l1" -> 1)
                lesson_id = lesson_data.get('id', '')
                try:
                    order = int(lesson_id.replace('m', '').replace('l', '')) if lesson_id else idx
                except (ValueError, TypeError):
                    order = idx

                # Extract key takeaways from markdown content
                key_concepts = ''
                if isinstance(content, str) and '## Key Takeaways' in content:
                    # Extract text between '## Key Takeaways' and the next section
                    parts = content.split('## Key Takeaways')[1]
                    # Remove the next section if it exists
                    if '**Estimated Reading Time:**' in parts:
                        parts = parts.split('**Estimated Reading Time:**')[0]
                    # Extract bullet points
                    lines = [line.strip('- ').strip() for line in parts.split('\n') if line.strip().startswith('- ')]
                    key_concepts = '; '.join(lines)

                # Extract estimated reading time from markdown content
                duration_minutes = 0
                if isinstance(content, str) and '**Estimated Reading Time:**' in content:
                    try:
                        time_str = content.split('**Estimated Reading Time:**')[1].split('minutes')[0].strip()
                        duration_minutes = int(time_str)
                    except (ValueError, IndexError):
                        duration_minutes = 0

                lesson = Lesson(
                    course_id=course.id,
                    module_id=module.id,
                    title=lesson_data.get('title', 'Untitled Lesson'),
                    content_markdown=content if isinstance(content, str) else '',
                    duration_minutes=duration_minutes,
                    learning_objectives='',
                    key_concepts=key_concepts,
                    order=order
                )
                db.add(lesson)
                db.flush()

                print(f"    [OK] Created lesson: {lesson.title} (ID: {lesson.id})")

            # Create Quiz
            quiz_data = module_data.get('quiz', {})
            if quiz_data:
                quiz = Quiz(
                    course_id=course.id,
                    module_id=module.id,
                    title=f"{module.title} Quiz",
                    description=f"Assessment for {module.title}",
                    passing_score=70,
                    total_points=100,
                    duration_minutes=30
                )
                db.add(quiz)
                db.flush()

                print(f"    [OK] Created quiz: {quiz.title} (ID: {quiz.id})")

                # Create Quiz Questions
                questions = quiz_data.get('questions', [])
                for q_idx, question_data in enumerate(questions, 1):
                    question = QuizQuestion(
                        quiz_id=quiz.id,
                        question_text=question_data.get('question', ''),
                        explanation=question_data.get('explanation', ''),
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

        # Commit all changes
        db.commit()
        print(f"\n[OK] Successfully seeded course with {len(modules_data)} modules!")

    except FileNotFoundError:
        print("[ERROR] test-output.json not found at backend/test-output.json")
        db.rollback()
    except Exception as e:
        print(f"[ERROR] Error seeding course: {str(e)}")
        print(f"[ERROR] {type(e).__name__}: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    seed_from_test_output()
