# AI Generation Layer - Architecture Document

## System Overview

The AI Generation Layer implements a sophisticated 3-stage pipeline for curriculum development using Claude AI with schema validation and extended thinking.

```
┌─────────────────────────────────────────────────────────────────────┐
│                    USER REQUEST                                      │
│  Topic, Difficulty, Duration, Audience, Tags, Context               │
└────────────────────────┬────────────────────────────────────────────┘
                         │
                         ▼
            ┌────────────────────────────┐
            │  GenerationRequest (Types) │
            │  - Validated Pydantic      │
            └────────────┬───────────────┘
                         │
                         ▼
     ┌───────────────────────────────────────────┐
     │    AIGenerationLayer (Orchestrator)       │
     │                                            │
     │  ┌─────────────────────────────────────┐  │
     │  │ Stage1OutlineGenerator              │  │
     │  ├─ Claude API (Extended Thinking)     │  │
     │  ├─ Prompt: High-level structure       │  │
     │  ├─ Output: OutlineSchema              │  │
     │  └─ Validation: Pydantic              │  │
     │        │                               │  │
     │        ├─ Module structure             │  │
     │        ├─ Lesson IDs                   │  │
     │        ├─ Learning objectives          │  │
     │        └─ Prerequisites                │  │
     │                                        │  │
     │  ┌─────────────────────────────────────┐  │
     │  │ Stage2ContentElaborator             │  │
     │  ├─ Claude API (Extended Thinking)     │  │
     │  ├─ Input: OutlineSchema               │  │
     │  ├─ Prompt: Detailed lesson content    │  │
     │  ├─ Output: ElaboratedContent          │  │
     │  └─ Validation: Pydantic              │  │
     │        │                               │  │
     │        ├─ Lesson texts                 │  │
     │        ├─ Key concepts                 │  │
     │        ├─ Real-world applications      │  │
     │        ├─ Misconceptions & fixes       │  │
     │        └─ Examples & takeaways         │  │
     │                                        │  │
     │  ┌─────────────────────────────────────┐  │
     │  │ Stage3AssessmentWeaver              │  │
     │  ├─ Claude API (Extended Thinking)     │  │
     │  ├─ Input: Outline + Content           │  │
     │  ├─ Prompt: Assessments                │  │
     │  ├─ Output: AssessmentSuite            │  │
     │  └─ Validation: Pydantic              │  │
     │        │                               │  │
     │        ├─ Lesson quizzes               │  │
     │        │  ├─ Multiple choice           │  │
     │        │  ├─ Short answer              │  │
     │        │  └─ True/false                │  │
     │        │                               │  │
     │        └─ Capstone projects            │  │
     │           ├─ Requirements              │  │
     │           ├─ Evaluation criteria       │  │
     │           └─ Learning outcomes         │  │
     │                                        │  │
     └────────────────────┬────────────────────┘  │
                          │
                          ▼
            ┌────────────────────────────┐
            │  GenerationResult (Types)  │
            │  - All 3 stages            │
            │  - Validated & typed       │
            │  - Timestamps & metrics    │
            └────────────────────────────┘
                          │
                          ├──────────────┬──────────────┬──────────────┐
                          │              │              │              │
                          ▼              ▼              ▼              ▼
                    ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
                    │   JSON   │  │Markdown  │  │Statistics│  │  Print   │
                    │  Export  │  │ Export   │  │Generator │  │ Summary  │
                    │(Utils)   │  │(Utils)   │  │(Utils)   │  │(Utils)   │
                    └──────────┘  └──────────┘  └──────────┘  └──────────┘
```

## Component Architecture

### 1. Type System (`types.py`)

**Purpose:** Define validated data structures for all pipeline stages

**Key Classes:**
- **Enums:** `DifficultyLevel`, `BloomLevel` (learning science standards)
- **Stage 1:** `Module`, `OutlineSchema` (course structure)
- **Stage 2:** `LessonContent`, `Concept` (detailed content)
- **Stage 3:** `QuizQuestion`, `CapstoneProject` (assessments)
- **Pipeline:** `GenerationRequest`, `GenerationResult` (I/O contracts)

**Design Pattern:** Pydantic BaseModel for:
- Runtime type checking
- JSON serialization
- Automatic validation
- Clear contracts between stages

### 2. Generation Layer (`generation_layer.py`)

