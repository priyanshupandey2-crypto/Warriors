# AI Generation Layer - Integration Guide

## System Integration Overview

The AI Generation Layer is designed to integrate seamlessly with other Capstone components while maintaining independence for standalone use.

## Architecture Context

```
┌─────────────────────────────────────────────────────────────┐
│                   CAPSTONE PROJECT                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │  Web Search  │    │ RAG Engine   │    │  Vector DB   │  │
│  └──────┬───────┘    └──────┬───────┘    └──────┬───────┘  │
│         │                   │                    │           │
│         │   ┌───────────────┼────────────────┐   │           │
│         │   │               │                │   │           │
│         ▼   ▼               │                ▼   ▼           │
│  ┌──────────────────────────┼────────────────────────────┐  │
│  │    Research Engine        │                           │  │
│  │    (generates context)    │                           │  │
│  └────────────┬──────────────┼────────────────┬──────────┘  │
│               │              │                │              │
│               ▼              ▼                │              │
│       ┌─────────────────────────────┐        │              │
│       │ AI Generation Layer ◄──────┘ Uses    │ Store        │
│       │  (THIS COMPONENT)            context │              │
│       │                                      │              │
│       │ Stage 1: Outline             ───────┘              │
│       │ Stage 2: Content                                   │
│       │ Stage 3: Assessments                               │
│       │                                                     │
│       └────────────────┬─────────────────────────────────┘  │
│                        │                                    │
│                        │ Outputs                            │
│                        ▼                                    │
│       ┌──────────────────────────────┐                     │
│       │ Frontend / UI Layer          │                     │
│       │ - Curriculum Display         │                     │
│       │ - Student Learning Platform  │                     │
│       │ - Progress Tracking          │                     │
│       └──────────────────────────────┘                     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Integration Points

### 1. With Research Engine

**Use Case:** Ground generated content in research findings

```python
from ai_research_engine.src import AIResearchEngine
from ai_layer import AIGenerationLayer, GenerationRequest, DifficultyLevel

# Step 1: Research the topic
research_engine = AIResearchEngine()
research_result = research_engine.research(
    topic="Machine Learning",
    difficulty=DifficultyLevel.INTERMEDIATE,
    targetAudience="Software engineers"
)

# Step 2: Use research as context for generation
request = GenerationRequest(
    topic="Introduction to Machine Learning",
    difficulty=DifficultyLevel.INTERMEDIATE,
    target_audience="Software engineers with Python knowledge",
    duration_weeks=8,
    tags=["machine-learning", "python"],
    context=f"Research context:\n{research_result.topic_overview.summary}"
)

# Step 3: Generate curriculum grounded in research
generation_layer = AIGenerationLayer()
result = generation_layer.generate(request)
```

**Benefits:**
- ✓ Content grounded in verified sources
- ✓ Current industry standards incorporated
- ✓ Evidence-based curriculum design

### 2. With RAG Engine

**Use Case:** Retrieve and use document content in curriculum

```python
from ai_research_engine.src.rag_engine import RAGEngine
from ai_layer import AIGenerationLayer, GenerationRequest, DifficultyLevel

# Step 1: Index documents with RAG
rag_engine = RAGEngine()
rag_engine.add_documents([
    "path/to/doc1.pdf",
    "path/to/doc2.md",
    "path/to/reference_material/"
])

# Step 2: Retrieve relevant content
context_chunks = rag_engine.retrieve(
    query="core concepts in machine learning",
    top_k=5
)

# Step 3: Use retrieved content in generation request
context_text = "\n".join([c["content"] for c in context_chunks])
request = GenerationRequest(
    topic="Machine Learning Fundamentals",
    difficulty=DifficultyLevel.INTERMEDIATE,
    target_audience="Data scientists",
    duration_weeks=6,
    context=f"Reference material:\n{context_text}"
)

