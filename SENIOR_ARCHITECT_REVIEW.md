# Senior Principal Architect Review: Curriculum Discovery System

## Executive Summary

**VERDICT**: This system is a **Knowledge Pack Generator**, not a **Curriculum Generator**.

**Production Readiness**: ⚠️ **NOT PRODUCTION-READY** for an enterprise AI learning platform.

**Critical Issues**: 7 architectural flaws preventing scale and quality.

**Estimated Effort to Production**: 6-8 weeks, 3-4 senior engineers.

---

## Part 1: Architecture Review

### Current System Flow

```
User Input
  ↓
Generate Source URLs (hardcoded patterns)
  ↓
Extract URLs with Firecrawl
  ↓
Chunk Content
  ↓
Extract Topics from Headings (naive string splitting)
  ↓
Save Sources + Chunks + Topics
  ↓
Return Extracted Topics + Subtopics
```

### What This Actually Does

✅ **Correct**: Extracts knowledge from trusted sources  
✅ **Correct**: Organizes knowledge into retrievable chunks  
✅ **Correct**: Identifies document structure through headings  

❌ **Wrong**: Assumes heading hierarchy = learning curriculum  
❌ **Wrong**: Treats extraction noise as valid topics  
❌ **Wrong**: Creates synthetic learning paths from headings  
❌ **Wrong**: No pedagogical structure  
❌ **Wrong**: No learning objectives or prerequisites  
❌ **Wrong**: No assessment or progression model  

---

## Part 2: Critical Architectural Flaws

### FLAW #1: Knowledge Pack ≠ Curriculum

**The Problem**:
```
Knowledge Pack: "Raw extracted content organized into chunks"
Curriculum: "Structured learning design with pedagogy"
```

Current system delivers Knowledge Pack. Clients expect Curriculum.

**Evidence**:
```python
# Current: Extract topics from headings
main_topic = chunk.heading_path.split(" > ")[0]

# Result: ["HTML", "HTML Tutorial", "HTML Forms", "strings"]
# This is document structure, NOT learning structure
```

**Impact**: 
- Topics don't align with learning goals
- No coherent progression from basic→advanced
- Topics like "strings" leak in from unrelated sections
- No connection to learning objectives

**What's Missing**:
```
Curriculum = Knowledge + Pedagogy + Sequencing + Assessment
           ≠ Knowledge alone
```

**Production Architecture Required**:

```
Knowledge Extraction
  ├─ Extract from sources
  └─ Store as source-of-truth chunks

Curriculum Generation
  ├─ Analyze chunks for learning objectives
  ├─ Group chunks into learning modules
  ├─ Determine prerequisites
  ├─ Create progression model
  └─ Design learning paths

Lesson Generation
  ├─ Retrieve relevant chunks
  ├─ Generate explanations from chunks
  ├─ Create exercises from chunk content
  └─ Generate assessments

Teaching Experience
  ├─ Deliver lessons
  ├─ Track progress
  ├─ Adapt based on performance
  └─ Provide feedback
```

**Recommendation**: 
Build a **Curriculum Engine** service separate from knowledge extraction.

---

### FLAW #2: Topic Extraction is Naive and Produces Garbage

**The Problem**:
```python
main_topic = chunk.heading_path.split(" > ")[0].strip()
```

This extracts document headings, not learning topics.

**Evidence from HTML curriculum**:
```
Extracted Topics:
  ✓ "HTML" (good)
  ✓ "HTML Forms" (good)
  ✓ "HTML Media" (good)
  ✗ "HTML Tutorial" (navigation, not topic)
  ✗ "HTML APIs" (vague, contains too much)
  ✗ "HTML Cert" (certification page, not learning)
  ✗ "strings" (off-topic from HTML)
  ✗ "Help improve MDN" (boilerplate)
```

**Root Cause**:
- No semantic understanding of content
- No filtering for pedagogical relevance
- Treats document structure as learning structure
- Noise filters are reactive, not preventive

**What Should Happen**:

