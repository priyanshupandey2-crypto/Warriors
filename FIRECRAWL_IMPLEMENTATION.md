# Firecrawl Integration Implementation Guide

## Overview

This document describes the complete Firecrawl integration for curriculum content extraction, processing, and storage in the Warriors backend.

## Architecture Diagram

```
User Input (Topic, Difficulty, Duration, Tags)
        ↓
Curriculum Discovery Layer (API Route)
        ↓
Check Curriculum Registry (PostgreSQL)
        ├─→ IF EXISTS & NOT EXPIRED: Return Cached Curriculum
        └─→ ELSE: Proceed to Curriculum Builder
        ↓
Curriculum Service Layer
        ↓
[Firecrawl Extraction Pipeline]
        ↓
1. URL Generation & Validation
   - Generate search queries from topic
   - Validate against trusted domains
   - Check URL accessibility
        ↓
2. Content Extraction (Firecrawl API)
   - Call Firecrawl /scrape endpoint
   - Extract raw markdown + metadata
   - Handle rate limiting & retries
        ↓
3. Content Cleaning
   - Remove navigation, ads, boilerplate
   - Remove scripts, comments, cookie banners
   - Normalize whitespace
        ↓
4. Content Normalization
   - Standardize markdown headings
   - Normalize code blocks
   - Standardize links
        ↓
5. Topic & Concept Extraction
   - Extract heading hierarchy
   - Extract bold text (**concept**)
   - Extract code references (`code`)
   - Identify key terms
        ↓
6. Content Chunking
   - Split by heading hierarchy
   - Respects token limits (1000 chars default)
   - Maintains context
        ↓
7. Knowledge Pack Creation
   - Structure chunks with metadata
   - Create semantic relationships
   - Add source attribution
        ↓
8. Database Persistence
   - Save sources to curriculum_sources
   - Save chunks to curriculum_chunks
   - Save registry to curriculum_registry
   - Generate learning paths
        ↓
Return Curriculum Response
```

## File Structure

```
backend/
├── app/
│   ├── models/
│   │   └── curriculum.py              # SQLAlchemy ORM models
│   │       ├── CurriculumSource       # Raw extracted content
│   │       ├── CurriculumChunk        # Semantic chunks
│   │       ├── CurriculumRegistry     # Cached curriculum templates
│   │       └── CurriculumLearningPath # Generated lesson sequences
│   │
│   ├── schemas/
│   │   └── curriculum.py              # Pydantic validation models
│   │       ├── CurriculumSourceSchema
│   │       ├── CurriculumChunkSchema
│   │       ├── KnowledgePackSchema
│   │       ├── CurriculumDiscoveryRequest
│   │       └── CurriculumResponse
│   │
│   ├── services/
│   │   ├── firecrawl_service.py       # Extraction pipeline orchestration
│   │   │   ├── FirecrawlClient        # Firecrawl API wrapper
│   │   │   ├── ContentCleaner         # Remove boilerplate
│   │   │   ├── ContentNormalizer      # Standardize content
│   │   │   ├── TopicExtractor         # Extract concepts & headings
│   │   │   ├── ContentChunker         # Split into semantic chunks
│   │   │   └── FirecrawlService       # Main orchestrator
│   │   │
│   │   └── curriculum_service.py      # Business logic layer
│   │       └── CurriculumService      # Coordinates extraction & storage
│   │
│   ├── repositories/
│   │   └── curriculum_repository.py   # Data access layer
│   │       └── CurriculumRepository   # All DB operations
│   │
│   ├── routers/
│   │   └── curriculum.py              # API endpoints
│   │       ├── POST /discover
│   │       ├── POST /validate-urls
│   │       ├── GET /{curriculum_id}
│   │       ├── GET /
│   │       └── GET /stats
│   │
│   ├── main.py                        # Updated to include curriculum router
│   └── config.py                      # Updated with FIRECRAWL_API_KEY
│
└── FIRECRAWL_IMPLEMENTATION.md        # This file
```

