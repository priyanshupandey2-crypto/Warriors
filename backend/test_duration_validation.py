"""
Test script to validate flexible duration field.

Tests that any duration format is now accepted.
"""

import sys
from app.schemas.curriculum import CurriculumDiscoveryRequest

def test_duration_validation():
    """Test various duration formats."""

    print("=" * 80)
    print("DURATION VALIDATION TEST")
    print("=" * 80)

    test_cases = [
        # Original allowed values
        ("30 minutes", True),
        ("1 hour", True),
        ("2 hours", True),
        ("3 hours", True),
        ("1 week", True),

        # New flexible values (should now work)
        ("6 weeks", True),
        ("1 month", True),
        ("2 months", True),
        ("1 year", True),
        ("30 days", True),
        ("4 hours", True),
        ("90 minutes", True),
        ("5 weeks", True),
        ("3 days", True),
        ("custom duration", True),

        # Invalid (empty)
        ("", False),
    ]

    passed = 0
    failed = 0

    print("\nTesting duration validation:\n")

    for duration, should_pass in test_cases:
        try:
            request = CurriculumDiscoveryRequest(
                topic="Test Topic",
                difficulty="Intermediate",
                duration=duration,
                tags=[]
            )
            if should_pass:
                print(f"[PASS] '{duration}' - Accepted")
                passed += 1
            else:
                print(f"[FAIL] '{duration}' - Should have been rejected but was accepted")
                failed += 1
        except Exception as e:
            if not should_pass:
                print(f"[PASS] '{duration}' - Correctly rejected")
                passed += 1
            else:
                print(f"[FAIL] '{duration}' - Should have been accepted but was rejected")
                print(f"       Error: {str(e)}")
                failed += 1

    print(f"\n{'=' * 80}")
    print(f"Results: {passed} passed, {failed} failed")
    print(f"{'=' * 80}\n")

    if failed > 0:
        sys.exit(1)


if __name__ == "__main__":
    try:
        test_duration_validation()
        print("[SUCCESS] All duration validation tests passed!")
    except Exception as e:
        print(f"[FAIL] Test failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
