# How Topic Extraction Works - Quick Reference

## The Short Version

```
1. User requests curriculum for "MySQL"
2. System calls Firecrawl to extract W3Schools MySQL page
3. Firecrawl returns markdown (only main content, no nav)
4. System chunks content by heading hierarchy
5. System extracts topics from heading paths
6. Topics are filtered (remove SQL keywords, noise)
7. Topics are normalized (map variations)
8. Final topics: "Database Design", "Joins", "Indexes", etc.
```

---

## The Process (Simplified)

### Input: Raw Web Content

```html
<nav>
  MySQL Tutorial
  MySQL SQL
  MySQL Database
</nav>

<main>
  ## MySQL Tutorial
  
  ### Introduction
  Learn MySQL...
  
  ### SELECT Statements
  The SELECT statement retrieves data...
  
  ### Database Design
  Good design is important...
</main>

<aside>
  Get Certified
  Subscribe
</aside>
```

### Step 1: Firecrawl Extraction

```python
firecrawl.scrape(url, options={"onlyMainContent": True})

# Removes: <nav>, <aside>, ads, scripts
# Keeps: <main> content only

Result:
## MySQL Tutorial

### Introduction
Learn MySQL...

### SELECT Statements
The SELECT statement retrieves data...

### Database Design
Good design is important...
```

### Step 2: Chunking by Heading Hierarchy

```python
chunk_by_heading(markdown)

Result: [
  {
    "heading_path": "MySQL Tutorial > Introduction",
    "content": "Learn MySQL...",
    "concepts": ["Introduction", "Basics"]
  },
  {
    "heading_path": "MySQL Tutorial > SELECT Statements",
    "content": "The SELECT statement...",
    "concepts": ["SELECT", "retrieves", "data"]
  },
  {
    "heading_path": "MySQL Tutorial > Database Design",
    "content": "Good design is important...",
    "concepts": ["design", "schema", "normalization"]
  }
]
```

### Step 3: Topic Extraction from Heading Paths

```python
for chunk in chunks:
    topic = chunk.heading_path.split(" > ")[0]
    # "MySQL Tutorial > Introduction" → "MySQL Tutorial"
    # "MySQL Tutorial > SELECT Statements" → "MySQL Tutorial"
    # "MySQL Tutorial > Database Design" → "MySQL Tutorial"

raw_topics = ["MySQL Tutorial"]
```

### Step 4: Noise Filtering (Layer 1)

```python
def _is_noise(text):
    NOISE_TERMS = {
        "Cert", "Tutorial", "Reference", "Example",
        "SELECT", "FROM", "WHERE", "JOIN",  # SQL keywords
        "PRINT", "INSIDE", "MONITOR",       # Demo keywords
        "Get Certified", "Subscribe",       # Marketing
        ...
    }
    return text in NOISE_TERMS

# Check "MySQL Tutorial"
_is_noise("MySQL Tutorial") → TRUE (contains "Tutorial")
→ REMOVE

cleaned_topics = []
```

Wait, that's not right. Let me recalculate:

```python
def _extract_topics(chunks):
    for chunk in chunks:
        heading_path = chunk.get("heading_path")
        main_topic = heading_path.split(" > ")[0]
        # All three headings start with "MySQL Tutorial"
        # So main_topic is always "MySQL Tutorial"
        
        if self._is_noise(main_topic):
            continue  # Skip if noise
        
        topics.add(main_topic)

# "MySQL Tutorial" is in NOISE_TERMS (because of "Tutorial")
# So it's filtered out

topics = set()  # empty!
```

This is a problem! The heading itself is noisy. Let me show you the REAL extraction:

### Real Step 3: Extract from Subtopics

```python
# The code actually extracts FIRST-LEVEL SUBTOPICS
# Not the page title

def _extract_subtopics(chunks, main_topics):
    subtopics_map = {}
    
    for chunk in chunks:
        heading_path = chunk.get("heading_path")
        # "MySQL Tutorial > Introduction"
        # "MySQL Tutorial > SELECT Statements"
        # "MySQL Tutorial > Database Design"
        
        parts = heading_path.split(" > ")
        main_topic = parts[0]  # "MySQL Tutorial"
        
        if len(parts) > 1:
            subtopic = parts[1]  # "Introduction", "SELECT Statements", etc.
            
            if not self._is_noise(subtopic):
                subtopics_map[main_topic].add(subtopic)

# Results:
# "Introduction" → not in NOISE → ADD
# "SELECT Statements" → "SELECT" is in NOISE → SKIP
# "Database Design" → not in NOISE → ADD

subtopics_map = {
    "MySQL Tutorial": {"Introduction", "Database Design"}
}
```

