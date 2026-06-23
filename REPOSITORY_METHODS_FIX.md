# Repository Methods Fix

## Problem
The curriculum discovery API was failing with error:
```
'CurriculumRepository' object has no attribute 'get_sources_for_curriculum'
```

## Root Cause
The `CurriculumService._build_response()` method calls two repository methods that were not implemented:
1. `repo.get_sources_for_curriculum(curriculum_id)` 
2. `repo.get_chunks_for_curriculum(curriculum_id)`

## Solution

### Added Method 1: `get_sources_for_curriculum()`
**Location:** [backend/app/repositories/curriculum_repository.py](backend/app/repositories/curriculum_repository.py:435-451)

```python
def get_sources_for_curriculum(self, curriculum_id: int) -> List[CurriculumSource]:
    """
    Retrieve all sources used in a curriculum.
    
    Gets the chunks for the curriculum and extracts the unique sources from them.
    """
    curriculum = self.get_curriculum(curriculum_id)
    if not curriculum or not curriculum.chunk_ids:
        return []
    
    chunks = self.db.query(CurriculumChunk).filter(
        CurriculumChunk.id.in_(curriculum.chunk_ids)
    ).all()
    
    source_ids = list(set(c.source_id for c in chunks))
    if not source_ids:
        return []
    
    return self.db.query(CurriculumSource).filter(
        CurriculumSource.id.in_(source_ids)
    ).all()
```

**Purpose:** Used by `_build_response()` to build the source breakdown in the curriculum response. Shows which URLs/sources contributed to the curriculum.

### Added Method 2: `get_chunks_for_curriculum()`
**Location:** [backend/app/repositories/curriculum_repository.py](backend/app/repositories/curriculum_repository.py:453-467)

```python
def get_chunks_for_curriculum(self, curriculum_id: int) -> List[CurriculumChunk]:
    """
    Retrieve all chunks used in a curriculum.
    
    Uses the chunk_ids stored in the curriculum registry.
    """
    curriculum = self.get_curriculum(curriculum_id)
    if not curriculum or not curriculum.chunk_ids:
        return []
    
    return self.db.query(CurriculumChunk).filter(
        CurriculumChunk.id.in_(curriculum.chunk_ids)
    ).order_by(CurriculumChunk.chunk_index).all()
```

**Purpose:** Used by `_build_response()` to:
- Calculate chunk counts per source
- Extract concept summaries
- Generate complete curriculum responses

## How They Work

### Data Flow

```
CurriculumRegistry (curriculum table)
    └─ chunk_ids: [1, 5, 12, 18, ...] (JSON array of selected chunk IDs)
        │
        ├─> get_chunks_for_curriculum(curriculum_id)
        │   └─> Returns: List[CurriculumChunk]
        │       - All chunks used in this curriculum
        │       - Ordered by chunk_index for sequential reading
        │
        └─> For each chunk:
            └─> source_id: (FK to curriculum_sources)
                └─> get_sources_for_curriculum(curriculum_id)
                    └─> Returns: List[CurriculumSource]
                        - Unique sources for this curriculum
                        - E.g., W3Schools, MDN, GeeksForGeeks
```

### Example Usage in CurriculumService

```python
# In _build_response() method (line 386-396):

# Get sources used in this curriculum
sources = self.repo.get_sources_for_curriculum(curriculum.id)

# Build source breakdown for API response
source_breakdown = []
if sources:
    for source in sources[:curriculum.sources_count]:
        source_breakdown.append({
            "url": source.url,
            "type": source.source_type,  # W3Schools, MDN, etc.
            "chunks_count": len([
                c for c in self.repo.get_chunks_for_curriculum(curriculum.id)
                if c.source_id == source.id
            ]),
            "content_quality": "high" if has_concepts else "medium"
        })
```

## Edge Cases Handled

1. **Non-existent curriculum:** Returns empty list
2. **Curriculum with no chunks:** Returns empty list
3. **Multiple chunks from same source:** Aggregates properly
4. **Chunk ordering:** Maintains chunk_index order for sequential reading

## Database Relationships

```
curriculum_registry
├─ id (primary key)
├─ topic
├─ difficulty
├─ duration
└─ chunk_ids: [1, 5, 12, ...] (JSON array)
    │
    └─> curriculum_chunks
        ├─ id: 1, 5, 12, ... (in chunk_ids array)
        ├─ source_id: (FK)
        ├─ chunk_index
        ├─ heading_path
        ├─ content
        └─ concepts
            │
            └─> curriculum_sources
                ├─ id: (FK referenced by source_id)
                ├─ url
                ├─ source_type (W3Schools, MDN, etc.)
                ├─ title
                ├─ raw_markdown
                └─ headings
```

## Testing

✅ Repository methods verified:
```
Repository methods check:
  get_sources_for_curriculum: True
  get_chunks_for_curriculum: True

Test with non-existent curriculum (id=999):
  sources returned: 0
  chunks returned: 0
```

✅ Service initialization verified:
```
[OK] CurriculumService initialized successfully

Required methods:
  discover_curriculum: OK
  _build_response: OK
  _generate_source_urls: OK

Repository methods:
  get_sources_for_curriculum: OK
  get_chunks_for_curriculum: OK
  check_curriculum_exists: OK
  save_curriculum: OK

[OK] All components ready for curriculum discovery
```

## Performance Notes

- Both methods use SQLAlchemy `filter(...).all()` queries
- Efficient bulk loading with `.in_()` operator
- Chunks ordered by index for sequential read
- No N+1 queries (loads all at once)

## Files Modified

- [backend/app/repositories/curriculum_repository.py](backend/app/repositories/curriculum_repository.py)
  - Added `get_sources_for_curriculum()` (17 lines)
  - Added `get_chunks_for_curriculum()` (15 lines)

## Next Steps

The curriculum discovery API should now work end-to-end:
1. ✅ Database tables created
2. ✅ Repository methods implemented
3. ✅ Service initialization successful
4. → Next: Test actual curriculum discovery with real content extraction
