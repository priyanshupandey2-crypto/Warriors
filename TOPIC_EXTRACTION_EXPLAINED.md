# Topic Extraction Explained - Code Walkthrough

## Complete Flow: From Raw Content to Topics

```
URL
  ↓
Firecrawl Extraction
  ↓
Content Cleaning
  ↓
Content Normalization
  ↓
Topic Extraction (MAIN FOCUS)
  ↓
Quality Filter
  ↓
Final Topics
```

---

## Step 1: URL → Firecrawl Extraction

**File:** `firecrawl_service.py:567-606`

```python
def extract_source(self, url: str) -> Optional[CurriculumSource]:
    """Extract content from a single URL."""
    
    # Step 1: Validate URL (check domain is trusted)
    is_valid, source_type = self.validate_url(url)
    if not is_valid:
        logger.error(f"URL validation failed for {url}")
        return None
    
    # Step 2: Call Firecrawl API with onlyMainContent option
    firecrawl_result = self.firecrawl.scrape(url, options={
        "onlyMainContent": True,  # ← CRITICAL: Only main article content
        "headers": {"User-Agent": "Mozilla/5.0..."}
    })
    
    # Step 3: Extract markdown from response
    data = firecrawl_result.get("data", {})
    raw_markdown = data.get("markdown", "")
    metadata = data.get("metadata", {})
    
    # Returns markdown like:
    # ## MySQL Tutorial
    # Content here...
    # ## Heading 2
    # More content...
```

**What `onlyMainContent: True` does:**

```
Full HTML Page:
┌─────────────────────────┐
│ <nav>                   │ ← REMOVED
│   MySQL Tutorial        │ ← REMOVED
│   MySQL SQL             │ ← REMOVED
│ </nav>                  │ ← REMOVED
├─────────────────────────┤
│ <main>                  │ ← KEPT
│   ## MySQL Tutorial     │ ← KEPT
│   Content...            │ ← KEPT
│ </main>                 │ ← KEPT
├─────────────────────────┤
│ <aside>                 │ ← REMOVED
│   Get Certified         │ ← REMOVED
│ </aside>                │ ← REMOVED
└─────────────────────────┘

Result: Only the main article markdown
```

---

## Step 2: Content Cleaning

**File:** `firecrawl_service.py:205-245`

```python
class ContentCleaner:
    """Remove boilerplate, navigation, ads from extracted content."""
    
    BOILERPLATE_PATTERNS = [
        r"(?i)cookie.*?(accept|reject|consent)",      # Cookie banners
        r"(?i)(subscribe|newsletter|sign\s+up).*?",   # Newsletter prompts
        r"(?i)advertisement|sponsored content",        # Ads
        r"(?i)^follow\s+us|share\s+on",               # Social buttons
        r"(?i)related.*?articles?",                    # Related content
        r"(?i)table of contents",                      # TOC
    ]
    
    @staticmethod
    def clean(markdown: str) -> str:
        """Remove common boilerplate patterns."""
        content = markdown
        
        # Remove script tags and HTML comments
        for pattern in ContentCleaner.SCRIPT_PATTERNS:
            content = re.sub(pattern, "", content, flags=re.IGNORECASE | re.DOTALL)
        
        # Remove boilerplate patterns
        for pattern in ContentCleaner.BOILERPLATE_PATTERNS:
            content = re.sub(pattern, "", content, flags=re.IGNORECASE | re.MULTILINE)
        
        # Remove excessive whitespace
        content = re.sub(r"\n\n\n+", "\n\n", content)
        
        return content.strip()
```

**Example:**

```
Before cleaning:
## MySQL Tutorial

Subscribe to our newsletter!
[Newsletter signup box]

## Introduction to MySQL

Real content here...

Related Articles:
[Links to other articles]

After cleaning:
## MySQL Tutorial

## Introduction to MySQL

Real content here...
```

---

## Step 3: Content Normalization

**File:** `firecrawl_service.py:248-302`

