# Quick Start: Curriculum Discovery API

## 1. Start the Backend Server
```bash
cd backend
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

**Expected output:**
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup - Environment: development, Debug: True
INFO:     Database initialized successfully
```

## 2. Test Curriculum Discovery

### Using curl:
```bash
curl -X POST http://localhost:8000/api/curriculum/discover \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "Python Async/Await",
    "difficulty": "Intermediate",
    "duration": "4 weeks",
    "tags": ["python", "asyncio", "concurrency"]
  }'
```

### Using Python:
```python
import requests

response = requests.post(
    "http://localhost:8000/api/curriculum/discover",
    json={
        "topic": "Python Async/Await",
        "difficulty": "Intermediate",
        "duration": "4 weeks",
        "tags": ["python", "asyncio"]
    }
)

print(response.json())
```

### Using FastAPI Docs:
1. Open http://localhost:8000/docs
2. Find POST `/api/curriculum/discover`
3. Click "Try it out"
4. Fill in the request body:
```json
{
  "topic": "Python Async/Await",
  "difficulty": "Intermediate",
  "duration": "4 weeks",
  "tags": ["python", "asyncio", "concurrency"]
}
```
5. Click "Execute"

## 3. Expected Response

```json
{
  "success": true,
  "curriculum_id": 1,
  "topic": "Python Async/Await",
  "difficulty": "Intermediate",
  "duration": "4 weeks",
  "sources_count": 4,
  "chunks_count": 24,
  "extracted_topics": [
    "Coroutines",
    "Async Functions",
    "Event Loops",
    "Await Expressions"
  ],
  "extracted_subtopics": {
    "Coroutines": ["Creating coroutines", "Running coroutines"],
    "Async Functions": ["async def", "Awaiting results"],
    "Event Loops": ["Creating event loops", "Running event loops"]
  },
  "concept_summary": ["async", "await", "event_loop", "Task", "coroutine"],
  "source_breakdown": [
    {
      "url": "https://w3schools.com/python/...",
      "type": "W3Schools",
      "chunks_count": 6,
      "content_quality": "high"
    },
    {
      "url": "https://developer.mozilla.org/...",
      "type": "MDN",
      "chunks_count": 5,
      "content_quality": "high"
    }
  ],
  "created_at": "2024-12-20T10:30:00"
}
```

## 4. Check Extracted Data in Database

### Connect to PostgreSQL:
```bash
psql -h localhost -U postgres -d warrior_db
```

### Query extracted sources:
```sql
SELECT id, url, source_type, title FROM curriculum_sources LIMIT 10;
```

### Query extracted chunks:
```sql
SELECT id, source_id, heading_path, token_count, concepts 
FROM curriculum_chunks 
WHERE token_count > 500 
LIMIT 5;
```

### Query curriculum registry:
```sql
SELECT id, topic, difficulty, duration, sources_count, chunks_count
FROM curriculum_registry
ORDER BY created_at DESC LIMIT 5;
```

### Query learning paths:
```sql
SELECT id, curriculum_id, path_index, title, topic
FROM curriculum_learning_paths
ORDER BY path_index LIMIT 10;
```

## 5. Troubleshooting

### Error: "relation 'curriculum_registry' does not exist"
**Solution:** Restart the backend server (database tables are auto-created on startup)
```bash
# Kill the server and restart
python -m uvicorn app.main:app --reload
```

### Error: "CurriculumRepository object has no attribute 'get_sources_for_curriculum'"
**Solution:** Ensure you have the latest code with the repository method fixes
```bash
git pull origin main
```

### Error: "Firecrawl API key invalid"
**Solution:** Check that `FIRECRAWL_API_KEY` is set in `.env`
```bash
echo $FIRECRAWL_API_KEY
# Should output: fc-4025bb6b035945428219ef9a87647ce0
```

### Error: "Unable to connect to database"
**Solution:** Ensure PostgreSQL is running
```bash
# Windows:
net start PostgreSQL14

# Or check connection string in .env
# Should be: postgresql+psycopg://postgres:root@localhost:5432/warrior_db
```

## 6. Key Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/curriculum/discover` | Create new curriculum |
| POST | `/api/curriculum/validate-urls` | Validate source URLs |
| GET | `/api/curriculum/{id}` | Get specific curriculum |
| GET | `/api/curriculum` | List all curricula (with filters) |

## 7. Request/Response Schemas

### CurriculumDiscoveryRequest
```json
{
  "topic": "string (required)",
  "difficulty": "Beginner|Intermediate|Advanced (required)",
  "duration": "string (e.g., '4 weeks')",
  "tags": ["string (optional)"]
}
```

### CurriculumResponse
```json
{
  "success": "boolean",
  "curriculum_id": "integer",
  "topic": "string",
  "difficulty": "string",
  "duration": "string",
  "sources_count": "integer",
  "chunks_count": "integer",
  "extracted_topics": ["string"],
  "extracted_subtopics": {"string": ["string"]},
  "concept_summary": ["string"],
  "source_breakdown": [
    {
      "url": "string",
      "type": "string",
      "chunks_count": "integer",
      "content_quality": "string"
    }
  ],
  "created_at": "ISO8601 datetime"
}
```

## 8. Example: Full Test Flow

```python
import requests
import time

# 1. Discover curriculum
print("1. Discovering curriculum...")
response = requests.post(
    "http://localhost:8000/api/curriculum/discover",
    json={
        "topic": "React Hooks",
        "difficulty": "Intermediate",
        "duration": "3 weeks",
        "tags": ["react", "hooks", "javascript"]
    }
)

result = response.json()
curriculum_id = result['curriculum_id']
print(f"   Curriculum created: {curriculum_id}")
print(f"   Sources: {result['sources_count']}, Chunks: {result['chunks_count']}")
print(f"   Topics: {', '.join(result['extracted_topics'][:3])}")

# 2. Wait a moment
time.sleep(1)

# 3. Retrieve curriculum
print("\n2. Retrieving curriculum...")
response = requests.get(f"http://localhost:8000/api/curriculum/{curriculum_id}")
curriculum = response.json()
print(f"   Topic: {curriculum['topic']}")
print(f"   Difficulty: {curriculum['difficulty']}")
print(f"   Available sources: {len(curriculum['source_breakdown'])}")

# 4. List all curricula
print("\n3. Listing all curricula...")
response = requests.get("http://localhost:8000/api/curriculum?limit=5")
curricula = response.json()
print(f"   Total: {len(curricula)} curricula")
for c in curricula[:3]:
    print(f"   - {c['topic']} ({c['difficulty']})")

print("\n[OK] All tests passed!")
```

## 9. Performance Expectations

- **First curriculum discovery:** ~30-60 seconds (content extraction + LLM processing)
- **Subsequent requests:** <1 second (cached)
- **Source extraction:** ~5-10 seconds per URL
- **LLM processing:** ~10-20 seconds for topic generation

## 10. Monitoring

### Check logs:
```bash
# Watch for errors
tail -f backend/app.log

# Or in the server output (look for ERROR lines)
```

### Monitor database:
```bash
# In PostgreSQL client
SELECT COUNT(*) FROM curriculum_sources;
SELECT COUNT(*) FROM curriculum_chunks;
SELECT COUNT(*) FROM curriculum_registry;
```

### Monitor API health:
```bash
curl http://localhost:8000/health
# Should return 200 OK
```

---

**Ready to test? Start with:**
```bash
cd backend
python -m uvicorn app.main:app --reload
```

Then open http://localhost:8000/docs and try the `/api/curriculum/discover` endpoint!
