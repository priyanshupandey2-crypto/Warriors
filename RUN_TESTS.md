# Testing AI Generation Layer

All tests should be run from the `ai_layer` folder.

## Test 1: Verify Setup (Fast - <1 second)

```bash
cd /c/Users/ananya.maheshwari/Desktop/Capstone/ai_layer
python test_setup.py
```

**Expected output:**
```
[SUCCESS] All setup checks passed!
```

**What it tests:**
- ✅ HuggingFace token is set in .env
- ✅ All imports work correctly
- ✅ Schemas validate properly
- ✅ Generation layer initializes

---

## Test 2: Generate Example Course (Slow - 10-20 minutes)

```bash
python test_my_course.py
```

**Expected output:**
```
[DONE] Generation complete in XX.Xs
Course Summary Statistics...
TEST COMPLETE
```

**What it tests:**
- ✅ Full 3-stage pipeline works
- ✅ HuggingFace API connection
- ✅ Content generation quality
- ✅ Results save/export functionality

---

## Test 3: Full Test Suite

```bash
python test_generation.py
```

**What it tests:**
- ✅ Request creation
- ✅ All three stages
- ✅ JSON extraction
- ✅ Schema validation

---

## Quick Commands

```bash
# Navigate to folder
cd /c/Users/ananya.maheshwari/Desktop/Capstone/ai_layer

# Verify setup (recommended first)
python test_setup.py

# Run example generation
python test_my_course.py

# View your .env token
cat .env

# List all test files
ls test_*.py
```

---

## Troubleshooting

### Error: HUGGINGFACE_API_KEY not found

**Fix:** Edit `.env` file and add your actual token:
```
HUGGINGFACE_API_KEY=hf_your_actual_token_here
```

Get token from: https://huggingface.co/settings/tokens

### Error: Module not found

**Fix:** Make sure you're in the `ai_layer` folder:
```bash
cd /c/Users/ananya.maheshwari/Desktop/Capstone/ai_layer
python test_setup.py
```

### Error: HuggingFace timeout

**Reason:** Free tier is busy
**Fix:** Wait a few minutes and try again, or use faster model:
```python
layer = AIGenerationLayer(model="mistralai/Mistral-7B-Instruct-v0.1")
```

---

## Expected Files After Tests

After running tests, you'll have:
- `test_courses/generation_YYYYMMDD_HHMMSS/` - Generated course files
- `test_course.md` - Markdown version of course
- Various JSON files with course structure

---

## Next Steps After Testing

1. ✅ Run `test_setup.py` - Verify everything works
2. ✅ Run `test_my_course.py` - Generate a sample course
3. ✅ Check results in `test_courses/` folder
4. ✅ Read the generated markdown: `cat test_course.md`

---

## All Tests Summary

| Test | Command | Time | API |
|------|---------|------|-----|
| Setup | `python test_setup.py` | <1s | No |
| Example | `python test_my_course.py` | 10-20m | Yes |
| Full Suite | `python test_generation.py` | 10-20m | Yes |

---

**Status:** All systems ready for testing! 🚀
