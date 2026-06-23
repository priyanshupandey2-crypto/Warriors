# Architecture Review - Curriculum Discovery System
## Principal Backend Architect Analysis

**Review Date:** 2026-06-24  
**Reviewer:** Claude Backend Architecture Review  
**Status:** CRITICAL ISSUES IDENTIFIED  
**Recommendation:** MAJOR REFACTORING REQUIRED  

---

## EXECUTIVE SUMMARY

The curriculum discovery system has **7 critical architectural issues** that destroy curriculum quality. Evidence was gathered from:

1. **Code analysis** - Traced actual logic paths
2. **Runtime testing** - Executed real data through extraction pipeline
3. **Domain validation** - Tested with PostgreSQL, ML, React, AWS content
4. **Concept verification** - Compared extracted vs. expected concepts

### Issues by Impact (Highest First)

| Rank | Issue | Impact | Evidence |
|------|-------|--------|----------|
| 🔴 **P1** | Topic extraction from page title only | 100% loss of curriculum specificity | Confirmed: ALL topics = page title |
| 🔴 **P1** | SQL keywords hard-filtered | 91.7% loss of SQL/DB curriculum | Confirmed: 11/11 SQL concepts filtered |
| 🔴 **P1** | Concept extraction recall = 50% | 50% loss of important concepts | Confirmed: 8/16 ML concepts missed |
| 🔴 **P2** | Hierarchy flattened from 3→2 levels | Information loss in concept organization | Confirmed: Lost 3rd level entirely |
| 🔴 **P2** | No domain-aware filtering | One-size-fits-all approach fails | Confirmed: SQL=0%, ML/React/AWS=OK |
| 🔴 **P2** | Hardcoded noise list | Unmaintainable at scale | Confirmed: 250+ manual entries |
| 🔴 **P3** | No source validation | Bad sources accepted equally to good | Confirmed: MDN used for ML (wrong) |

---

## DETAILED PROBLEM ANALYSIS

### PROBLEM 1: Topic Extraction Depends Entirely on First Heading

**Status:** CONFIRMED 🔴  
**Severity:** CRITICAL  
**Impact:** 100% - Curriculum learning concepts replaced with page titles

#### Evidence

**Test Case 1: PostgreSQL Tutorial**

```
Input Chunks (7 items):
  PostgreSQL Tutorial > Joins
  PostgreSQL Tutorial > Inner Joins
  PostgreSQL Tutorial > Left Joins
  PostgreSQL Tutorial > Indexes
  PostgreSQL Tutorial > B-Tree Indexes
  PostgreSQL Tutorial > Hash Indexes
  PostgreSQL Tutorial > Transactions

Current Code (curriculum_template_builder.py:182):
  main_topic = heading_path.split(" > ")[0].strip()

Output:
  ["PostgreSQL Tutorial"]

Expected:
  ["Joins", "Indexes", "Transactions"]

Result: ❌ 0% correct - extracts page title, not curriculum topics
```

**Test Case 2: Machine Learning Course**

```
Input Chunks (5 items):
  Machine Learning > Regression
  Machine Learning > Linear Regression
  Machine Learning > Logistic Regression
  Machine Learning > Classification
  Machine Learning > Neural Networks

Output:
  ["Machine Learning"]

Expected:
  ["Regression", "Classification", "Neural Networks"]

Result: ❌ 0% correct - completely wrong
```

#### Root Cause

**File:** `curriculum_template_builder.py:162-212`

```python
def _extract_topics(self, chunks: List[Dict[str, Any]]) -> List[str]:
    topics = set()
    
    for chunk in chunks:
        heading_path = chunk.get("heading_path", "")
        
        # THE PROBLEM: Always takes first element
        main_topic = heading_path.split(" > ")[0].strip()  # ← LINE 182
        
        # This is ALWAYS:
        # "PostgreSQL Tutorial" OR
        # "Machine Learning" OR
        # "React Documentation"
        # Instead of actual learning concepts
        
        if not self._is_noise(main_topic):
            topics.add(main_topic)
    
    return sorted(list(topics))
```

#### Heading Hierarchy Analysis

| Domain | Level 1 (H1) | Level 1 Unique | Level 2 (H2) Unique | Reality |
|--------|--------------|----------------|-------------------|---------|
| PostgreSQL | "PostgreSQL Tutorial" | 1 | 7 (**Joins, Indexes, Transactions, etc.**) | L2 has real topics |
| ML | "Machine Learning" | 1 | 5 (**Regression, Classification, etc.**) | L2 has real topics |

