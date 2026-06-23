"""Generate mock course data for testing (without HuggingFace API)"""

from dotenv import load_dotenv
import os
from pathlib import Path
from datetime import datetime

load_dotenv(Path(__file__).parent / ".env")

from schemas import (
    GenerationRequest,
    GenerationResult,
    OutlineSchema,
    Module,
    ElaboratedContent,
    LessonContent,
    Concept,
    BloomLevel,
    DifficultyLevel,
    AssessmentSuite,
    LessonQuiz,
    QuizQuestion,
    CapstoneProject,
)
from utils import save_generation_result, export_to_markdown, print_course_summary


def create_mock_outline(request: GenerationRequest) -> OutlineSchema:
    """Create mock course outline"""

    modules = [
        Module(
            id="module_1",
            name="Fundamentals",
            sequence=1,
            description=f"Introduction to {request.topic} fundamentals",
            estimated_hours=8,
            lessons=["lesson_1_1", "lesson_1_2", "lesson_1_3"],
        ),
        Module(
            id="module_2",
            name="Core Concepts",
            sequence=2,
            description=f"Core concepts in {request.topic}",
            estimated_hours=10,
            lessons=["lesson_2_1", "lesson_2_2", "lesson_2_3"],
        ),
        Module(
            id="module_3",
            name="Practical Applications",
            sequence=3,
            description=f"Real-world applications of {request.topic}",
            estimated_hours=8,
            lessons=["lesson_3_1", "lesson_3_2"],
        ),
    ]

    return OutlineSchema(
        title=f"{request.topic} Course",
        description=f"Complete {request.topic} course for {request.target_audience}",
        difficulty=request.difficulty,
        target_audience=request.target_audience,
        total_hours=26,
        modules=modules,
        learning_objectives=[
            f"Understand the fundamentals of {request.topic}",
            f"Apply {request.topic} in practical scenarios",
            f"Solve real-world problems using {request.topic}",
        ],
        prerequisites=[],
    )


def create_mock_content(outline: OutlineSchema) -> ElaboratedContent:
    """Create mock lesson content"""

    lessons = []
    lesson_id = 1

    for module in outline.modules:
        for i in range(len(module.lessons)):
            lessons.append(
                LessonContent(
                    lesson_id=f"lesson_{lesson_id // 10 + 1}_{lesson_id % 10 + 1}",
                    title=f"Lesson {lesson_id}: {outline.title.split()[0]}  Concept {i + 1}",
                    module_id=module.id,
                    sequence=i + 1,
                    learning_objectives=[
                        f"Learn concept {i + 1}",
                        f"Apply concept {i + 1}",
                    ],
                    introduction=f"This lesson introduces important concepts about {outline.title}.",
                    main_concepts=[
                        Concept(
                            name=f"Concept {j + 1}",
                            explanation=f"Detailed explanation of concept {j + 1} in {outline.title}.",
                            bloom_level=BloomLevel.UNDERSTAND,
                            examples=[
                                f"Example 1 of concept {j + 1}",
                                f"Example 2 of concept {j + 1}",
                                f"Example 3 of concept {j + 1}",
                            ],
                        )
                        for j in range(3)
                    ],
                    real_world_applications=[
                        f"Real-world application {j + 1} of {outline.title}"
                        for j in range(2)
                    ],
                    common_misconceptions=[
                        {
                            "misconception": f"Common misconception {j + 1}",
                            "correction": f"The correct understanding is: ...",
                        }
                        for j in range(2)
                    ],
                    key_takeaways=[
                        f"Takeaway {j + 1} from this lesson" for j in range(3)
                    ],
                    estimated_duration_minutes=45,
                )
            )
            lesson_id += 1

    return ElaboratedContent(
        course_id=f"mock-{datetime.now().timestamp()}",
        outline=outline,
        lessons=lessons,
        total_lessons=len(lessons),
    )


def create_mock_assessments(
    outline: OutlineSchema, content: ElaboratedContent
) -> AssessmentSuite:
    """Create mock assessments"""

    quizzes = []
    for lesson in content.lessons:
        questions = [
            QuizQuestion(
                id=f"q_{i + 1}",
                question_text=f"What is {lesson.title}?",
                question_type="multiple_choice",
                options=["Option A", "Option B", "Option C", "Option D"],
                correct_answer="Option A",
                explanation="Option A is correct because...",
                bloom_level=BloomLevel.UNDERSTAND,
                difficulty=outline.difficulty,
            )
            for i in range(4)
        ]

        quizzes.append(
            LessonQuiz(
                lesson_id=lesson.lesson_id,
                quiz_questions=questions,
                passing_score_percentage=70,
                estimated_duration_minutes=15,
            )
        )

    capstones = [
        CapstoneProject(
            id="capstone_1",
            title=f"Build a {outline.title} Project",
            description=f"Create a real-world project using {outline.title} concepts.",
            learning_objectives=[
                "Apply all course concepts",
                "Solve a real problem",
                "Create a portfolio piece",
            ],
            requirements=[
                "Use at least 3 key concepts",
                "Solve a real problem",
                "Document your solution",
            ],
            submission_format="GitHub repository with documentation",
            evaluation_criteria=[
                {"criterion": "Functionality", "description": "Does it work?"},
                {"criterion": "Code Quality", "description": "Is it well-written?"},
                {"criterion": "Documentation", "description": "Is it documented?"},
            ],
            estimated_hours=20,
            bloom_levels=[BloomLevel.APPLY, BloomLevel.ANALYZE, BloomLevel.CREATE],
        )
    ]

    return AssessmentSuite(
        course_id=content.course_id,
        outline=outline,
        elaborated_content=content,
        lesson_quizzes=quizzes,
        capstone_projects=capstones,
    )


def main():
    """Generate mock course and display results"""

    request = GenerationRequest(
        topic="Python Programming",
        difficulty=DifficultyLevel.BEGINNER,
        target_audience="Complete beginners",
        duration_weeks=4,
        tags=["python", "programming"],
    )

    print("=" * 60)
    print("[MOCK] Generating Mock Course")
    print("=" * 60)
    print(f"\nTopic: {request.topic}")
    print(f"Difficulty: {request.difficulty.value}")

    # Generate mock data
    print("\n[STAGE1] Creating outline...")
    outline = create_mock_outline(request)
    print(f"  {len(outline.modules)} modules created")

    print("[STAGE2] Creating content...")
    content = create_mock_content(outline)
    print(f"  {content.total_lessons} lessons created")

    print("[STAGE3] Creating assessments...")
    assessments = create_mock_assessments(outline, content)
    print(f"  {len(assessments.lesson_quizzes)} quizzes created")
    print(f"  {len(assessments.capstone_projects)} capstones created")

    # Create result
    result = GenerationResult(
        request=request,
        stage_1_outline=outline,
        stage_2_content=content,
        stage_3_assessments=assessments,
        generation_timestamp=datetime.now().isoformat(),
        total_duration_seconds=0.5,
    )

    # Save
    print("\n[SAVE] Saving mock course...")
    output_dir = save_generation_result(result, output_dir="mock_courses")

    # Export
    print("[EXPORT] Exporting to markdown...")
    export_to_markdown(result, "mock_course.md")

    # Summary
    print_course_summary(result)

    print("\n" + "=" * 60)
    print("MOCK COURSE GENERATED")
    print("=" * 60)
    print(f"\nFiles created:")
    print(f"  - {output_dir}")
    print(f"  - mock_course.md")


if __name__ == "__main__":
    main()
