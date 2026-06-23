# Topic Extraction - Visual Flow Diagram

## High-Level Pipeline

```
┌─────────────────────────────────────────────────────────────┐
│                        USER REQUEST                         │
│  Topic: "MySQL"                                             │
│  Difficulty: "Beginner"                                     │
│  Duration: "6 weeks"                                        │
└─────────────────────────┬─────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                  CURRICULUM SERVICE                         │
│  • Check cache                                              │
│  • Generate source URLs                                     │
│  • Call Firecrawl for each URL                              │
└─────────────────────────┬─────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│           FIRECRAWL SERVICE (URL EXTRACTION)                │
│                                                             │
│  URL: https://www.w3schools.com/mysql/                     │
│                                                             │
│  1. Validate URL                                           │
│  2. Call Firecrawl API with onlyMainContent=True           │
│  3. Receive markdown                                       │
│  4. Clean content (remove boilerplate)                     │
│  5. Normalize content (standardize markdown)               │
│  6. Return CurriculumSource                                │
│                                                             │
│  Result: {                                                 │
│    "url": "https://...",                                   │
│    "raw_markdown": "## MySQL Tutorial\n## SELECT\n...",   │
│    "headings": ["MySQL Tutorial", "SELECT", ...]          │
│  }                                                          │
└─────────────────────────┬─────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│              CONTENT CHUNKER (SEMANTIC SPLIT)               │
│                                                             │
│  Input: raw_markdown                                       │
│  Output: List of chunks with heading paths                 │
│                                                             │
│  Result: [                                                 │
│    {                                                       │
│      "heading_path": "MySQL > SELECT",                     │
│      "content": "The SELECT statement...",                │
│      "token_count": 450,                                   │
│      "concepts": ["SELECT", "FROM", "WHERE"]              │
│    },                                                      │
│    {                                                       │
│      "heading_path": "MySQL > Database Design",            │
│      "content": "Good design is important...",            │
│      "token_count": 380,                                   │
│      "concepts": ["Normalization", "Schema"]              │
│    }                                                       │
│  ]                                                         │
└─────────────────────────┬─────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│        CURRICULUM TEMPLATE BUILDER (TOPIC EXTRACTION)       │
│                                                             │
│  Input: chunks (list of content blocks)                    │
│  Output: curriculum template with topics                   │
│                                                             │
│  4 STAGES:                                                 │
└─────────────────────────┬─────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
        ▼                 ▼                 ▼
  
  STAGE 1:          STAGE 2:          STAGE 3:
  Extract &         Clean &           Normalize &
  Filter            Validate          Build

        │                 │                 │
        └─────────────────┼─────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                   FINAL CURRICULUM                          │
│                                                             │
│  {                                                          │
│    "extracted_topics": [                                   │
│      "MySQL",                                              │
│      "Database Design",                                    │
│      "Querying Data"                                       │
│    ],                                                      │
│    "extracted_subtopics": {                                │
│      "MySQL": ["Basics", "Introduction"],                 │
│      "Database Design": ["Normalization", "Schema"],      │
│      "Querying Data": ["SELECT", "WHERE", "Filtering"]    │
│    }                                                       │
│  }                                                          │
└─────────────────────────────────────────────────────────────┘
```

---

## Detailed: STAGE 1 - Extract Topics from Content