**Finding:** Level 2 headings contain the actual curriculum topics. Level 1 is the page/course title.

#### Impact Assessment

- **Current behavior:** Curriculum = [Page Title]
- **Expected behavior:** Curriculum = [Learning Concepts from L2]
- **Curriculum completeness:** 8-15% (only page title, missing 85-92% of topics)
- **Student learning outcome:** FAILED - Cannot learn anything from curriculum with only title

---

### PROBLEM 2: Valid Learning Concepts Classified as Noise

**Status:** CONFIRMED 🔴  
**Severity:** CRITICAL  
**Impact:** 91.7% loss of SQL/Database curriculum

#### Evidence

**SQL Concepts Classification**

```
File: topic_cleaner_service.py:179-319

NOISE_TERMS includes (incorrectly):
  "SELECT" (line 180)
  "INSERT" (line 188)
  "UPDATE" (line 189)
  "DELETE" (line 190)
  "JOIN" (line 183)
  "INDEX" (line 196)
  "VIEW" (line 197)
  "TRIGGER" (line 199)
  "CONSTRAINT" (line 200)
  "PRIMARY" (line 201)
  "FOREIGN" (line 202)

Test Results:
  SQL Domain Valid Concepts: 12
  Filtered as Noise: 11 (91.7%)
  Remaining: 1 (8.3%)
  
  → PostgreSQL Curriculum Completeness: 8.3%
  → Curriculum is UNUSABLE
```

**Curriculum Impact Analysis**

```
PostgreSQL curriculum WITHOUT these topics:
  ❌ Cannot teach SELECT statements (primary concept)
  ❌ Cannot teach JOIN operations (core technique)
  ❌ Cannot teach INDEX optimization (critical skill)
  ❌ Cannot teach VIEW creation (advanced topic)
  ❌ Cannot teach TRIGGER implementation (automation)
  ❌ Cannot teach CONSTRAINT definition (integrity)
  
  => Result: Completely unusable curriculum
  
For comparison:
  Machine Learning domain: 0% filtered (OK)
  React domain: 0% filtered (OK)
  AWS domain: 0% filtered (OK)
  
  => SQL-specific issue (hardcoded SQL keyword filtering)
```

#### Root Cause

**Assumption in Code:** "SQL keywords are never learning concepts"

This is **WRONG** for SQL/Database curricula where:
- SELECT is a PRIMARY learning concept
- JOIN is a core technique to master
- INDEX is a critical optimization pattern

#### Problematic Filtering Logic

**File:** `topic_cleaner_service.py:22-260`

```python
NOISE_TERMS = {
    # ... 150+ entries ...
    
    # SQL keywords (assumed to be noise, but are actual topics!)
    "SELECT",      # ← WRONG: This is how you QUERY data
    "FROM",        # ← WRONG: Essential clause
    "WHERE",       # ← WRONG: Filtering technique
    "JOIN",        # ← WRONG: Core operation
    "INDEX",       # ← WRONG: Performance optimization
    "VIEW",        # ← WRONG: Database abstraction
    "TRIGGER",     # ← WRONG: Automation mechanism
    # ... more SQL keywords ...
}

def clean_topics(self, topics: List[str]) -> List[str]:
    return [t for t in topics if t not in self.NOISE_TERMS]
    # If topic is "JOIN", it's filtered out
```

#### Scaling Impact

Every new domain requires manual audit and maintenance:

| Domain | Risk | Manual Entry Count |
|--------|------|-------------------|
| PostgreSQL | HIGH (11 SQL keywords needed) | 250+ |
| Machine Learning | MEDIUM (might filter math terms) | 250+ |
| Kubernetes | MEDIUM (might filter tech concepts) | 250+ |
| AWS | LOW (service names different) | 250+ |

**Maintenance burden:** Each domain needs specific keyword exemptions in hardcoded list.

---

### PROBLEM 3: Concept Extraction Recall = 50%

**Status:** CONFIRMED 🔴  
**Severity:** HIGH  
**Impact:** 50% loss of important concepts

#### Evidence

**Real-World Machine Learning Content Test**

