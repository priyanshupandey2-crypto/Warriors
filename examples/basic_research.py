"""Basic research example"""

import asyncio
import os
from src.research_orchestrator import ResearchOrchestrator
from src.types import ResearchRequest, DifficultyLevel


async def main():
    """Run basic research example"""
    orchestrator = ResearchOrchestrator(
        model="claude-opus-4-8",
        enable_caching=True,
        langsmith_enabled=os.getenv("LANGSMITH_ENABLED", "false").lower() == "true",
        langsmith_api_key=os.getenv("LANGSMITH_API_KEY"),
    )

    # Setup progress tracking
    def on_progress(progress):
        percent = int(progress.progress * 100)
        print(f"[{progress.status}] {progress.current_step}: {percent}%")
        if progress.errors:
            print(f"  Errors: {progress.errors}")

    orchestrator.on_progress(on_progress)

    # Create research request
    request = ResearchRequest(
        topic="Machine Learning Fundamentals",
        difficulty=DifficultyLevel.BEGINNER,
        targetAudience="Software Engineers",
        duration=8,
        tags=["machine-learning", "ai", "data-science"],
        context="Focus on practical applications and industry relevance",
    )

    print(f"Starting research for: {request.topic}")
    print(f"Trace ID: {orchestrator.get_trace_id()}")
    print("---\n")

    try:
        result = await orchestrator.research(request)

        # Display results
        print("=== RESEARCH RESULTS ===\n")
        print(f"Topic: {result.topic_overview.topic}")
        print(f"Summary: {result.topic_overview.summary}\n")

        print("Learning Objectives:")
        for i, obj in enumerate(result.learning_objectives[:3], 1):
            print(f"  {i}. {obj.objective} ({obj.level})")
        print(f"  ... and {len(result.learning_objectives) - 3} more\n")

        print("Curriculum Structure:")
        for block in result.curriculum_structure[:3]:
            print(f"  Block {block.sequence}: {block.title} ({block.duration} days)")
            print(f"    Topics: {', '.join(block.key_topics[:2])}")
        print(f"  ... and {len(result.curriculum_structure) - 3} more blocks\n")

        print("Key Concepts (by industry relevance):")
        top_concepts = sorted(
            result.industry_relevant_concepts,
            key=lambda c: c.industry_relevance,
            reverse=True,
        )[:5]
        for i, concept in enumerate(top_concepts, 1):
            print(
                f"  {i}. {concept.name} (relevance: {concept.industry_relevance})"
            )
            print(f"     {concept.description}")
        print(
            f"  ... and {len(result.industry_relevant_concepts) - 5} more concepts\n"
        )

        print("Learning Progression:")
        print(f"  Total Weeks: {result.learning_progression.total_weeks}")
        print(
            f"  Weekly Breakdown: {len(result.learning_progression.weekly_breakdown)} weeks"
        )
        print(
            f"  Skill Development Paths: {len(result.learning_progression.skill_development_path)}"
        )

        for week in result.learning_progression.weekly_breakdown[:3]:
            print(f"\n  Week {week.week}: {week.focus}")
            print(f"    Hours: {week.estimated_hours}")
            concepts_str = ", ".join(week.learning_concepts[:2])
            print(f"    Concepts: {concepts_str}")

        print("\n\nConfidence Metrics:")
        print(
            f"  Curriculum: {int(result.confidence_scores.curriculum_confidence * 100)}%"
        )
        print(
            f"  Objectives: {int(result.confidence_scores.objective_confidence * 100)}%"
        )
        print(
            f"  Industry Relevance: {int(result.confidence_scores.industry_relevance_confidence * 100)}%"
        )
        print(
            f"  Progression: {int(result.confidence_scores.progression_confidence * 100)}%"
        )

        # Export reasoning trace
        print("\n=== RESEARCH TRACE (Explainability) ===\n")
        markdown = orchestrator.export_trace_as_markdown()
        print(markdown[:1000] + "\n... (trace continues)")

        # Visualization
        print("\n=== REASONING VISUALIZATION ===\n")
        viz = orchestrator.get_reasoning_visualization()
        print(f"Total Steps: {viz.steps}")
        print(f"Timeline Entries: {len(viz.timeline)}")
        print(f"Dependency Nodes: {len(viz.dependencies)}")

        print("\nTimeline:")
        for entry in viz.timeline[:5]:
            print(f"  {entry.step}. {entry.action} (+{entry.duration}ms)")

    except Exception as e:
        print(f"Research failed: {e}")
        import traceback

        traceback.print_exc()
        return 1

    return 0


if __name__ == "__main__":
    exit_code = asyncio.run(main())
    exit(exit_code)
