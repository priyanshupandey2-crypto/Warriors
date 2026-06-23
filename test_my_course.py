"""Complete test of AI Generation Layer with course generation"""

from dotenv import load_dotenv
import os
from pathlib import Path

# Load .env from current directory
env_path = Path(__file__).parent / ".env"
load_dotenv(env_path)

from generation_layer import AIGenerationLayer
from schemas import GenerationRequest, DifficultyLevel
from utils import save_generation_result, export_to_markdown, print_course_summary


def main():
    """Generate and test a complete curriculum"""

    # Create request
    request = GenerationRequest(
        topic="JavaScript Fundamentals",
        difficulty=DifficultyLevel.BEGINNER,
        target_audience="Web developers new to JavaScript",
        duration_weeks=6,
        tags=["javascript", "web", "programming"],
        context="Focus on practical examples and hands-on exercises"
    )

    print("=" * 60)
    print("AI Generation Layer - Full Test")
    print("=" * 60)
    print(f"\nTopic: {request.topic}")
    print(f"Duration: {request.duration_weeks} weeks")
    print(f"Difficulty: {request.difficulty.value}")

    # Generate
    print("\n[START] Generating curriculum...")
    layer = AIGenerationLayer(model="mistralai/Mistral-7B-Instruct-v0.1")
    result = layer.generate(request)

    # Save
    print("\n[SAVE] Saving results...")
    output_dir = save_generation_result(result, output_dir="test_courses")

    # Export
    print("[EXPORT] Exporting to markdown...")
    export_to_markdown(result, "test_course.md")

    # Summary
    print_course_summary(result)

    # Check content
    print("\n" + "=" * 60)
    print("CONTENT SUMMARY")
    print("=" * 60)

    print(f"\nModules ({len(result.stage_1_outline.modules)}):")
    for module in result.stage_1_outline.modules:
        print(f"  - {module.name}")

    print(f"\nLessons ({result.stage_2_content.total_lessons}):")
    for i, lesson in enumerate(result.stage_2_content.lessons[:3], 1):
        print(f"  {i}. {lesson.title}")
    if result.stage_2_content.total_lessons > 3:
        print(f"  ... and {result.stage_2_content.total_lessons - 3} more")

    print(f"\nQuizzes: {len(result.stage_3_assessments.lesson_quizzes)}")
    print(f"Capstones: {len(result.stage_3_assessments.capstone_projects)}")

    print("\n" + "=" * 60)
    print("TEST COMPLETE")
    print("=" * 60)


if __name__ == "__main__":
    main()