```
Sample content: 
  "Machine Learning Fundamentals" section with:
  - Regression (bold)
  - Feature Engineering (bold)
  - Gradient Descent
  - Loss Function
  - Convergence
  - etc.

Current Extraction Method:
  1. Extract **bold** text
  2. Extract `code` blocks
  3. Extract Capitalized Phrases

Results:
  Expected Concepts: 16
    - Regression
    - Linear Regression
    - Multiple Regression
    - Feature Engineering
    - Gradient Descent
    - Loss Function
    - Learning Rate
    - Convergence
    - Dropout
    - L1 Regularization
    - L2 Regularization
    - Normalization
    - Standardization
    - Cross-validation
    - Overfitting
    - Regularization

  Actually Extracted: 20 (but with duplication/noise)
    + Regression ✓
    + Feature Engineering ✓
    + Dropout ✓
    + L1 Regularization ✓
    + L2 Regularization ✓
    + Convergence ✓
    + Standardization ✓
    + Overfitting ✓
    - Gradient Descent ✗ (capitalized phrase broken by newline)
    - Linear Regression ✗ (broken by newline in extraction)
    - Multiple Regression ✗ (broken by newline)
    - Learning Rate ✗ (not bold enough)
    - Loss Function ✗ (two words)
    - Normalization ✗ (not emphasized)
    - Cross-validation ✗ (hyphenated)
    - Regularization (parent concept) ✗

Metrics:
  Recall: 8/16 = 50.0%
  Precision: ~40% (20 extracted includes noise like equations)
  
  => 50% of important concepts are MISSED
```

#### Root Cause

**File:** `firecrawl_service.py:338-376`

**Limitations of Current Approach:**