## Core Classes

### 1. FirecrawlClient

**Purpose**: Wrapper around Firecrawl API

**Methods**:
- `scrape(url, options)`: Extract single URL → markdown + metadata
- `crawl(url, limit, allow_external_links, options)`: Crawl domain → multiple pages

**Configuration**:
```python
from app.services.firecrawl_service import FirecrawlClient

client = FirecrawlClient(api_key="your-key")
result = client.scrape("https://example.com")
# Returns: {"success": True, "data": {"markdown": "...", "metadata": {...}}}
```

### 2. ContentCleaner

**Purpose**: Remove boilerplate from extracted content

**Removes**:
- Cookie banners
- Subscribe/newsletter popups
- Advertisement blocks
- "Follow us" sections
- Navigation elements
- Related articles sections
- HTML comments and scripts

**Usage**:
```python
from app.services.firecrawl_service import ContentCleaner

cleaner = ContentCleaner()
cleaned = cleaner.clean(raw_markdown)
```

### 3. ContentNormalizer

**Purpose**: Standardize markdown for consistency

**Normalizations**:
- **Headings**: `# Heading` → consistent format
- **Code Blocks**: ` ```language ` → standard fence format
- **Links**: `[text](url)` → consistent spacing

**Usage**:
```python
from app.services.firecrawl_service import ContentNormalizer

normalizer = ContentNormalizer()
normalized = normalizer.normalize(cleaned_markdown)
```

### 4. TopicExtractor

**Purpose**: Extract semantic information from content

**Extracts**:
- **Headings**: All heading hierarchy
- **Concepts**: Bold text, code references, repeated terms
- **Heading Paths**: Hierarchical structure (e.g., "Python > Async > Await")

**Usage**:
```python
from app.services.firecrawl_service import TopicExtractor

extractor = TopicExtractor()
headings = extractor.extract_headings(markdown)
concepts = extractor.extract_concepts(markdown)
path = extractor.build_heading_path([(1, "Intro"), (2, "Async")])
```

### 5. ContentChunker

**Purpose**: Split content into semantic, token-limited chunks

**Strategy**:
- Split by heading hierarchy first
- Within sections, split by paragraphs if exceeds token limit
- Default: 1000 chars/chunk (~250 tokens)

**Configuration**:
```python
ContentChunker.DEFAULT_CHUNK_SIZE = 1000  # chars
ContentChunker.DEFAULT_OVERLAP = 200      # chars
```

**Usage**:
```python
from app.services.firecrawl_service import ContentChunker

chunker = ContentChunker()
chunks = chunker.chunk(normalized_markdown, max_chunk_size=1000)
# Returns: [(heading_path, content, token_count, concepts), ...]
```

### 6. FirecrawlService

**Purpose**: Main orchestration service for extraction pipeline

**Key Methods**:
- `validate_url(url)`: Check trusted domain + accessibility
- `extract_source(url)`: Single URL extraction pipeline
- `process_source_to_chunks(source)`: Convert source to chunks
- `extract_and_chunk_urls(urls)`: Batch extraction
- `build_knowledge_pack(urls, topic, difficulty, duration)`: Complete pipeline

**Usage**:
```python
from app.services.firecrawl_service import FirecrawlService

service = FirecrawlService(db=session)

# Extract single URL
source = service.extract_source("https://example.com")

# Batch extraction
result = service.extract_and_chunk_urls(urls)
print(f"Extracted {result['successful']} sources")
print(f"Created {len(result['chunks'])} chunks")

# Full pipeline
pack = service.build_knowledge_pack(
    urls=urls,
    topic="Python Async/Await",
    difficulty="Intermediate",
    duration="2 hours"
)
```

### 7. CurriculumService

**Purpose**: Business logic and orchestration

**Key Methods**:
- `discover_curriculum(request)`: Main curriculum discovery/building
- `validate_urls(urls)`: Pre-extraction URL validation
- `get_curriculum(curriculum_id)`: Retrieve with all data
- `list_curricula(topic, difficulty)`: Search/filter
- `get_statistics()`: Aggregate stats

**Usage**:
```python
from app.services.curriculum_service import CurriculumService
from app.schemas.curriculum import CurriculumDiscoveryRequest

