# Testing Guide - AI Research Engine

## No Postman Needed - Multiple Testing Options

You don't need Postman for testing. Here are 5 ways to test the engine:

## Option 1: Python Examples (Recommended)

### Basic Research (No RAG)
```bash
python -m examples.basic_research
```

### With Hybrid RAG
```bash
export ENABLE_RAG=true
python -m examples.rag_research
```

**Pros**: Easy, shows full output, no additional tools needed

## Option 2: curl Commands (Simple)

### Health Check
```bash
curl http://localhost:8000/health
```

### Configuration
```bash
curl http://localhost:8000/config
```

### Execute Research
```bash
curl -X POST http://localhost:8000/research \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "Machine Learning",
    "difficulty": "beginner",
    "targetAudience": "Developers",
    "duration": 8,
    "tags": ["ML", "AI"]
  }' | jq .
```

### Get Trace
```bash
# Replace TRACE_ID with actual ID from research response
curl http://localhost:8000/trace/{TRACE_ID} | jq .
```

**Pros**: Quick, no tools needed, works in terminal

## Option 3: Python Requests (Flexible)

```python
import requests
import json

BASE_URL = "http://localhost:8000"

# Health check
response = requests.get(f"{BASE_URL}/health")
print("Health:", response.json())

# Execute research
payload = {
    "topic": "Python Programming",
    "difficulty": "beginner",
    "targetAudience": "Beginners",
    "duration": 4,
    "tags": ["python", "programming"]
}

response = requests.post(
    f"{BASE_URL}/research",
    json=payload,
    headers={"Content-Type": "application/json"}
)

result = response.json()
print(f"Research ID: {result['id']}")
print(f"Topic: {result['topic_overview']['topic']}")
print(f"Objectives: {len(result['learning_objectives'])}")
print(f"Confidence: {result['confidence_scores']}")

# Get trace
trace_id = result['id']
trace_response = requests.get(f"{BASE_URL}/trace/{trace_id}")
print(f"\nTrace steps: {trace_response.json()['steps']}")
```

**Pros**: More control, can automate, easy to process results

## Option 4: httpie (Like curl but prettier)

```bash
# Install (one time)
pip install httpie

# Health check
http GET localhost:8000/health

# Research
http POST localhost:8000/research \
  topic="Cloud Computing" \
  difficulty="intermediate" \
  targetAudience="DevOps" \
  duration:=10 \
  tags:='["cloud", "k8s"]'

# Get trace
http GET localhost:8000/trace/{TRACE_ID}
```

**Pros**: More readable output than curl, no additional UI needed

## Option 5: Interactive Python Shell

```bash
python
>>> import asyncio
>>> from src.research_orchestrator import ResearchOrchestrator
>>> from src.types import ResearchRequest, DifficultyLevel
>>> 
>>> async def test():
...     orch = ResearchOrchestrator(enable_rag=True)
...     result = await orch.research(ResearchRequest(
...         topic="Kubernetes",
...         difficulty=DifficultyLevel.INTERMEDIATE,
...         targetAudience="DevOps",
...         duration=8,
...         tags=["k8s", "containers"]
...     ))
...     print(f"ID: {result.id}")
...     print(f"Sources: {len(result.research_sources)}")
...     return result
>>> 
>>> result = asyncio.run(test())
```

**Pros**: Direct control, see everything, good for debugging

## Testing Workflow

### Step 1: Start Server
```bash
uvicorn src.app:app --reload
```

### Step 2: Test Health (in another terminal)
```bash
curl http://localhost:8000/health
```

Expected response:
```json
{
  "status": "healthy",
  "service": "ai-research-engine",
  "model": "claude-opus-4-8"
}
```

### Step 3: Run Research
```bash
# Option A: Python example
python -m examples.basic_research

# Option B: curl
curl -X POST http://localhost:8000/research \
  -H "Content-Type: application/json" \
  -d '{"topic":"ML","difficulty":"beginner","targetAudience":"Dev","duration":8,"tags":["ml"]}'

# Option C: Python requests
python << 'EOF'
import requests
r = requests.post("http://localhost:8000/research", json={
    "topic": "ML",
    "difficulty": "beginner",
    "targetAudience": "Dev",
    "duration": 8,
    "tags": ["ml"]
})
print(r.json())
EOF
```

