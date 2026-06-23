# AI Generation Layer - 3-Stage Curriculum Pipeline

The AI Generation Layer implements an advanced 3-stage pipeline for generating comprehensive educational curricula. Each stage builds upon the previous one, with schema validation ensuring quality outputs.

```
┌─────────────────────────────────────────────────────────────┐
│         STAGE 1: OUTLINE GENERATOR                           │
│  Input: Topic, Difficulty, Audience, Duration               │
│  Output: Course structure with modules & lesson headings     │
│  Schema: OutlineSchema (validated)                           │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│         STAGE 2: CONTENT ELABORATOR                          │
│  Input: Stage 1 Outline                                      │
│  Output: Detailed lesson texts with concepts & examples      │
│  Schema: ElaboratedContent (validated)                       │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│         STAGE 3: ASSESSMENT WEAVER                           │
│  Input: Stage 1 Outline + Stage 2 Content                    │
│  Output: Quizzes & Capstone projects with rubrics            │
│  Schema: AssessmentSuite (validated)                         │
└─────────────────────────────────────────────────────────────┘
```

## Architecture

### Core Components

#### 1. **Types** (`types.py`)
- **Enums:** `DifficultyLevel`, `BloomLevel`, `SourceType`
- **Stage 1:** `OutlineSchema`, `Module`
- **Stage 2:** `ElaboratedContent`, `LessonContent`, `Concept`
- **Stage 3:** `AssessmentSuite`, `QuizQuestion`, `CapstoneProject`
- **Pipeline:** `GenerationRequest`, `GenerationResult`

#### 2. **Generation Layer** (`generation_layer.py`)
- **Stage1OutlineGenerator:** Creates high-level course structure
- **Stage2ContentElaborator:** Elaborates outline into detailed lessons
- **Stage3AssessmentWeaver:** Creates assessments based on content
- **AIGenerationLayer:** Main orchestrator managing all stages

#### 3. **Utilities** (`utils.py`)
- Save/load generation results as JSON
- Export to Markdown format
- Generate course statistics
- Print formatted summaries

## Key Features

### ✨ Schema Validation
All outputs are validated against Pydantic schemas:
- Ensures structural correctness
- Type-safe throughout pipeline
- Automatic error handling

### 🧠 Extended Thinking
Each stage uses Claude's extended thinking:
- Stage 1: 10,000 token budget (outline structure)
- Stage 2: 15,000 token budget (detailed content)
- Stage 3: 10,000-12,000 token budgets (assessments)

### 📚 Educational Framework
- **Bloom's Taxonomy:** All content levels mapped
- **Learning Objectives:** Structured SMART goals
- **Progression:** Content flows from foundational to advanced

### 🎯 Multi-Dimensional Content
- Real-world applications
- Common misconceptions with corrections
- Practical examples for each concept
- Industry relevance scoring

## Usage

### Basic Example

```python
from ai_layer import AIGenerationLayer, GenerationRequest, DifficultyLevel

# Create request
request = GenerationRequest(
    topic="Introduction to Machine Learning",
    difficulty=DifficultyLevel.INTERMEDIATE,
    target_audience="Software engineers with Python knowledge",
    duration_weeks=8,
    tags=["machine-learning", "python", "data-science"],
    context="Focus on practical applications"
)

# Generate curriculum
layer = AIGenerationLayer()
result = layer.generate(request)

# Access results
print(f"Modules: {len(result.stage_1_outline.modules)}")
print(f"Lessons: {result.stage_2_content.total_lessons}")
print(f"Quizzes: {len(result.stage_3_assessments.lesson_quizzes)}")
```

### Saving Results

```python
from ai_layer import save_generation_result, export_to_markdown

# Save as JSON
output_dir = save_generation_result(result)

# Export to Markdown
export_to_markdown(result, "course.md")
```

### Accessing Detailed Content

```python
# Get first lesson
lesson = result.stage_2_content.lessons[0]
print(f"Title: {lesson.title}")
print(f"Duration: {lesson.estimated_duration_minutes} min")

# Get lesson concepts
for concept in lesson.main_concepts:
    print(f"- {concept.name}: {concept.explanation}")

# Get associated quiz
quiz = next(
    q for q in result.stage_3_assessments.lesson_quizzes 
    if q.lesson_id == lesson.lesson_id
)
for question in quiz.quiz_questions:
    print(f"Q: {question.question_text}")
    print(f"A: {question.correct_answer}")
```

## Output Structure

### JSON Outputs

```
generated_courses/
├── generation_YYYYMMDD_HHMMSS/
│   ├── complete_result.json       # Full result object
│   ├── stage_1_outline.json       # Course outline
│   ├── stage_2_content.json       # Elaborated lessons
│   ├── stage_3_assessments.json   # Quizzes & capstones
│   └── summary.json               # Statistics & metadata
```

