"""Utility functions for AI Generation Layer"""

import json
import os
from typing import Dict, Any
from datetime import datetime
from pathlib import Path

try:
    from .schemas import GenerationResult
except ImportError:
    from schemas import GenerationResult


def save_generation_result(result: GenerationResult, output_dir: str = "output") -> str:
    """Save generation result to JSON files

    Args:
        result: GenerationResult to save
        output_dir: Output directory path

    Returns:
        str: Path to saved result directory
    """
    os.makedirs(output_dir, exist_ok=True)

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    result_dir = os.path.join(output_dir, f"generation_{timestamp}")
    os.makedirs(result_dir, exist_ok=True)

    # Save complete result
    with open(os.path.join(result_dir, "complete_result.json"), "w") as f:
        json.dump(result.model_dump(), f, indent=2)

    # Save individual stages
    with open(os.path.join(result_dir, "stage_1_outline.json"), "w") as f:
        json.dump(result.stage_1_outline.model_dump(), f, indent=2)

    with open(os.path.join(result_dir, "stage_2_content.json"), "w") as f:
        json.dump(result.stage_2_content.model_dump(), f, indent=2)

    with open(os.path.join(result_dir, "stage_3_assessments.json"), "w") as f:
        json.dump(result.stage_3_assessments.model_dump(), f, indent=2)

    # Save summary
    with open(os.path.join(result_dir, "summary.json"), "w") as f:
        summary = {
            "request": result.request.model_dump(),
            "generation_timestamp": result.generation_timestamp,
            "total_duration_seconds": result.total_duration_seconds,
            "statistics": {
                "total_modules": len(result.stage_1_outline.modules),
                "total_lessons": result.stage_2_content.total_lessons,
                "total_quizzes": len(result.stage_3_assessments.lesson_quizzes),
                "total_capstones": len(result.stage_3_assessments.capstone_projects),
                "total_hours": result.stage_1_outline.total_hours,
            }
        }
        json.dump(summary, f, indent=2)

    print(f"\n[SAVE] Results saved to: {result_dir}")
    return result_dir


def load_generation_result(result_path: str) -> GenerationResult:
    """Load generation result from file

    Args:
        result_path: Path to complete_result.json file

    Returns:
        GenerationResult: Loaded result object
    """
    with open(result_path, "r") as f:
        data = json.load(f)
    return GenerationResult(**data)