### Step 4: Verify Output
Check for:
- Research ID
- Topic overview
- Learning objectives (8-12)
- Curriculum blocks
- Concepts with industry relevance
- Sources with URLs
- Confidence scores
- Reasoning trace

## Code Quality Checks

### Run Compilation Check
```bash
python -m py_compile src/*.py
```

### Run Unit Tests
```bash
pytest tests/ -v
```

### Check Types
```bash
# Install (one time)
pip install mypy

# Run type checker
mypy src/
```

## Common Test Scenarios

### Test 1: Basic Functionality
```bash
python -m examples.basic_research
```
**Verify**: Output includes all 7 research components

### Test 2: RAG Integration
```bash
export ENABLE_RAG=true
python -m examples.rag_research
```
**Verify**: Sources have real URLs

### Test 3: Caching
```bash
# Run twice with same topic
python -m examples.basic_research
python -m examples.basic_research
```
**Verify**: Second run is <50ms (cached)

### Test 4: Progress Tracking
```python
from src.research_orchestrator import ResearchOrchestrator
from src.types import ResearchRequest

orch = ResearchOrchestrator()

def on_progress(p):
    print(f"{p.current_step}: {p.progress*100:.0f}%")

orch.on_progress(on_progress)

# Run research
```
**Verify**: Progress callbacks fire during research

### Test 5: Trace Export
```python
orch = ResearchOrchestrator()
result = await orch.research(request)

# Get markdown trace
markdown = orch.export_trace_as_markdown()
print(markdown)
```
**Verify**: Trace has 7 steps with reasoning

### Test 6: Different Difficulties
```bash
# Beginner
python << 'EOF'
import asyncio
from src.research_orchestrator import ResearchOrchestrator
from src.types import ResearchRequest, DifficultyLevel

async def test(difficulty):
    orch = ResearchOrchestrator()
    result = await orch.research(ResearchRequest(
        topic="Data Science",
        difficulty=difficulty,
        targetAudience="Test",
        duration=4,
        tags=["ds"]
    ))
    return len(result.learning_objectives)

for diff in [DifficultyLevel.BEGINNER, DifficultyLevel.INTERMEDIATE, DifficultyLevel.ADVANCED]:
    count = asyncio.run(test(diff))
    print(f"{diff}: {count} objectives")
EOF
```
**Verify**: All difficulties produce 8-12 objectives

## Troubleshooting Tests

### Issue: Import Errors
```bash
# Verify all files compile
python -m py_compile src/*.py
```

### Issue: API Not Responding
```bash
# Check if server is running
curl http://localhost:8000/health

# Restart server if needed
uvicorn src.app:app --reload
```

### Issue: Low Confidence Scores
- Use more specific topic
- Increase duration
- Match difficulty to audience

### Issue: Missing Sources
- Check RAG is enabled: `export ENABLE_RAG=true`
- DuckDuckGo should always work (default)

## Performance Testing

### Measure Response Time
```bash
time python -m examples.basic_research
```

### Test Cache Performance
```bash
# First run (no cache)
time python -m examples.basic_research

# Second run (cached)
time python -m examples.basic_research
```

Expected:
- First: 30-120 seconds
- Second: <50ms

## Verification Checklist

- [x] All Python files compile
- [x] Server starts successfully
- [x] Health endpoint responds
- [x] Config endpoint shows RAG enabled
- [x] Research completes and returns results
- [x] Confidence scores are >0
- [x] Sources are returned
- [x] Reasoning trace has 7 steps
- [x] Caching works (second request is fast)
- [x] Progress tracking works
- [x] Examples run successfully

## Recommended Testing Order

1. **Quick Check** (2 minutes)
   ```bash
   python -c "from src.app import app; print('OK')"
   ```

2. **Example Run** (2-5 minutes)
   ```bash
   python -m examples.basic_research
   ```

3. **API Test** (2 minutes)
   ```bash
   curl http://localhost:8000/health
   curl http://localhost:8000/config
   ```

4. **RAG Test** (2-5 minutes)
   ```bash
   export ENABLE_RAG=true
   python -m examples.rag_research
   ```

5. **Full Suite** (5-10 minutes)
   ```bash
   pytest tests/ -v
   ```

## Summary

**NO POSTMAN NEEDED!** You can test using:
- Python examples (simplest)
- curl commands (in terminal)
- Python requests (programmatic)
- httpie (prettier curl)
- Python shell (interactive)

**Start with**: `python -m examples.basic_research`
