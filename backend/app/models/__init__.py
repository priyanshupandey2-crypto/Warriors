# This module lazily imports all models to ensure tables are registered
# Import Base first to make it available
from app.database.connection import Base

# Import all models - they'll use the Base imported above
from app.models.user import User
from app.models.course import Course
from app.models.user_course import UserCourse
from app.models.learning_activity import LearningActivity
from app.models.user_goal import UserGoal
from app.models.milestone import Milestone
from app.models.lesson import Lesson
from app.models.quiz import Quiz, QuizQuestion, QuestionOption, QuizSubmission

__all__ = [
    "User",
    "Course",
    "UserCourse",
    "LearningActivity",
    "UserGoal",
    "Milestone",
    "Lesson",
    "Quiz",
    "QuizQuestion",
    "QuestionOption",
    "QuizSubmission"
]