```
INPUT: List of chunks with heading_path

chunks = [
  {"heading_path": "MySQL Tutorial > Introduction"},
  {"heading_path": "MySQL > SELECT"},
  {"heading_path": "MySQL > SELECT > Basic Queries"},
  {"heading_path": "MySQL > Database Design"},
  {"heading_path": "MySQL > FROM"},
  {"heading_path": "MySQL > PRINT"},
]

PROCESS:

for chunk in chunks:
    heading_path = chunk.get("heading_path")
    
    # Extract first part (main topic)
    main_topic = heading_path.split(" > ")[0]
    
    Iteration 1:
    heading_path = "MySQL Tutorial > Introduction"
    main_topic = "MySQL Tutorial"
    Check _is_noise("MySQL Tutorial") → TRUE (contains "Tutorial")
    → SKIP ✗
    
    Iteration 2:
    heading_path = "MySQL > SELECT"
    main_topic = "MySQL"
    Check _is_noise("MySQL") → FALSE
    Check len("MySQL") < 1 → FALSE
    Check word count >= 1 → FALSE (only 1 word)
    → ADD ✓
    
    Iteration 3:
    heading_path = "MySQL > SELECT > Basic Queries"
    main_topic = "MySQL"
    → Already added (no duplicates, using set)
    
    Iteration 4:
    heading_path = "MySQL > Database Design"
    main_topic = "MySQL"
    → Already added
    
    Iteration 5:
    heading_path = "MySQL > FROM"
    main_topic = "MySQL"
    → Already added
    
    Iteration 6:
    heading_path = "MySQL > PRINT"
    main_topic = "MySQL"
    → Already added

OUTPUT: raw_topics = ["MySQL"]
```

---

## Detailed: STAGE 2 - Clean Topics

```
INPUT: raw_topics = ["MySQL"]

PROCESS: Apply topic_cleaner_service.py cleaning

_is_noise() checks against NOISE_TERMS:

NOISE_TERMS includes:
{
  "Cert", "Reference", "Tutorial",  ← These would be filtered
  "Examples", "Contact Us", "Privacy",
  "SELECT", "FROM", "WHERE", "JOIN", ← SQL keywords
  "PRINT", "INSIDE", "MONITOR",     ← SQL demo keywords
  "Customers", "Products", "Orders", ← Table names
  ...
}

For "MySQL":
  "MySQL" not in NOISE_TERMS → KEEP ✓

OUTPUT: cleaned_topics = ["MySQL"]
```

---

## Detailed: STAGE 3 - Normalize & Extract Subtopics

```
INPUT: 
- cleaned_topics = ["MySQL"]
- chunks = [
    {"heading_path": "MySQL > SELECT", ...},
    {"heading_path": "MySQL > Database Design", ...},
    {"heading_path": "MySQL > FROM", ...},
  ]

PROCESS A: Normalize main topics
For "MySQL":
  Check canonical_map.get("mysql") → None (no mapping)
  → KEEP as "MySQL"

normalized_topics = ["MySQL"]

PROCESS B: Extract subtopics

subtopics_map = {"MySQL": set()}

For each chunk:
  Chunk 1: "MySQL > SELECT"
    main_topic = "MySQL"
    subtopic = "SELECT"
    _is_noise("SELECT") → TRUE (SQL keyword)
    → SKIP ✗
  
  Chunk 2: "MySQL > Database Design"
    main_topic = "MySQL"
    subtopic = "Database Design"
    _is_noise("Database Design") → FALSE
    Check boilerplate → FALSE
    → ADD ✓
    
  Chunk 3: "MySQL > FROM"
    subtopic = "FROM"
    _is_noise("FROM") → TRUE (SQL keyword)
    → SKIP ✗

subtopics_map["MySQL"] = {"Database Design"}

OUTPUT:
normalized_topics = ["MySQL"]
subtopics = {
  "MySQL": ["Database Design"]
}
```

---

## Code Flow: _extract_topics()

```python
def _extract_topics(self, chunks):
    """
    Line-by-line code walkthrough
    """
    topics = set()                    # Line 172: empty set for unique topics
    all_headings = []                 # Line 173: track all headings
    filtered_count = 0                # Line 174: count filtered items
    
    for chunk in chunks:              # Line 176: loop each chunk
        
        heading_path = chunk.get("heading_path", "")  # Line 177
        # heading_path might be: "MySQL > SELECT > Basic Queries"
        
        if not heading_path:          # Line 178: skip empty
            continue
        
        main_topic = heading_path.split(" > ")[0].strip()  # Line 182
        # main_topic = "MySQL"
        
        all_headings.append(main_topic)  # Line 183: track all
        
        # FILTER 1: Noise check
        if self._is_noise(main_topic):   # Line 186
            # Check if "MySQL" is in NOISE_TERMS
            # It's not, so this passes
            filtered_count += 1           # Line 187
            continue                      # Line 188: skip this one
        
        # FILTER 2: Length check
        if len(main_topic) < self.MIN_HEADING_LENGTH:  # Line 192
            # MIN_HEADING_LENGTH = 1
            # len("MySQL") = 5, so 5 < 1 is FALSE
            # This filter passes
            filtered_count += 1
            continue
        
        # FILTER 3: Word count check
        if len(main_topic.split()) < self.MIN_TOPIC_LENGTH:  # Line 198
            # MIN_TOPIC_LENGTH = 1
            # "MySQL".split() = ["MySQL"] → length 1
            # 1 < 1 is FALSE
            # This filter passes
            filtered_count += 1
            continue
        
        # If passes ALL filters, add to topics
        topics.add(main_topic)  # Line 203
        # topics = {"MySQL"}
    
    # Log results
    self.logger.info(...)
    
    return sorted(list(topics))  # Line 212
    # Return: ["MySQL"]
```

