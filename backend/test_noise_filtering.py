"""
Test script to validate noise filtering improvements.

Shows what topics/subtopics/concepts are being filtered out.
"""

import sys
from app.services.topic_cleaner_service import TopicCleanerService
from app.services.curriculum_template_builder import CurriculumTemplateBuilder

def test_noise_filtering():
    """Test noise filtering for various problematic items."""

    print("=" * 80)
    print("NOISE FILTERING TEST")
    print("=" * 80)

    cleaner = TopicCleanerService()
    builder = CurriculumTemplateBuilder()

    # Test topics that should be filtered
    test_topics = [
        # Valid topics - should pass
        ("HTML", True),
        ("CSS", True),
        ("JavaScript", True),
        ("Forms", True),
        ("Media Elements", True),
        ("Accessibility", True),

        # Invalid topics - should be filtered
        ("Help improve MDN", False),
        ("Tutorial", False),
        ("Reference", False),
        ("strings", False),
        ("arrays", False),
        ("rest api", False),
        ("Login", False),
        ("Report Error", False),
    ]

    print("\nTOPIC FILTERING:")
    print("-" * 80)
    valid_count = 0
    invalid_count = 0

    for topic, should_pass in test_topics:
        is_valid = cleaner._is_valid_topic(topic)
        status = "PASS" if is_valid == should_pass else "FAIL"
        symbol = "[PASS]" if is_valid == should_pass else "[FAIL]"

        print(f"{symbol} {topic:30} -> {'Valid' if is_valid else 'Filtered'}")

        if is_valid == should_pass:
            if is_valid:
                valid_count += 1
            else:
                invalid_count += 1

    print(f"\nFiltering Results: {valid_count} correctly passed, {invalid_count} correctly filtered")

    # Test concepts
    print("\n" + "=" * 80)
    print("CONCEPT FILTERING:")
    print("-" * 80)

    test_concepts = [
        "Elements",  # Valid
        "Forms",  # Valid
        "<video>",  # Valid (HTML tag)
        "arrays",  # Invalid
        "strings",  # Invalid
        "rest api",  # Invalid
        "Help improve MDN",  # Invalid
        "Web",  # Valid
        "Design",  # Valid
    ]

    cleaned_concepts = cleaner.clean_concepts(test_concepts)

    print(f"Original concepts ({len(test_concepts)}): {test_concepts}")
    print(f"Cleaned concepts ({len(cleaned_concepts)}): {cleaned_concepts}")

    # Test subtopic filtering
    print("\n" + "=" * 80)
    print("SUBTOPIC FILTERING:")
    print("-" * 80)

    test_subtopics = {
        "HTML": {
            "Valid Items": [
                "Basic Structure",
                "Forms and Input",
                "Semantic HTML",
                "Media Elements",
            ],
            "Invalid Items": [
                "Help improve MDN",
                "**Basics**",
                "rest api",
                "arrays",
                "Interview Questions",
            ]
        }
    }

    for topic, items in test_subtopics.items():
        print(f"\nTopic: {topic}")
        print("Valid items (should pass):")
        for item in items["Valid Items"]:
            is_valid = cleaner._is_valid_topic(item)
            symbol = "[OK]" if is_valid else "[FAIL]"
            print(f"  {symbol} {item}")

        print("Invalid items (should be filtered):")
        for item in items["Invalid Items"]:
            is_valid = cleaner._is_valid_topic(item)
            symbol = "[OK]" if not is_valid else "[FAIL]"
            print(f"  {symbol} {item}")

    print("\n" + "=" * 80)
    print("ALL FILTERING TESTS COMPLETE")
    print("=" * 80)


if __name__ == "__main__":
    try:
        test_noise_filtering()
    except Exception as e:
        print(f"\n[FAIL] Test failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
