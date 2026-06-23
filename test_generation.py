"""Test script for AI Generation Layer"""

import os
import sys
import json
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from ai_layer import (
    AIGenerationLayer,
    GenerationRequest,
    DifficultyLevel,
    save_generation_result,
    export_to_markdown,
    print_course_summary,
)


def test_generation_request():
    """Test creating a generation request"""
    print("[TEST] Testing GenerationRequest creation...")
    request = GenerationRequest(
        topic="Python Web Development with FastAPI",
        difficulty=DifficultyLevel.INTERMEDIATE,
        target_audience="Python developers new to web frameworks",
        duration_weeks=6,
        tags=["python", "fastapi", "web-development", "rest-api"],
        context="Focus on building production-ready APIs"
    )
    assert request.topic == "Python Web Development with FastAPI"
    assert request.difficulty == DifficultyLevel.INTERMEDIATE
    print("  [OK] Request created successfully")
    return request


def test_full_pipeline():
    """Test complete 3-stage pipeline"""
    print("\n" + "="*60)
    print("[TEST] AI Generation Layer - Full Pipeline")
    print("="*60)

    # Check API key
    hf_token = os.getenv("HUGGINGFACE_API_KEY")
    if not hf_token:
        print("[WARNING] HUGGINGFACE_API_KEY not found in .env")
        print("Please set it in your .env file first!")
        return False

    try:
        # Create request
        request = test_generation_request()

        # Initialize layer
        print("\n[INIT] Initializing AIGenerationLayer...")
        generation_layer = AIGenerationLayer(model="mistralai/Mistral-7B-Instruct-v0.1")
        print("  [OK] Layer initialized with HuggingFace")

        # Test full pipeline
        print("\n[EXEC] Testing full pipeline execution...")
        result = generation_layer.generate(request)
        assert result.request.topic == request.topic
        assert len(result.stage_1_outline.modules) > 0
        assert result.stage_2_content.total_lessons > 0
        assert len(result.stage_3_assessments.lesson_quizzes) > 0
        print("  [OK] Full pipeline executed successfully")

        # Test utilities
        print("\n[TEST] Testing utilities...")

        # Summary
        print_course_summary(result)

        # Save results
        output_dir = save_generation_result(result, output_dir="test_generation")
        assert os.path.exists(output_dir)
        print(f"  [OK] Results saved to {output_dir}")

        # Export markdown
        markdown_file = export_to_markdown(result, output_file="test_generation/course.md")
        assert os.path.exists(markdown_file)
        print(f"  [OK] Markdown exported to {markdown_file}")

        print("\n" + "="*60)
        print("[SUCCESS] All tests passed!")
        print("="*60)

    except Exception as e:
        print(f"\n[ERROR] Test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

    return True


if __name__ == "__main__":
    success = test_full_pipeline()
    sys.exit(0 if success else 1)

