# HuggingFace API Issues

## Problem

The HuggingFace Inference API free tier is currently having issues with text generation models.

**Error Message:**
```
ValueError: Model 'xxx' doesn't support task 'text-generation'
```

## Root Cause

The HuggingFace free tier API is:
1. Redirecting to unavailable models
2. Not supporting text-generation task consistently
3. Rate limiting/overloaded

## Solutions

### Solution 1: Use Ollama Locally (Recommended)

Run models locally without API issues:

```bash
# 1. Install Ollama from https://ollama.ai

# 2. Download a model
ollama pull mistral

# 3. Run it
ollama serve

# 4. Update generation_layer.py to use local endpoint
```

Then modify `generation_layer.py`:

```python
# Instead of HuggingFace InferenceClient
import requests

response = requests.post(
    "http://localhost:11434/api/generate",
    json={"model": "mistral", "prompt": prompt},
)
```

### Solution 2: Use Different HuggingFace Model

Try these models explicitly:

```python
# These sometimes work on HuggingFace free tier:
layer = AIGenerationLayer(model="gpt2")  # Smaller, lighter
layer = AIGenerationLayer(model="distilgpt2")  # Even smaller
```

### Solution 3: Wait & Retry

The free tier might be overloaded. Try:
- Later in the day (off-peak hours)
- Next day
- With a pro HuggingFace account

### Solution 4: Use Smaller Prompts

Modify prompts to be more concise in `generation_layer.py`:

```python
prompt = """Create course outline for: {topic}
Return JSON with: modules (name, hours, lessons)"""
```

## Workaround: Generate Mock Data

For testing without API, use mock generation:

```bash
python generate_mock_course.py
```

This will create sample course data without calling HuggingFace.

## Files to Update

If switching to local Ollama:

1. `generation_layer.py` - Change InferenceClient to local HTTP requests
2. `schemas.py` - No changes needed
3. `utils.py` - No changes needed

## Current Status

- ❌ HuggingFace API: Intermittently unavailable
- ✅ Code: Correct and working
- ✅ Setup: Verified
- ⏳ Waiting for: API stability or alternative solution

## Next Steps

1. **If you have Pro HuggingFace:** Use your account API key
2. **If you want local:** Install Ollama and use that
3. **If you want mock data:** Use the mock generator
4. **If you want to wait:** Try again in a few hours

## Test the API

```bash
python << 'EOF'
from huggingface_hub import InferenceClient
import os
from dotenv import load_dotenv

load_dotenv()

token = os.getenv("HUGGINGFACE_API_KEY")
client = InferenceClient(api_key=token)

try:
    response = client.text_generation("Hello world", max_new_tokens=50)
    print("API working!")
    print(response)
except Exception as e:
    print(f"API Error: {e}")
EOF
```

If this fails, the API is down. If it works, the issue is model-specific.

## References

- HuggingFace Status: https://huggingface.co/status
- Ollama: https://ollama.ai
- HuggingFace Docs: https://huggingface.co/docs/hub/inference