#### Stage 1: OutlineGenerator
```
Input:  GenerationRequest
        ├─ topic: str
        ├─ difficulty: DifficultyLevel
        ├─ target_audience: str
        ├─ duration_weeks: int
        └─ context: str (optional)
        
Process:
        1. Build curriculum design prompt
        2. Call Claude with extended thinking (10k tokens)
        3. Extract & validate JSON response
        4. Parse into OutlineSchema
        
Output: OutlineSchema
        ├─ title: str
        ├─ modules: List[Module]
        │  ├─ id: str
        │  ├─ name: str
        │  ├─ lessons: List[str]  (lesson_1_1, lesson_1_2, ...)
        │  └─ estimated_hours: int
        ├─ learning_objectives: List[str]
        └─ total_hours: int
```

#### Stage 2: ContentElaborator
```
Input:  OutlineSchema (from Stage 1)
        + original GenerationRequest
        
Process:
        1. For each module:
           a. Build content elaboration prompt
           b. Call Claude with extended thinking (15k tokens)
           c. Extract & validate JSON for lessons
           d. Parse Concept objects within lessons
           
Output: ElaboratedContent
        ├─ course_id: str
        ├─ outline: OutlineSchema
        └─ lessons: List[LessonContent]
           ├─ lesson_id: str
           ├─ title: str
           ├─ learning_objectives: List[str]
           ├─ main_concepts: List[Concept]
           │  ├─ name: str
           │  ├─ explanation: str (200-300 words)
           │  ├─ bloom_level: BloomLevel
           │  └─ examples: List[str]
           ├─ real_world_applications: List[str]
           ├─ common_misconceptions: List[{misconception, correction}]
           └─ estimated_duration_minutes: int
```

#### Stage 3: AssessmentWeaver
```
Input:  OutlineSchema + ElaboratedContent
        
Process:
        1. For each lesson:
           a. Build quiz prompt with lesson content
           b. Call Claude with extended thinking (10k tokens)
           c. Generate balanced question mix (MC, SA, TF)
           d. Validate bloom levels and difficulty
           
        2. For course:
           a. Build capstone prompt with all content
           b. Call Claude with extended thinking (12k tokens)
           c. Generate 1-2 portfolio-worthy projects
           d. Define clear rubrics and requirements
           
Output: AssessmentSuite
        ├─ lesson_quizzes: List[LessonQuiz]
        │  ├─ lesson_id: str
        │  └─ quiz_questions: List[QuizQuestion]
        │     ├─ question_text: str
        │     ├─ question_type: str
        │     ├─ options: List[str] | null
        │     ├─ correct_answer: str
        │     ├─ explanation: str
        │     ├─ bloom_level: BloomLevel
        │     └─ difficulty: DifficultyLevel
        │
        └─ capstone_projects: List[CapstoneProject]
           ├─ title: str
           ├─ description: str
           ├─ learning_objectives: List[str]
           ├─ requirements: List[str]
           ├─ evaluation_criteria: List[{criterion, description}]
           └─ estimated_hours: int
```

### 3. Orchestrator (`AIGenerationLayer`)

**Responsibility:** Coordinate all 3 stages in sequence

```python
class AIGenerationLayer:
    def generate(request: GenerationRequest) -> GenerationResult:
        # Stage 1
        outline = stage1.generate(request)
        
        # Stage 2 (uses Stage 1 output)
        content = stage2.generate(request, outline)
        
        # Stage 3 (uses Stage 1 + Stage 2)
        assessments = stage3.generate(request, outline, content)
        
        # Package results
        return GenerationResult(
            stage_1_outline=outline,
            stage_2_content=content,
            stage_3_assessments=assessments,
            total_duration_seconds=elapsed_time
        )
```

### 4. Utilities (`utils.py`)

**Functions:**
- `save_generation_result()` - Persist all outputs as JSON
- `load_generation_result()` - Reload saved results
- `export_to_markdown()` - Teacher-friendly course document
- `generate_course_statistics()` - Metrics and analytics
- `print_course_summary()` - Console output

## Data Flow

```
Stage 1 Output (OutlineSchema)
├─ Defines module and lesson structure
├─ Specifies lesson IDs (lesson_1_1, lesson_1_2, etc.)
├─ Sets total hours and learning objectives
└─ FEEDS INTO →

Stage 2 Process
├─ Iterates through each lesson ID from Stage 1
├─ Generates detailed content for each lesson
├─ Maps lessons to module IDs
├─ Elaborates concepts with Bloom's levels
└─ FEEDS INTO →

Stage 3 Process
├─ Uses lesson IDs from Stage 1
├─ References actual content from Stage 2
├─ Creates assessments aligned to content
├─ Builds capstone projects integrating multiple modules
└─ GENERATES →

GenerationResult
├─ Contains all 3 stage outputs
├─ Fully validated and typed
├─ Ready for serialization or display
└─ Can be saved/loaded/exported
```