service = CurriculumService(db=session)

request = CurriculumDiscoveryRequest(
    topic="Python Async/Await",
    difficulty="Intermediate",
    duration="2 hours",
    tags=["python", "concurrency"]
)

response = service.discover_curriculum(request)
print(f"Curriculum ID: {response.curriculum_id}")
print(f"Sources: {response.sources_count}")
print(f"Chunks: {response.chunks_count}")
```

### 8. CurriculumRepository

**Purpose**: Data access layer for all curriculum operations

**Key Methods**:

**Sources**:
- `save_source()`: Save extracted source
- `get_source_by_url()`: Lookup by URL
- `get_sources_by_type()`: Filter by source type (MDN, W3Schools, etc.)
- `get_recent_sources()`: Get recently extracted
- `get_sources_needing_refresh()`: Cache invalidation

**Chunks**:
- `save_chunk()`: Save single chunk
- `bulk_save_chunks()`: Efficient batch save
- `get_chunks_by_source()`: All chunks from a source
- `get_chunks_by_concept()`: Search by concept
- `get_chunk_statistics()`: Aggregate stats

**Registry**:
- `check_curriculum_exists()`: Cache lookup
- `save_curriculum()`: Save to registry
- `get_curriculum()`: Retrieve by ID
- `list_curricula()`: Search/filter
- `get_expired_curricula()`: Cache expiration

**Learning Paths**:
- `save_learning_path()`: Save lesson
- `get_learning_paths()`: All paths for curriculum
- `bulk_save_learning_paths()`: Batch save

## Database Schema

### curriculum_sources

Stores raw extracted content from URLs.

```sql
CREATE TABLE curriculum_sources (
    id INTEGER PRIMARY KEY,
    url VARCHAR(2048) UNIQUE NOT NULL,
    source_type VARCHAR(100) NOT NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    raw_markdown TEXT NOT NULL,
    headings JSON NOT NULL DEFAULT '[]',
    metadata JSON NOT NULL DEFAULT '{}',
    fetched_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    INDEX idx_source_type (source_type),
    INDEX idx_fetched_at (fetched_at)
);
```

**Fields**:
- `url`: Source URL (unique)
- `source_type`: "W3Schools", "MDN", "GeeksForGeeks", etc.
- `title`: Page title
- `description`: Page meta description
- `raw_markdown`: Cleaned and normalized markdown
- `headings`: JSON array of page headings
- `metadata`: JSON object with lang, og_image, etc.
- `fetched_at`: When extracted (for cache invalidation)

### curriculum_chunks

Semantic chunks of content.

```sql
CREATE TABLE curriculum_chunks (
    id INTEGER PRIMARY KEY,
    source_id INTEGER NOT NULL REFERENCES curriculum_sources(id),
    chunk_index INTEGER NOT NULL,
    heading_path VARCHAR(1000),
    content TEXT NOT NULL,
    token_count INTEGER DEFAULT 0,
    concepts JSON NOT NULL DEFAULT '[]',
    metadata JSON NOT NULL DEFAULT '{}',
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    UNIQUE (source_id, chunk_index),
    INDEX idx_heading_path (heading_path),
    INDEX idx_token_count (token_count)
);
```

**Fields**:
- `source_id`: Foreign key to curriculum_sources
- `chunk_index`: Position within source
- `heading_path`: Hierarchical heading (e.g., "Async > Await > Examples")
- `content`: Chunk text
- `token_count`: Approximate token count (~1 token = 4 chars)
- `concepts`: JSON array of extracted concepts
- `metadata`: source_type, source_title, extracted_at, etc.

### curriculum_registry

Cached curriculum templates (for fast lookup).

```sql
CREATE TABLE curriculum_registry (
    id INTEGER PRIMARY KEY,
    topic VARCHAR(500) NOT NULL,
    difficulty VARCHAR(50) NOT NULL,
    duration VARCHAR(100) NOT NULL,
    extracted_topics JSON NOT NULL DEFAULT '[]',
    extracted_subtopics JSON NOT NULL DEFAULT '{}',
    learning_order JSON NOT NULL DEFAULT '[]',
    chunk_ids JSON NOT NULL DEFAULT '[]',
    sources_count INTEGER DEFAULT 0,
    chunks_count INTEGER DEFAULT 0,
    total_tokens INTEGER DEFAULT 0,
    extraction_metadata JSON NOT NULL DEFAULT '{}',
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    expires_at TIMESTAMP,
    UNIQUE (topic, difficulty, duration),
    INDEX idx_topic (topic),
    INDEX idx_difficulty (difficulty),
    INDEX idx_expires_at (expires_at)
);
```

**Fields**:
- `topic`: Learning topic
- `difficulty`: Beginner, Intermediate, Advanced
- `duration`: Estimated time
- `extracted_topics`: Unique topics found
- `extracted_subtopics`: Topic hierarchy
- `learning_order`: Recommended learning sequence
- `chunk_ids`: JSON array of chunk IDs used
- `extraction_metadata`: Extract timestamp, source types, errors, etc.
- `expires_at`: Cache expiration (30 days default)

### curriculum_learning_paths

Generated lesson sequences.

```sql
CREATE TABLE curriculum_learning_paths (
    id INTEGER PRIMARY KEY,
    curriculum_id INTEGER NOT NULL REFERENCES curriculum_registry(id),
    path_index INTEGER NOT NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    topic VARCHAR(300) NOT NULL,
    subtopic VARCHAR(300),
    chunk_ids JSON NOT NULL DEFAULT '[]',
    estimated_minutes INTEGER,
    learning_objectives JSON NOT NULL DEFAULT '[]',
    prerequisites JSON NOT NULL DEFAULT '[]',
    metadata JSON NOT NULL DEFAULT '{}',
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    UNIQUE (curriculum_id, path_index),
    INDEX idx_topic (topic)
);
```

**Fields**:
- `curriculum_id`: Foreign key to curriculum_registry
- `path_index`: Lesson order
- `chunk_ids`: Content chunks for this lesson
- `estimated_minutes`: Time to complete
- `learning_objectives`: What to learn
- `prerequisites`: Required knowledge

## API Endpoints

### 1. POST /api/curriculum/discover

Discover or build curriculum.

**Request**:
```json
{
    "topic": "Python Async/Await",
    "difficulty": "Intermediate",
    "duration": "2 hours",
    "tags": ["python", "concurrency", "async"]
}
```

**Response** (Cache Hit):
```json
{
    "success": true,
    "curriculum_id": "123",
    "topic": "Python Async/Await",
    "difficulty": "Intermediate",
    "duration": "2 hours",
    "sources_count": 4,
    "chunks_count": 24,
    "message": "Curriculum retrieved from cache"
}
```

**Process**:
1. Check `curriculum_registry` for (topic, difficulty, duration)
2. If found and not expired, return immediately
3. Otherwise, generate search queries
4. Extract from trusted sources with Firecrawl
5. Clean, normalize, extract concepts, chunk content
6. Save sources → chunks → registry → learning paths
7. Return response

### 2. POST /api/curriculum/validate-urls

Validate URLs before extraction.

**Request**:
```json
{
    "urls": [
        "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise",
        "https://www.w3schools.com/whatis/whatis_asyncawait.asp"
    ]
}
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
            "source_type": "MDN",
            "status_code": 200
        },
        {
            "url": "https://www.w3schools.com/...",
            "valid": true,
            "source_type": "W3Schools",
            "status_code": 200
        }
    ]
}
```

**Validation**:
- Trusted domain check
- HTTP HEAD request (200 status)
- Content-Type check (HTML)

### 3. GET /api/curriculum/{curriculum_id}

Retrieve curriculum with all data.

**Response**:
```json
{
    "curriculum": {
        "id": 1,
        "topic": "Python Async/Await",
        "difficulty": "Intermediate",
        "duration": "2 hours",
        "sources_count": 4,
        "chunks_count": 24
    },
    "sources": [
        {
            "id": 1,
            "url": "https://...",
            "source_type": "MDN",
            "title": "...",
            "description": "...",
            "headings": ["Intro", "Async", "Await"],
            "metadata": {}
        }
    ],
    "chunks": [
        {
            "id": 1,
            "source_id": 1,
            "chunk_index": 0,
            "heading_path": "Async > Await",
            "content": "...",
            "token_count": 250,
            "concepts": ["async", "await", "promise"],
            "metadata": {}
        }
    ],
    "learning_paths": [
        {
            "id": 1,
            "curriculum_id": 1,
            "path_index": 0,
            "title": "Introduction to Async/Await",
            "topic": "Async",
            "subtopic": "Basics",
            "chunk_ids": [1, 2, 3],
            "estimated_minutes": 15,
            "learning_objectives": ["Understand async/await"],
            "prerequisites": []
        }
    ]
}
```

### 4. GET /api/curriculum/

List curricula with filters.

**Query Parameters**:
- `topic`: Filter by topic (substring)
- `difficulty`: Filter by difficulty
- `skip`: Pagination offset
- `limit`: Pagination limit (max 100)

**Example**:
```
GET /api/curriculum/?topic=Python&difficulty=Intermediate&skip=0&limit=10
```

**Response**:
```json
[
    {
        "id": 1,
        "topic": "Python Async/Await",
        "difficulty": "Intermediate",
        "duration": "2 hours",
        "sources_count": 4,
        "chunks_count": 24,
        "created_at": "2024-01-15T10:30:00"
    }
]
```

### 5. GET /api/curriculum/stats/

Get aggregate statistics.

**Response**:
```json
{
    "total_curricula": 42,
    "total_chunks": 1024,
    "total_tokens": 512000,
    "average_chunk_size": 500
}
```

## Configuration

### Environment Variables

Add to `.env`:

```bash
# Firecrawl API
FIRECRAWL_API_KEY=your-firecrawl-api-key

