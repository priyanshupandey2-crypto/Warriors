# Firecrawl Integration - Setup Checklist

## Pre-Requisites ✓

- [x] Python 3.8+ installed
- [x] PostgreSQL running
- [x] FastAPI backend running
- [x] Git repository ready

## Installation Steps

### 1. Get Firecrawl API Key

- [ ] Visit [https://firecrawl.dev](https://firecrawl.dev)
- [ ] Create account (free tier available)
- [ ] Copy API key from dashboard

### 2. Update Environment

- [ ] Open `.env` file in project root
- [ ] Add: `FIRECRAWL_API_KEY=your-api-key-here`
- [ ] Verify line: `FIRECRAWL_API_KEY=sk_...` (not empty)

Example `.env`:
```bash
APP_ENV=development
HOST=127.0.0.1
PORT=8000
DATABASE_URL=postgresql+psycopg://user:password@localhost:5432/warriors_db
JWT_SECRET=your-secret-key-here
JWT_EXPIRATION_HOURS=24
LANGSMITH_API_KEY=...
FIRECRAWL_API_KEY=your-api-key-here  # ← ADD THIS
```

### 3. Verify Dependencies

All dependencies already in `requirements.txt`:
- [ ] `fastapi` ✓
- [ ] `sqlalchemy` ✓
- [ ] `pydantic` ✓
- [ ] `requests` ✓

Run to verify:
```bash
pip list | grep -E "(fastapi|sqlalchemy|pydantic|requests)"
```

### 4. Database Setup

Run to create curriculum tables:
```bash
cd backend
python -m app.models.curriculum_init
```

Expected output:
```
✅ Curriculum tables created successfully
   - curriculum_sources
   - curriculum_chunks
   - curriculum_registry
   - curriculum_learning_paths
```

Verify in PostgreSQL:
```sql
psql -U postgres -d warriors_db -c "\dt curriculum*"
```

Expected:
```
                  List of relations
 Schema |           Name            | Type  | Owner
--------+---------------------------+-------+---------
 public | curriculum_chunks         | table | postgres
 public | curriculum_learning_paths | table | postgres
 public | curriculum_registry       | table | postgres
 public | curriculum_sources        | table | postgres
```

### 5. Start Backend

```bash
cd backend
python main.py
```

Expected:
```
INFO:     Application startup - Environment: development, Debug: False
INFO:     Database initialized successfully
INFO:     Uvicorn running on http://127.0.0.1:8000
```

## Verification Tests

### Test 1: API Documentation

- [ ] Navigate to http://localhost:8000/docs
- [ ] See "curriculum" section with 5 endpoints
- [ ] All endpoints documented with examples

### Test 2: URL Validation

```bash
curl -X POST http://localhost:8000/api/curriculum/validate-urls \
  -H "Content-Type: application/json" \
  -d '{
    "urls": [
      "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide",
      "https://www.w3schools.com/js/"
    ]
  }'
```

Expected: `"valid": 2, "invalid": 0`

### Test 3: Discover Curriculum

```bash
curl -X POST http://localhost:8000/api/curriculum/discover \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "JavaScript Promises",
    "difficulty": "Intermediate",
    "duration": "2 hours"
  }'
```

Expected: `"success": true, "sources_count": 4, "chunks_count": 20+`

### Test 4: Retrieve Curriculum

Replace `{id}` with curriculum_id from Test 3:

```bash
curl http://localhost:8000/api/curriculum/1
```

Expected: Curriculum with sources, chunks, learning_paths arrays

### Test 5: List Curricula

```bash
curl "http://localhost:8000/api/curriculum/?skip=0&limit=10"
```

Expected: Array of curriculum objects

### Test 6: Statistics

```bash
curl http://localhost:8000/api/curriculum/stats/
```

Expected:
```json
{
  "total_curricula": 1,
  "total_chunks": 20,
  "total_tokens": 5000,
  "average_chunk_size": 250
}
```

## Files Created/Modified

### Created (9 new files)

- [x] `backend/app/services/firecrawl_service.py` (550 lines)
- [x] `backend/app/services/curriculum_service.py` (310 lines)
- [x] `backend/app/repositories/curriculum_repository.py` (400 lines)
- [x] `backend/app/models/curriculum.py` (180 lines)
- [x] `backend/app/schemas/curriculum.py` (200 lines)
- [x] `backend/app/routers/curriculum.py` (240 lines)
- [x] `backend/app/models/curriculum_init.py` (30 lines)
- [x] `FIRECRAWL_IMPLEMENTATION.md` (800 lines)
- [x] `FIRECRAWL_QUICKSTART.md` (400 lines)

### Modified (2 files)

- [x] `backend/app/main.py` (added curriculum router)
- [x] `backend/app/config.py` (added FIRECRAWL_API_KEY)

## Code Architecture

```
Input (Topic, Difficulty, Duration)
  ↓
API Route: /curriculum/discover
  ↓
CurriculumService: discover_curriculum()
  ↓
[Check cache in curriculum_registry]
  ├─ HIT: Return immediately
  └─ MISS: Continue...
  ↓
FirecrawlService: extract_and_chunk_urls()
  ├─ Validate URLs
  ├─ Extract with Firecrawl API
  ├─ Clean content
  ├─ Normalize markdown
  ├─ Extract topics/concepts
  ├─ Create chunks
  └─ Return knowledge pack
  ↓
CurriculumRepository: save_curriculum_to_db()
  ├─ Save sources → curriculum_sources
  ├─ Save chunks → curriculum_chunks
  ├─ Save registry → curriculum_registry
  └─ Save paths → curriculum_learning_paths
  ↓
Return: CurriculumResponse (success, curriculum_id, stats)
```

## Trusted Sources

Validated domains:
- ✅ developer.mozilla.org (MDN)
- ✅ w3schools.com (W3Schools)
- ✅ geeksforgeeks.org (GeeksForGeeks)
- ✅ javatpoint.com (JavaTPoint)
- ✅ roadmap.sh (Roadmap)

**Note**: URLs from other domains will fail validation

## Database Schema

### 4 Tables

```sql
curriculum_sources         -- Raw extracted content
├── id, url (unique), source_type, title, raw_markdown, headings[], metadata
└── Relationships: (1) → (many) curriculum_chunks

curriculum_chunks          -- Semantic chunks
├── id, source_id (FK), chunk_index, heading_path, content, token_count, concepts[]
└── Relationships: (many) → (1) curriculum_sources

curriculum_registry        -- Cached curricula
├── id, topic, difficulty, duration (unique), extracted_topics, chunk_ids[], expires_at
└── Relationships: (1) → (many) curriculum_learning_paths

curriculum_learning_paths  -- Generated lessons
├── id, curriculum_id (FK), path_index, title, chunk_ids[], estimated_minutes
└── Relationships: (many) → (1) curriculum_registry
```

## Indexes

For optimal query performance:
- `curriculum_sources.source_type` (filter by type)
- `curriculum_sources.fetched_at` (cache invalidation)
- `curriculum_chunks.heading_path` (content search)
- `curriculum_registry.topic` (curriculum search)
- `curriculum_registry.expires_at` (cache expiration)

## Configuration

**Required** (must set):
- `FIRECRAWL_API_KEY`: Get from firecrawl.dev

**Optional** (defaults provided):
- `CURRICULUM_CACHE_EXPIRY_DAYS`: Default 30 days
- `FIRECRAWL_TIMEOUT`: Default 30 seconds
- `MAX_CHUNK_SIZE`: Default 1000 characters

## Troubleshooting

### Issue: FIRECRAWL_API_KEY not found

**Solution**:
```bash
# Check .env file
cat .env | grep FIRECRAWL_API_KEY

# Should see: FIRECRAWL_API_KEY=sk_...
# If empty, add: FIRECRAWL_API_KEY=your-actual-key
```

### Issue: Database tables not created

**Solution**:
```bash
cd backend
python -c "from app.models.curriculum_init import init_curriculum_tables; init_curriculum_tables()"
```

### Issue: No sources extracted

**Check**:
1. Is Firecrawl API key valid? (test in firecrawl.dev dashboard)
2. Are URLs from trusted domains? (MDN, W3Schools, etc.)
3. Are URLs accessible? (test with curl/browser)

### Issue: 404 Not Found on curriculum endpoints

**Check**:
1. Is curriculum router registered? (check app/main.py line 11)
2. Is import correct? `from app.routers import curriculum`
3. Restart FastAPI server

### Issue: Database constraint violation

**Check**:
```sql
SELECT COUNT(*) FROM curriculum_registry
WHERE topic='Python' AND difficulty='Intermediate' AND duration='2 hours';
```

If exists, it's cached. Reuse instead of creating duplicate.

## Performance Baseline

| Operation | Expected Time |
|-----------|---------------|
| Single URL extraction | 2-5 seconds |
| 5 URLs extraction | 10-25 seconds |
| 10 URLs extraction | 20-50 seconds |
| Cache hit (registry lookup) | <10 milliseconds |
| Chunk creation (in-memory) | <1 second |
| Database persistence (batch) | <1 second |

## Security Checklist

- [x] Domain whitelist (not all URLs accepted)
- [x] Firecrawl API key in environment (not hardcoded)
- [x] Input validation (Pydantic schemas)
- [x] Database constraints (unique, foreign keys)
- [x] Error messages without sensitive data
- [x] No SQL injection (ORM layer)
- [x] CORS configured (FastAPI middleware)

## Monitoring & Logging

All operations logged to console/file:
```python
logger.info(f"Discovering curriculum: topic='{topic}'")
logger.error(f"Failed to extract {url}: {error}")
```

Enable debug logging:
```bash
export DEBUG=true
python main.py
```

## Next Steps After Setup

1. **Test the integration** (run verification tests above)
2. **Create a curriculum** for a learning topic
3. **Retrieve it** to see extracted sources and chunks
4. **Build on top**: Course generation, quiz creation, etc.

## Support Resources

- **Implementation Details**: `FIRECRAWL_IMPLEMENTATION.md` (comprehensive)
- **Quick Reference**: `FIRECRAWL_QUICKSTART.md` (examples)
- **Code Documentation**: Docstrings in all Python files
- **API Docs**: http://localhost:8000/docs (interactive)

## Completion Checklist

When all items checked, Firecrawl integration is ready:

- [ ] Firecrawl API key obtained
- [ ] `.env` file updated with API key
- [ ] Dependencies verified installed
- [ ] Database tables created (curriculum_init.py)
- [ ] Backend started successfully
- [ ] API documentation loads (/docs)
- [ ] URL validation test passes
- [ ] Curriculum discovery test passes
- [ ] Curriculum retrieval test passes
- [ ] Statistics test passes

**Status**: 🟢 Ready to use when all items checked!