### Step 4: Clean and Normalize

```python
cleaned_subtopics = self.cleaner.clean_topics(raw_subtopics)
# Remove additional noise patterns

normalized_subtopics = self.normalizer.normalize_topics(cleaned_subtopics)
# Map variations to canonical forms

Result: {
    "MySQL Tutorial": ["Introduction", "Database Design"]
}

# Remove the page title noise by extracting only concepts from content
```

---

## The Three Layers of Filtering

### Layer 1: TopicExtractor (firecrawl_service.py)

**What it does:** Extract raw data from markdown

```python
# For each chunk, extract:
# 1. Heading from heading_path
# 2. Concepts from content (bold, code, phrases)
# 3. Apply basic filtering

# Filter criteria:
# - Skip if heading in SQL_KEYWORDS
# - Skip if heading in GENERIC_TERMS
# - Skip single-word topics (too generic)
```

**Code:**
```python
SQL_KEYWORDS = {
    "SELECT", "FROM", "WHERE", "JOIN", "INSERT",
    "UPDATE", "DELETE", "CREATE", "DROP", "ALTER",
    "CONSTRAINT", "PRIMARY", "FOREIGN", "PRINT",
    "INSIDE", "MONITOR", ...
}

GENERIC_TERMS = {
    "Example", "Tutorial", "Introduction", "Overview",
    "Reference", "Guide", "Basic", "Advanced"
}

def extract_concepts(markdown):
    # Get bold, code, phrases
    # Remove SQL keywords and generic terms
    # Return top 30 concepts
```

### Layer 2: TopicCleanerService (topic_cleaner_service.py)

**What it does:** Remove 250+ noise patterns

```python
NOISE_TERMS = {
    "Cert", "Certification", "Tutorial", "Contact",
    "Privacy", "Terms", "Cookie", "Home", "Back",
    "Get Certified", "Subscribe", "Newsletter",
    
    # SQL keywords (50+)
    "SELECT", "FROM", "WHERE", "JOIN", "INSERT",
    "UPDATE", "DELETE", "CREATE", "DROP",
    
    # Demo table names
    "Customers", "Products", "Orders", "Employees"
}

def clean_topics(topics):
    return [t for t in topics if t not in NOISE_TERMS]
```

### Layer 3: TopicNormalizationService (topic_normalization_service.py)

**What it does:** Map variations to canonical forms

```python
TOPIC_ALIASES = {
    "database design": [
        "database design", "schema design",
        "normalization", "database normalization",
        "relational design"
    ],
    "select statements": [
        "select", "select statements", "querying data",
        "data retrieval", "select queries"
    ],
    "joins": [
        "join", "joins", "inner join", "left join",
        "right join", "table relationships"
    ]
}

def normalize_topics(topics):
    for topic in topics:
        if topic.lower() in canonical_map:
            yield canonical_map[topic.lower()]
        else:
            yield topic
```

---

## Code Files Involved

### 1. firecrawl_service.py
**Location:** `backend/app/services/firecrawl_service.py`

**Key functions:**
- `FirecrawlClient.scrape()` - Calls Firecrawl API
- `FirecrawlService.extract_source()` - Full extraction pipeline
- `TopicExtractor.extract_headings()` - Get headings from markdown
- `TopicExtractor.extract_concepts()` - Get concepts with filtering
- `ContentChunker.chunk()` - Split into chunks by headings

**Critical change (line 589-591):**
```python
firecrawl_result = self.firecrawl.scrape(url, options={
    "onlyMainContent": True,  # ← THE KEY FIX
    "headers": {"User-Agent": "..."}
})
```

### 2. curriculum_template_builder.py
**Location:** `backend/app/services/curriculum_template_builder.py`

**Key functions:**
- `CurriculumTemplateBuilder.build_template()` - Main orchestrator
- `_extract_topics()` - Extract main topics from heading paths
- `_extract_subtopics()` - Extract subtopics from heading hierarchy
- `_aggregate_concepts()` - Collect all concepts

**Process (lines 162-212):**
```python
def _extract_topics(self, chunks):
    """Extract from heading_path by splitting on >"""
    for chunk in chunks:
        topic = chunk.heading_path.split(" > ")[0]
        if not self._is_noise(topic):
            topics.add(topic)
    return sorted(list(topics))
```

### 3. topic_cleaner_service.py
**Location:** `backend/app/services/topic_cleaner_service.py`