# Curriculum caching
CURRICULUM_CACHE_EXPIRY_DAYS=30
```

### Update config.py

```python
from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    FIRECRAWL_API_KEY: Optional[str] = None
```

## Usage Examples

### Example 1: Discover Curriculum

```python
from app.services.curriculum_service import CurriculumService
from app.schemas.curriculum import CurriculumDiscoveryRequest
from app.database import SessionLocal

db = SessionLocal()
service = CurriculumService(db)

request = CurriculumDiscoveryRequest(
    topic="Python Decorators",
    difficulty="Intermediate",
    duration="2 hours",
    tags=["python", "decorators", "functions"]
)

response = service.discover_curriculum(request)
print(f"Created curriculum {response.curriculum_id}")
print(f"Sources: {response.sources_count}")
print(f"Chunks: {response.chunks_count}")
```

### Example 2: Retrieve Curriculum

```python
curriculum_data = service.get_curriculum(curriculum_id=1)

print(f"Topic: {curriculum_data['curriculum'].topic}")
print(f"Sources: {len(curriculum_data['sources'])}")
print(f"Chunks: {len(curriculum_data['chunks'])}")
print(f"Learning paths: {len(curriculum_data['learning_paths'])}")

for chunk in curriculum_data['chunks'][:3]:
    print(f"  {chunk.heading_path}: {len(chunk.content)} chars")
