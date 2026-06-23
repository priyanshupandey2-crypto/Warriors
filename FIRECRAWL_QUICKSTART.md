# Firecrawl Integration - Quick Start Guide

## Setup (5 minutes)

### 1. Get Firecrawl API Key

1. Visit [firecrawl.dev](https://firecrawl.dev)
2. Create account → Get API key
3. Add to `.env`:

```bash
FIRECRAWL_API_KEY=your-api-key-here
```

### 2. Install Dependencies

```bash
# If not already installed
pip install requests  # Already in requirements.txt
```

### 3. Database Initialization

The new curriculum tables are auto-created on first run. No migration needed.

## Usage (3 examples)

### Example 1: Discover Curriculum (via API)

```bash
curl -X POST http://localhost:8000/api/curriculum/discover \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "Python Async/Await",
    "difficulty": "Intermediate",
    "duration": "2 hours",
    "tags": ["python", "concurrency"]
  }'
```

**Response**:
```json
{
  "success": true,
  "curriculum_id": "1",
  "topic": "Python Async/Await",
  "difficulty": "Intermediate",
  "duration": "2 hours",
  "sources_count": 4,
  "chunks_count": 24,
  "message": "Curriculum built successfully"
}
```

### Example 2: Validate URLs Before Extraction

```bash
curl -X POST http://localhost:8000/api/curriculum/validate-urls \
  -H "Content-Type: application/json" \
  -d '{
    "urls": [
      "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise",
      "https://www.w3schools.com/whatis/whatis_asyncawait.asp"
    ]
  }'
```

**Response**:
```json
{
  "total": 2,
  "valid": 2,
  "invalid": 0,
  "results": [
    {
      "url": "https://developer.mozilla.org/...",
      "valid": true,
      "source_type": "MDN"
    },
    {
      "url": "https://www.w3schools.com/...",
      "valid": true,
      "source_type": "W3Schools"
    }
  ]
}
```

### Example 3: Get Curriculum (via API)

```bash
curl http://localhost:8000/api/curriculum/1
```

**Returns**: Complete curriculum with sources, chunks, and learning paths

## Key Files

| File | Purpose |
|------|---------|
| `app/services/firecrawl_service.py` | Extraction pipeline (clean, normalize, chunk, extract) |
| `app/services/curriculum_service.py` | Business logic and orchestration |
| `app/repositories/curriculum_repository.py` | All database operations |
| `app/models/curriculum.py` | SQLAlchemy ORM models (4 tables) |
| `app/schemas/curriculum.py` | Pydantic request/response models |
| `app/routers/curriculum.py` | API endpoints |

## Pipeline Overview

```
Input: Topic, Difficulty, Duration
  ↓
Check cache (curriculum_registry)
  ├→ Found & not expired? Return immediately
  └→ Not found? Continue extraction
  ↓
Generate search queries → Validate URLs
  ↓
Firecrawl API: Extract markdown + metadata
  ↓
Clean: Remove ads, navigation, boilerplate
  ↓
Normalize: Standardize markdown, code blocks, links
  ↓
Extract: Get headings, concepts, keywords
  ↓
Chunk: Split by headings, respecting token limits
  ↓
Save to Database:
  ├→ curriculum_sources (raw content)
  ├→ curriculum_chunks (semantic chunks)
  ├→ curriculum_registry (cache)
  └→ curriculum_learning_paths (lessons)
  ↓
Output: Curriculum ID + sources + chunks
```

## Trusted Sources

Supported domains:
- ✅ MDN (developer.mozilla.org)
- ✅ W3Schools (w3schools.com)
- ✅ GeeksForGeeks (geeksforgeeks.org)
- ✅ JavaTPoint (javatpoint.com)
- ✅ Roadmap.sh (roadmap.sh)

## Common Tasks

### List All Curricula

```bash
curl "http://localhost:8000/api/curriculum/?skip=0&limit=10"
```

### Filter by Topic

```bash
curl "http://localhost:8000/api/curriculum/?topic=Python&difficulty=Intermediate"
```

### Get Statistics

```bash
curl "http://localhost:8000/api/curriculum/stats/"
```

## Database Schema (Quick Reference)

### curriculum_sources
```
id, url (unique), source_type, title, raw_markdown, headings[], metadata
```

### curriculum_chunks
```
id, source_id (FK), chunk_index, heading_path, content, token_count, concepts[]
```

### curriculum_registry
```
id, topic, difficulty, duration (unique), extracted_topics, chunk_ids[], expires_at
```

### curriculum_learning_paths
```
id, curriculum_id (FK), path_index, title, chunk_ids[], estimated_minutes, learning_objectives[]
```

## Caching Strategy

- **Cache Key**: (topic, difficulty, duration)
- **TTL**: 30 days (configurable)
- **Hit Rate**: Typically high for common topics
- **Refresh**: Automatic deletion of expired entries

Example cache hit:
```
First call:  Discover "Python Async/Await" → Extract → 30 seconds
Second call: Discover "Python Async/Await" → Cache hit → 10 ms
```

## Error Handling

**Firecrawl API Error**:
```
→ Logs error, returns null
→ Service skips failed URL
→ Continues with remaining URLs
→ Returns partial curriculum if some sources succeeded
```

**Trusted Domain Validation Fails**:
```
→ URL rejected during validation
→ Not sent to Firecrawl
→ Reduces API costs
```

**Database Error**:
```
→ Transaction rolled back automatically
→ Returns 500 error to client
→ Check PostgreSQL connection
```

## Monitoring & Logging

All operations logged to `app/logger.py`:

```python
logger.info(f"Discovering curriculum: topic='{topic}'")
logger.info(f"Successfully extracted {url} ({size} chars)")
logger.error(f"Failed to extract {url}: {error}")
```

## Performance Tips

1. **Cache Hits**: Most common topics cached after first extraction
2. **Batch Extraction**: ~2-5 sec per URL, ~50 sec for 10 URLs
3. **Database Queries**: Use pagination for lists (skip/limit)
4. **Concept Search**: Use heading_path index for fast filtering

## Troubleshooting

### No sources extracted

**Check**:
1. Is `FIRECRAWL_API_KEY` set in `.env`?
2. Are URLs from trusted domains?
3. Are URLs accessible (no redirects, 403, 404)?

**Debug**:
```python
from app.services.firecrawl_service import FirecrawlService
service = FirecrawlService()
is_valid, msg = service.validate_url("https://example.com")
print(f"Valid: {is_valid}, Message: {msg}")
```

### Cache not working

**Check**:
```bash
SELECT * FROM curriculum_registry 
WHERE topic='Python' AND difficulty='Beginner';
```

If empty, curriculum not cached yet (run `/discover` first).

### Database constraints

**Unique constraint on** `curriculum_registry` (topic, difficulty, duration):
```python
curriculum = service.repo.check_curriculum_exists(topic, diff, duration)
if curriculum:
    return curriculum  # Use existing instead of duplicate
```

## What's Included

✅ Complete extraction pipeline (5 stages: clean, normalize, extract, chunk, store)  
✅ Firecrawl API integration  
✅ Database models (4 tables, full relationships)  
✅ Service layer (curriculum discovery, validation, retrieval)  
✅ Repository layer (all DB operations)  
✅ API endpoints (5 routes with full OpenAPI docs)  
✅ Comprehensive documentation  
✅ Error handling and logging  
✅ Caching with 30-day TTL  

## What To Build Next

1. **Course Generation**: Convert curriculum → course lessons
2. **Quiz Generation**: Use Claude to create questions from chunks
3. **Learning Paths**: Reorder lessons based on prerequisites
4. **Concept Graphs**: Build knowledge graph from concepts
5. **Analytics**: Track which curricula are most used
6. **Search**: Full-text search across all chunks
7. **Feedback Loop**: Users can rate curriculum quality

## API Documentation

Interactive docs available at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

All endpoints documented with examples and error codes.

## Questions?

Check:
1. **Architecture**: `FIRECRAWL_IMPLEMENTATION.md` (comprehensive guide)
2. **Code**: `app/services/firecrawl_service.py` (well-commented)
3. **Schemas**: `app/schemas/curriculum.py` (request/response models)
4. **Database**: `app/models/curriculum.py` (ORM definitions)