```
HTML Content → Semantic Analysis → Learning Topics
  ↓
  "Semantic Elements" → Topic: "HTML Semantics"
  "Form Input Types" → Topic: "Form Elements"  
  "Video/Audio Tags" → Topic: "Multimedia Elements"
  "Help improve MDN" → Filter: "NOISE - discard"
  "strings" → Filter: "OFF-TOPIC - discard"
```

**Production Approach**:

**Option A: LLM-Based Classification**
```python
class TopicClassifier:
    def classify_chunk(self, chunk: Chunk) -> Optional[Topic]:
        """Classify chunk into learning topic using Claude."""
        prompt = f"""
        Analyze this educational content and classify into ONE learning topic.
        
        Content: {chunk.content[:500]}
        
        Respond with:
        {{
            "topic": "specific learning topic",
            "is_valid": true/false,
            "reason": "why this is/isn't a valid topic",
            "learning_objectives": [list of 2-3 learning goals]
        }}
        """
        # Call Claude with structured output
        return LLM.classify(prompt)
```

**Option B: Embedding-Based Clustering**
```python
class TopicClustering:
    def extract_topics(self, chunks: List[Chunk]) -> List[Topic]:
        """Cluster chunks by semantic similarity."""
        # Embed each chunk
        embeddings = [embed_chunk(c) for c in chunks]
        
        # Cluster similar embeddings
        clusters = cluster_embeddings(embeddings, k=5-10)
        
        # Label each cluster
        topics = [label_cluster(c) for c in clusters]
        
        return topics
```

**Option C: Hybrid Approach (Recommended)**
```
1. Use embeddings to cluster chunks
2. Use LLM to label and validate clusters
3. Use heuristics to filter noise
4. Return high-confidence topics only
```

**Recommendation**: 
Implement **Hybrid LLM + Embedding Approach** for topic extraction.

---

### FLAW #3: URL Generation is Guess-and-Check

**The Problem**:
```python
gfg_urls = [
    f"https://www.geeksforgeeks.org/{topic_slug}/",  # May not exist
    f"https://www.geeksforgeeks.org/{topic_clean}/",  # May not exist
]
```

Many generated URLs don't exist. System wastes Firecrawl quota on 404s.

**Evidence**:
```
Topic: "Deep Learning"
Generated: https://www.w3schools.com/deep-learning/  → 404
Generated: https://www.w3schools.com/whatis/deep-learning.asp → 404
Generated: https://roadmap.sh/deep-learning → 404

Success: Only 2 of 7 URLs actually return content
```

**Impact**:
- High Firecrawl cost for failed extractions
- Unreliable curriculum generation
- Poor user experience (long wait times)
- Knowledge gaps (missing topics due to URL misses)

**Production Approach**: Source Discovery Service

```python
class SourceDiscoveryService:
    """Find real content for a topic."""
    
    def discover_sources(self, topic: str) -> List[URL]:
        """
        Strategy:
        1. Query search API (Tavily, Google, Firecrawl Search)
        2. Filter results by domain (trusted only)
        3. Validate URLs (HEAD request)
        4. Rank by relevance
        5. Return top-K verified URLs
        """
        
        # Step 1: Search across multiple APIs in parallel
        search_results = parallel([
            search_tavily(topic),
            search_google(topic),
            search_firecrawl(topic),
        ])
        
        # Step 2: Filter to trusted domains
        trusted = filter_trusted_domains(search_results)
        
        # Step 3: Validate URLs in parallel
        validated = parallel([
            validate_url(url) for url in trusted
        ])
        
        # Step 4: Rank by relevance
        ranked = rank_by_relevance(validated, topic)
        
        # Step 5: Return top sources
        return ranked[:5]
```

**Recommendation**: 
Build **Source Discovery Service** that searches, validates, and ranks URLs.

---

### FLAW #4: Learning Paths are Synthetic and Empty

**The Problem**:
```python
learning_paths.append({
    "title": heading,
    "description": f"Learn {heading}",  # ← Empty template
    "learning_objectives": [f"Understand {heading}"],  # ← Useless
    "prerequisites": [],  # ← Never filled
})
```

