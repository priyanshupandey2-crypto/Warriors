# .env Setup Instructions

## Overview

The `.env` file has been created at `backend/.env` with template values. Follow these steps to configure it properly.

## Step 1: Update Database Configuration

Edit `backend/.env` and update the PostgreSQL connection:

```bash
# BEFORE (template)
DATABASE_URL=postgresql+psycopg://user:password@localhost:5432/warriors_db

# AFTER (your actual values)
DATABASE_URL=postgresql+psycopg://postgres:your-password@localhost:5432/warriors_db
```

**Find your actual values:**
```bash
# Test your connection
psql -U postgres -h localhost -d warriors_db -c "SELECT 1"
```

## Step 2: Generate JWT Secret

The JWT secret must be at least 32 characters. Generate one:

```bash
# Option 1: Python (recommended)
python -c "import secrets; print(secrets.token_urlsafe(32))"

# Option 2: OpenSSL
openssl rand -base64 32

# Option 3: Use a random string (min 32 chars)
abcdefghijklmnopqrstuvwxyz123456
```

Update `.env`:
```bash
# BEFORE
JWT_SECRET=your-random-secret-min-32-chars-use-secrets.token_urlsafe(32)

# AFTER
JWT_SECRET=<paste-generated-secret-here>
```

## Step 3: Setup Firecrawl API Key

This is **required** for curriculum extraction.

### Get Free API Key

1. Visit: https://firecrawl.dev
2. Click "Sign Up" (free tier available)
3. Create account
4. Go to dashboard → API Keys
5. Copy your API key (starts with `sk_`)

### Add to .env

```bash
# BEFORE
FIRECRAWL_API_KEY=sk_your-firecrawl-api-key-here

# AFTER
FIRECRAWL_API_KEY=sk_abc123xyz456...
```

## Step 4: (Optional) Setup LangSmith

LangSmith is optional for observability/tracing.

If you want to use it:

1. Visit: https://smith.langchain.com
2. Sign up (free tier available)
3. Create organization → project
4. Copy API key

Update `.env`:
```bash
LANGSMITH_API_KEY=sk_your-langsmith-key
LANGSMITH_PROJECT=your-project-name
```

If you don't want to use it, leave these empty:
```bash
LANGSMITH_API_KEY=
LANGSMITH_PROJECT=
```

## Step 5: Verify Configuration

Test that everything is set up correctly:

```bash
cd backend

# Test database connection
python -c "from app.database import engine; print('✅ Database connected'); engine.dispose()"

# Test Firecrawl API key
python -c "from app.config import settings; print(f'✅ Firecrawl API key set: {bool(settings.FIRECRAWL_API_KEY)}')"

# Start the app
python main.py
```

Expected output:
```
INFO:     Application startup - Environment: development
INFO:     Database initialized successfully
INFO:     Uvicorn running on http://127.0.0.1:8000
```

## Complete .env Template

Here's what your final `.env` should look like:

```bash
# Application Environment
APP_ENV=development

# Server
HOST=127.0.0.1
PORT=8000

# PostgreSQL (REQUIRED - update with your credentials)
DATABASE_URL=postgresql+psycopg://postgres:your-password@localhost:5432/warriors_db

# JWT (REQUIRED - generate with: python -c "import secrets; print(secrets.token_urlsafe(32))")
JWT_SECRET=your-generated-32-char-secret-here
JWT_EXPIRATION_HOURS=24

# LangSmith (OPTIONAL - leave empty if not using)
LANGSMITH_API_KEY=
LANGSMITH_ENDPOINT=https://api.smith.langchain.com
LANGSMITH_PROJECT=

# Firecrawl (REQUIRED for curriculum extraction - get from https://firecrawl.dev)
FIRECRAWL_API_KEY=sk_your-firecrawl-api-key-here
```

## Security Notes

⚠️ **IMPORTANT**: Never commit `.env` to git!

```bash
# Verify .env is in .gitignore
cat .gitignore | grep ".env"

# If not there, add it
echo ".env" >> .gitignore
echo ".env.local" >> .gitignore
```

## Troubleshooting

### "Database connection failed"

```bash
# Check PostgreSQL is running
psql -U postgres -h localhost -c "SELECT 1"

# Fix: Start PostgreSQL (Windows)
net start PostgreSQL-x64-15  # Adjust version number
```

### "FIRECRAWL_API_KEY environment variable not set"

```bash
# Check the key is in .env
grep FIRECRAWL_API_KEY backend/.env

# If empty, get a key from https://firecrawl.dev and add it
```

### "Invalid JWT_SECRET"

```bash
# Must be at least 32 characters
# Generate a new one:
python -c "import secrets; print(f'JWT_SECRET={secrets.token_urlsafe(32)}')"
```

### "LangSmith tracing not working"

```bash
# This is optional - if you don't have an API key, just leave it empty
# The app will work fine without it
```

## Next Steps

Once `.env` is configured:

1. **Create database tables:**
   ```bash
   cd backend
   python -c "from app.models.curriculum_init import init_curriculum_tables; init_curriculum_tables()"
   ```

2. **Start the backend:**
   ```bash
   python main.py
   ```

3. **Test curriculum extraction:**
   ```bash
   curl -X POST http://localhost:8000/api/curriculum/discover \
     -H "Content-Type: application/json" \
     -d '{
       "topic": "Python Async/Await",
       "difficulty": "Intermediate",
       "duration": "2 hours"
     }'
   ```

4. **View API documentation:**
   - Swagger UI: http://localhost:8000/docs
   - ReDoc: http://localhost:8000/redoc

## Summary

| Setting | Required? | How to Get |
|---------|-----------|-----------|
| DATABASE_URL | ✅ Yes | Your PostgreSQL connection string |
| JWT_SECRET | ✅ Yes | Generate with `secrets.token_urlsafe(32)` |
| FIRECRAWL_API_KEY | ✅ Yes | Sign up at https://firecrawl.dev |
| LANGSMITH_API_KEY | ❌ No | Optional, from https://smith.langchain.com |

**Status**: Configure your `.env` file and you're ready to go! 🚀
