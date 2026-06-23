# Test Plan: Verify Real Curriculum Generation

## What Changed

The `curriculum_service.py` now uses Claude LLM to generate topics instead of extracting headings.

## How to Test

### Test 1: JavaScript Curriculum (Beginner)
```bash
curl -X POST http://localhost:8000/api/curriculum/discover \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "JavaScript",
    "difficulty": "Beginner",
    "duration": "6 weeks"
  }'
```

**Expected Output**:
- Topics should be meaningful (not "rest api", "Tutorial")
- Examples: "Variables and Data Types", "Functions and Scope", "Object-Oriented Programming"
- Subtopics should break down each topic logically
- No garbage words in output

### Test 2: Python Curriculum (Intermediate)
```bash
curl -X POST http://localhost:8000/api/curriculum/discover \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "Python",
    "difficulty": "Intermediate",
    "duration": "8 weeks"
  }'
```

**Expected Output**:
- Topics: "Data Structures", "Object-Oriented Programming", "Functional Programming", etc.
- Not: "Tutorial", "rest api", random words

### Test 3: HTML Curriculum (Beginner)
```bash
curl -X POST http://localhost:8000/api/curriculum/discover \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "HTML",
    "difficulty": "Beginner",
    "duration": "4 weeks"
  }'
```

**Expected Output**:
- Topics: "Semantic HTML Structure", "Forms and Validation", "Accessibility", etc.
- Not: "HTML Tutorial", "strings", "Help improve MDN"

---

## What to Look For

### Quality Metrics

**GOOD Topics**:
- ✓ Specific and teachable
- ✓ Progress logically (basic → advanced)
- ✓ Directly related to the main topic
- ✓ Can be explained in 15-30 minutes each
- ✓ Have clear learning objectives

**BAD Topics** (should no longer appear):
- ✗ "rest api" (unrelated to JavaScript/Python/HTML)
- ✗ "Tutorial" (navigation, not content)
- ✗ "data types" (too generic, covered in subtopics)
- ✗ "async" (too vague, should be "Asynchronous Programming")
- ✗ Single random words from content

### Response Structure

```json
{
  "success": true,
  "extracted_topics": [
    "Topic 1",
    "Topic 2",
    "Topic 3",
    "Topic 4"
  ],
  "extracted_subtopics": {
    "Topic 1": [
      "Subtopic 1",
      "Subtopic 2",
      "Subtopic 3"
    ]
  },
  "quality_metrics": {
    "topics_generated": 4,
    "generation_method": "Claude LLM + Semantic Analysis"
  }
}
```

---

## Before vs After

### BEFORE (v1 - Extraction-based)
```json
{
  "extracted_topics": [
    "Dynamic scripting with JavaScript",
    "JavaScript",
    "Tutorial"
  ],
  "extracted_subtopics": {
    "Tutorial": [
      "rest api",
      "data types",
      "async",
      "exception handling"
    ]
  }
}
```

**Problems**:
- "rest api" is garbage
- "Tutorial" is navigation
- "data types", "async" are too generic
- Subtopics are random words from content

### AFTER (v2 - Generation-based)
```json
{
  "extracted_topics": [
    "Variables and Data Types",
    "Functions and Scope",
    "Object-Oriented Programming",
    "Asynchronous Programming"
  ],
  "extracted_subtopics": {
    "Variables and Data Types": [
      "Primitive Types",
      "Type Coercion",
      "Variable Declaration"
    ],
    "Functions and Scope": [
      "Function Declaration",
      "Arrow Functions",
      "Closures and Scope"
    ]
  }
}
```

**Improvements**:
- Topics are specific and teachable
- Subtopics break down each topic logically
- No garbage words
- Pedagogically sound structure

---

## How to Verify Locally

### Prerequisites
1. Backend running: `python main.py`
2. Database initialized with schema
3. ANTHROPIC_API_KEY set in environment

### Manual Testing
```bash
# Navigate to backend directory
cd backend

# Run the service
python main.py

# In another terminal, test the endpoint
curl -X POST http://localhost:8000/api/curriculum/discover \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "React",
    "difficulty": "Intermediate",
    "duration": "8 weeks"
  }'
```

### Automated Testing (Optional)
```python
# test_curriculum_generation.py
from app.services.curriculum_service import CurriculumService
from sqlalchemy.orm import Session

def test_javascript_topic_generation():
    """Test that JavaScript curriculum generates real topics."""
    service = CurriculumService(db)
    
    # Mock chunks
    mock_chunks = [...]  # Sample chunks
    
    topics = service._extract_curriculum_topics(
        mock_chunks, 
        "JavaScript", 
        "Beginner"
    )
    
    # Verify
    assert "Variables and Data Types" in topics or \
           "Functions and Scope" in topics or \
           "Object-Oriented Programming" in topics
    
    assert "rest api" not in topics
    assert "Tutorial" not in topics
    assert "async" not in topics  # Too generic
    
    print(f"✓ Generated topics: {topics}")
```

---

## Success Criteria

✅ No garbage topics like "rest api", "Tutorial", "rest api" again  
✅ Topics are specific and teachable  
✅ Subtopics provide meaningful breakdown  
✅ Topics progress logically (basic → advanced)  
✅ Quality metrics show "Claude LLM + Semantic Analysis"  
✅ Response structure is valid JSON  
✅ Takes reasonable time (< 10 seconds per curriculum)  

---

## Troubleshooting

### If generation fails:
```
Error: "Failed to create message"
→ Check ANTHROPIC_API_KEY is set
→ Check Claude API is accessible
→ Check token limits

System fallback to heuristics:
→ Will extract topics based on concept frequency
→ Quality will be lower but system stays up
```

### If topics still include garbage:
```
Check logs for:
"LLM generated X learning topics"

If this line appears:
→ Generation is working
→ Garbage means Claude analysis found those topics
→ Prompt may need refinement

If this line doesn't appear:
→ Fallback heuristic running
→ Check logs for "LLM topic generation failed"
```

---

## What's Being Tested

1. **Claude Integration**: Does LLM generate topics correctly?
2. **Fallback Strategy**: Does heuristic work if Claude fails?
3. **Output Quality**: Are topics meaningful (not garbage)?
4. **API Compatibility**: Does response format match expectations?
5. **Performance**: Does generation complete in reasonable time?

---

## Next Steps After Testing

1. ✅ Test locally with sample data
2. ✅ Verify output quality
3. ✅ Check error handling
4. ✅ Deploy to production
5. ✅ Monitor real usage

---

## Commands for Quick Testing

```bash
# Test JavaScript
curl -X POST http://localhost:8000/api/curriculum/discover \
  -H "Content-Type: application/json" \
  -d '{"topic":"JavaScript","difficulty":"Beginner","duration":"6 weeks"}'

# Test Python  
curl -X POST http://localhost:8000/api/curriculum/discover \
  -H "Content-Type: application/json" \
  -d '{"topic":"Python","difficulty":"Intermediate","duration":"8 weeks"}'

# Test HTML
curl -X POST http://localhost:8000/api/curriculum/discover \
  -H "Content-Type: application/json" \
  -d '{"topic":"HTML","difficulty":"Beginner","duration":"4 weeks"}'
```

Expected: Real, meaningful topics (not garbage like "rest api")