### Markdown Export

```
course.md
├── Course Title & Overview
├── Learning Objectives
├── Modules
│   ├── Lessons
│   │   ├── Concepts with Examples
│   │   ├── Real-World Applications
│   │   ├── Common Misconceptions
│   │   └── Quiz Questions
│   └── ...
└── Capstone Projects
```

## Schema Details

### Stage 1: OutlineSchema

```python
{
    "title": str,
    "description": str,
    "difficulty": DifficultyLevel,
    "target_audience": str,
    "total_hours": int,
    "modules": [
        {
            "id": "module_1",
            "name": str,
            "sequence": int,
            "description": str,
            "estimated_hours": int,
            "lessons": ["lesson_1_1", "lesson_1_2", ...]
        }
    ],
    "learning_objectives": [str],
    "prerequisites": [str]
}
```

### Stage 2: ElaboratedContent

```python
{
    "course_id": str,
    "outline": OutlineSchema,
    "lessons": [
        {
            "lesson_id": str,
            "title": str,
            "module_id": str,
            "learning_objectives": [str],
            "introduction": str,
            "main_concepts": [
                {
                    "name": str,
                    "explanation": str,
                    "bloom_level": BloomLevel,
                    "examples": [str]
                }
            ],
            "real_world_applications": [str],
            "common_misconceptions": [
                {
                    "misconception": str,
                    "correction": str
                }
            ],
            "key_takeaways": [str],
            "estimated_duration_minutes": int
        }
    ]
}
```

### Stage 3: AssessmentSuite

```python
{
    "course_id": str,
    "lesson_quizzes": [
        {
            "lesson_id": str,
            "quiz_questions": [
                {
                    "id": str,
                    "question_text": str,
                    "question_type": "multiple_choice|short_answer|true_false",
                    "options": [str] | null,
                    "correct_answer": str,
                    "explanation": str,
                    "bloom_level": BloomLevel,
                    "difficulty": DifficultyLevel
                }
            ],
            "passing_score_percentage": int,
            "estimated_duration_minutes": int
        }
    ],
    "capstone_projects": [
        {
            "id": str,
            "title": str,
            "description": str,
            "learning_objectives": [str],
            "requirements": [str],
            "submission_format": str,
            "evaluation_criteria": [
                {
                    "criterion": str,
                    "description": str
                }
            ],
            "estimated_hours": int,
            "bloom_levels": [BloomLevel]
        }
    ]
}
```

## Customization

### Using Different Models

```python
# Use Mistral model
layer = AIGenerationLayer(model="mistralai/Mistral-7B-Instruct-v0.1")
result = layer.generate(request)

# Available free models:
# - meta-llama/Llama-2-70b-chat-hf
# - mistralai/Mistral-7B-Instruct-v0.1
# - tiiuae/falcon-40b-instruct
```

### Partial Generation

```python
# Stage 1 only
outline = layer.stage1.generate(request)

# Stage 2 with existing outline
content = layer.stage2.generate(request, outline)

# Stage 3 with stages 1 & 2
assessments = layer.stage3.generate(request, outline, content)
```

## Best Practices

1. **Topic Specificity:** More specific topics generate better structured outlines
2. **Clear Audience:** Define target audience precisely (e.g., "junior developers familiar with REST APIs")
3. **Realistic Duration:** Allocate sufficient weeks (minimum 4 for beginner courses)
4. **Context Matters:** Add relevant context about learning goals or constraints
5. **Model Selection:** Use latest Claude models for best results

## Performance

- **Typical generation time:** 10-30 minutes for full pipeline (HuggingFace inference)
- **Cost per generation:** FREE (using HuggingFace free tier)
- **Output size:** 
  - Stage 1: ~50-100 KB
  - Stage 2: ~500-800 KB
  - Stage 3: ~200-300 KB

Note: Generation time depends on HuggingFace API availability and model load

## Quality Metrics

The layer ensures quality through:
- Structured schema validation at each stage
- Extended thinking for complex reasoning
- Content verification at stage boundaries
- Alignment with learning science principles (Bloom's, ADDIE)
- Real-world application focus

## Error Handling

```python
try:
    result = layer.generate(request)
except ValueError as e:
    print(f"Generation failed: {e}")
except anthropic.APIError as e:
    print(f"API error: {e}")
```

## Integration

The AI Generation Layer integrates seamlessly with:
- Research Engine: Use research outputs as context
- RAG Engine: Ground content in retrieved information
- Vector DB: Store generated content for retrieval
- Web Search: Incorporate latest information

## Environment

Requires:
- `HUGGINGFACE_API_KEY` environment variable
- Python 3.10+
- Dependencies: `huggingface_hub`, `pydantic`

Setup:
```bash
pip install huggingface_hub pydantic
export HUGGINGFACE_API_KEY=hf_your_token_here
```