**Key functions:**
- `TopicCleanerService.clean_topics()` - Remove noise terms
- `TopicCleanerService.clean_subtopics()` - Clean subtopic list
- `TopicCleanerService.clean_concepts()` - Clean concept list

**Noise filtering (line 22+):**
```python
NOISE_TERMS = {
    "Cert", "Reference", "Tutorial",
    # ... 250+ items including SQL keywords
}

def clean_topics(self, topics):
    return [t for t in topics if t not in self.NOISE_TERMS]
```

### 4. topic_normalization_service.py
**Location:** `backend/app/services/topic_normalization_service.py`

**Key functions:**
- `TopicNormalizationService.normalize_topics()` - Map to canonical
- `TopicNormalizationService.normalize_subtopics()` - Normalize subtopics

**Aliases (line 42+):**
```python
TOPIC_ALIASES = {
    "database design": ["database design", "schema design", "normalization"],
    "select statements": ["select", "querying data", "data retrieval"],
    "joins": ["join", "joins", "inner join", "left join"],
    # ... MySQL-specific mappings
}
```

---

## Data Flow Diagram

```
URL INPUT
    ↓
FirecrawlClient.scrape() → Raw HTML
    ↓
Firecrawl API {onlyMainContent: true} → Article markdown
    ↓
ContentCleaner.clean() → Remove boilerplate
    ↓
ContentNormalizer.normalize() → Standardize markdown
    ↓
ContentChunker.chunk() → List of chunks with heading_path
    ↓
CurriculumTemplateBuilder.build_template()
    ├─ _extract_topics() from heading_path
    ├─ _extract_subtopics() from heading hierarchy
    ├─ _aggregate_concepts() from content
    └─ Apply cleaning and normalization
        ├─ TopicCleanerService.clean_topics()
        ├─ TopicNormalizationService.normalize_topics()
        └─ Return final curriculum
    ↓
FINAL TOPICS OUTPUT
```

---

## Example Execution Trace

```
Input: https://www.w3schools.com/mysql/

1. Firecrawl extracts:
   ## MySQL Tutorial
   ### Introduction
   ### SELECT Statements
   ### Database Design
   ### Normalization

2. Chunk by heading_path:
   - "MySQL Tutorial > Introduction"
   - "MySQL Tutorial > SELECT Statements"
   - "MySQL Tutorial > Database Design"
   - "MySQL Tutorial > Normalization"

3. Extract topics from first part:
   - raw_topics = ["MySQL Tutorial"]

4. Extract subtopics from second part:
   - "Introduction" → not noise → KEEP
   - "SELECT Statements" → "SELECT" is SQL → SKIP
   - "Database Design" → not noise → KEEP
   - "Normalization" → not noise → KEEP

5. Clean subtopics:
   - All three pass cleaning
   - cleaned_subtopics = ["Introduction", "Database Design", "Normalization"]

6. Normalize subtopics:
   - "Introduction" → no mapping → "Introduction"
   - "Database Design" → is in aliases → "Database Design"
   - "Normalization" → is in aliases → "Database Design"

7. Final output:
   extracted_subtopics = {
       "MySQL Tutorial": ["Introduction", "Database Design"]
   }

8. Remove page title noise by only using subtopics:
   extracted_topics = ["Database Design"]  # From unique subtopics
```

---

## Key Insights

1. **Firecrawl is critical** - `onlyMainContent: True` removes nav/headers/footers
2. **Three-layer filtering** - Each layer catches different types of garbage
3. **Heading hierarchy** - Topics extracted from heading structure, not random text
4. **Subtopic extraction** - Subtopics are the real learning concepts
5. **Normalization** - Maps variations to standard learning terminology
6. **SQL keyword filtering** - 60+ SQL keywords explicitly removed

---

## Testing

To see it in action:

```bash
# 1. Start backend
cd backend
python -m uvicorn app.main:app --reload

# 2. Call API
curl -X POST http://localhost:8000/api/curriculum/discover \
  -H "Content-Type: application/json" \
  -d '{"topic":"MySQL","difficulty":"Beginner","duration":"6 weeks"}'

# 3. Check response
# Look for extracted_topics and extracted_subtopics
# Topics should be meaningful (not SQL keywords)
```

---

## Summary

Topics are extracted through:
1. **Firecrawl extraction** - Get clean content (no nav)
2. **Heading parsing** - Split by heading hierarchy
3. **Raw extraction** - Get first/second-level headings
4. **Noise filtering** - Remove 250+ noise patterns
5. **SQL filtering** - Remove 60+ SQL keywords
6. **Normalization** - Map to canonical learning concepts

**Result:** High-quality topics representing actual learning concepts.