generation_layer = AIGenerationLayer()
result = generation_layer.generate(request)
```

**Benefits:**
- ✓ Content aligned with existing materials
- ✓ Consistent terminology and frameworks
- ✓ No duplication of concepts

### 3. With Vector Database

**Use Case:** Store and retrieve generated curricula

```python
from ai_research_engine.src.vector_db import VectorDB
from ai_layer import AIGenerationLayer, save_generation_result
import json

# Step 1: Generate curriculum
generation_layer = AIGenerationLayer()
result = generation_layer.generate(request)

# Step 2: Save and extract content
output_dir = save_generation_result(result)

# Step 3: Index in vector database
vector_db = VectorDB()

# Index outline
vector_db.add_text(
    f"Course: {result.stage_1_outline.title}",
    metadata={
        "type": "course_outline",
        "course_id": result.stage_2_content.course_id,
        "difficulty": result.stage_1_outline.difficulty.value,
    }
)

# Index lessons
for lesson in result.stage_2_content.lessons:
    vector_db.add_text(
        f"{lesson.title}\n{lesson.introduction}",
        metadata={
            "type": "lesson",
            "lesson_id": lesson.lesson_id,
            "course_id": result.stage_2_content.course_id,
        }
    )

# Index assessments
for quiz in result.stage_3_assessments.lesson_quizzes:
    for q in quiz.quiz_questions:
        vector_db.add_text(
            q.question_text,
            metadata={
                "type": "quiz_question",
                "lesson_id": quiz.lesson_id,
                "course_id": result.stage_2_content.course_id,
            }
        )

# Step 4: Retrieve later
search_results = vector_db.search("how to build machine learning models")
```

**Benefits:**
- ✓ Semantic search over curriculum
- ✓ Cross-course concept discovery
- ✓ Student recommendation engine foundation

### 4. With Frontend/UI

**Use Case:** Display curriculum in web interface

```python
from ai_layer import AIGenerationLayer, export_to_markdown
import json

# Backend: Generate curriculum
generation_layer = AIGenerationLayer()
result = generation_layer.generate(request)

# Convert to JSON for API
curriculum_json = {
    "course": result.stage_1_outline.model_dump(),
    "lessons": [l.model_dump() for l in result.stage_2_content.lessons],
    "quizzes": [q.model_dump() for q in result.stage_3_assessments.lesson_quizzes],
    "capstones": [c.model_dump() for c in result.stage_3_assessments.capstone_projects],
    "metadata": {
        "total_duration_seconds": result.total_duration_seconds,
        "generation_timestamp": result.generation_timestamp,
    }
}

# API Endpoint
from flask import Flask, jsonify
app = Flask(__name__)

@app.route('/api/curriculum/<topic>')
def get_curriculum(topic):
    # Generate on-demand or retrieve from cache
    result = generation_layer.generate(request)
    return jsonify(result.model_dump())

@app.route('/api/curriculum/<course_id>/lesson/<lesson_id>')
def get_lesson(course_id, lesson_id):
    lesson = next(
        l for l in result.stage_2_content.lessons 
        if l.lesson_id == lesson_id
    )
    return jsonify(lesson.model_dump())

@app.route('/api/curriculum/<course_id>/quiz/<quiz_id>')
def get_quiz(course_id, quiz_id):
    quiz = next(
        q for q in result.stage_3_assessments.lesson_quizzes
        if q.lesson_id == quiz_id
    )
    return jsonify(quiz.model_dump())
```

## Data Flow Examples

### Complete Workflow

```
┌─────────────────────────────────────────────────────────────┐
│ USER REQUEST                                                │
│ "Create a course on Data Science for beginners"             │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
    ┌────────────────────────────┐
    │ Research Engine            │
    │ - Search web for resources │
    │ - Extract key concepts     │
    │ - Identify sources         │
    └────────────┬───────────────┘
                 │ Research findings
                 ▼
    ┌────────────────────────────┐
    │ RAG Engine                 │
    │ - Index reference docs     │
    │ - Retrieve relevant chunks │
    │ - Extract structured info  │
    └────────────┬───────────────┘
                 │ Retrieved context
                 ▼
    ┌────────────────────────────┐
    │ AI Generation Layer        │
    │ - Stage 1: Outline         │
    │ - Stage 2: Content         │
    │ - Stage 3: Assessments     │
    └────────────┬───────────────┘
                 │ Generated curriculum
                 ▼
    ┌────────────────────────────┐
    │ Vector DB Storage          │
    │ - Index all content        │
    │ - Enable semantic search   │
    └────────────┬───────────────┘
                 │ Indexed & searchable
                 ▼
    ┌────────────────────────────┐
    │ Frontend Display           │
    │ - Show course overview     │
    │ - Navigate lessons         │
    │ - Take quizzes             │
    │ - Track progress           │
    └────────────────────────────┘
