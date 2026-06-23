#!/usr/bin/env python3
"""
Test script to verify curriculum discovery works with fallback.

This tests the fix for "Failed to extract content from any source" error.
"""

import sys
import json
from pathlib import Path

# Add backend to path
backend_path = Path(__file__).parent / "backend"
sys.path.insert(0, str(backend_path))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.services.curriculum_service import CurriculumService
from app.schemas.curriculum import CurriculumDiscoveryRequest
from app.models import Base

def test_curriculum_generation():
    """Test curriculum generation with demo data fallback."""
    print("\n" + "="*70)
    print("Testing Curriculum Discovery with Fallback")
    print("="*70 + "\n")

    # Create in-memory database
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    db = Session()

    # Create service
    service = CurriculumService(db)
    print("[1] Service initialized with in-memory database")

    # Test request
    request = CurriculumDiscoveryRequest(
        topic="JavaScript",
        difficulty="Beginner",
        duration="6 weeks",
        tags=[]
    )
    print(f"[2] Created request: topic='{request.topic}', difficulty='{request.difficulty}'")

    # Call discovery (will fallback to demo data)
    print("\n[3] Calling discover_curriculum()...")
    print("    (Will use demo data since Firecrawl key is missing)\n")

    try:
        response = service.discover_curriculum(request)

        print("[OK] Discovery succeeded!")
        print("\n" + "-"*70)
        print("Response Structure:")
        print("-"*70)

        if response.success:
            data = response.data

            print(f"\nExtracted Topics ({len(data['extracted_topics'])}):")
            for i, topic in enumerate(data['extracted_topics'], 1):
                print(f"  {i}. {topic}")

            print(f"\nExtracted Subtopics:")
            for topic, subs in data['extracted_subtopics'].items():
                print(f"  {topic}:")
                for sub in subs:
                    print(f"    - {sub}")

            print(f"\nQuality Metrics:")
            metrics = data['quality_metrics']
            print(f"  - Generation Method: {metrics['generation_method']}")
            print(f"  - Topics Generated: {metrics['topics_generated']}")
            print(f"  - Chunks Analyzed: {metrics['chunks_analyzed']}")
            print(f"  - Sources Used: {metrics['sources_used']}")
            print(f"  - From Cache: {metrics['from_cache']}")

            print("\n" + "="*70)
            print("VERIFICATION")
            print("="*70)

            # Verify output quality
            checks = {
                "Topics are not empty": len(data['extracted_topics']) > 0,
                "Has 4+ topics": len(data['extracted_topics']) >= 4,
                "Topics are strings": all(isinstance(t, str) for t in data['extracted_topics']),
                "No garbage topics": not any(bad in str(data['extracted_topics']).lower()
                                            for bad in ['rest api', 'tutorial', 'guide']),
                "Has subtopics": len(data['extracted_subtopics']) > 0,
                "All topics have subtopics": all(
                    topic in data['extracted_subtopics']
                    for topic in data['extracted_topics']
                ),
                "Claude LLM method used": data['quality_metrics']['generation_method'] == 'Claude LLM',
            }

            for check, passed in checks.items():
                status = "[PASS]" if passed else "[FAIL]"
                print(f"{status} {check}")

            all_passed = all(checks.values())

            print("\n" + "="*70)
            if all_passed:
                print("SUCCESS: Curriculum discovery working correctly!")
                print("The fallback to demo data is functioning properly.")
                print("Claude LLM topic generation is successful.")
            else:
                print("FAILURE: Some checks did not pass.")
            print("="*70 + "\n")

            return all_passed
        else:
            print(f"[ERROR] Response indicates failure: {response}")
            return False

    except Exception as e:
        print(f"[ERROR] Exception occurred: {e}")
        import traceback
        traceback.print_exc()
        return False
    finally:
        db.close()


if __name__ == "__main__":
    success = test_curriculum_generation()
    sys.exit(0 if success else 1)