```python
class ContentNormalizer:
    """Normalize markdown for consistency across sources."""
    
    @staticmethod
    def normalize_headings(markdown: str) -> str:
        """Ensure consistent heading format."""
        lines = []
        for line in markdown.split("\n"):
            if line.startswith("#"):
                heading_text = line.lstrip("#").strip()
                level = len(line) - len(line.lstrip("#"))
                lines.append(f"{'#' * level} {heading_text}")  # ← Standardize
            else:
                lines.append(line)
        return "\n".join(lines)
    
    @staticmethod
    def normalize_code_blocks(markdown: str) -> str:
        """Standardize code block formatting."""
        # Convert ~~~ to ```
        # Ensure consistent backtick count
        pass
    
    @staticmethod
    def normalize_links(markdown: str) -> str:
        """Standardize link formatting."""
        link_pattern = r"\[(.*?)\]\((.*?)\)"
        
        def normalize_link(match):
            text, url = match.groups()
            if not url.startswith(("http://", "https://", "#", "/")):
                return match.group(0)
            return f"[{text.strip()}]({url.strip()})"
        
        return re.sub(link_pattern, normalize_link, markdown)
    
    @staticmethod
    def normalize(markdown: str) -> str:
        """Apply all normalizations."""
        markdown = ContentNormalizer.normalize_headings(markdown)
        markdown = ContentNormalizer.normalize_code_blocks(markdown)
        markdown = ContentNormalizer.normalize_links(markdown)
        return markdown
```

**Example:**

```
Before normalization:
##MySQL Tutorial
some text
### Intro to MySQL

