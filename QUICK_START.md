# AI Generation Layer - Quick Start

## 🚀 5-Minute Setup

### 1. Get HuggingFace Token
1. Go to https://huggingface.co/settings/tokens
2. Create a new token (read access)
3. Set environment:
```bash
export HUGGINGFACE_API_KEY=hf_your_token_here
```

### 2. Install Dependencies
```bash
pip install huggingface_hub pydantic
```

### 4. Basic Usage
```python
from ai_layer import AIGenerationLayer, GenerationRequest, DifficultyLevel

# Create request
request = GenerationRequest(
    topic="Introduction to Python",
    difficulty=DifficultyLevel.BEGINNER,
    target_audience="Complete beginners",
    duration_weeks=4,
    tags=["python", "programming", "beginner"],
)

# Generate curriculum (takes 10-30 minutes on HuggingFace)
layer = AIGenerationLayer()
result = layer.generate(request)

# You now have:
# - Stage 1: Course outline with modules
# - Stage 2: Detailed lessons with concepts
# - Stage 3: Quizzes and capstone projects
```

### 5. Save & Export
```python
from ai_layer import save_generation_result, export_to_markdown

# Save as JSON
output_dir = save_generation_result(result)

# Export to readable markdown
export_to_markdown(result, "course.md")
```

## 📊 What You Get

### Stage 1: Course Outline
```
Modules: 4-6
├── Module 1: Fundamentals
│   ├── Lesson 1.1: Intro to Variables
│   ├── Lesson 1.2: Data Types
│   └── Lesson 1.3: Operators
└── ...
```

### Stage 2: Detailed Content
For each lesson:
- Learning objectives
- Key concepts with explanations
- Real-world examples
- Common misconceptions fixed
- Estimated time

### Stage 3: Assessments
- Quiz per lesson (4-5 questions)
- Multiple choice, short answer, true/false
- 1-2 capstone projects
- Clear evaluation rubrics

## 🔍 Access Content

### Get Lessons
```python
for lesson in result.stage_2_content.lessons:
    print(f"{lesson.title} - {lesson.estimated_duration_minutes} min")
```

### Get Quiz Questions
```python
quiz = result.stage_3_assessments.lesson_quizzes[0]
for q in quiz.quiz_questions:
    print(f"Q: {q.question_text}")
    print(f"A: {q.correct_answer}")
```

### Get Capstone Projects
```python
for capstone in result.stage_3_assessments.capstone_projects:
    print(f"Project: {capstone.title}")
    print(f"Hours: {capstone.estimated_hours}")
```

## 📁 Output Files

```
generated_courses/generation_YYYYMMDD_HHMMSS/
├── complete_result.json       # Full data
├── stage_1_outline.json       # Outline
├── stage_2_content.json       # Content
├── stage_3_assessments.json   # Quizzes
└── summary.json               # Stats
```

## ⚡ Performance

| Phase | Time | Cost |
|-------|------|------|
| Stage 1 | ~3-5 min | FREE |
| Stage 2 | ~5-10 min | FREE |
| Stage 3 | ~2-5 min | FREE |
| **Total** | **~10-20 min** | **FREE** |

Note: Times vary based on HuggingFace inference API availability

## 🎓 Real Example

```python
# Generate a Data Science course
request = GenerationRequest(
    topic="Data Science with Python",
    difficulty=DifficultyLevel.INTERMEDIATE,
    target_audience="Software engineers with Python knowledge",
    duration_weeks=6,
    tags=["data-science", "python", "pandas", "scikit-learn"],
    context="Focus on practical applications with real datasets"
)

result = AIGenerationLayer().generate(request)

# Result contains:
# - 6 modules covering: Python recap, NumPy, Pandas, EDA, ML Basics, Projects
# - 15-18 lessons with detailed content
# - 15-18 quizzes with 60+ questions total
# - 2 capstone projects
```

## 🔧 Customization

### Different Model
```python
# Llama 2 (default)
layer = AIGenerationLayer(model="meta-llama/Llama-2-70b-chat-hf")

# Mistral (faster)
layer = AIGenerationLayer(model="mistralai/Mistral-7B-Instruct-v0.1")

# Falcon
layer = AIGenerationLayer(model="tiiuae/falcon-40b-instruct")
```

### Just Stage 1
```python
outline = layer.stage1.generate(request)
```

### Custom Prompt
```python
class MyStage1(Stage1OutlineGenerator):
    def _build_outline_prompt(self, request):
        return "Your custom prompt"
```

## 📖 Full Documentation

- **README.md** - Complete user guide
- **ARCHITECTURE.md** - System design
- **INTEGRATION_GUIDE.md** - Integration patterns
- **example_usage.py** - Working code sample

## ❓ Common Questions

**Q: How long does generation take?**
A: ~10-30 minutes total (depends on HuggingFace load)

**Q: How much does it cost?**
A: FREE! Uses HuggingFace free tier

**Q: Can I use my own content?**
A: Yes! Pass your content in the `context` field

**Q: Can I customize the output?**
A: Yes, full control over all schemas and prompts

**Q: What if HuggingFace is slow?**
A: Use a smaller model like Mistral-7B for faster results

**Q: Can I use offline?**
A: Not with HuggingFace inference API, but you could use Ollama locally

## 🚦 Status

✅ Production Ready  
✅ Fully Tested  
✅ Comprehensively Documented  
✅ Ready for Integration  

## 📞 Support

See documentation files for detailed help on:
- Schema structure (types.py)
- Pipeline design (ARCHITECTURE.md)
- Integration patterns (INTEGRATION_GUIDE.md)
- Code examples (example_usage.py)

---

**Happy Learning! 🎉**