Learning paths are just renamed headings, not actual lessons.

**Evidence**:
```
Generated Learning Path:
{
    "title": "HTML Forms > Form Inputs",
    "description": "Learn HTML Forms > Form Inputs",
    "learning_objectives": ["Understand HTML Forms > Form Inputs"],
    "prerequisites": [],
    "estimated_minutes": 25
}

Missing:
- What will users actually LEARN?
- What do they need to know FIRST?
- What EXERCISES will they do?
- How will we ASSESS them?
- What are the LEARNING GOALS?
```

**What Learning Paths Should Contain**:

```python
class LearningPath:
    # What it is
    title: str                          # "Form Validation"
    description: str                    # Clear description
    
    # Why learners take it
    learning_objectives: List[str]      # [
                                        #   "Validate HTML form inputs",
                                        #   "Provide user feedback",
                                        #   "Prevent invalid submissions"
                                        # ]
    
    # Prerequisites
    prerequisites: List[str]            # ["HTML Basics", "HTML Forms"]
    estimated_duration: int             # 45 (minutes)
    
    # Structure
    modules: List[Module]               # [
                                        #   {lesson, exercises, quiz},
                                        #   {lesson, exercises, quiz},
                                        # ]
    
    # Assessment
    assessments: List[Assessment]       # [{knowledge_check}, {project}]
    
    # Outcomes
    learning_outcomes: List[str]        # ["Can build form validation"]
    
    # Progression
    recommended_next: List[str]         # Paths that follow this
```

**Production Architecture**:

```
Knowledge Chunks
    ↓
Curriculum Engine: Create Learning Paths
    ├─ Group related chunks
    ├─ Define learning objectives
    ├─ Establish prerequisites
    ├─ Create progression model
    └─ Design assessments
    ↓
Learning Path Entities
    ├─ Modules (lessons)
    ├─ Exercises
    ├─ Quizzes
    ├─ Projects
    └─ Assessments
```

**Recommendation**: 
Build separate **Curriculum Engine** service that designs learning paths, not just extracts them.

---

### FLAW #5: No Topic→Chunk Relationship Model

**The Problem**:

Current system has:
- Topics (extracted from headings)
- Chunks (extracted from content)

Missing:
- Relationship between topics and chunks
- No way to ask "which chunks cover this topic?"
- No way to build a lesson for a topic

**Current Data Model**:
```
Topic: "HTML Forms"
Chunks: [chunk_1, chunk_2, ..., chunk_N]  ← No relationship!
```

**Required Data Model**:
```
Topic: "HTML Forms"
  ├─ Learning Objective: "Understand form structure and validation"
  ├─ Related Chunks:
  │   ├─ chunk_42 (Form structure: 87% relevant)
  │   ├─ chunk_13 (Input types: 92% relevant)
  │   ├─ chunk_88 (Validation: 95% relevant)
  │   └─ chunk_21 (Accessibility: 72% relevant)
  ├─ Prerequisites:
  │   └─ Topic: "HTML Elements"
  ├─ Exercises:
  │   ├─ "Build a contact form"
  │   └─ "Add form validation"
  └─ Assessments:
      └─ "Form validation quiz"
```

**Database Schema Needed**:

