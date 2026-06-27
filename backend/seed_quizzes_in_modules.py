"""
Seed script to create quizzes within modules
Run: python seed_quizzes_in_modules.py
"""

from app.database import SessionLocal
from app.models.quiz import Quiz, QuizQuestion, QuestionOption
from app.models.module import Module
from datetime import datetime

db = SessionLocal()

quizzes_data = [
    {
        "module_id": 3,  # Module: Visual Design & Components (last module of UI/UX)
        "course_id": 1,
        "title": "UI/UX Design Module Quiz",
        "description": "Test your understanding of UI/UX design principles",
        "passing_score": 70,
        "order": 1,
        "questions": [
            {
                "question_text": "What does UX stand for?",
                "question_type": "multiple_choice",
                "options": [
                    {"option_text": "User Experience", "is_correct": True},
                    {"option_text": "User Expertise", "is_correct": False},
                    {"option_text": "Universal Exchange", "is_correct": False},
                    {"option_text": "Unit Execution", "is_correct": False},
                ]
            },
            {
                "question_text": "Which of these is a key principle of good UX design?",
                "question_type": "multiple_choice",
                "options": [
                    {"option_text": "Complexity", "is_correct": False},
                    {"option_text": "Simplicity", "is_correct": True},
                    {"option_text": "Maximalism", "is_correct": False},
                    {"option_text": "Randomness", "is_correct": False},
                ]
            },
            {
                "question_text": "What is the primary goal of user research in UX design?",
                "question_type": "multiple_choice",
                "options": [
                    {"option_text": "To make things look pretty", "is_correct": False},
                    {"option_text": "To understand user needs and behaviors", "is_correct": True},
                    {"option_text": "To reduce project cost", "is_correct": False},
                    {"option_text": "To follow trends", "is_correct": False},
                ]
            },
            {
                "question_text": "Which tool is commonly used for wireframing?",
                "question_type": "multiple_choice",
                "options": [
                    {"option_text": "Photoshop", "is_correct": False},
                    {"option_text": "Figma", "is_correct": True},
                    {"option_text": "Word", "is_correct": False},
                    {"option_text": "Excel", "is_correct": False},
                ]
            },
            {
                "question_text": "What is a prototype in UX design?",
                "question_type": "multiple_choice",
                "options": [
                    {"option_text": "The final product", "is_correct": False},
                    {"option_text": "An interactive mockup for testing", "is_correct": True},
                    {"option_text": "A written document", "is_correct": False},
                    {"option_text": "A marketing plan", "is_correct": False},
                ]
            },
        ]
    },
    {
        "module_id": 5,  # Module: Advanced Data Structures (last module of Python)
        "course_id": 2,
        "title": "Python Algorithms Module Quiz",
        "description": "Assess your knowledge of algorithms and data structures",
        "passing_score": 75,
        "order": 1,
        "questions": [
            {
                "question_text": "What is the time complexity of binary search?",
                "question_type": "multiple_choice",
                "options": [
                    {"option_text": "O(n)", "is_correct": False},
                    {"option_text": "O(log n)", "is_correct": True},
                    {"option_text": "O(n²)", "is_correct": False},
                    {"option_text": "O(1)", "is_correct": False},
                ]
            },
            {
                "question_text": "Which sorting algorithm has the best worst-case time complexity?",
                "question_type": "multiple_choice",
                "options": [
                    {"option_text": "Bubble Sort", "is_correct": False},
                    {"option_text": "Quick Sort", "is_correct": False},
                    {"option_text": "Merge Sort", "is_correct": True},
                    {"option_text": "Insertion Sort", "is_correct": False},
                ]
            },
            {
                "question_text": "What data structure uses LIFO?",
                "question_type": "multiple_choice",
                "options": [
                    {"option_text": "Queue", "is_correct": False},
                    {"option_text": "Stack", "is_correct": True},
                    {"option_text": "Array", "is_correct": False},
                    {"option_text": "Graph", "is_correct": False},
                ]
            },
        ]
    },
    {
        "module_id": 7,  # Module: Growth & Analytics (last module of Marketing)
        "course_id": 3,
        "title": "Digital Marketing Module Quiz",
        "description": "Test your marketing knowledge",
        "passing_score": 65,
        "order": 1,
        "questions": [
            {
                "question_text": "What does SEO stand for?",
                "question_type": "multiple_choice",
                "options": [
                    {"option_text": "Search Engine Optimization", "is_correct": True},
                    {"option_text": "Search Engine Output", "is_correct": False},
                    {"option_text": "Site Engine Operation", "is_correct": False},
                    {"option_text": "Search Evaluation Office", "is_correct": False},
                ]
            },
            {
                "question_text": "Which metric measures the percentage of clicks on an ad?",
                "question_type": "multiple_choice",
                "options": [
                    {"option_text": "Conversion Rate", "is_correct": False},
                    {"option_text": "Click-Through Rate", "is_correct": True},
                    {"option_text": "Bounce Rate", "is_correct": False},
                    {"option_text": "Engagement Rate", "is_correct": False},
                ]
            },
        ]
    },
    {
        "module_id": 9,  # Module: Building AI Models (last module of AI)
        "course_id": 4,
        "title": "AI & Neural Networks Module Quiz",
        "description": "Assess your AI knowledge",
        "passing_score": 70,
        "order": 1,
        "questions": [
            {
                "question_text": "What is a neural network?",
                "question_type": "multiple_choice",
                "options": [
                    {"option_text": "A computer network", "is_correct": False},
                    {"option_text": "A model inspired by biological neurons", "is_correct": True},
                    {"option_text": "A social media platform", "is_correct": False},
                    {"option_text": "A database structure", "is_correct": False},
                ]
            },
            {
                "question_text": "What is backpropagation used for?",
                "question_type": "multiple_choice",
                "options": [
                    {"option_text": "Reversing network connections", "is_correct": False},
                    {"option_text": "Training neural networks", "is_correct": True},
                    {"option_text": "Testing models", "is_correct": False},
                    {"option_text": "Deploying models", "is_correct": False},
                ]
            },
        ]
    },
]

def seed_quizzes():
    try:
        print("[INFO] Seeding quizzes in modules...")
        for quiz_data in quizzes_data:
            quiz = Quiz(
                module_id=quiz_data["module_id"],
                course_id=quiz_data["course_id"],
                title=quiz_data["title"],
                description=quiz_data["description"],
                passing_score=quiz_data["passing_score"],
                order=quiz_data["order"],
                created_at=datetime.utcnow(),
            )
            db.add(quiz)
            db.flush()

            module = db.query(Module).filter(Module.id == quiz_data["module_id"]).first()
            print(f"  [OK] Quiz: {quiz.title} (Module: {module.title if module else 'NOT FOUND'})")

            # Add questions
            for question_data in quiz_data["questions"]:
                question = QuizQuestion(
                    quiz_id=quiz.id,
                    question_text=question_data["question_text"],
                    question_type=question_data["question_type"],
                    created_at=datetime.utcnow(),
                )
                db.add(question)
                db.flush()

                # Add options
                for option_data in question_data["options"]:
                    option = QuestionOption(
                        question_id=question.id,
                        text=option_data["option_text"],
                        is_correct=option_data["is_correct"],
                        created_at=datetime.utcnow(),
                    )
                    db.add(option)

            db.commit()

        print("\n[SUCCESS] Quizzes seeded successfully in modules!")

    except Exception as e:
        db.rollback()
        print(f"[ERROR] Error seeding quizzes: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()


if __name__ == "__main__":
    seed_quizzes()