```

## Integration Patterns

### Pattern 1: Context-Aware Generation

Use research findings to enhance curriculum:

```python
def create_context_aware_curriculum(topic: str) -> GenerationResult:
    """Generate curriculum informed by research"""
    
    # Research phase
    research_engine = AIResearchEngine()
    research = research_engine.research(topic=topic, ...)
    
    # RAG phase (optional)
    rag_engine = RAGEngine()
    docs = rag_engine.retrieve(query=topic, top_k=3)
    
    # Generation phase
    context = f"""
    Research: {research.topic_overview.summary}
    Industry Context: {research.topic_overview.industry_context}
    Sources: {', '.join([s.title for s in research.research_sources[:3]])}
    Retrieved Materials: {' '.join([d['content'][:200] for d in docs])}
    """
    
    request = GenerationRequest(
        topic=topic,
        context=context,
        ...
    )
    
    return AIGenerationLayer().generate(request)
```

### Pattern 2: Incremental Curriculum Building

Build curriculum piece by piece:

```python
def build_curriculum_incrementally(topics: list[str]) -> list[GenerationResult]:
    """Generate curricula for multiple related topics"""
    
    layer = AIGenerationLayer()
    results = []
    context = ""
    
    for topic in topics:
        request = GenerationRequest(
            topic=topic,
            context=f"Prerequisites: {context}",
            ...
        )
        result = layer.generate(request)
        results.append(result)
        
        # Use previous curriculum as context for next
        context = f"{topic}: {result.stage_1_outline.title}"
    
    return results
```

### Pattern 3: Personalized Path Generation

Adapt curriculum to learner profile:

```python
def create_personalized_curriculum(
    topic: str,
    learner_background: str,
    learner_goals: str,
    time_available_hours: int
) -> GenerationResult:
    """Generate personalized curriculum"""
    
    weeks = time_available_hours // 10  # Estimate 10 hrs/week
    
    request = GenerationRequest(
        topic=topic,
        duration_weeks=weeks,
        target_audience=learner_background,
        context=f"""
        Learner Goals: {learner_goals}
        Available Time: {time_available_hours} hours
        Background: {learner_background}
        """,
    )
    
    return AIGenerationLayer().generate(request)
```

## Database Integration

### Storing Generated Content

```python
from sqlalchemy import create_engine, Column, String, Text, DateTime
from sqlalchemy.orm import declarative_base, Session
from datetime import datetime
from ai_layer import GenerationResult

Base = declarative_base()

class Curriculum(Base):
    __tablename__ = "curricula"
    
    id = Column(String, primary_key=True)
    topic = Column(String, index=True)
    difficulty = Column(String)
    total_hours = Column(int)
    course_json = Column(Text)  # JSON of stage 1
    content_json = Column(Text)  # JSON of stage 2
    assessments_json = Column(Text)  # JSON of stage 3
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

def save_curriculum_to_db(result: GenerationResult, db: Session):
    """Save generated curriculum to database"""
    curriculum = Curriculum(
        id=result.stage_2_content.course_id,
        topic=result.request.topic,
        difficulty=result.stage_1_outline.difficulty.value,
        total_hours=result.stage_1_outline.total_hours,
        course_json=result.stage_1_outline.model_dump_json(),
        content_json=result.stage_2_content.model_dump_json(),
        assessments_json=result.stage_3_assessments.model_dump_json(),
    )
    db.add(curriculum)
    db.commit()

