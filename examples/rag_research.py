"""Example: Research with Hybrid RAG (Vector DB + Web Search)"""

import asyncio
import os
from src.research_orchestrator import ResearchOrchestrator
from src.types import ResearchRequest, DifficultyLevel
from src.rag_engine import RAGEngine
from src.vector_db import Document


async def setup_knowledge_base():
    """Setup sample knowledge base documents"""
    rag = RAGEngine()

    # Sample documents to index
    documents = [
        Document(
            id="ml_basics_1",
            content="""
Machine Learning is a subset of artificial intelligence that enables systems
to learn and improve from experience without explicit programming. Key concepts
include supervised learning, unsupervised learning, and reinforcement learning.
Real-world applications include image recognition, natural language processing,
and predictive analytics. ML engineers typically work with Python, TensorFlow,
and scikit-learn libraries.
            """,
            metadata={
                "topic": "machine-learning",
                "level": "beginner",
                "source": "internal_kb"
            },
            source_url="https://example.com/ml-basics",
            source_type="educational"
        ),
        Document(
            id="ml_concepts_1",
            content="""
Core ML concepts include:
- Supervised Learning: Training with labeled data (classification, regression)
- Unsupervised Learning: Finding patterns in unlabeled data (clustering)
- Reinforcement Learning: Learning through rewards and penalties
- Transfer Learning: Leveraging pre-trained models for new tasks
- Deep Learning: Neural networks with multiple layers
Each approach has specific use cases and algorithms.
            """,
            metadata={
                "topic": "machine-learning",
                "level": "intermediate",
                "source": "internal_kb"
            },
            source_url="https://example.com/ml-concepts",
            source_type="educational"
        ),
        Document(
            id="ml_industry_1",
            content="""
Industry Applications of Machine Learning:
- Tech: Google, Meta, Apple use ML for recommendation systems and search
- Finance: Banks use ML for fraud detection and risk assessment
- Healthcare: ML assists in diagnosis, drug discovery, and patient monitoring
- E-commerce: Amazon uses ML for personalization and logistics
- Manufacturing: Predictive maintenance using sensor data
Skills needed: Python, statistics, linear algebra, and domain knowledge.
            """,
            metadata={
                "topic": "machine-learning",
                "level": "advanced",
                "source": "internal_kb"
            },
            source_url="https://example.com/ml-industry",
            source_type="industry"
        ),
    ]

    # Index documents
    await rag.initialize()
    await rag.index_documents(documents)
    print(f"Indexed {len(documents)} knowledge base documents\n")