## Error Handling Strategy

```python
try:
    # Stage execution
    outline = stage1.generate(request)
except ValueError as e:
    # JSON parsing failed
    print(f"Outline parsing error: {e}")
except anthropic.APIError as e:
    # API communication failed
    print(f"API error: {e}")
except Exception as e:
    # Unexpected error
    print(f"Generation failed: {e}")
    raise
```

## Extended Thinking Budgets

Each stage uses Claude's extended thinking for complex reasoning:

| Stage | Budget | Purpose |
|-------|--------|---------|
| Stage 1 | 10,000 tokens | Design coherent course structure |
| Stage 2 | 15,000 tokens | Elaborate detailed content per lesson |
| Stage 3 | 10,000-12,000 tokens | Create assessments aligned to content |

**Why Extended Thinking?**
- Complex educational content requires multi-step reasoning
- Output must follow strict schemas
- Quality and coherence are paramount
- Validation of educational best practices

## Validation Layers

### Layer 1: Pydantic Schema Validation
```python
outline = OutlineSchema(**response_dict)
# Validates:
# - All required fields present
# - Types match schema
# - Field constraints (positive ints, valid enums)
```

### Layer 2: Content Integrity
```python
# Verify references
- All lesson IDs mentioned in modules exist
- All quiz lesson_ids match lesson_id values
- Capstone learning_objectives cover course objectives
```

### Layer 3: Educational Standards
```python
# Ensure:
- Bloom's progression (remember → understand → apply → analyze)
- Learning objectives are SMART
- Assessment aligns to content
- Difficulty distribution is balanced
```

## Prompt Engineering Strategy

### Stage 1 Prompt Structure
1. **Context:** Role + task clarity
2. **Input:** Topic, difficulty, audience, duration
3. **Requirements:** Specific output structure
4. **Format:** Exact JSON schema expected
5. **Constraints:** Module count, lesson count, hour allocation

### Stage 2 Prompt Structure
1. **Context:** Instructional design role
2. **Input:** Course overview + module being elaborated
3. **Requirements:** Detailed lesson structure with concepts
4. **Examples:** Show expected concept depth and examples
5. **Quality:** Bloom's levels, misconceptions, applications

### Stage 3 Prompt Structure
1. **Context:** Assessment design role
2. **Input:** Course objectives + lesson content
3. **Requirements:** Question types, Bloom's distribution
4. **Rubrics:** Clear evaluation criteria
5. **Portfolio:** Capstone projects worth sharing

## Performance Characteristics

```
Generation Time (per stage):
├─ Stage 1 (outline): ~30-60 seconds
├─ Stage 2 (content): ~2-5 minutes (scales with lesson count)
└─ Stage 3 (assessments): ~1-3 minutes

Total Pipeline: 3-8 minutes for typical course

Cost Estimate (claude-opus-4-8):
├─ Stage 1: ~$0.50-1.00
├─ Stage 2: ~$3.00-5.00 (scales with lesson count)
├─ Stage 3: ~$1.00-2.00
└─ Total: ~$4.50-8.00

Output Size:
├─ JSON Stage 1: ~50-100 KB
├─ JSON Stage 2: ~500-800 KB
├─ JSON Stage 3: ~200-300 KB
└─ Total JSON: ~750-1200 KB
```

## Quality Assurance

### Pre-Generation Validation
- Request has all required fields
- Duration is realistic (4-52 weeks)
- Topic is specific enough

### Post-Generation Validation
- All schemas validate successfully
- Cross-references are intact
- No missing or orphaned content
- Statistics match expected values

### Content Quality Checks
- Bloom's progression in lessons
- Example coverage for concepts
- Realistic time estimates
- Assessment difficulty distribution

## Extensibility

### Adding New Stages
```python
class Stage4SomethingNew:
    def generate(self, request, outline, content, assessments):
        # Use outputs from previous stages
        # Generate new stage output
        pass

class AIGenerationLayer:
    def __init__(self):
        self.stage4 = Stage4SomethingNew()
```

### Custom Prompts
```python
# Override prompt building
class CustomStage1(Stage1OutlineGenerator):
    def _build_outline_prompt(self, request):
        # Custom prompt logic
        return custom_prompt
```

### Different Models
```python
layer = AIGenerationLayer(model="claude-sonnet-4-6")
```

## Integration Points

- **Research Engine:** Use research outputs as course context
- **RAG Engine:** Ground content in retrieved documents
- **Vector DB:** Store and retrieve generated lessons
- **Frontend:** API for curriculum generation requests
- **Storage:** Save results for later retrieval/editing