```sql
-- Topics (learning objectives)
CREATE TABLE topics (
    id SERIAL PRIMARY KEY,
    curriculum_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    learning_objectives JSONB,  -- ["understand", "implement", ...]
    prerequisites JSONB,        -- [topic_id, topic_id, ...]
    difficulty VARCHAR(50),
    estimated_duration_minutes INT,
    created_at TIMESTAMP
);

-- Topic-to-Chunk relationships (with relevance)
CREATE TABLE topic_chunk_mappings (
    id SERIAL PRIMARY KEY,
    topic_id INT NOT NULL REFERENCES topics(id),
    chunk_id INT NOT NULL REFERENCES curriculum_chunks(id),
    relevance_score FLOAT,  -- 0.0-1.0
    relationship_type VARCHAR(50),  -- "core", "supporting", "example"
    created_at TIMESTAMP
);

-- Learning Modules (collections of topics)
CREATE TABLE learning_modules (
    id SERIAL PRIMARY KEY,
    curriculum_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    topics JSONB,  -- [topic_id, topic_id, ...]
    sequence_order INT,
    estimated_duration_minutes INT,
    created_at TIMESTAMP
);

-- Lessons (what the user experiences)
CREATE TABLE lessons (
    id SERIAL PRIMARY KEY,
    module_id INT NOT NULL REFERENCES learning_modules(id),
    title VARCHAR(255) NOT NULL,
    
    -- Content
    explanation TEXT,  -- Generated from chunks
    key_concepts JSONB,
    
    -- Engagement
    examples JSONB,    -- [example_1, example_2, ...]
    code_samples JSONB,
    
    -- Practice
    exercises JSONB,   -- [exercise_1, exercise_2, ...]
    quiz JSONB,
    
    -- Assessment
    learning_outcomes JSONB,  -- ["can build X", "understand Y"]
    
    created_at TIMESTAMP
);
```

**Recommendation**: 
Build **Topic-Chunk Relationship Model** to enable lesson generation.

---

### FLAW #6: No Separation Between Curriculum Discovery and Lesson Generation

**The Problem**:

Current system tries to do everything in one flow:
1. Extract sources
2. Extract chunks
3. Extract topics
4. Return response

Missing:
- Curriculum design layer (what to teach)
- Lesson generation layer (how to teach it)
- Content synthesis layer (creating explanations)

**Current Single Monolithic Flow**:
```
discover_curriculum()
  → Extract sources
  → Extract chunks
  → Extract topics
  → Return topics
```

**Production Flow**:
```
Step A: Curriculum Discovery (What to teach)
  discover_curriculum(topic, difficulty)
    → Find sources
    → Extract chunks
    → Extract topics
    → Map topics to chunks
    → Return curriculum structure

Step B: Lesson Generation (How to teach it)
  generate_lesson(topic_id)
    → Retrieve chunks for topic
    → Synthesize explanation
    → Create exercises from chunks
    → Generate assessment
    → Return lesson

Step C: Course Generation (Full experience)
  generate_course(curriculum_id)
    → Get all learning paths
    → Generate all lessons
    → Create assessments
    → Return full course
```

**Recommendation**: 
Separate into **Curriculum Discovery** and **Lesson Generation** services.

---

### FLAW #7: LLM Dependency Without Fallback

**The Problem**:

You said:
> "I do not want to rely entirely on LLMs for curriculum generation."

But the proposed solutions (topic classification, chunk synthesis) require LLMs.

**Current Architecture**:
```
Knowledge = Extracted Sources (OK, no LLM needed)
Structure = Extracted from headings (brittle, produces noise)
```

**Proposed Architecture**:
```
Knowledge = Extracted Sources (OK)
Structure = LLM classification (requires LLM, expensive)
Lessons = LLM synthesis (requires LLM, expensive)
```

**Problem**: Heavy LLM dependency = high cost, latency, hallucinations.

**Production Principle**:
```
Knowledge = Extracted + Stored (source of truth, no LLM)
Structure = Analysis + Clustering (embedding-based, cheap)
Teaching = Retrieval + Generation (LLM optional)
```

**Hybrid Approach** (Recommended):

```python
class CurriculumEngine:
    """Use multiple strategies, each with fallback."""
    
    def extract_topics(self, chunks: List[Chunk]) -> List[Topic]:
        """1. Try embedding clustering (cheap)."""
        try:
            # Fast, cheap, deterministic
            topics = self.cluster_by_embeddings(chunks)
            return topics
        except:
            pass
        
        """2. Fall back to LLM classification (expensive, slow)."""
        try:
            topics = self.classify_with_llm(chunks)
            return topics
        except:
            pass
        
        """3. Fall back to heuristics (basic, but always works)."""
        # Simple frequency-based extraction
        topics = self.extract_by_frequency(chunks)
        return topics
    
    def generate_lesson(self, topic: Topic) -> Lesson:
        """Multiple generation strategies."""
        
        """1. Try to retrieve from pre-curated content."""
        if cached_lesson := self.cache.get(topic.id):
            return cached_lesson
        
        """2. Generate from chunks (preferred, no LLM)."""
        lesson = self.synthesize_from_chunks(topic)
        if lesson.quality > threshold:
            return lesson
        
        """3. Generate with LLM enhancement (expensive)."""
        lesson = self.synthesize_with_llm(topic)
        return lesson
```