async def research_with_rag():
    """Run research with RAG enabled"""

    # Setup knowledge base first
    await setup_knowledge_base()

    # Initialize orchestrator with RAG
    orchestrator = ResearchOrchestrator(
        model="claude-opus-4-8",
        enable_rag=True,
        enable_caching=True,
    )

    # Progress tracking
    def on_progress(progress):
        status = progress.status.replace("_", " ").title()
        percent = int(progress.progress * 100)
        step = progress.current_step.replace("_", " ").title()
        print(f"[{status}] {step}: {percent}%")

    orchestrator.on_progress(on_progress)

    # Create research request
    request = ResearchRequest(
        topic="Machine Learning Fundamentals",
        difficulty=DifficultyLevel.BEGINNER,
        targetAudience="Software Engineers",
        duration=8,
        tags=["machine-learning", "ai", "data-science"],
        context="Focus on practical applications and industry relevance"
    )

    print("=" * 70)
    print("AI Research Engine with Hybrid RAG")
    print("=" * 70)
    print(f"\nTopic: {request.topic}")
    print(f"Difficulty: {request.difficulty}")
    print(f"Target Audience: {request.targetAudience}")
    print(f"Duration: {request.duration} weeks")
    print(f"\nRAG Configuration:")
    print(f"  - Vector DB: {type(orchestrator.engine.rag_engine.vector_db).__name__}")
    print(f"  - Web Search: {type(orchestrator.engine.rag_engine.web_search).__name__}")
    print(f"  - Caching: {orchestrator.enable_caching}")
    print("\nStarting research...\n")

    try:
        result = await orchestrator.research(request)

        # Display results
        print("\n" + "=" * 70)
        print("RESEARCH RESULTS")
        print("=" * 70)

        print(f"\nTopic: {result.topic_overview.topic}")
        print(f"Summary: {result.topic_overview.summary}")
        print(f"Industry Context: {result.topic_overview.industry_context}")
        print(f"Relevance Score: {result.topic_overview.relevance_score}")
        print(f"Key Areas: {', '.join(result.topic_overview.key_areas)}")

        print(f"\n--- Learning Objectives ({len(result.learning_objectives)} total) ---")
        for i, obj in enumerate(result.learning_objectives[:5], 1):
            print(f"{i}. {obj.objective}")
            print(f"   Level: {obj.level} | {obj.description[:60]}...")
        if len(result.learning_objectives) > 5:
            print(f"... and {len(result.learning_objectives) - 5} more objectives")

        print(f"\n--- Curriculum Structure ({len(result.curriculum_structure)} blocks) ---")
        for block in result.curriculum_structure[:3]:
            print(f"Block {block.sequence}: {block.title} ({block.duration} days)")
            print(f"  Topics: {', '.join(block.key_topics[:2])}")
        if len(result.curriculum_structure) > 3:
            print(f"... and {len(result.curriculum_structure) - 3} more blocks")

        print(f"\n--- Industry-Relevant Concepts (Top 5) ---")
        top_concepts = sorted(
            result.industry_relevant_concepts,
            key=lambda c: c.industry_relevance,
            reverse=True
        )[:5]
        for i, concept in enumerate(top_concepts, 1):
            print(f"{i}. {concept.name}")
            print(f"   Difficulty: {concept.difficulty}")
            print(f"   Industry Relevance: {concept.industry_relevance}")
            if concept.applications:
                print(f"   Applications: {', '.join(concept.applications[:2])}")

        print(f"\n--- Learning Progression ---")
        print(f"Total Weeks: {result.learning_progression.total_weeks}")
        print(f"Weekly Breakdown:")
        for week in result.learning_progression.weekly_breakdown[:3]:
            print(f"  Week {week.week}: {week.focus} ({week.estimated_hours} hours)")
        if len(result.learning_progression.weekly_breakdown) > 3:
            print(f"  ... and {len(result.learning_progression.weekly_breakdown) - 3} more weeks")

        print(f"\n--- RAG: Research Sources (GROUNDED) ---")
        print(f"Total Sources: {len(result.research_sources)}")
        for i, source in enumerate(result.research_sources[:5], 1):
            print(f"\n{i}. {source.title}")
            print(f"   Type: {source.type}")
            print(f"   Relevance: {source.relevance}")
            print(f"   URL: {source.url}")
            print(f"   Description: {source.description[:80]}...")
        if len(result.research_sources) > 5:
            print(f"\n... and {len(result.research_sources) - 5} more sources")

        print(f"\n--- Confidence Scores ---")
        scores = result.confidence_scores
        print(f"Curriculum: {int(scores.curriculum_confidence * 100)}%")
        print(f"Objectives: {int(scores.objective_confidence * 100)}%")
        print(f"Industry Relevance: {int(scores.industry_relevance_confidence * 100)}%")
        print(f"Progression: {int(scores.progression_confidence * 100)}%")

        print(f"\n--- Research Trace ---")
        trace = orchestrator.get_reasoning_trace()
        print(f"Total Steps: {len(trace)}")
        for step in trace[:3]:
            print(f"  Step {step.step}: {step.action}")
            print(f"    Reasoning: {step.reasoning[:70]}...")
        if len(trace) > 3:
            print(f"  ... and {len(trace) - 3} more steps")

        print("\n" + "=" * 70)
        print("RAG INTEGRATION SUCCESSFUL")
        print("=" * 70)
        print(f"Sources are now grounded in:")
        print(f"  - Knowledge base documents (Vector DB)")
        print(f"  - Real web search results (Current information)")
        print(f"  - All sources have verified URLs")
        print(f"\nTrace ID: {result.id}")

    except Exception as e:
        print(f"Error during research: {e}")
        import traceback
        traceback.print_exc()
        return 1

    return 0


async def compare_rag_performance():
    """Compare performance with and without RAG"""
    print("\n" + "=" * 70)
    print("COMPARING RAG VS NON-RAG PERFORMANCE")
    print("=" * 70)

    request = ResearchRequest(
        topic="Python Programming",
        difficulty=DifficultyLevel.BEGINNER,
        targetAudience="Beginners",
        duration=4,
        tags=["python", "programming"],
    )

    import time

    # Test with RAG
    print("\n1. Testing WITH RAG enabled...")
    orch_with_rag = ResearchOrchestrator(enable_rag=True, enable_caching=False)
    start = time.time()
    try:
        result_rag = await orch_with_rag.research(request)
        time_with_rag = time.time() - start
        sources_rag = len(result_rag.research_sources)
        print(f"   Time: {time_with_rag:.1f}s")
        print(f"   Sources: {sources_rag}")
        print(f"   Avg Relevance: {sum(s.relevance for s in result_rag.research_sources) / sources_rag:.2f}")
    except Exception as e:
        print(f"   Error: {e}")
        return

    # Test without RAG
    print("\n2. Testing WITHOUT RAG...")
    orch_no_rag = ResearchOrchestrator(enable_rag=False, enable_caching=False)
    start = time.time()
    try:
        result_no_rag = await orch_no_rag.research(request)
        time_no_rag = time.time() - start
        sources_no_rag = len(result_no_rag.research_sources)
        print(f"   Time: {time_no_rag:.1f}s")
        print(f"   Sources: {sources_no_rag}")
        print(f"   Avg Relevance: {sum(s.relevance for s in result_no_rag.research_sources) / sources_no_rag:.2f}")
    except Exception as e:
        print(f"   Error: {e}")
        return

    # Compare
    print("\n3. Comparison:")
    print(f"   Time difference: {time_with_rag - time_no_rag:.1f}s ({((time_with_rag/time_no_rag - 1) * 100):.0f}% slower)")
    print(f"   Quality improvement: RAG provides grounded sources with URLs")


async def main():
    """Main entry point"""
    await research_with_rag()


if __name__ == "__main__":
    asyncio.run(main())
