# Database Fix Summary

## Problem
The curriculum discovery API was failing with error:
```
relation "curriculum_registry" does not exist
```

## Root Cause
The curriculum database models were not being registered with SQLAlchemy before table creation, so no tables were created on app startup.

## Changes Made

### 1. **backend/app/models/__init__.py**
Added curriculum model imports:
```python
from app.models.curriculum import (
    CurriculumSource,
    CurriculumChunk,
    CurriculumRegistry,
    CurriculumLearningPath,
)
```

**Why:** SQLAlchemy needs to know about all models before creating tables. Models need to be imported somewhere that SQLAlchemy loads.

### 2. **backend/app/database/connection.py**
Modified `init_db()` function to import models:
```python
def init_db():
    """Initialize database tables."""
    try:
        if engine:
            # Import all models to register them with SQLAlchemy
            import app.models  # noqa: F401
            
            Base.metadata.create_all(bind=engine, checkfirst=True)
            logger.info("Database tables initialized successfully")
```

**Why:** This ensures models are registered before `Base.metadata.create_all()` is called.

### 3. **backend/app/models/curriculum.py**
Fixed duplicate index names in `CurriculumLearningPath`:
```python
# Before (duplicate "idx_topic" index):
__table_args__ = (
    UniqueConstraint("topic", "difficulty", "duration", name="uq_curriculum_key"),
    Index("idx_topic", "topic"),  # CONFLICTS with curriculum_registry
    Index("idx_difficulty", "difficulty"),
    Index("idx_expires_at", "expires_at"),
)

# After (unique names):
__table_args__ = (
    UniqueConstraint("topic", "difficulty", "duration", name="uq_curriculum_key"),
    Index("idx_registry_topic", "topic"),
    Index("idx_registry_difficulty", "difficulty"),
    Index("idx_registry_expires_at", "expires_at"),
)
```

**Why:** PostgreSQL requires unique index names across the database.

## Result

✅ **All 4 curriculum tables successfully created:**

| Table | Columns | Purpose |
|-------|---------|---------|
| `curriculum_sources` | 11 | Raw extracted web content |
| `curriculum_chunks` | 10 | Semantic chunks with concepts |
| `curriculum_registry` | 15 | Cached curriculum templates |
| `curriculum_learning_paths` | 14 | Learning sequences |

### Schema Details

#### curriculum_sources
- `id` (primary key)
- `url` (unique, indexed)
- `source_type` (W3Schools, MDN, GeeksForGeeks, etc.)
- `title`, `description`
- `raw_markdown` (extracted content)
- `headings` (JSON array)
- `source_metadata` (JSON)
- `fetched_at`, `created_at`, `updated_at`

#### curriculum_chunks
- `id` (primary key)
- `source_id` (foreign key to curriculum_sources)
- `chunk_index` (ordered chunks per source)
- `heading_path` (hierarchical heading structure)
- `content` (chunk text)
- `token_count` (estimated tokens)
- `concepts` (JSON array of extracted concepts)
- `chunk_metadata` (JSON)
- `created_at`, `updated_at`

#### curriculum_registry
- `id` (primary key)
- `topic`, `difficulty`, `duration` (unique combination)
- `extracted_topics` (JSON array)
- `extracted_subtopics` (JSON object)
- `learning_order` (JSON array - recommended learning sequence)
- `chunk_ids` (JSON array - selected chunks for this curriculum)
- `sources_count`, `chunks_count`, `total_tokens`
- `registry_metadata` (JSON)
- `created_at`, `updated_at`, `expires_at` (cache invalidation)

#### curriculum_learning_paths
- `id` (primary key)
- `curriculum_id` (foreign key to curriculum_registry)
- `path_index` (lesson order)
- `title`, `description`
- `topic`, `subtopic`
- `chunk_ids` (JSON - content for this lesson)
- `estimated_minutes` (learning duration)
- `learning_objectives` (JSON array)
- `prerequisites` (JSON array)
- `path_metadata` (JSON)
- `created_at`, `updated_at`

## Testing

✅ Database initialization verified:
```
[OK] All curriculum tables created successfully with correct schema
[OK] Database is ready for content extraction
```

✅ Service initialization verified:
```
[OK] CurriculumService initialized successfully
[OK] Database connection: OK
[OK] Firecrawl integration: OK
[OK] Repository layer: OK
```

## Next Steps

1. **Start the app** - Tables will be auto-created on startup
2. **Call curriculum discovery API** - Will extract content and populate tables
3. **Monitor extraction quality** - Check `curriculum_sources` and `curriculum_chunks` tables
4. **Validate results** - Use `/api/curriculum/get/{curriculum_id}` endpoint

## Environment Configuration

Database: `warrior_db` (as configured in `.env`)
```
DATABASE_URL=postgresql+psycopg://postgres:root@localhost:5432/warrior_db
```

All curriculum models are now properly registered and will be created automatically on app startup.
