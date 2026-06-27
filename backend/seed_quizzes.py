"""
Seed script to populate the database with quizzes and questions.
Run this from the backend directory: python seed_quizzes.py
"""

from app.database import SessionLocal
from app.models.quiz import Quiz, QuizQuestion, QuestionOption
from datetime import datetime

quiz_data = [
    {
        "course_id": 1,
        "title": "UI/UX Design Fundamentals Quiz",
        "description": "Test your knowledge of UI/UX design principles and practices",
        "passing_score": 70,
        "total_points": 100,
        "questions": [
            {
                "question_text": "What does UX stand for?",
                "question_type": "multiple_choice",
                "difficulty": "easy",
                "explanation": "UX stands for User Experience, which focuses on how users interact with products.",
                "options": [
                    {"text": "User Experience", "is_correct": True},
                    {"text": "Universal Extension", "is_correct": False},
                    {"text": "User Exchange", "is_correct": False},
                    {"text": "Universal Experience", "is_correct": False},
                ],
            },
            {
                "question_text": "Which of the following is NOT a principle of good UI design?",
                "question_type": "multiple_choice",
                "difficulty": "medium",
                "explanation": "Good UI design follows principles like consistency, clarity, and feedback. Complexity is not a principle of good design.",
                "options": [
                    {"text": "Consistency", "is_correct": False},
                    {"text": "Complexity", "is_correct": True},
                    {"text": "Clarity", "is_correct": False},
                    {"text": "User Feedback", "is_correct": False},
                ],
            },
            {
                "question_text": "What is the primary goal of user research?",
                "question_type": "multiple_choice",
                "difficulty": "medium",
                "explanation": "User research aims to understand user needs, behaviors, and pain points to inform design decisions.",
                "options": [
                    {"text": "To create beautiful designs", "is_correct": False},
                    {"text": "To understand user needs and behaviors", "is_correct": True},
                    {"text": "To reduce development costs", "is_correct": False},
                    {"text": "To speed up the design process", "is_correct": False},
                ],
            },
        ],
    },
    {
        "course_id": 2,
        "title": "Python Algorithms Quiz",
        "description": "Test your understanding of algorithms and data structures in Python",
        "passing_score": 70,
        "total_points": 100,
        "questions": [
            {
                "question_text": "What is the time complexity of binary search?",
                "question_type": "multiple_choice",
                "difficulty": "medium",
                "explanation": "Binary search has O(log n) time complexity because it divides the search space in half with each iteration.",
                "options": [
                    {"text": "O(n)", "is_correct": False},
                    {"text": "O(log n)", "is_correct": True},
                    {"text": "O(n^2)", "is_correct": False},
                    {"text": "O(1)", "is_correct": False},
                ],
            },
            {
                "question_text": "Which sorting algorithm is most efficient for large datasets?",
                "question_type": "multiple_choice",
                "difficulty": "hard",
                "explanation": "Quick Sort and Merge Sort are O(n log n) on average, making them efficient for large datasets.",
                "options": [
                    {"text": "Bubble Sort", "is_correct": False},
                    {"text": "Quick Sort", "is_correct": True},
                    {"text": "Selection Sort", "is_correct": False},
                    {"text": "Insertion Sort", "is_correct": False},
                ],
            },
        ],
    },
]


def seed_quizzes():
    """Add quizzes to the database"""
    db = SessionLocal()

    try:
        # Check if quizzes already exist
        existing_count = db.query(Quiz).count()
        if existing_count > 0:
            print(f"Database already has {existing_count} quizzes. Skipping seed.")
            return

        for quiz_info in quiz_data:
            quiz = Quiz(
                course_id=quiz_info["course_id"],
                title=quiz_info["title"],
                description=quiz_info["description"],
                passing_score=quiz_info["passing_score"],
                total_points=quiz_info["total_points"],
                created_at=datetime.utcnow(),
            )
            db.add(quiz)
            db.flush()

            for q_data in quiz_info["questions"]:
                question = QuizQuestion(
                    quiz_id=quiz.id,
                    question_text=q_data["question_text"],
                    question_type=q_data["question_type"],
                    explanation=q_data["explanation"],
                    difficulty=q_data["difficulty"],
                    created_at=datetime.utcnow(),
                )
                db.add(question)
                db.flush()

                for option_data in q_data["options"]:
                    option = QuestionOption(
                        question_id=question.id,
                        text=option_data["text"],
                        is_correct=option_data["is_correct"],
                        created_at=datetime.utcnow(),
                    )
                    db.add(option)

        db.commit()
        print(f"[SUCCESS] Added {len(quiz_data)} quizzes to the database!")

        total = db.query(Quiz).count()
        print(f"[INFO] Total quizzes in database: {total}")

    except Exception as e:
        db.rollback()
        print(f"[ERROR] Error seeding quizzes: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    seed_quizzes()