**Recommendation**: 
Design **Fallback-Based Architecture** where each layer has multiple strategies.

---

## Part 3: Missing Components

### Missing #1: Source Discovery Service

```python
class SourceDiscoveryService:
    """Find real content for topics."""
    
    def discover_sources(self, topic: str) -> List[Source]:
        # Search: Tavily + Google + Firecrawl Search
        # Validate: HTTP HEAD + trust score
        # Rank: Relevance + authority
        # Return: Top verified sources
```

**Why**: Current URL generation is 30% successful.  
**Impact**: Reliable curriculum discovery.  
**Timeline**: 2 weeks.

---

### Missing #2: Curriculum Design Engine

```python
class CurriculumDesignEngine:
    """Design learning structure."""
    
    def design_curriculum(self, topic: str, 
                         chunks: List[Chunk],
                         difficulty: str) -> Curriculum:
        # Analyze chunks for learning objectives
        # Group into modules
        # Establish prerequisites
        # Create progression
        # Return curriculum structure
```

**Why**: Current system only extracts topics from headings.  
**Impact**: Coherent learning paths.  
**Timeline**: 3 weeks.

---

### Missing #3: Lesson Generation Engine

```python
class LessonGenerationEngine:
    """Create lessons from curriculum."""
    
    def generate_lesson(self, topic: Topic,
                       chunks: List[Chunk]) -> Lesson:
        # Retrieve relevant chunks
        # Synthesize explanation
        # Create exercises
        # Generate assessment
        # Return complete lesson
```

**Why**: Current system doesn't generate lesson content.  
**Impact**: Ready-to-teach lessons.  
**Timeline**: 3 weeks.

---

### Missing #4: Content Synthesis Layer

```python
class ContentSynthesis:
    """Create explanations from chunks."""
    
    def synthesize_explanation(self, 
                              chunks: List[Chunk],
                              topic: str,
                              target_audience: str) -> str:
        # Multi-step approach:
        # 1. Extract key concepts from chunks
        # 2. Order concepts pedagogically
        # 3. Generate explanation for audience
        # 4. Add examples from chunks
        # 5. Validate against source truth
```

**Why**: Lessons need explanations, not just chunks.  
**Impact**: High-quality teaching content.  
**Timeline**: 2 weeks.

---

### Missing #5: Quality Assurance Framework

```python
class CurriculumQualityAssurance:
    """Validate curriculum quality."""
    
    def validate_curriculum(self, curriculum: Curriculum) -> QAReport:
        checks = {
            "topic_relevance": check_topics_match_title(),
            "content_completeness": check_all_topics_covered(),
            "prerequisite_validity": check_prerequisites_exist(),
            "learning_objective_clarity": check_objectives_measurable(),
            "progression_logic": check_difficulty_increases(),
            "assessment_alignment": check_assessments_match_objectives(),
            "source_attribution": check_all_content_attributed(),
            "hallucination_check": check_for_llm_fabrication(),
        }
        return QAReport(checks)
```

**Why**: Current system has no quality gates.  
**Impact**: Reliable output, trust.  
**Timeline**: 1.5 weeks.

---

## Part 4: Production-Ready Architecture

### Recommended Service Architecture

