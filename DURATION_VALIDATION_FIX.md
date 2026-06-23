# Duration Validation Fix

## Problem

The curriculum discovery API had a **strict regex pattern** that only allowed 5 specific duration values:
- "30 minutes"
- "1 hour"
- "2 hours"
- "3 hours"
- "1 week"

When users tried to enter "6 weeks", they got:
```json
{
  "detail": [
    {
      "type": "string_pattern_mismatch",
      "loc": ["body", "duration"],
      "msg": "String should match pattern '^(30 minutes|1 hour|2 hours|3 hours|1 week)$'",
      "input": "6 weeks"
    }
  ]
}
```

## Solution

**File**: `backend/app/schemas/curriculum.py`

### Before
```python
duration: str = Field(
    ...,
    description="Estimated duration",
    pattern="^(30 minutes|1 hour|2 hours|3 hours|1 week)$"
)
```

### After
```python
duration: str = Field(
    ...,
    description="Estimated duration (e.g., '30 minutes', '2 hours', '1 week', '6 weeks')",
    min_length=1
)
```

## Changes Made

1. ✅ **Removed strict regex pattern** - No longer restricts to 5 values
2. ✅ **Added flexible validation** - Only checks min_length (must not be empty)
3. ✅ **Updated description** - Shows examples including new formats
4. ✅ **Added schema examples** - Multiple examples in OpenAPI documentation

## What Users Can Now Enter

### Original formats (still work)
- "30 minutes"
- "1 hour"
- "2 hours"
- "3 hours"
- "1 week"

### New flexible formats (now work)
- "6 weeks"
- "1 month"
- "2 months"
- "1 year"
- "30 days"
- "4 hours"
- "90 minutes"
- "5 weeks"
- "3 days"
- Any custom duration format

## Testing

Created `backend/test_duration_validation.py` with 16 test cases:

```
[PASS] '30 minutes' - Accepted
[PASS] '1 hour' - Accepted
[PASS] '2 hours' - Accepted
[PASS] '3 hours' - Accepted
[PASS] '1 week' - Accepted
[PASS] '6 weeks' - Accepted ✨ NEW
[PASS] '1 month' - Accepted ✨ NEW
[PASS] '2 months' - Accepted ✨ NEW
[PASS] '1 year' - Accepted ✨ NEW
[PASS] '30 days' - Accepted ✨ NEW
[PASS] '4 hours' - Accepted ✨ NEW
[PASS] '90 minutes' - Accepted ✨ NEW
[PASS] '5 weeks' - Accepted ✨ NEW
[PASS] '3 days' - Accepted ✨ NEW
[PASS] 'custom duration' - Accepted ✨ NEW
[PASS] '' - Correctly rejected (empty not allowed)

Results: 16 passed, 0 failed ✓
```

## Test Coverage

✅ All original formats still accepted (backward compatible)  
✅ New formats now accepted  
✅ Empty string correctly rejected  
✅ Min_length validation working  

## How to Test

### Run the validation test
```bash
cd backend
python test_duration_validation.py
```

Expected output: **16 passed, 0 failed**

### Test with the API
```bash
# Test with "6 weeks" (was failing before)
curl -X POST http://localhost:8000/api/curriculum/discover \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "HTML",
    "difficulty": "Beginner",
    "duration": "6 weeks",
    "tags": ["web"]
  }'
```

Expected: ✅ Request accepted (no validation error)

### Test with different formats
```bash
# Test "1 month"
curl -X POST http://localhost:8000/api/curriculum/discover \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "React Advanced",
    "difficulty": "Advanced",
    "duration": "1 month"
  }'

# Test "90 minutes"
curl -X POST http://localhost:8000/api/curriculum/discover \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "Python Basics",
    "difficulty": "Beginner",
    "duration": "90 minutes"
  }'
```

## Backward Compatibility

✅ **100% Backward Compatible**
- All original 5 durations still work
- No breaking changes
- Existing code/clients unaffected
- Only adds flexibility for new values

## Performance Impact

✅ **No performance impact**
- Removed regex pattern matching (slightly faster)
- Now using simple string length validation (O(1) operation)

## Files Modified

1. `backend/app/schemas/curriculum.py` - Duration field validation

## New Files

1. `backend/test_duration_validation.py` - 16 test cases
2. `DURATION_VALIDATION_FIX.md` - This documentation

## Summary

| Aspect | Before | After |
|--------|--------|-------|
| **Allowed formats** | 5 fixed values | Any format |
| **User input "6 weeks"** | ❌ Rejected | ✅ Accepted |
| **User input "1 month"** | ❌ Rejected | ✅ Accepted |
| **Validation type** | Strict regex | Flexible (min length) |
| **Test coverage** | None | 16/16 pass |
| **Backward compatible** | N/A | ✅ Yes |

## Status

✅ **Ready for Production**

Users can now enter any duration they prefer!