def load_curriculum_from_db(curriculum_id: str, db: Session) -> GenerationResult:
    """Load curriculum from database"""
    curriculum = db.query(Curriculum).filter(Curriculum.id == curriculum_id).first()
    if curriculum:
        return GenerationResult(
            # Reconstruct from JSON
        )
```

## API Interface

### REST Endpoints

```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI(title="AI Generation API")

class CurriculumRequest(BaseModel):
    topic: str
    difficulty: str  # "beginner", "intermediate", "advanced"
    target_audience: str
    duration_weeks: int
    tags: list[str] = []

@app.post("/api/v1/generate-curriculum")
async def generate_curriculum(req: CurriculumRequest):
    """Generate new curriculum"""
    try:
        request = GenerationRequest(
            topic=req.topic,
            difficulty=DifficultyLevel(req.difficulty),
            target_audience=req.target_audience,
            duration_weeks=req.duration_weeks,
            tags=req.tags,
        )
        layer = AIGenerationLayer()
        result = layer.generate(request)
        return result.model_dump()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/curriculum/{course_id}")
async def get_curriculum(course_id: str):
    """Retrieve existing curriculum"""
    # Load from DB or cache
    pass

@app.get("/api/v1/curriculum/{course_id}/lessons")
async def get_lessons(course_id: str):
    """Get all lessons for course"""
    pass

@app.get("/api/v1/curriculum/{course_id}/lesson/{lesson_id}")
async def get_lesson(course_id: str, lesson_id: str):
    """Get specific lesson"""
    pass
```

## Performance Considerations

### Caching Strategy

```python
from functools import lru_cache
from hashlib import sha256

class CurriculumCache:
    def __init__(self):
        self.cache = {}
    
    def get_cache_key(self, request: GenerationRequest) -> str:
        """Generate cache key from request"""
        key_str = f"{request.topic}|{request.difficulty.value}|{request.duration_weeks}"
        return sha256(key_str.encode()).hexdigest()
    
    def get(self, request: GenerationRequest) -> GenerationResult | None:
        """Get cached result if exists"""
        key = self.get_cache_key(request)
        return self.cache.get(key)
    
    def set(self, request: GenerationRequest, result: GenerationResult) -> None:
        """Cache generation result"""
        key = self.get_cache_key(request)
        self.cache[key] = result

# Usage
cache = CurriculumCache()
request = GenerationRequest(...)

cached = cache.get(request)
if cached:
    result = cached
else:
    result = layer.generate(request)
    cache.set(request, result)
```

### Async Generation

```python
import asyncio
from concurrent.futures import ThreadPoolExecutor

class AsyncGenerationLayer:
    def __init__(self):
        self.layer = AIGenerationLayer()
        self.executor = ThreadPoolExecutor(max_workers=4)
    
    async def generate_async(self, request: GenerationRequest) -> GenerationResult:
        """Generate curriculum asynchronously"""
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(
            self.executor,
            self.layer.generate,
            request
        )

# Usage in async context
async def handle_curriculum_request(request: GenerationRequest):
    async_layer = AsyncGenerationLayer()
    result = await async_layer.generate_async(request)
    return result
```

## Monitoring & Logging

```python
import logging
from datetime import datetime

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def log_generation(result: GenerationResult):
    """Log generation metrics"""
    logger.info(
        f"Curriculum Generated: {result.stage_1_outline.title} | "
        f"Duration: {result.total_duration_seconds:.1f}s | "
        f"Lessons: {result.stage_2_content.total_lessons} | "
        f"Quizzes: {len(result.stage_3_assessments.lesson_quizzes)} | "
        f"Capstones: {len(result.stage_3_assessments.capstone_projects)}"
    )
```

## Summary

The AI Generation Layer integrates seamlessly with:
- ✓ Research Engine for context
- ✓ RAG Engine for document grounding
- ✓ Vector DB for indexing/search
- ✓ Frontend APIs for UI display
- ✓ Databases for persistence
- ✓ Caching for performance
- ✓ Async operations for scalability

All integration points are optional—the layer works standalone or as part of larger system.
