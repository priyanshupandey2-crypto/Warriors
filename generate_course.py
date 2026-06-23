
"""Main script to generate a curriculum"""

from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

# Verify token is set
hf_token = os.getenv("HUGGINGFACE_API_KEY")
if not hf_token:
    print("❌ Error: HUGGINGFACE_API_KEY not set!")
    print("\nPlease create a .env file with:")
    print('  HUGGINGFACE_API_KEY=hf_your_token_here')
    exit(1)

print(f"✅ Token loaded: {hf_token[:20]}...")

# Now import AI layer
from ai_layer import (
    AIGenerationLayer,
    GenerationRequest,
    DifficultyLevel,
    save_generation_result,
    export_to_markdown,
    print_course_summary,
)

def main():
    """Generate a complete curriculum"""
    
    # Create request
    request = GenerationRequest(
        topic="Full-Stack Web Development",
        difficulty=DifficultyLevel.INTERMEDIATE,
        target_audience="Junior developers with JavaScript basics",
        duration_weeks=8,
        tags=["web", "frontend", "backend", "fullstack"],
        context="Include modern frameworks and best practices"
    )

    print("\n🚀 Starting curriculum generation...")
    print(f"Topic: {request.topic}")
    print(f"Duration: {request.duration_weeks} weeks")
    print(f"Target: {request.target_audience}")
    
    # Generate
    layer = AIGenerationLayer()
    result = layer.generate(request)

    # Save
    print("\n💾 Saving results...")
    output_dir = save_generation_result(result, output_dir="generated_courses")

    # Export
    print("📄 Exporting to markdown...")
    export_to_markdown(result, "course.md")

    # Summary
    print_course_summary(result)

    print(f"\n✅ Complete!")
    print(f"Saved to: {output_dir}")
    print(f"Markdown: course.md")


if __name__ == "__main__":
    main()