def export_to_markdown(result: GenerationResult, output_file: str = "course.md") -> str:
    """Export generation result to Markdown format

    Args:
        result: GenerationResult to export
        output_file: Output markdown file path

    Returns:
        str: Path to saved markdown file
    """
    lines = []

    # Header
    lines.append(f"# {result.stage_1_outline.title}")
    lines.append("")
    lines.append(f"**Difficulty:** {result.stage_1_outline.difficulty.value}")
    lines.append(f"**Target Audience:** {result.stage_1_outline.target_audience}")
    lines.append(f"**Duration:** {result.stage_1_outline.total_hours} hours")
    lines.append("")

    # Course description
    lines.append("## Course Overview")
    lines.append(result.stage_1_outline.description)
    lines.append("")

    # Learning objectives
    lines.append("## Learning Objectives")
    for obj in result.stage_1_outline.learning_objectives:
        lines.append(f"- {obj}")
    lines.append("")

    # Modules and lessons
    content = result.stage_2_content
    for lesson in content.lessons:
        lines.append(f"## {lesson.title}")
        lines.append(f"**Lesson ID:** {lesson.lesson_id}")
        lines.append(f"**Duration:** {lesson.estimated_duration_minutes} minutes")
        lines.append("")

        lines.append("### Learning Objectives")
        for obj in lesson.learning_objectives:
            lines.append(f"- {obj}")
        lines.append("")

        lines.append("### Introduction")
        lines.append(lesson.introduction)
        lines.append("")

        lines.append("### Key Concepts")
        for concept in lesson.main_concepts:
            lines.append(f"#### {concept.name}")
            lines.append(concept.explanation)
            lines.append("")
            lines.append("**Examples:**")
            for example in concept.examples:
                lines.append(f"- {example}")
            lines.append("")

        lines.append("### Real-World Applications")
        for app in lesson.real_world_applications:
            lines.append(f"- {app}")
        lines.append("")

        if lesson.common_misconceptions:
            lines.append("### Common Misconceptions")
            for misconception in lesson.common_misconceptions:
                lines.append(f"- **Misconception:** {misconception['misconception']}")
                lines.append(f"  **Correction:** {misconception['correction']}")
            lines.append("")

        lines.append("### Key Takeaways")
        for takeaway in lesson.key_takeaways:
            lines.append(f"- {takeaway}")
        lines.append("")

        # Add quiz
        quiz = next(
            (q for q in result.stage_3_assessments.lesson_quizzes if q.lesson_id == lesson.lesson_id),
            None
        )
        if quiz:
            lines.append("### Lesson Quiz")
            for i, question in enumerate(quiz.quiz_questions, 1):
                lines.append(f"**{i}. {question.question_text}**")
                if question.options:
                    for opt in question.options:
                        lines.append(f"- {opt}")
                lines.append(f"\n**Answer:** {question.correct_answer}")
                lines.append(f"**Explanation:** {question.explanation}")
                lines.append("")

    # Capstone projects
    if result.stage_3_assessments.capstone_projects:
        lines.append("## Capstone Projects")
        for i, capstone in enumerate(result.stage_3_assessments.capstone_projects, 1):
            lines.append(f"### Project {i}: {capstone.title}")
            lines.append(capstone.description)
            lines.append("")

            lines.append("**Learning Objectives:**")
            for obj in capstone.learning_objectives:
                lines.append(f"- {obj}")
            lines.append("")

            lines.append("**Requirements:**")
            for req in capstone.requirements:
                lines.append(f"- {req}")
            lines.append("")

            lines.append(f"**Submission Format:** {capstone.submission_format}")
            lines.append(f"**Estimated Hours:** {capstone.estimated_hours}")
            lines.append("")

            lines.append("**Evaluation Criteria:**")
            for criterion in capstone.evaluation_criteria:
                lines.append(f"- {criterion['criterion']}: {criterion['description']}")
            lines.append("")

    # Save markdown
    with open(output_file, "w") as f:
        f.write("\n".join(lines))

    print(f"[EXPORT] Markdown exported to: {output_file}")
    return output_file


def generate_course_statistics(result: GenerationResult) -> Dict[str, Any]:
    """Generate statistics about generated course

    Args:
        result: GenerationResult to analyze

    Returns:
        Dict: Statistics dictionary
    """
    stats = {
        "course_title": result.stage_1_outline.title,
        "difficulty": result.stage_1_outline.difficulty.value,
        "total_hours": result.stage_1_outline.total_hours,
        "modules_count": len(result.stage_1_outline.modules),
        "lessons_count": result.stage_2_content.total_lessons,
        "concepts_count": sum(
            len(lesson.main_concepts) for lesson in result.stage_2_content.lessons
        ),
        "quiz_count": len(result.stage_3_assessments.lesson_quizzes),
        "quiz_questions_count": sum(
            len(quiz.quiz_questions) for quiz in result.stage_3_assessments.lesson_quizzes
        ),
        "capstone_count": len(result.stage_3_assessments.capstone_projects),
        "capstone_hours": sum(
            cap.estimated_hours for cap in result.stage_3_assessments.capstone_projects
        ),
        "generation_time_seconds": result.total_duration_seconds,
        "generation_timestamp": result.generation_timestamp,
    }
    return stats


def print_course_summary(result: GenerationResult) -> None:
    """Print formatted course summary

    Args:
        result: GenerationResult to summarize
    """
    stats = generate_course_statistics(result)

    print("\n" + "="*60)
    print(f"[SUMMARY] COURSE GENERATION")
    print("="*60)
    print(f"Course: {stats['course_title']}")
    print(f"Difficulty: {stats['difficulty']}")
    print(f"Total Hours: {stats['total_hours']}")
    print("-"*60)
    print(f"[MODULES] Modules: {stats['modules_count']}")
    print(f"[LESSONS] Lessons: {stats['lessons_count']}")
    print(f"[CONCEPTS] Concepts: {stats['concepts_count']}")
    print(f"[QUIZZES] Quiz Questions: {stats['quiz_questions_count']}")
    print(f"[CAPSTONES] Capstone Projects: {stats['capstone_count']}")
    print(f"[TIME] Generation Time: {stats['generation_time_seconds']:.1f}s")
    print("="*60 + "\n")