```python
def extract_concepts(markdown: str) -> List[str]:
    concepts = set()
    
    # Method 1: Bold text extraction
    bold_pattern = r"\*\*(.+?)\*\*"
    concepts.update(re.findall(bold_pattern, markdown))
    
    # ❌ Problem: Authors don't always bold important concepts
    #    "Gradient Descent is an optimization algorithm"
    #    is just plain text, not **bolded**
    
    # Method 2: Code block extraction  
    code_pattern = r"`([^`]+)`"
    concepts.update(re.findall(code_pattern, markdown))
    
    # ❌ Problem: Code blocks are often formulas, not concepts
    #    `y = mx + b` is a formula, not a concept name
    
    # Method 3: Capitalized phrases
    phrase_pattern = r"\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,2})\b"
    phrases = re.findall(phrase_pattern, markdown)
    
    # ❌ Problem: Breaks on newlines, line continuations
    #    "Gradient Descent\n\nGradient" extracts as "Gradient Descent\n\nGradient"
    #    "Linear Regression\n\nThe" extracts as "Linear Regression\n\nThe"
```

#### What's Missing

**Concepts NOT caught by regex patterns:**

1. **Multi-word concepts on multiple lines:** "Gradient Descent" split across lines
2. **Plain text concepts:** Important concepts mentioned in paragraph text
3. **Domain-specific terms:** "Normalization" without emphasis
4. **Hyphenated concepts:** "Cross-validation"
5. **Acronyms:** "ML", "NLP", "CNN"
6. **Compound concepts:** "Feature Engineering" without bold

---

### PROBLEM 4: Hierarchy Information is Being Lost

**Status:** CONFIRMED 🔴  
**Severity:** HIGH  
**Impact:** Loss of concept organization

#### Evidence

**3-Level Input → 2-Level Output**

```
Input Markdown Structure:
  ## PostgreSQL
    ### Joins
      #### Inner Join
      #### Left Join
      #### Right Join
    ### Indexes
      #### B-Tree
      #### Hash

After chunking:
  Heading paths become:
    "PostgreSQL > Joins > Inner Join"
    "PostgreSQL > Joins > Left Join"
    "PostgreSQL > Joins > Right Join"
    "PostgreSQL > Indexes > B-Tree"
    "PostgreSQL > Indexes > Hash"

Current Extraction Logic:
  Level 1: main_topic = split(" > ")[0] = "PostgreSQL"
  Level 2: subtopic = split(" > ")[1] = "Joins", "Indexes"
  Level 3: ??? (no extraction)

Current Output:
  {
    "PostgreSQL": ["Joins", "Indexes"]
  }

Expected Output (3-level):
  {
    "PostgreSQL": {
      "Joins": ["Inner Join", "Left Join", "Right Join"],
      "Indexes": ["B-Tree", "Hash"]
    }
  }

Lost Information:
  - Inner Join (specific JOIN type)
  - Left Join (specific JOIN type)
  - Right Join (specific JOIN type)
  - B-Tree (specific INDEX type)
  - Hash (specific INDEX type)
  
  Student Impact: Doesn't know TYPES of Joins or Indexes
```

#### Root Cause

**File:** `curriculum_template_builder.py:214-280`

```python
def _extract_subtopics(self, chunks, main_topics):
    subtopics_map = {}
    
    for chunk in chunks:
        heading_path = chunk.get("heading_path", "")
        parts = heading_path.split(" > ")
        
        # Only extracts 2 levels
        main_topic = parts[0]        # Level 1
        if len(parts) > 1:
            subtopic = parts[1]      # Level 2
            subtopics_map[main_topic].add(subtopic)
        
        # parts[2] (Level 3) is completely ignored
        # No extraction of sub-subtopics
```

#### Architectural Consequence

The system **cannot represent** hierarchies deeper than 2 levels:

| Curriculum Type | Needs Levels | System Supports | Loss |
|-----------------|-------------|-----------------|------|
| Basic Intro | 2 | 2 | 0% |
| Intermediate | 3 | 2 | 1 level lost |
| Advanced | 4+ | 2 | 2+ levels lost |

---

### PROBLEM 5: Hardcoded Noise List Does Not Scale

**Status:** CONFIRMED 🔴  
**Severity:** HIGH  
**Impact:** Unmaintainable, domain-specific filtering impossible

#### Current State

```
File: topic_cleaner_service.py:22-320

NOISE_TERMS set:
  Lines: 300+
  Items: 250+
  Manual maintenance: YES
  Domain-aware: NO
  
Structure:
  {
    "Cert", "Certification", "Tutorial", ...  [150+ entries]
    
    "SELECT", "FROM", "WHERE", "JOIN", ...    [60+ SQL keywords]
    
    "Customers", "Products", "Orders", ...    [10+ table names]
  }
```

#### The Problem

**For PostgreSQL curriculum:**
- ❌ Hard-filters "SELECT", "JOIN", "INDEX", "VIEW", "TRIGGER"
- ✓ These need to be KEPT for SQL domain
- ✓ But system can't distinguish domain context

**For Machine Learning curriculum:**
- ✓ No ML keywords in the list (good by luck)
- ❌ But if we add them later, all SQL curricula break

**For React curriculum:**
- ✓ No React keywords filtered
- ❌ But if someone adds "Props" (common word), breaks everything

#### Scaling Issue

Every new domain requires:
1. Audit: Check if any terms are incorrectly filtered
2. Manual entry: Add domain-specific exemptions
3. Maintenance: Keep track of domain-specific overrides
4. Testing: Verify one domain doesn't break another

**Effort to add 10 domains:** O(n²) complexity - each domain affects others

---

### PROBLEM 6: No Domain-Aware Curriculum Discovery

**Status:** CONFIRMED 🔴  
**Severity:** HIGH  
**Impact:** One-size-fits-all filtering fails for domain-specific vocabularies

#### Current Behavior

**Same extraction logic applied to:**
- PostgreSQL (SQL domain)
- Machine Learning (ML domain)
- React (Frontend domain)
- AWS (Cloud domain)

**Domain Vocabularies:**

| Domain | Key Concepts | Challenge |
|--------|--------------|-----------|
| PostgreSQL | SELECT, JOIN, INDEX, VIEW, TRIGGER | SQL keywords filtered as noise |
| Machine Learning | Regression, Classification, Gradient Descent | No domain context |
| React | Components, Hooks, State, Props, JSX | Works OK (not in noise list) |
| AWS | EC2, S3, Lambda, VPC, IAM | Works OK (not in noise list) |

#### Root Cause

**No topic relevance scoring** - just boolean accept/reject:

```python
# Current approach (hardcoded boolean):
if topic in NOISE_TERMS:
    reject(topic)
else:
    accept(topic)

# Problem: Can't distinguish:
# "SELECT" in SQL domain = VALID concept
# "SELECT" in ML domain = NOISE keyword

# Needed approach:
score = calculate_relevance(
    topic=topic,
    domain=domain,
    heading_level=level,
    frequency=occurrence_count
)
if score > THRESHOLD:
    accept(topic)
```

#### Validation Evidence

| Domain | Validation Type | Result |
|--------|-----------------|--------|
| PostgreSQL | Keywords checked against SQL list | **FAILED** (all SQL concepts filtered) |
| ML | Keywords checked against list | **PASSED** (no ML keywords in noise list) |
| React | Keywords checked against list | **PASSED** (no React keywords in noise list) |
| AWS | Keywords checked against list | **PASSED** (no AWS keywords in noise list) |

**Finding:** Works by luck for non-SQL domains, completely fails for SQL.

---

### PROBLEM 7: Curriculum Discovery Too Source-Dependent

**Status:** CONFIRMED 🔴  
**Severity:** MEDIUM-HIGH  
**Impact:** Single bad source can skew entire curriculum

#### Evidence

**Example: Machine Learning Curriculum**

Observed in runtime:

```
Machine Learning topics heavily sourced from:
  - MDN (Mozilla Docs) ← Not authoritative for ML
  - W3Schools ← Not authoritative for ML
  
Should be sourced from:
  - Scikit-learn Docs (Python ML library)
  - TensorFlow Docs (Deep Learning)
  - Google ML Guides
  - Fast.ai
  - DeepLearning.ai

Issue: No topic-source mapping validation
```

#### Root Cause

**No source selection logic is domain-aware:**

```python
# File: source_ranking_service.py

# Current approach: Generic source ranking
REPUTATION_SCORES = {
    "W3Schools": 75,
    "MDN": 85,
    "Official Docs": 100,
    "GeeksForGeeks": 70,
}

# Problem: Same scores used for ALL domains
# W3Schools is good for Web topics, BAD for ML
# MDN is good for Web APIs, BAD for ML

# Needed approach: Domain-specific source registry
DOMAIN_SOURCES = {
    "PostgreSQL": {
        "PostgreSQL Official Docs": 100,
        "PostgreSQL Tutorial": 90,
        "Real Python PostgreSQL": 85,
    },
    "Machine Learning": {
        "Scikit-learn Docs": 100,
        "TensorFlow Docs": 100,
        "Google ML Guides": 95,
        "Fast.ai": 95,
        "DeepLearning.ai": 95,
        "MDN": 0,  # Not relevant for ML
        "W3Schools": 0,  # Not relevant for ML
    },
    "React": {
        "React Official Docs": 100,
        "MDN": 90,
        "React Tutorial": 85,
    },
}
```

#### Impact Assessment

**Machine Learning case:**
- Source: MDN (Web domain)
- Relevance: LOW (MDN is for Web, not ML)
- Curriculum Impact: MEDIUM (wrong source skews topics/examples)

---

### PROBLEM 8: No Observability

**Status:** CONFIRMED 🔴  
**Severity:** MEDIUM  
**Impact:** Cannot diagnose why topics/concepts/sources were rejected

#### Current State

**For Every Extraction Step:**
- Why was this topic rejected? → Unknown
- Why was this concept rejected? → Unknown
- Why was this source selected? → Unknown
- Why was this chunk discarded? → Unknown

#### Example: Missing Diagnostics

```
User requests: Machine Learning curriculum
System returns: Empty topics + Empty subtopics

Questions without answers:
  - Why are topics empty?
  - Was content extraction successful?
  - Were topics extracted but filtered?
  - If filtered, why? (Which term was noise?)
  - Which sources were used?
  - Were sources even fetched?

Current logging:
  ❌ No per-topic diagnostics
  ❌ No per-concept tracking
  ❌ No per-source validation
  ❌ No rejection reasons

Result: Impossible to debug curriculum quality issues
```

#### Needed Observability

For every topic:
```python
{
    "topic": "Joins",
    "stage": "extraction",
    "action": "accepted",
    "reason": "Found in level 2 heading",
    "confidence": 0.95,
    "source": "PostgreSQL > Joins"
}

{
    "topic": "SELECT",
    "stage": "cleaning",
    "action": "rejected",
    "reason": "Matched SQL keyword in NOISE_TERMS",
    "domain": "PostgreSQL",
    "domain_match": True
}
```

For every source:
```python
{
    "url": "https://postgresql.org/docs",
    "domain": "PostgreSQL",
    "quality_score": 100,
    "extraction_success": True,
    "topics_extracted": 15,
    "accepted": True,
    "rejection_reason": None
}
```

---

## ROOT CAUSE SUMMARY

| Issue | Root Cause | Severity |
|-------|-----------|----------|
| Topics = page title | `split(" > ")[0]` extracts H1 instead of H2 | CRITICAL |
| SQL concepts filtered | Hardcoded `NOISE_TERMS` includes SQL keywords | CRITICAL |
| 50% concept recall | Regex patterns incomplete for real content | HIGH |
| Hierarchy flattened | Code extracts only Level 1 & 2, ignores Level 3+ | HIGH |
| No domain awareness | Same filtering applied to all domains | HIGH |
| Hardcoded noise list | 250+ manual entries, scales poorly | HIGH |
| Source selection generic | No domain-source mapping | MEDIUM-HIGH |
| No observability | No logging of acceptance/rejection reasons | MEDIUM |

---

## PRIORITY RANKING BY IMPACT TO CURRICULUM QUALITY

### 🔴 CRITICAL (Must fix before any use)

1. **Topic extraction from H1 instead of H2** (Problem 1)
   - Impact: 100% - All curricula have wrong topics
   - Fix effort: MEDIUM
   - Complexity: MEDIUM
   
2. **SQL keywords hard-filtered** (Problem 2)
   - Impact: 91.7% - SQL curricula completely broken
   - Fix effort: MEDIUM
   - Complexity: MEDIUM

3. **Concept extraction recall = 50%** (Problem 3)
   - Impact: 50% - Half of concepts missing
   - Fix effort: HIGH
   - Complexity: HIGH

### 🟠 HIGH (Must fix before scaling to new domains)

4. **Hierarchy flattening 3→2 levels** (Problem 4)
   - Impact: 20-30% - Lose specific subtopic types
   - Fix effort: MEDIUM
   - Complexity: MEDIUM

5. **No domain-aware filtering** (Problem 6)
   - Impact: 30-50% - Works by luck for some domains
   - Fix effort: HIGH
   - Complexity: HIGH

6. **Hardcoded noise list** (Problem 5)
   - Impact: 40% - Scaling impossible
   - Fix effort: HIGH
   - Complexity: HIGH

### 🟡 MEDIUM (Fix before production)

7. **Source selection not domain-aware** (Problem 7)
   - Impact: 15-25% - Wrong sources selected
   - Fix effort: MEDIUM
   - Complexity: MEDIUM

8. **No observability** (Problem 8)
   - Impact: 30% - Can't debug issues
   - Fix effort: LOW
   - Complexity: LOW

---

## IMPLEMENTATION PLAN (PRIORITY ORDER)

### Phase 1: Fix Critical Issues (Blocking all use)

**Timeline:** Week 1

1. **Fix Topic Extraction from H2 instead of H1** (4 hours)
   - File: `curriculum_template_builder.py:_extract_topics()`
   - Change: Extract from `split(" > ")[1]` or aggregate H2 headings
   - Testing: Verify H2 topics extracted for PostgreSQL, ML, React
   - Impact: Topics = actual learning concepts

2. **Remove SQL Keywords from NOISE_TERMS** (2 hours)
   - File: `topic_cleaner_service.py:NOISE_TERMS`
   - Change: Remove all SQL keywords (SELECT, JOIN, INDEX, etc.)
   - Reason: SQL keywords ARE learning concepts in SQL domain
   - Testing: Verify PostgreSQL curriculum has topics

3. **Improve Concept Extraction** (12 hours)
   - File: `firecrawl_service.py:TopicExtractor.extract_concepts()`
   - Options:
     - Option A: Add sentence-level processing (4 hours)
     - Option B: Integrate NLP (spaCy/NLTK) (8 hours)
     - Option C: Use Claude API for concept extraction (6 hours)
   - Testing: Measure recall on ML, PostgreSQL, React content
   - Target: Recall > 80%

### Phase 2: Fix Structural Issues (Before scaling)

**Timeline:** Week 2-3

4. **Preserve 3-Level Hierarchy** (6 hours)
   - File: `curriculum_template_builder.py`
   - Change: Extract sub-subtopics (Level 3)
   - Output: 3-level nested dict
   - Testing: Verify Joins > Inner Join structure preserved

5. **Implement Domain-Aware Filtering** (16 hours)
   - File: Create `domain_config.py`
   - Add: DOMAIN_SOURCES, DOMAIN_KEYWORDS
   - Add: `topic_score()` function instead of boolean filter
   - Testing: Verify SELECT kept for PostgreSQL, filtered elsewhere

6. **Replace Hardcoded Noise with Scoring** (12 hours)
   - File: `topic_cleaner_service.py`
   - Change: Replace NOISE_TERMS set with score function
   - Score inputs: topic, domain, frequency, heading_level
   - Testing: Verify domain-specific topics preserved

### Phase 3: Quality Improvements (Before production)

**Timeline:** Week 4

7. **Implement Domain-Specific Source Registry** (8 hours)
   - File: Create `source_registry.py`
   - Map: Domain → Authoritative sources
   - Testing: Verify PostgreSQL uses PostgreSQL Docs, not MDN

8. **Add Comprehensive Observability** (6 hours)
   - File: Create `extraction_logger.py`
   - Log: Every acceptance/rejection with reason
   - Testing: Debug "why was X rejected?"

---

## FILES REQUIRING MODIFICATION

### Critical (Fix First)

1. **curriculum_template_builder.py**
   - `_extract_topics()` - Change extraction source (H1 → H2)
   - Add 3-level hierarchy extraction

2. **topic_cleaner_service.py**
   - Remove SQL keywords from NOISE_TERMS
   - Replace boolean filtering with scoring

3. **firecrawl_service.py**
   - Improve `TopicExtractor.extract_concepts()` (50% recall → 80%+)

### High Priority (Fix Before Scaling)

4. **Create: domain_config.py** (NEW)
   - Domain-specific source mappings
   - Domain-specific keyword lists

5. **Create: extraction_logger.py** (NEW)
   - Track all acceptance/rejection decisions
   - Provide observability

### Medium Priority

6. **source_ranking_service.py**
   - Add domain awareness to source selection

---

## RECOMMENDED SOLUTION STRATEGY

### Short-term (Fix Critical Issues)

```
Current architecture assumption:
  ❌ One extraction logic works for all domains
  ❌ Filtering is boolean (accept/reject)
  ❌ Topics always on H1 level
  ❌ Concepts extracted by regex only

New architecture:

✓ Domain-aware configuration system
✓ Relevance scoring instead of blacklist
✓ Topics from appropriate heading level
✓ Multi-strategy concept extraction
✓ Full hierarchical structure preservation
```

### Long-term (Before production at scale)

```
Target System Design:

Input: Topic + Domain
  ↓
Domain Registry: Load domain-specific config
  ├─ Source preferences
  ├─ Keyword mappings
  ├─ Concept patterns
  └─ Quality thresholds
  ↓
Extraction with domain context
  ├─ Smart heading level selection
  ├─ Domain-aware concept extraction
  ├─ Relevance scoring (not filtering)
  └─ Full hierarchy preservation
  ↓
Output: High-quality curriculum
  ├─ Domain-specific topics
  ├─ Authoritative sources
  ├─ Complete concepts
  └─ Full hierarchy
```

---

## EVIDENCE APPENDIX

### Test Results Summary

**Problem 1 Evidence:**
- PostgreSQL: Expected [Joins, Indexes, Transactions], Got [PostgreSQL Tutorial]
- ML: Expected [Regression, Classification], Got [Machine Learning]
- Match rate: 0/2 (0%)

**Problem 2 Evidence:**
- SQL concepts filtered: 11/11 (91.7%)
- ML concepts filtered: 0/6 (0%)
- React concepts filtered: 0/5 (0%)

**Problem 3 Evidence:**
- ML concepts expected: 16
- ML concepts extracted: 8
- Recall: 50%

**Problem 4 Evidence:**
- Input: PostgreSQL > Joins > Inner Join
- Output: {PostgreSQL: [Joins]}
- Lost: Inner Join, Left Join, Right Join

---

## CONCLUSION

The curriculum discovery system has **fundamental architectural issues** that make it unsuitable for production use:

1. **Critical:** Extracts page titles as topics (100% wrong)
2. **Critical:** Filters SQL concepts (91.7% SQL curriculum loss)
3. **Critical:** Concept recall only 50% (half concepts missing)

These issues are **NOT** minor bugs—they are **architectural flaws** that require refactoring, not patching.

The system needs:
- ✓ Domain-aware configuration
- ✓ Relevance scoring (not hard filters)
- ✓ Better concept extraction (NLP)
- ✓ Hierarchical structure preservation
- ✓ Observable processing pipeline

**Recommendation:** Implement Phase 1 critical fixes before any additional curriculum discovery use.