---

## Concept Extraction: extract_concepts()

```python
def extract_concepts(markdown: str) -> List[str]:
    """
    Input markdown from a chunk:
    
    ## SELECT Statements
    
    The **SELECT** statement is used to query the database.
    
    Syntax: `SELECT column FROM table`
    
    You can use **WHERE** to filter:
    `SELECT id, name FROM Customers WHERE age > 18`
    
    Common patterns include:
    - Filtering with **WHERE** clauses
    - Ordering with **ORDER BY**
    """
    
    concepts = set()
    
    # STEP 1: Extract bold text (**text**)
    bold_pattern = r"\*\*(.+?)\*\*"
    bold_concepts = re.findall(bold_pattern, markdown)
    # bold_concepts = ["SELECT", "WHERE", "WHERE", "ORDER BY"]
    # After filtering short ones: ["SELECT", "WHERE", "ORDER BY"]
    concepts.update(["SELECT", "WHERE", "ORDER BY"])
    
    # STEP 2: Extract code (?text?)
    code_pattern = r"`([^`]+)`"
    code_concepts = re.findall(code_pattern, markdown)
    # code_concepts = [
    #   "SELECT column FROM table",
    #   "SELECT id, name FROM Customers WHERE age > 18"
    # ]
    # These are too long/complex, filtered out or kept as is
    
    # STEP 3: Extract capitalized phrases
    phrase_pattern = r"\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,2})\b"
    phrases = re.findall(phrase_pattern, markdown)
    # phrases = ["Filtering with", "Ordering with"]
    concepts.update(["Filtering with", "Ordering with"])
    
    # STEP 4: FILTER OUT SQL KEYWORDS AND GENERIC TERMS
    SQL_KEYWORDS = {"SELECT", "FROM", "WHERE", "ORDER BY", ...}
    GENERIC_TERMS = {"Example", "Tutorial", ...}
    
    filtered = [
        c for c in concepts
        if c not in SQL_KEYWORDS       # ← Remove SQL keywords
        and c not in GENERIC_TERMS     # ← Remove generic terms
        and len(c) > 2                 # ← Remove very short
    ]
    
    # filtered = ["Filtering with", "Ordering with"]
    # (SELECT, WHERE, ORDER BY removed as SQL keywords)
    
    return sorted(list(set(filtered)))[:30]
    # Return: ["Filtering with", "Ordering with"]
```

---

## Three-Layer Filtering Visualization

```
                    RAW CONTENT
                        │
        ┌───────────────┼───────────────┐
        │               │               │
        ▼               ▼               ▼
    [Topics]      [Subtopics]     [Concepts]
        │               │               │
        │               │               │
        ├──────────┬────┴────┬──────────┤
        │          │         │          │
    SELECT      SELECT    WHERE    (other SQL)
    FROM        FROM              
    MySQL       MySQL             Customers
    Database    Normalization     PRINT
    Design              
                                  
    LAYER 1: TopicExtractor (firecrawl_service.py)
    ───────────────────────────────────────────
    
    ├─ Extract multi-word phrases (not single words)
    ├─ Filter SQL_KEYWORDS = {SELECT, FROM, WHERE, ...}
    ├─ Filter GENERIC_TERMS = {Example, Tutorial, ...}
    │
    ▼
    
    SELECT      SELECT     WHERE         SELECT
    FROM        FROM       Customers     WHERE
    MySQL       ✗ REMOVED  PRINT         (removed)
    Database    ✗ REMOVED  ✗ REMOVED     (removed)
    Design                 (removed)
    
    LAYER 2: TopicCleanerService (topic_cleaner_service.py)
    ────────────────────────────────────────────────────────
    
    ├─ Check against NOISE_TERMS (250+ patterns)
    │  Including: SELECT, FROM, WHERE, PRINT, Customers, etc.
    ├─ Min length: 3 chars
    │
    ▼
    
    SELECT    ✗ REMOVED    ✗ REMOVED    SELECT
    FROM      ✗ REMOVED    ✗ REMOVED    ✗ REMOVED
    MySQL     ✓ KEPT       ✓ KEPT       (removed)
    Database  ✓ KEPT       (removed)    (removed)
    Design    ✓ KEPT       (removed)    (removed)
    
    LAYER 3: TopicNormalizationService (topic_normalization_service.py)
    ──────────────────────────────────────────────────────────────────
    
    ├─ Check canonical_map for variations
    │  "schema design" → "Database Design"
    │  "querying data" → "Select Statements"
    ├─ Standardize terminology
    │
    ▼
    
    SELECT      (no mapping)  (no mapping)  (removed)
    FROM        (no mapping)  (no mapping)  (removed)
    MySQL       ✓ KEPT        ✓ KEPT        (removed)
    Database    ✓ KEPT        (kept as is)  (removed)
    Design      ✓ KEPT        (kept as is)  (removed)
    
    ═════════════════════════════════════════════════════════════════════
    
    FINAL OUTPUT:
    
    Topics:        ["MySQL", "Database Design"]
    Subtopics:     {"MySQL": ["Database Design"]}
    Concepts:      ["Normalization", "Schema", ...] (only non-SQL concepts)
```

---

## Real Database Query Example

```
1. FETCH chunks from database:

   SELECT heading_path, content, concepts 
   FROM curriculum_chunks 
   WHERE source_id = 1
   
   Results:
   ┌────────────────────────────────┬─────────────┬──────────────┐
   │ heading_path                   │ content     │ concepts     │
   ├────────────────────────────────┼─────────────┼──────────────┤
   │ MySQL > SELECT                 │ "SELECT..." │ ["SELECT"]   │
   │ MySQL > Database Design        │ "Design..." │ ["Normal"]   │
   │ MySQL > FROM                   │ "FROM..."   │ ["FROM"]     │
   │ MySQL > Joins                  │ "JOINs..."  │ ["JOIN"]     │
   └────────────────────────────────┴─────────────┴──────────────┘

2. PROCESS IN _extract_topics():

   for chunk in chunks:
       topic = chunk.heading_path.split(" > ")[0]
       
   Iteration 1: "MySQL > SELECT" → topic = "MySQL"
   Iteration 2: "MySQL > Database Design" → topic = "MySQL"
   Iteration 3: "MySQL > FROM" → topic = "MySQL"
   Iteration 4: "MySQL > Joins" → topic = "MySQL"
   
   topics = {"MySQL"} (set, no duplicates)

3. OUTPUT:
   
   extracted_topics = ["MySQL"]
   extracted_subtopics = {
       "MySQL": ["Database Design", "Joins"]
       # "SELECT" and "FROM" removed as SQL keywords
   }
```

---

## Key Points Summary

| Step | Input | Process | Output |
|------|-------|---------|--------|
| Extract | Markdown | Split by " > ", get first part | Raw topics |
| Clean | Raw topics | Remove NOISE_TERMS (250+ patterns) | Cleaned topics |
| Normalize | Cleaned topics | Map variations to canonical | Final topics |
| Filter Concepts | Raw concepts | Remove SQL keywords, generic terms | Clean concepts |

The three-layer approach ensures SQL keywords like "SELECT", "FROM", "WHERE" are filtered out at different stages, so even if one layer misses something, the others catch it.

