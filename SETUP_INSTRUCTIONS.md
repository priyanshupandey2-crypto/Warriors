# AI Generation Layer - Setup Instructions

## Local Setup (One-Time)

### 1. Clone the Repository
```bash
git clone https://github.com/priyanshupandey2-crypto/Warriors.git
cd Warriors/ai_layer
```

### 2. Create Virtual Environment
```bash
python -m venv venv
source venv/bin/activate    # On Windows: venv\Scripts\activate
```

### 3. Install Dependencies
```bash
pip install huggingface_hub pydantic python-dotenv
```

### 4. Set Up Environment Variables

**Copy the example file:**
```bash
cp .env.example .env
```

**Edit `.env` and add your HuggingFace token:**
```bash
# Open .env in your editor and replace:
HUGGINGFACE_API_KEY=hf_your_actual_token_here

# With your actual token from:
# https://huggingface.co/settings/tokens
```

### 5. Verify Setup
```bash
python test_setup.py
```

Expected output:
```
[SUCCESS] All setup checks passed!
```

---

## Important Security Notes

⚠️ **NEVER commit `.env` file!**
- `.env` contains your HuggingFace API token
- GitHub will block pushes with secrets
- Use `.env.example` as a template only
- Add your real token locally only

✅ **Always use `.env.example` for templates**
- Commit `.env.example` (no real secrets)
- Keep actual `.env` locally only
- Each developer has their own `.env`

---

## Getting Your HuggingFace Token

1. Go to: https://huggingface.co/settings/tokens
2. Click "New token"
3. Give it a name (e.g., "Warriors Project")
4. Select "Read" access (that's all you need)
5. Click "Generate"
6. Copy the token starting with `hf_`
7. Paste into your local `.env` file

---

## Running the System

### Option 1: Generate Mock Course (Recommended - No API needed)
```bash
python generate_mock_course.py
```

### Option 2: Generate Real Course (Requires HuggingFace API)
```bash
python example_usage.py
```

### Option 3: Run Tests
```bash
python test_setup.py      # Quick verification
python test_generation.py # Full tests
```

---

## File Structure

```
ai_layer/
├── .env              ← YOUR TOKEN (DO NOT COMMIT)
├── .env.example      ← TEMPLATE (OK to commit)
├── .gitignore        ← Prevents .env commits
├── schemas.py        ← Data models
├── generation_layer.py ← Main pipeline
├── utils.py          ← Utilities
├── test_*.py         ← Tests
└── *.md              ← Documentation
```

---

## If You Accidentally Push a Secret

GitHub will block it automatically. To fix:

```bash
# 1. Remove the secret from your local .env
rm .env

# 2. Create fresh .env from example
cp .env.example .env
# Edit and add your token

# 3. Git will stop tracking the file
git rm --cached .env  # Remove from git history
git add .gitignore    # Ensure .env is ignored
git commit -m "Remove secrets from tracking"
git push
```

---

## Troubleshooting

### Error: "HUGGINGFACE_API_KEY not found"
**Fix:** Create `.env` file with your token
```bash
cp .env.example .env
# Edit and add your real token
```

### Error: "Model doesn't support task 'text-generation'"
**Fix:** HuggingFace API is busy. Try:
- Using mock generator: `python generate_mock_course.py`
- Waiting a few minutes and trying again
- Using local Ollama (see docs)

### Error: GitHub push protection
**Fix:** Don't push `.env` file
```bash
git rm --cached ai_layer/.env
git commit -m "Remove .env from tracking"
git push
```

---

## Common Commands

```bash
# Verify everything works
python test_setup.py

# Generate a sample course
python generate_mock_course.py

# View generated course
cat mock_course.md

# Run full tests
python test_generation.py

# Check git status
git status

# Safely push changes
git add .              # Stage all changes
git status             # Verify (no .env!)
git commit -m "message"
git push origin [branch-name]
```

---

## Environment Files Explained

### .env (Local Only - DO NOT COMMIT)
```
HUGGINGFACE_API_KEY=hf_actual_token_here
```
- Contains your real token
- Only on your machine
- Ignored by git
- Never pushed to GitHub

### .env.example (Safe to Commit)
```
HUGGINGFACE_API_KEY=hf_your_actual_token_here
```
- Template for developers
- No real secrets
- Shows what variables are needed
- Safe to commit and push

---

## Next Steps

1. ✅ Clone the repo
2. ✅ Create virtual environment
3. ✅ Install dependencies
4. ✅ Copy `.env.example` → `.env`
5. ✅ Add your HuggingFace token
6. ✅ Run `python test_setup.py`
7. ✅ Start generating courses!

---

**Questions?** Check the documentation files:
- README.md - User guide
- QUICK_START.md - Quick setup
- HUGGINGFACE_API_ISSUE.md - Troubleshooting
