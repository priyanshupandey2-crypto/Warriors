"""
Test script to validate URL generation improvements.

This script tests the enhanced URL generation logic without requiring
Firecrawl API or database connectivity.
"""

import sys
from app.services.curriculum_service import CurriculumService
from sqlalchemy.orm import Session

# Mock database session for testing
class MockSession:
    pass

def test_url_generation():
    """Test URL generation for various topics."""

    print("=" * 80)
    print("URL GENERATION TEST")
    print("=" * 80)

    # Create service with mock session
    service = CurriculumService(MockSession())

    test_topics = [
        ("Deep Learning", ["machine-learning", "neural-networks"]),
        ("Python", ["programming", "beginner"]),
        ("JavaScript", ["web", "frontend"]),
        ("React", ["frontend", "framework"]),
        ("Machine Learning", ["ai", "data-science"]),
        ("Web Development", ["html", "css", "javascript"]),
        ("Kubernetes", ["devops", "containers"]),
        ("TypeScript", ["programming", "web"]),
    ]

    for topic, tags in test_topics:
        print(f"\n{'='*80}")
        print(f"Topic: {topic}")
        print(f"Tags: {', '.join(tags)}")
        print(f"{'='*80}")

        urls = service._generate_source_urls(topic, tags)

        for idx, url in enumerate(urls, 1):
            print(f"{idx}. {url}")

        # Validate URL patterns
        geeksforgeeks_count = sum(1 for url in urls if "geeksforgeeks.org" in url)
        w3schools_count = sum(1 for url in urls if "w3schools.com" in url)
        mdn_count = sum(1 for url in urls if "developer.mozilla.org" in url)
        javatpoint_count = sum(1 for url in urls if "javatpoint.com" in url)
        roadmap_count = sum(1 for url in urls if "roadmap.sh" in url)

        print(f"\nURL Distribution:")
        print(f"  GeeksForGeeks: {geeksforgeeks_count}")
        print(f"  W3Schools: {w3schools_count}")
        print(f"  MDN: {mdn_count}")
        print(f"  JavaTPoint: {javatpoint_count}")
        print(f"  Roadmap.sh: {roadmap_count}")

        # Check for quality
        assert len(urls) > 0, "No URLs generated"
        assert all(url.startswith("http") for url in urls), "Invalid URL format"
        assert len(set(urls)) == len(urls), "Duplicate URLs detected"

        print(f"[PASS] All checks passed for {topic}")

    print(f"\n{'='*80}")
    print("ALL TESTS PASSED!")
    print(f"{'='*80}\n")


if __name__ == "__main__":
    try:
        test_url_generation()
    except Exception as e:
        print(f"\n[FAIL] Test failed: {e}")
        sys.exit(1)