[Link Text](  https://example.com  )

~~~python
code
~~~

After normalization:
## MySQL Tutorial
some text
### Intro to MySQL

[Link Text](https://example.com)

```python
code
```
```

---

## Step 4: Topic Extraction (THE MAIN PART)

This happens in **two stages**:

### Stage A: Extract from Content

**File:** `curriculum_template_builder.py:162-212`

```python
def _extract_topics(self, chunks: List[Dict[str, Any]]) -> List[str]:
    """
    Extract main learning topics from heading hierarchy.
    
    Each chunk has:
    {
        "heading_path": "MySQL > Databases > Creating Tables",
        "content": "...",
        "concepts": [...]
    }
    """
    topics = set()
    all_headings = []
    filtered_count = 0
    
    # Loop through all chunks
    for chunk in chunks:
        heading_path = chunk.get("heading_path", "")
        if not heading_path:
            continue
        
        # Get MAIN topic (first part before >)
        # "MySQL > Databases > Creating Tables" → "MySQL"
        main_topic = heading_path.split(" > ")[0].strip()
        all_headings.append(main_topic)
        
        # FILTER 1: Skip noise
        if self._is_noise(main_topic):
            filtered_count += 1
            self.logger.debug(f"Filtered noise: {main_topic}")
            continue
        
        # FILTER 2: Skip very short headings
        if len(main_topic) < self.MIN_HEADING_LENGTH:  # MIN = 1
            filtered_count += 1
            continue
        
        # FILTER 3: Skip single-word topics (too generic)
        if len(main_topic.split()) < self.MIN_TOPIC_LENGTH:  # MIN = 1
            filtered_count += 1
            self.logger.debug(f"Filtered (single word): {main_topic}")
            continue
        
        # If passes all filters, add to topics
        topics.add(main_topic)
    
    return sorted(list(topics))
```

**What `_is_noise()` does:**

```python
def _is_noise(self, text: str) -> bool:
    """Check if text is noise (not educational content)."""
    
    # Check against NOISE_PATTERNS from topic_cleaner_service.py
    noise_patterns = {
        "Cert", "Reference", "Tutorial", "Examples",
        "Contact Us", "Privacy", "Login", "Follow Us",
        "Search", "Learn", "Note", "Important",
        
        # SQL keywords added by our fix
        "SELECT", "FROM", "WHERE", "JOIN", "INSERT", "UPDATE",
        "DELETE", "CREATE", "DROP", "ALTER", "TABLE",
        "DATABASE", "INDEX", "VIEW", "PROCEDURE",
        "CONSTRAINT", "PRIMARY", "FOREIGN", "UNIQUE",
        "PRINT", "INSIDE", "MONITOR",
        "Customers", "Products", "Orders"
    }
    
    return text in noise_patterns
```

**Example Flow:**

```
Input chunks:
[
    {heading_path: "MySQL Tutorial", ...},
    {heading_path: "MySQL > SELECT", ...},
    {heading_path: "MySQL > Database Design", ...},
    {heading_path: "MySQL > PRINT", ...},
]

Processing:
1. "MySQL Tutorial" → _is_noise("MySQL Tutorial") → TRUE (noise) → SKIP
2. "MySQL" → _is_noise("MySQL") → FALSE → ADD
3. "Database Design" → _is_noise("Database Design") → FALSE → ADD
4. "PRINT" → _is_noise("PRINT") → TRUE (SQL keyword) → SKIP

Result:
topics = ["Database Design", "MySQL"]
```

---

### Stage B: Clean and Normalize

**File:** `topic_cleaner_service.py` + `topic_normalization_service.py`

```python
# Step 1: Clean topics
cleaned_topics = self.cleaner.clean_topics(raw_topics)

def clean_topics(self, topics: List[str]) -> List[str]:
    """Remove noise terms."""
    return [
        t for t in topics 
        if t not in self.NOISE_TERMS
        and len(t) >= self.MIN_LENGTH
    ]
```

The NOISE_TERMS set is HUGE:

```python
NOISE_TERMS = {
    "Cert", "Certification", "Certificate", "Tutorial",
    "Contact", "Contact Us", "Contact Sales", "Support",
    "Privacy", "Terms", "Cookie", "Home", "Back", "Next",
    "Get Certified", "Subscribe", "Newsletter",
    
    # Added by our fix:
    "SELECT", "FROM", "WHERE", "JOIN", "LEFT", "RIGHT", "INSERT",
    "UPDATE", "DELETE", "CREATE", "DROP", "ALTER", "TABLE",
    "DATABASE", "INDEX", "VIEW", "PROCEDURE", "TRIGGER",
    "CONSTRAINT", "PRIMARY", "FOREIGN", "UNIQUE", "CHECK",
    "DEFAULT", "NULL", "NOT", "AND", "OR", "IN", "LIKE",
    "BETWEEN", "EXISTS", "CASE", "WHEN", "THEN", "ELSE", "END",
    "AS", "ON", "USING", "GROUP", "ORDER", "BY", "HAVING",
    "LIMIT", "OFFSET", "UNION", "INTERSECT", "EXCEPT",
    "DISTINCT", "ALL", "ANY", "SOME", "WITH", "RECURSIVE",
    "LATERAL", "CROSS", "NATURAL", "FULL", "INTO", "VALUES", "SET",
    
    "PRINT", "INSIDE", "MONITOR", "Customers", "Products",
    "Orders", "Employees", "Departments"
}
```

```python
# Step 2: Normalize topics
normalized_topics = self.normalizer.normalize_topics(cleaned_topics)

def normalize_topics(self, topics: List[str]) -> List[str]:
    """Map topic variations to canonical forms."""
    result = []
    
    for topic in topics:
        # Check if it matches any canonical form
        if topic.lower() in self.canonical_map:
            canonical = self.canonical_map[topic.lower()]
            result.append(canonical)
        else:
            result.append(topic)
    
    return list(set(result))  # Remove duplicates

# Example mappings (built from TOPIC_ALIASES):
canonical_map = {
    "select": "Select Statements",
    "querying data": "Select Statements",
    "data retrieval": "Select Statements",
    "join": "Joins",
    "joins": "Joins",
    "combining data": "Joins",
    "database design": "Database Design",
    "schema design": "Database Design",
    "normalization": "Database Design",
    # ... many more ...
}
```

**Complete Example:**

```
Raw topics from headings:
["MySQL", "SELECT", "FROM", "Customers", "Database Design"]

↓ Clean (remove noise)
["MySQL", "Database Design"]

↓ Normalize (map to canonical)
["MySQL", "Database Design"]

↓ Final topics
["Database Design", "MySQL"]
```

---

## Step 5: Extract Subtopics

**File:** `curriculum_template_builder.py:214-280`

```python
def _extract_subtopics(self, chunks, main_topics) -> Dict[str, List[str]]:
    """
    Extract subtopics from heading hierarchy.
    
    For each chunk, if heading_path is like:
    "MySQL > SELECT Statements > Basic Queries"
    
    Extract:
    - main_topic = "MySQL"
    - subtopic = "SELECT Statements"
    """
    
    subtopics_map = {topic: set() for topic in main_topics}
    
    for chunk in chunks:
        heading_path = chunk.get("heading_path", "")
        
        # Need hierarchical path (with >)
        if not heading_path or " > " not in heading_path:
            continue
        
        # Split the path
        parts = heading_path.split(" > ")
        main_topic = parts[0].strip()
        
        # Only process if we extracted this as a main topic
        if main_topic not in subtopics_map:
            continue
        
        # Get first-level subtopic
        if len(parts) > 1:
            subtopic = parts[1].strip()
            
            # Apply same filters as main topics
            if self._is_noise(subtopic):
                continue
            if len(subtopic) < self.MIN_HEADING_LENGTH:
                continue
            
            # Don't include boilerplate
            if any(word in subtopic.lower() 
                   for word in ["help", "improve", "edit", "github"]):
                continue
            
            subtopics_map[main_topic].add(subtopic)
    
    # Convert sets to sorted lists
    return {
        topic: sorted(list(subs))
        for topic, subs in subtopics_map.items()
    }
```

**Example:**

```
Input headings:
- "MySQL > SELECT Statements > Basic Queries"
- "MySQL > SELECT Statements > WHERE Clauses"
- "MySQL > Joins > INNER Joins"
- "MySQL > Joins > LEFT Joins"
- "MySQL > Database Design > Normalization"

Processing:
main_topic = "MySQL"
subtopics = [
    "SELECT Statements",
    "Joins",
    "Database Design"
]

Result:
{
    "MySQL": {
        "SELECT Statements": ["Basic Queries", "WHERE Clauses"],
        "Joins": ["INNER Joins", "LEFT Joins"],
        "Database Design": ["Normalization"]
    }
}
```

---

## Step 6: Extract Concepts

**File:** `firecrawl_service.py:316-380`

```python
class TopicExtractor:
    
    SQL_KEYWORDS = {
        "SELECT", "FROM", "WHERE", "JOIN", "INSERT", "UPDATE",
        "DELETE", "CREATE", "DROP", "ALTER", "TABLE", "DATABASE",
        # ... 60+ keywords
    }
    
    GENERIC_TERMS = {
        "Example", "Tutorial", "Introduction", "Overview",
        "Reference", "Guide", "Basic", "Advanced", "Intermediate"
    }
    
    @staticmethod
    def extract_concepts(markdown: str) -> List[str]:
        """Extract key concepts from content."""
        concepts = set()
        
        # Extract 1: Bold text (**concept**)
        bold_pattern = r"\*\*(.+?)\*\*"
        bold_concepts = re.findall(bold_pattern, markdown)
        concepts.update([c.strip() for c in bold_concepts if len(c.strip()) > 2])
        
        # Extract 2: Code blocks (`concept`)
        code_pattern = r"`([^`]+)`"
        code_concepts = re.findall(code_pattern, markdown)
        concepts.update([c.strip() for c in code_concepts if len(c.strip()) > 2])
        
        # Extract 3: Multi-word phrases (more meaningful than single words)
        phrase_pattern = r"\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,2})\b"
        phrases = re.findall(phrase_pattern, markdown)
        
        stop_words = {"The", "A", "An", "Is", "Are", "And", "Or"}
        for phrase in phrases:
            if phrase not in TopicExtractor.SQL_KEYWORDS and phrase not in stop_words:
                concepts.add(phrase)
        
        # FILTER: Remove SQL keywords and generic terms
        filtered = [
            c for c in concepts
            if c not in TopicExtractor.SQL_KEYWORDS
            and c not in TopicExtractor.GENERIC_TERMS
            and len(c) > 2
        ]
        
        return sorted(list(set(filtered)))[:30]  # Top 30
```

**Example:**

```
Input markdown:
## SELECT Statements
Learn how to use **SELECT** to retrieve data.
The syntax is: `SELECT column FROM table`

You can filter with WHERE:
`SELECT name FROM Customers WHERE age > 18`

Common Patterns:
- **Filtering Rows** with WHERE
- **Ordering Results** with ORDER BY

Result before filtering:
["SELECT", "WHERE", "ORDER BY", "Customers", "Filtering Rows", "Ordering Results"]

Result after filtering (remove SQL keywords):
["Filtering Rows", "Ordering Results"]
```

---

## The Complete Pipeline (Actual Code Flow)

```python
# 1. Extract source (firecrawl_service.py)
source = self.extract_source(url)
# Returns: CurriculumSource with raw_markdown

# 2. Process source to chunks (firecrawl_service.py:603)
chunks = self.process_source_to_chunks(source)
# Each chunk has heading_path and concepts

# 3. Build curriculum template (curriculum_template_builder.py)
template = self.build_template(chunks, sources, topic, difficulty)

# 4. Inside build_template:
raw_topics = self._extract_topics(chunks)
# raw_topics = ["MySQL", "Database Design", "SELECT", ...]

raw_subtopics = self._extract_subtopics(chunks, raw_topics)
# raw_subtopics = {"MySQL": ["Databases", "Tables"]}

raw_concepts = self._aggregate_concepts(chunks)
# raw_concepts = ["SELECT", "PRIMARY KEY", "INDEX", ...]

# 5. Clean topics
cleaned_topics = self.cleaner.clean_topics(raw_topics)
# cleaned_topics = ["MySQL", "Database Design"]
# (SELECT, FROM, etc. removed)

cleaned_subtopics = self.cleaner.clean_subtopics(raw_subtopics)
cleaned_concepts = self.cleaner.clean_concepts(raw_concepts)

# 6. Normalize topics
normalized_topics = self.normalizer.normalize_topics(cleaned_topics)
# "querying data" → "Select Statements"
# "schema design" → "Database Design"

normalized_subtopics = self.normalizer.normalize_subtopics(cleaned_subtopics)

# 7. Return final curriculum
return {
    "extracted_topics": normalized_topics,
    "extracted_subtopics": normalized_subtopics,
    "concept_summary": cleaned_concepts[:20],
    ...
}
```

---

## Real Example: MySQL Page

### Input: Raw W3Schools MySQL Page

```html
<nav>
  MySQL Tutorial
  MySQL SQL
  MySQL Database
</nav>

<main>
  ## MySQL Tutorial
  
  ### Introduction
  Learn the basics...
  
  ### SELECT
  The **SELECT** statement is used...
  `SELECT * FROM table_name`
  
  ### Database Design
  Good database design is important...
  
  ### Normalization
  First, second, third normal forms...
</main>

<aside>
  Get Certified
  Subscribe to Newsletter
</aside>
```

### After Firecrawl (onlyMainContent=True)

```
## MySQL Tutorial

### Introduction
Learn the basics...

### SELECT
The **SELECT** statement is used...
`SELECT * FROM table_name`

### Database Design
Good database design is important...

### Normalization
First, second, third normal forms...
```

### After Chunking (heading_path)

```
[
  {heading_path: "MySQL Tutorial > Introduction", content: "..."},
  {heading_path: "MySQL Tutorial > SELECT", content: "..."},
  {heading_path: "MySQL Tutorial > Database Design", content: "..."},
  {heading_path: "MySQL Tutorial > Normalization", content: "..."},
]
```

### Topic Extraction Results

```
Raw topics: ["MySQL Tutorial"]

Clean:
- "MySQL Tutorial" → Check noise
  - Not in NOISE_TERMS ✓
  - Length >= 1 ✓
  - Not single word ✓
  - KEEP

Cleaned: ["MySQL Tutorial"]

Normalize:
- "MySQL Tutorial" → No mapping
  - KEEP as "MySQL Tutorial"

Final: ["MySQL Tutorial"]
```

### Subtopic Extraction Results

```
Raw: {
  "MySQL Tutorial": [
    "Introduction",
    "SELECT",
    "Database Design",
    "Normalization"
  ]
}

Clean:
- "Introduction" → Check noise
  - Not in NOISE_TERMS ✓
  - KEEP
  
- "SELECT" → Check noise
  - IN NOISE_TERMS (SQL keyword) ✗
  - REMOVE
  
- "Database Design" → KEEP
- "Normalization" → KEEP

Cleaned: {
  "MySQL Tutorial": [
    "Introduction",
    "Database Design",
    "Normalization"
  ]
}

Final: [
  "Introduction",
  "Database Design",
  "Normalization"
]
```

---

## Summary: How Topics Are Extracted

**Three-layer filtering:**

1. **TopicExtractor** (in firecrawl_service.py)
   - Extract headings from markdown
   - Filter SQL keywords, generic terms
   - Extract multi-word phrases

2. **TopicCleanerService** (topic_cleaner_service.py)
   - Remove noise patterns (250+ patterns)
   - Filter marketing, navigation, boilerplate

3. **TopicNormalizationService** (topic_normalization_service.py)
   - Map variations to canonical learning concepts
   - "schema design" → "Database Design"
   - "querying data" → "Select Statements"

**Result:** High-quality, meaningful topics that represent actual learning concepts.

---

## Key Code Functions Reference

| Function | File | Purpose |
|----------|------|---------|
| `extract_source()` | firecrawl_service.py | Extract content from URL with Firecrawl |
| `extract_headings()` | firecrawl_service.py | Extract heading text from markdown |
| `extract_concepts()` | firecrawl_service.py | Extract bold, code, phrase concepts |
| `_extract_topics()` | curriculum_template_builder.py | Extract main topics from heading hierarchy |
| `_extract_subtopics()` | curriculum_template_builder.py | Extract subtopics from heading hierarchy |
| `clean_topics()` | topic_cleaner_service.py | Filter noise terms |
| `normalize_topics()` | topic_normalization_service.py | Map to canonical forms |
| `build_template()` | curriculum_template_builder.py | Orchestrate entire pipeline |

