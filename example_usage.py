
from dotenv import load_dotenv
import os

load_dotenv()  # Load from .env file

from generation_layer import AIGenerationLayer
from schemas import GenerationRequest, DifficultyLevel
from utils import save_generation_result, export_to_markdown, print_course_summary


def main():
    """Example: Generate complete curriculum for Data Science course"""

    # Create generation request
    request = GenerationRequest(
        topic="Introduction to Machine Learning",
        difficulty=DifficultyLevel.INTERMEDIATE,
        target_audience="Software engineers with basic Python knowledge",
        duration_weeks=8,
        tags=["machine-learning", "python", "data-science", "algorithms"],
        context="Focus on practical applications and real-world datasets"
    )

    # Initialize generation layer
    generation_layer = AIGenerationLayer(model="mistralai/Mistral-7B-Instruct-v0.1")

    # Execute 3-stage pipeline
    result = generation_layer.generate(request)

    # Save results
    output_dir = save_generation_result(result, output_dir="generated_courses")

    # Export to markdown
    markdown_file = export_to_markdown(result, output_file="course_content.md")

    # Print summary
    print_course_summary(result)

    # Example: Access specific stage outputs
    print("\n📊 Stage 1 Outline Modules:")
    for module in result.stage_1_outline.modules:
        print(f"  - {module.name} ({module.estimated_hours} hours)")

    print("\n📚 Stage 2 Lessons:")
    for lesson in result.stage_2_content.lessons:
        print(f"  - {lesson.title} ({lesson.estimated_duration_minutes} min)")

    print("\n🧪 Stage 3 Assessments:")
    print(f"  - Quizzes: {len(result.stage_3_assessments.lesson_quizzes)}")
    print(f"  - Capstone Projects: {len(result.stage_3_assessments.capstone_projects)}")

    # Example: Access detailed content
    first_lesson = result.stage_2_content.lessons[0]
    print(f"\n📖 First Lesson: {first_lesson.title}")
    print(f"   Objectives: {', '.join(first_lesson.learning_objectives)}")
    print(f"   Concepts: {', '.join([c.name for c in first_lesson.main_concepts])}")

    # Example: Access assessment details
    first_quiz = result.stage_3_assessments.lesson_quizzes[0]
    print(f"\n🧪 First Quiz: {first_quiz.quiz_questions[0].question_text}")


if __name__ == "__main__":
    main()