```

### Example 3: Search Chunks

```python
chunks = service.repo.search_chunks_by_content("async programming")
for chunk in chunks:
    print(f"{chunk.source_id}: {chunk.heading_path}")
```

### Example 4: Cache Refresh

```python
# Find expired curricula
expired = service.repo.get_expired_curricula()
print(f"Found {len(expired)} expired curricula")

# Delete and regenerate
for curriculum in expired:
    service.repo.delete_curriculum(curriculum.id)

# Next discover_curriculum call will regenerate
```

## Error Handling

### Firecrawl API Errors

```python
try:
    source = service.extract_source(url)
    if source is None:
        logger.error(f"Failed to extract {url}")
except Exception as e:
    logger.error(f"Extraction error: {e}")
```

### Database Errors

```python
try:
    curriculum = service.discover_curriculum(request)
except Exception as e:
    logger.error(f"Database error: {e}")
    # Rollback happens automatically via SQLAlchemy
```

## Performance Considerations

### Extraction Performance

- **Single URL**: ~2-5 seconds (Firecrawl I/O)
- **10 URLs**: ~20-50 seconds
- **100 URLs**: ~200-500 seconds

### Database Performance

- `curriculum_registry` index on (topic, difficulty, duration) for cache lookup
- `curriculum_chunks` index on heading_path for content search
- `curriculum_sources` index on fetched_at for cache invalidation

### Optimization Tips

1. **Batch Requests**: Extract multiple URLs in parallel
2. **Cache Reuse**: Check registry before extraction (30-day default TTL)
3. **Lazy Loading**: Use learning_paths separately if not needed immediately
4. **Pagination**: Always use limit/skip for list endpoints

## Testing

### Unit Tests

```python
import pytest
from app.services.firecrawl_service import ContentCleaner, ContentNormalizer