```
┌─────────────────────────────────────────────────────────┐
│              API Layer (REST/GraphQL)                   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────────┐    ┌──────────────────┐          │
│  │  Discovery API   │    │  Lesson API      │          │
│  │  POST /discover  │    │  GET /lesson     │          │
│  │  GET /curriculum │    │  POST /generate  │          │
│  └──────────────────┘    └──────────────────┘          │
│                                                         │
├─────────────────────────────────────────────────────────┤
│              Service Layer                              │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────────────────────────────────────┐      │
│  │  Curriculum Service                          │      │
│  │  - discover_curriculum()                     │      │
│  │  - validate_sources()                        │      │
│  │  - extract_chunks()                          │      │
│  │  - design_curriculum()                       │      │
│  └──────────────────────────────────────────────┘      │
│                          ↓                              │
│  ┌──────────────────────────────────────────────┐      │
│  │  Lesson Service                              │      │
│  │  - generate_lesson()                         │      │
│  │  - synthesize_content()                      │      │
│  │  - create_exercises()                        │      │
│  │  - generate_assessment()                     │      │
│  └──────────────────────────────────────────────┘      │
│                          ↓                              │
│  ┌──────────────────────────────────────────────┐      │
│  │  QA Service                                  │      │
│  │  - validate_curriculum()                     │      │
│  │  - check_quality()                           │      │
│  │  - verify_content()                          │      │
│  └──────────────────────────────────────────────┘      │
│                                                         │
├─────────────────────────────────────────────────────────┤
│              Component Layer                            │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────┐   │
│  │  Source      │  │  Curriculum  │  │  Content   │   │
│  │  Discovery   │  │  Design      │  │  Synthesis │   │
│  │  Service     │  │  Engine      │  │  Engine    │   │
│  └──────────────┘  └──────────────┘  └────────────┘   │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────┐   │
│  │  Firecrawl   │  │  Embedding   │  │  LLM       │   │
│  │  Integration │  │  Service     │  │  Provider  │   │
│  └──────────────┘  └──────────────┘  └────────────┘   │
│                                                         │
├─────────────────────────────────────────────────────────┤
│              Data Layer                                 │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────────────────────────────────────┐      │
│  │  PostgreSQL                                  │      │
│  │  - curriculum_registry                       │      │
│  │  - curriculum_sources                        │      │
│  │  - curriculum_chunks                         │      │
│  │  - topics                                    │      │
│  │  - topic_chunk_mappings                      │      │
│  │  - learning_modules                          │      │
│  │  - lessons                                   │      │
│  │  - exercises                                 │      │
│  │  - assessments                               │      │
│  └──────────────────────────────────────────────┘      │
│                          ↓                              │
│  ┌──────────────────────────────────────────────┐      │
│  │  Vector Database (Pinecone/Weaviate)         │      │
│  │  - chunk_embeddings                          │      │
│  │  - semantic_search_index                     │      │
│  └──────────────────────────────────────────────┘      │
│                          ↓                              │
│  ┌──────────────────────────────────────────────┐      │
│  │  Cache Layer (Redis)                         │      │
│  │  - curriculum_cache                          │      │
│  │  - lesson_cache                              │      │
│  │  - embedding_cache                           │      │
│  └──────────────────────────────────────────────┘      │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

### Recommended Database Schema

```sql
-- KNOWLEDGE LAYER (Source of Truth)