def test_content_cleaner():
    markdown = "Hello\n\nCookie Consent Banner\n\nWorld"
    cleaned = ContentCleaner.clean(markdown)
    assert "Cookie" not in cleaned

def test_content_normalizer():
    markdown = "# Heading\n##Subheading"
    normalized = ContentNormalizer.normalize(markdown)
    assert normalized.count("#") >= 3
```

### Integration Tests

```python
@pytest.fixture
def curriculum_service(db):
    return CurriculumService(db)

def test_discover_curriculum(curriculum_service):
    request = CurriculumDiscoveryRequest(
        topic="Python",
        difficulty="Beginner",
        duration="1 hour"
    )
    response = curriculum_service.discover_curriculum(request)
    assert response.success
    assert response.sources_count > 0
```

## Troubleshooting

### Firecrawl API Key Missing

```
ValueError: FIRECRAWL_API_KEY environment variable not set
```

**Solution**: Add to `.env` file:
```bash
FIRECRAWL_API_KEY=your-actual-key
```

### URLs Not Extracting

**Check**:
1. Is the URL from a trusted domain? (MDN, W3Schools, etc.)
2. Is the URL accessible? (test with curl)
3. Is Firecrawl API key valid? (test in Firecrawl dashboard)

### Database Constraints Violated

**Unique Constraint** on `curriculum_registry`:
```python
curriculum = service.repo.check_curriculum_exists(topic, difficulty, duration)
if curriculum:
    # Already exists, use it
    return curriculum
```

## Future Enhancements

1. **Parallel Extraction**: Extract multiple URLs concurrently
2. **Search Integration**: Use Google Custom Search API for source discovery
3. **LLM Processing**: Use Claude to generate learning objectives, quiz questions
4. **Real-time Updates**: Stream chunks as they're extracted
5. **Source Ranking**: Score sources by relevance, recency, quality
6. **Concept Graphs**: Build knowledge graphs from extracted concepts
7. **Multi-language**: Support extraction in multiple languages

## References

- [Firecrawl API Documentation](https://docs.firecrawl.dev)
- [SQLAlchemy Documentation](https://docs.sqlalchemy.org)
- [Pydantic Documentation](https://docs.pydantic.dev)
- [FastAPI Documentation](https://fastapi.tiangolo.com)