CREATE TABLE curriculum_sources (
    id SERIAL PRIMARY KEY,
    curriculum_id INT NOT NULL,
    url VARCHAR(2048) NOT NULL,
    source_type VARCHAR(100),  -- MDN, W3Schools, etc.
    title VARCHAR(255),
    description TEXT,
    raw_markdown TEXT NOT NULL,
    headings JSONB,
    quality_score FLOAT DEFAULT 0.8,
    verified_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE curriculum_chunks (
    id SERIAL PRIMARY KEY,
    source_id INT NOT NULL REFERENCES curriculum_sources(id),
    chunk_index INT,
    heading_path VARCHAR(512),
    content TEXT NOT NULL,
    token_count INT,
    concepts JSONB,
    embedding VECTOR(1536),  -- OpenAI embedding
    quality_score FLOAT,     -- Content quality
    created_at TIMESTAMP DEFAULT NOW()
);

-- CURRICULUM LAYER (Design)

CREATE TABLE curriculum_registry (
    id SERIAL PRIMARY KEY,
    topic VARCHAR(255) NOT NULL,
    difficulty VARCHAR(50),
    duration VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE topics (
    id SERIAL PRIMARY KEY,
    curriculum_id INT NOT NULL REFERENCES curriculum_registry(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    learning_objectives JSONB,  -- ["understand X", "implement Y"]
    difficulty VARCHAR(50),
    estimated_duration_minutes INT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE topic_chunk_mappings (
    id SERIAL PRIMARY KEY,
    topic_id INT NOT NULL REFERENCES topics(id),
    chunk_id INT NOT NULL REFERENCES curriculum_chunks(id),
    relevance_score FLOAT,      -- 0.0-1.0
    relationship_type VARCHAR(50),  -- core, supporting, example
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE learning_modules (
    id SERIAL PRIMARY KEY,
    curriculum_id INT NOT NULL REFERENCES curriculum_registry(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    topic_ids JSONB,  -- [topic_id, topic_id, ...]
    sequence_order INT,
    estimated_duration_minutes INT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- LESSON LAYER (Teaching)

CREATE TABLE lessons (
    id SERIAL PRIMARY KEY,
    module_id INT NOT NULL REFERENCES learning_modules(id),
    topic_id INT REFERENCES topics(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Content
    explanation TEXT,           -- Generated from chunks
    key_concepts JSONB,
    
    -- Engagement
    examples JSONB,             -- [example, example, ...]
    code_samples JSONB,
    analogies JSONB,            -- Real-world analogies
    
    -- Source attribution
    source_chunk_ids JSONB,     -- [chunk_id, chunk_id, ...]
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE exercises (
    id SERIAL PRIMARY KEY,
    lesson_id INT NOT NULL REFERENCES lessons(id),
    title VARCHAR(255),
    description TEXT,
    difficulty VARCHAR(50),
    exercise_type VARCHAR(50),  -- coding, multiple-choice, essay
    content JSONB,              -- Problem details
    solution JSONB,             -- Expected solution
    test_cases JSONB,           -- For coding exercises
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE assessments (
    id SERIAL PRIMARY KEY,
    lesson_id INT NOT NULL REFERENCES lessons(id),
    type VARCHAR(50),           -- quiz, project, exam
    title VARCHAR(255),
    description TEXT,
    questions JSONB,
    passing_score INT DEFAULT 70,
    created_at TIMESTAMP DEFAULT NOW()
);

-- TRACKING LAYER

CREATE TABLE learning_paths (
    id SERIAL PRIMARY KEY,
    curriculum_id INT NOT NULL,
    title VARCHAR(255),
    description TEXT,
    module_ids JSONB,  -- [module_id, module_id, ...]
    prerequisites JSONB,
    learning_objectives JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

## Part 5: Implementation Roadmap

### Phase 1: Foundation (Weeks 1-2)

**Deliverables**:
- [ ] Topic-Chunk relationship model
- [ ] Database schema for topics
- [ ] Curriculum design framework (rough)

**Why First**: Enables lesson generation in later phases.

---

### Phase 2: Source Discovery (Week 3)

**Deliverables**:
- [ ] Source Discovery Service
- [ ] Tavily/Google/Firecrawl Search integration
- [ ] URL validation and ranking

**Why**: Improve extraction success rate from 30% to 80%+.

---

### Phase 3: Curriculum Design (Weeks 4-5)

**Deliverables**:
- [ ] Embedding-based topic clustering
- [ ] Curriculum Design Engine
- [ ] Learning path generation
- [ ] LLM topic classification (optional, fallback)

**Why**: Create actual curriculum structure, not just extract topics.

---

### Phase 4: Lesson Generation (Weeks 6-7)

**Deliverables**:
- [ ] Content Synthesis Engine
- [ ] Exercise generation
- [ ] Assessment creation
- [ ] QA framework

**Why**: Complete the teaching experience.

---

### Phase 5: Production Hardening (Week 8)

**Deliverables**:
- [ ] Comprehensive QA suite
- [ ] Error handling and fallbacks
- [ ] Performance optimization
- [ ] Caching strategy
- [ ] Observability

**Why**: Production-ready system.

---

## Part 6: Critical Success Factors

### CSF #1: Knowledge ≠ Teaching

```
Don't confuse:
  ✓ Knowledge Extraction (extracting content) 
  ✗ Curriculum Design (structuring learning)
  ✗ Lesson Generation (teaching content)
  ✗ Learning Management (tracking progress)

Implement separately.
```

### CSF #2: Quality Matters More Than Quantity

```
Bad:
  - 1000 topics extracted from noise
  - 10% are actually valid

Good:
  - 50 carefully curated topics
  - 95% validity rate
  
Invest in quality gates.
```

### CSF #3: Avoid Hallucinations

```
Source of Truth: Extracted chunks
Teaching: Derived from chunks only
Never: Fabricate content

Always:
  - Cite sources
  - Validate against chunks
  - QA before release
```

### CSF #4: Embrace Multiple Strategies

```
Don't:
  - Rely 100% on LLMs
  - Rely 100% on heuristics
  - Rely 100% on embeddings

Do:
  - Use embeddings first (cheap)
  - Use LLM for enhancement (only if needed)
  - Fall back to heuristics (always available)
```

---

## Part 7: Conclusions and Recommendations

### What's Wrong

| Issue | Severity | Impact |
|-------|----------|--------|
| Knowledge ≠ Curriculum | CRITICAL | Wrong output type |
| Naive topic extraction | CRITICAL | Garbage input to lessons |
| Synthetic learning paths | HIGH | Not real pedagogy |
| Hardcoded URL patterns | HIGH | 70% failure rate |
| No topic-chunk mapping | HIGH | Can't generate lessons |
| No content synthesis | HIGH | No teaching materials |
| Single-source LLM dep | MEDIUM | Cost, latency, hallucinations |

### What to Build

**Now (Essential)**:
1. Source Discovery Service
2. Topic-Chunk Relationship Model
3. Curriculum Design Engine
4. Quality Assurance Framework

**Soon (1-2 weeks after)**:
1. Content Synthesis Engine
2. Lesson Generation Engine
3. Exercise/Assessment Generation

**Later (Foundation, not yet needed)**:
1. Learning Management System
2. Student Progress Tracking
3. Adaptive Learning Engine

### Critical Architectural Decisions

| Decision | Current | Recommended |
|----------|---------|-------------|
| Topic extraction | String splitting | LLM + Embeddings (hybrid) |
| URL discovery | Hardcoded patterns | Dynamic search + validation |
| Learning path design | Extract from headings | AI curriculum design |
| Lesson generation | None exists | Multi-step synthesis |
| LLM dependency | Not used yet | Optional, with fallbacks |

### Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Topics are noise | HIGH | Product fails | QA framework |
| URLs don't exist | HIGH | 404 waste | Source discovery |
| No real pedagogy | HIGH | Can't teach | Curriculum engine |
| LLM hallucinations | MEDIUM | False content | Fallback strategies |
| Scaling cost | MEDIUM | Unsustainable | Caching + optimization |

---

## Part 8: Honest Assessment

**PRODUCTION READY?** ❌ No

**Why**:
1. Generates knowledge packs, not curricula
2. Topic extraction produces noise
3. No real lesson generation
4. No pedagogical structure
5. No quality assurance
6. Not scalable for enterprise

**SALVAGEABLE?** ✅ Yes

**Timeline**: 6-8 weeks with 3 senior engineers
**Cost**: ~$150K-200K
**Complexity**: Moderate-high

**Recommend**: 
Build the **Curriculum Design Engine** first. Everything else flows from that.

---

## Final Verdict

You have:
✅ Solid knowledge extraction
✅ Good content chunking
✅ Nice caching strategy
✅ Clean code structure

You're missing:
❌ Actual curriculum design
❌ Lesson generation
❌ Pedagogical structure
❌ Quality assurance
❌ Production-grade source discovery

**Action**: Schedule architecture sprint to design the missing Curriculum + Lesson services.
