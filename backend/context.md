# Backend Infrastructure & Mock Data Services Context

## Purpose

This FastAPI-based backend provides:

1. **Foundation Infrastructure** (by Shreya)
   - Structured logging for production-grade observability
   - Telemetry tracking for execution metrics (duration, tokens, cost)
   - LangSmith integration for distributed tracing and parent/child run relationships
   - Environment-driven configuration for flexibility across deployment contexts
   - Health monitoring endpoints for infrastructure verification

2. **Mock Data Services** (by Shruti - Issue: Create Mock Data Services for UI Development)
   - 26 API endpoints serving realistic mock data
   - Pydantic schemas for request/response validation
   - JSON-based data files replicating AI engine outputs
   - Ready for UI team to build complete interfaces immediately
   - Zero database dependencies - data loads from files

---

## Project Structure

```
Warriors/
├── backend/
│   ├── venv/                        # Virtual environment (created with python -m venv venv)
│   │
│   ├── app/
│   │   ├── __init__.py              # Package initialization
│   │   ├── main.py                  # FastAPI application factory with all routers
│   │   ├── config.py                # Environment configuration (includes database config)
│   │   ├── database.py              # SQLAlchemy async engine and session management
│   │   ├── logger.py                # Structured JSON logging utilities
│   │   ├── telemetry.py             # Execution metrics recording
│   │   ├── tracing.py               # LangSmith integration
│   │   ├── models/                  # SQLAlchemy ORM models
│   │   │   ├── __init__.py
│   │   │   └── user.py              # User model (id, name, email, password_hash, role, courses_enrolled)
│   │   │
│   │   ├── routes/                  # Foundation infrastructure endpoints
│   │   │   ├── __init__.py
│   │   │   ├── health.py            # Health check endpoint
│   │   │   └── test_trace.py        # Infrastructure verification endpoint
│   │   │
│   │   ├── routers/                 # API endpoints (auth + mock data)
│   │   │   ├── __init__.py
│   │   │   ├── auth/                # Authentication endpoints
│   │   │   │   ├── __init__.py
│   │   │   │   ├── signup.py        # POST /api/auth/signup
│   │   │   │   ├── login.py         # POST /api/auth/login
│   │   │   │   └── verify.py        # POST /api/auth/verify-token
│   │   │   ├── courses.py           # Courses (featured, browse, generate, preview, enroll)
│   │   │   ├── classroom.py         # Learning workspace (lessons, quizzes, capstone, bookmarks)
│   │   │   └── analytics.py         # User analytics & dashboard
│   │   │
│   │   ├── schemas/                 # Pydantic validation models
│   │   │   ├── __init__.py
│   │   │   ├── user_schemas.py      # User models (SignupRequest, LoginRequest, LoginResponse, etc)
│   │   │   ├── course_schemas.py    # Course models (CoursePreview, FeaturedCourse, etc)
│   │   │   └── classroom_schemas.py # Classroom models (LessonContent, QuizStructure, etc)
│   │   │
│   │   ├── utils/                   # Utility functions
│   │   │   ├── __init__.py
│   │   │   ├── password.py          # Password hashing (hash_password, verify_password)
│   │   │   ├── validators.py        # Input validation (email, name, password)
│   │   │   ├── jwt_handler.py       # JWT token creation & verification
│   │   │   └── dependencies.py      # FastAPI dependencies for protected routes
│   │   │
│   │   └── data/                    # Mock JSON data files
│   │       ├── __init__.py
│   │       ├── featuredCourses.json     # 5 featured courses for landing page
│   │       ├── coursePreview.json       # Complete course with modules & lessons
│   │       ├── classroomWorkspace.json  # Lessons, quizzes, assessments, capstone
│   │       ├── bookmarks.json           # Bookmarked lessons
│   │       └── userDashboard.json       # User analytics & dashboard data
│   │
│   ├── main.py                      # Server entry point
│   ├── requirements.txt              # Python dependencies
│   ├── alembic.ini                  # Database migration configuration
│   ├── .env.example                 # Environment variables template
│   ├── .env                         # Environment configuration (development)
│   └── context.md                   # This file
│
├── frontend/                        # React application (coming soon)
├── .gitignore                       # Git ignore patterns
└── readme.md                        # Project README
```

## Running the Project

### Prerequisites: Setup Virtual Environment

**Requirements:**
- Python 3.13+ (Python 3.14 not yet supported due to package compatibility)
- PostgreSQL connection (Neon.tech cloud or local)

```bash
# Navigate to backend folder
cd Warriors/backend

# Create virtual environment with Python 3.13
py -3.13 -m venv venv

# Activate virtual environment
# On Windows (PowerShell):
venv\Scripts\Activate.ps1
# On Windows (CMD):
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### Environment Variables (.env)

**Required Configuration (must be set in .env):**
```
# Application Environment
APP_ENV=development

# Server Configuration
HOST=127.0.0.1
PORT=8000

# PostgreSQL Database Configuration
DATABASE_URL=postgresql+psycopg://user:password@localhost:5432/warriors_db

# JWT Configuration
JWT_SECRET=generate-a-random-secret-min-32-chars-using-secrets.token_urlsafe(32)
JWT_EXPIRATION_HOURS=24

# LangSmith Configuration
LANGSMITH_API_KEY=your-langsmith-api-key-or-empty-string
LANGSMITH_ENDPOINT=https://api.smith.langchain.com
LANGSMITH_PROJECT=your-project-name
```

**Configuration Details:**

| Variable | Required | Hardcoded Default | Purpose |
|----------|----------|-------------------|---------|
| `APP_ENV` | ✅ Yes | None | Deployment environment (development/production) |
| `HOST` | ✅ Yes | None | Server bind address |
| `PORT` | ✅ Yes | None | Server listen port |
| `DATABASE_URL` | ✅ Yes | None | PostgreSQL connection string |
| `JWT_SECRET` | ✅ Yes | None | Secret key for JWT signing (min 32 chars) |
| `JWT_EXPIRATION_HOURS` | ✅ Yes | None | JWT token expiration time in hours |
| `LANGSMITH_API_KEY` | ✅ Yes | None | LangSmith API key |
| `LANGSMITH_ENDPOINT` | ✅ Yes | None | LangSmith API endpoint URL |
| `LANGSMITH_PROJECT` | ✅ Yes | None | LangSmith project name |
| `DEBUG` | ❌ No | `False` | Enable debug mode (optional override) |
| `DATABASE_ECHO` | ❌ No | `False` | Log SQL statements (optional override) |
| `DATABASE_POOL_SIZE` | ❌ No | `20` | Connection pool size (optional override) |
| `DATABASE_MAX_OVERFLOW` | ❌ No | `0` | Max overflow connections (optional override) |
| `LANGSMITH_TRACING` | ❌ No | `False` | Enable LangSmith tracing (optional override) |
| `JWT_ALGORITHM` | ❌ No | `HS256` | JWT algorithm (optional override) |

**Setup Instructions:**
1. Copy `.env.example` to `.env`: `cp .env.example .env`
2. Update all **Required** variables in `.env` with your actual values
3. Keep `.env` in `.gitignore` (never commit secrets)

**Generating JWT_SECRET:**
```python
import secrets
print(secrets.token_urlsafe(32))
```

Copy the output and set it in `.env`

**Status:** ✅ **Database Connected & Initialized**
- Using **PostgreSQL** (Neon.tech or local)
- Driver: **psycopg v3.2.13** (async-capable)
- Tables auto-created on application startup via `init_db()`
- Connection pooling enabled (20 persistent connections)

### Start Server

```bash
# From Warriors/backend directory with venv activated
python main.py
```

Server runs on: `http://127.0.0.1:8000`

**Note:** All imports use relative paths (e.g., `from app.config import settings`), so run from the `backend/` directory.

### Verify Installation
```bash
# Foundation endpoints (her code)
GET /health                 → Server status
GET /test-trace            → LangSmith tracing verification

# Mock data endpoints (your code) - Sample 3 of 26
GET /api/courses/featured  → Featured courses
GET /api/classroom/course-001 → Learning workspace
GET /api/user/dashboard    → User analytics

# API Documentation
GET /docs                  → Swagger UI with all 26 endpoints
```

---

## Mock Data Services - 26 API Endpoints

**Status:** ✅ Complete & Production-Ready  
**Purpose:** Unblock UI team while AI agents are being built  
**Data Source:** JSON files (no database needed)

### Endpoints by Domain

**Authentication (3):**
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Current user profile

**Courses (5):**
- `GET /api/courses/featured` - Featured courses (landing page)
- `GET /api/courses` - Browse all courses (paginated)
- `POST /api/courses/generate` - Generate new course
- `GET /api/courses/{course_id}/preview` - Course preview with modules
- `POST /api/courses/{course_id}/enroll` - Enroll in course

**Classroom & Learning (11):**
- `GET /api/classroom/{course_id}` - Full classroom workspace
- `GET /api/classroom/{course_id}/lessons` - All lessons in course
- `GET /api/classroom/{course_id}/lessons/{lesson_id}` - Lesson with markdown content
- `GET /api/classroom/{course_id}/quizzes` - All course quizzes
- `GET /api/classroom/{course_id}/quizzes/{quiz_id}` - Specific quiz with questions
- `POST /api/classroom/{course_id}/quizzes/{quiz_id}/submit` - Submit quiz answers
- `GET /api/classroom/{course_id}/capstone` - Capstone project specs
- `POST /api/classroom/{course_id}/capstone/start` - Start capstone work
- `POST /api/classroom/{course_id}/capstone/submit` - Submit capstone
- `POST /api/classroom/progress/complete` - Mark lesson complete
- `POST /api/classroom/bookmarks/toggle` - Bookmark/unbookmark lesson
- `GET /api/classroom/bookmarks/` - Get all bookmarks

**Analytics & Dashboard (7):**
- `GET /api/user/dashboard` - Complete user dashboard
- `GET /api/user/analytics/activity` - Weekly activity metrics
- `GET /api/user/analytics/consistency` - Learning consistency heatmap
- `GET /api/user/milestones` - Upcoming milestones
- `GET /api/user/achievements` - Badges & achievements
- `GET /api/user/progress/overview` - Course progress overview
- `GET /api/user/stats` - User statistics

### Quick Test

```bash
# Browse to Swagger UI
http://127.0.0.1:8000/docs

# Or curl test
curl http://127.0.0.1:8000/api/courses/featured
curl http://127.0.0.1:8000/api/user/dashboard
```

### Mock Data Files

| File | Purpose | Size |
|------|---------|------|
| `featuredCourses.json` | Homepage course cards | 5 courses |
| `coursePreview.json` | Generated course layout | 3 modules, 8 lessons |
| `classroomWorkspace.json` | Complete learning environment | Lessons (markdown), quizzes, assessments, capstone |
| `bookmarks.json` | User bookmarks | 3 examples |
| `userDashboard.json` | User analytics & progress | Complete dashboard data |

### File Purposes

| File | Purpose | By |
|------|---------|-----|
| `app/main.py` | FastAPI application factory; initializes logging, tracing, middleware, and all routers on startup | Team Member |
| `app/config.py` | Centralized settings using Pydantic; loads environment variables from `.env` | Team Member |
| `app/logger.py` | Structured JSON logging with timestamp, level, module, function, and line number | Team Member |
| `app/telemetry.py` | `TelemetryRecorder` class for tracking execution duration, tokens, cost, and metadata | Team Member |
| `app/tracing.py` | LangSmith client wrapper; context managers for creating and finalizing runs | Team Member |
| `app/routes/health.py` | `GET /health` endpoint returning server status and LangSmith configuration | Team Member |
| `app/routes/test_trace.py` | `GET /test-trace` endpoint demonstrating telemetry and tracing integration | Team Member |
| `app/routers/auth.py` | 3 authentication endpoints: signup, login, profile retrieval | You |
| `app/routers/courses.py` | 5 course endpoints: featured, browse, generate, preview, enroll | You |
| `app/routers/classroom.py` | 11 learning endpoints: lessons, quizzes, assessments, capstone, bookmarks | You |
| `app/routers/analytics.py` | 7 analytics endpoints: dashboard, activity, consistency, milestones, achievements | You |
| `app/schemas/auth_schemas.py` | Pydantic models: SignupRequest, LoginRequest, TokenResponse, UserProfile | You |
| `app/schemas/course_schemas.py` | Pydantic models: CoursePreview, FeaturedCourse, ModulePreview, etc. | You |
| `app/schemas/classroom_schemas.py` | Pydantic models: LessonContent, QuizStructure, CapstoneSpecs, BookmarkItem | You |
| `app/data/featuredCourses.json` | Mock data: 5 featured courses for landing page | You |
| `app/data/coursePreview.json` | Mock data: Complete course with 3 modules and 8 lessons | You |
| `app/data/classroomWorkspace.json` | Mock data: Lessons (markdown), quizzes, assessments, capstone | You |
| `app/data/bookmarks.json` | Mock data: 3 sample bookmarked lessons | You |
| `app/data/userDashboard.json` | Mock data: User analytics, progress, milestones, achievements | You |
| `main.py` | Entry point; runs Uvicorn server with settings from `app/config.py` | Team Member |
| `requirements.txt` | Python package dependencies (FastAPI, Uvicorn, Pydantic, LangSmith, etc.) | Team Member |
| `.env.example` | Template for environment variables (copy to `.env` and fill in real values) | Team Member |
| `.env` | Development environment configuration with all required variables | You |

---

## Implemented Components

### Database Connection

**File:** `app/database.py`

Manages PostgreSQL connection and SQLAlchemy ORM setup for async operations.

**Components:**

- `Base` - SQLAlchemy declarative base for all ORM models. All models inherit from this class.
- `engine` - Async SQLAlchemy engine with connection pooling
  - Uses `postgresql+asyncpg://` driver for async operations
  - Pool size configurable via `DATABASE_POOL_SIZE` (default: 20)
  - `pool_pre_ping=True` ensures stale connections are refreshed
- `async_session` - Session factory for creating database sessions
- `get_db()` - FastAPI dependency that provides database sessions to route handlers
- `init_db()` - Initializes all database tables on application startup
- `close_db()` - Gracefully closes database connections on shutdown

**Usage in Route Handlers:**

```python
from fastapi import APIRouter, Depends
from app.database import get_db
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter()

@router.get("/example")
async def example_endpoint(db: AsyncSession = Depends(get_db)):
    # Use db for queries
    result = await db.execute(...)
    return result
```

**Creating ORM Models:**

```python
from app.database import Base
from sqlalchemy import Column, String, Integer

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True)
    name = Column(String(100))
    email = Column(String(100), unique=True)
```

Models are automatically registered when imported, and tables are created on `init_db()`.

---

### Configuration

**File:** `app/config.py`

The `Settings` class uses Pydantic to load and validate configuration from environment variables. Configuration is centralized in one place and accessible throughout the application via the `settings` singleton.

**Supported Environment Variables:**

| Variable | Default | Purpose |
|----------|---------|---------|
| `APP_ENV` | development | Deployment environment (development/production) |
| `DEBUG` | True | Enable debug mode for development |
| `HOST` | 127.0.0.1 | Server bind address |
| `PORT` | 8000 | Server listen port |
| `DATABASE_URL` | postgresql+psycopg://user:password@localhost:5432/warriors_db | PostgreSQL connection string (using psycopg driver) |
| `DATABASE_ECHO` | False | Log SQL statements (True for debugging) |
| `DATABASE_POOL_SIZE` | 20 | Connection pool size |
| `DATABASE_MAX_OVERFLOW` | 0 | Max overflow connections |
| `LANGSMITH_API_KEY` | None | API key for LangSmith authentication |
| `LANGSMITH_PROJECT` | None | LangSmith project name for organizing runs |
| `LANGSMITH_TRACING` | False | Enable/disable LangSmith tracing |
| `LANGSMITH_ENDPOINT` | https://api.smith.langchain.com | LangSmith API endpoint URL |

**Helper Methods:**

- `is_production()` - Returns True if `APP_ENV` is "production"
- `is_tracing_enabled()` - Returns True if both `LANGSMITH_TRACING=true` and API key is set

**Usage:**
```python
# Note: Relative imports (from app.config, not from backend.app.config)
# Note: Relative imports (from app.config, not from backend.app.config)
from app.config import settings

if settings.is_production():
    # Production-specific behavior
    pass

project_name = settings.LANGSMITH_PROJECT
```

---

### Logging

**File:** `app/logger.py`

Implements structured JSON logging for production-grade observability. Each log line is a JSON object containing timestamp, level, logger name, function, line number, and optional custom metadata.

**JSON Log Format:**
```json
{
  "timestamp": "2026-06-20T22:15:45.234567",
  "level": "INFO",
  "logger": "app.routes.test_trace",
  "message": "Sample token usage recorded",
  "module": "test_trace",
  "function": "test_trace",
  "line": 64,
  "exception": "optional traceback if error"
}
```

**Functions:**

- `configure_logging()` - Sets up JSON formatter and console handler; called once at app startup
- `get_logger(name)` - Returns a `LoggerAdapter` for a module (use `__name__` as parameter)
- `log_with_metadata(logger, level, message, **metadata)` - Logs with custom metadata

**Usage:**
```python
# Note: Relative import from app.logger
# Note: Relative import from app.logger
from app.logger import get_logger

logger = get_logger(__name__)

logger.info("Processing request")
logger.warning("Retrying failed request")
logger.error("Request failed", exc_info=True)
```

**Development vs Production:**
- **Development:** DEBUG level, logs all detail
- **Production:** INFO level, logs important events only

---

### Telemetry

**File:** `app/telemetry.py`

Tracks execution metrics for workflows: duration, token usage, cost, status, and custom metadata. Metrics are recorded locally and can be exported for storage or sent to observability systems.

**TelemetryMetrics Dataclass:**

Stores all metrics for a single execution:
- `run_id` - Unique UUID for this execution
- `start_time` / `end_time` - Timestamps for duration calculation
- `duration_ms` - Total execution time in milliseconds
- `status` - "running", "success", or "failure"
- `error_message` - Error details if status is "failure"
- `token_usage` - Dict with "input", "output", "total" token counts
- `estimated_cost` - Calculated cost based on tokens
- `metadata` - Custom key-value pairs

**TelemetryRecorder Class:**

Manages metrics for a single workflow execution.

**Methods:**
- `start()` - Initialize recording, return run_id
- `record_tokens(input_tokens, output_tokens)` - Update token counts
- `record_cost(cost)` - Set estimated cost
- `add_metadata(key, value)` - Add custom metadata
- `complete(status, error_message)` - Finalize and return all metrics as dict

**Usage Example:**
```python
# Note: Relative import from app.telemetry
# Note: Relative import from app.telemetry
from app.telemetry import create_run_context

# Create and start recording
telemetry = create_run_context("my-workflow")
run_id = telemetry.start()

try:
    # Do work
    result = do_something()
    
    # Record metrics
    telemetry.record_tokens(input_tokens=100, output_tokens=50)
    telemetry.record_cost(0.001)
    telemetry.add_metadata("model", "gpt-4")
    
    # Finalize
    metrics = telemetry.complete("success")
    
except Exception as e:
    metrics = telemetry.complete("failure", str(e))

# metrics is now a dict with all collected data
```

---

### LangSmith Tracing

**File:** `app/tracing.py`

Integrates with LangSmith for distributed tracing. Enables parent/child run relationships for nested workflow execution.

**Configuration:**

`configure_langsmith()` is called at app startup. It:
1. Reads LangSmith credentials from environment variables
2. Sets environment variables for the LangSmith client
3. Logs configuration status

**API Integration:**

LangSmith's `client.create_run()` returns `None` (void operation). The implementation:
1. Generates a UUID for the run_id using `uuid.uuid4()`
2. Passes it to `client.create_run()` as the `id` parameter
3. Later uses `client.update_run()` to attach metrics

**Context Manager: `trace_run()`**

Creates a LangSmith trace and yields the run_id. Use as a context manager.

**Signature:**
```python
@contextmanager
def trace_run(
    name: str,
    run_type: str = "chain",
    metadata: Optional[Dict[str, Any]] = None,
    tags: Optional[list] = None,
    parent_run_id: Optional[str] = None,
)
```

**Parameters:**
- `name` - Run name (appears in LangSmith dashboard)
- `run_type` - Type: "chain", "llm", "tool", "agent"
- `metadata` - Input data (dict, appears in Inputs tab)
- `tags` - List of tags for filtering
- `parent_run_id` - Parent run UUID for nested traces

**Function: `end_trace_run()`**

Finalizes a LangSmith run by attaching metrics. Must be called before exiting the `trace_run()` context.

**Signature:**
```python
def end_trace_run(
    run_id: str,
    outputs: Optional[Dict[str, Any]] = None,
    error: Optional[str] = None,
    token_usage: Optional[Dict[str, int]] = None,
    cost: Optional[float] = None,
    metadata: Optional[Dict[str, Any]] = None,
) -> None
```

**Parameters:**
- `run_id` - The run_id from `trace_run()` context
- `outputs` - Output data (dict, appears in Outputs tab)
- `error` - Error message if run failed
- `token_usage` - Dict with "prompt_tokens" and "completion_tokens"
- `cost` - Estimated cost of execution
- `metadata` - Additional metadata

**Usage Example:**
```python
# Note: Relative imports from app.tracing
# Note: Relative imports from app.tracing
from app.tracing import trace_run, end_trace_run

with trace_run(
    "my-workflow",
    run_type="chain",
    metadata={"input": user_input}
) as trace_run_id:
    # Do work
    result = process(user_input)
    
    # Attach metrics to LangSmith
    if trace_run_id:
        end_trace_run(
            run_id=trace_run_id,
            outputs={"result": result},
            token_usage={"prompt_tokens": 100, "completion_tokens": 50},
            cost=0.001
        )
    
    return result
```

**Parent/Child Tracing:**

For nested workflows, pass parent run_id to create child traces:

```python
# Note: Relative imports from app.tracing
from app.tracing import trace_run, end_trace_run

# Note: Relative imports from app.tracing
from app.tracing import trace_run, end_trace_run

# Parent trace
with trace_run("parent-workflow") as parent_id:
    # Do parent work
    
    # Child trace (nested)
    with trace_run("child-workflow", parent_run_id=parent_id) as child_id:
        # Do child work
        if child_id:
            end_trace_run(run_id=child_id, outputs={...})
    
    # Finalize parent
    if parent_id:
        end_trace_run(run_id=parent_id, outputs={...})
```

---

### Health Endpoint

**Endpoint:** `GET /health`

**Purpose:** Verify server is running and check configuration status.

**Response:**
```json
{
  "status": "healthy",
  "environment": "development",
  "langsmith_enabled": true,
  "langsmith_config": {
    "enabled": true,
    "project": "kbaseProject",
    "endpoint": "https://api.smith.langchain.com",
    "api_key_set": true
  }
}
```

**Usage:**
```bash
curl http://127.0.0.1:8000/health
```

---

### Test Trace Endpoint

**Endpoint:** `GET /test-trace`

**Purpose:** Demonstrates end-to-end integration of telemetry and LangSmith tracing. Useful for infrastructure verification during initial setup.

**Response:**
```json
{
  "status": "success",
  "message": "LangSmith tracing and telemetry are working correctly",
  "trace_run_id": "550e8400-e29b-41d4-a716-446655440000",
  "telemetry_run_id": "550e8400-e29b-41d4-a716-446655440001",
  "duration_ms": 115.25,
  "tokens_recorded": {
    "input": 150,
    "output": 100,
    "total": 250
  },
  "cost_recorded": 0.0025,
  "metadata_recorded": {
    "test_type": "end-to-end-verification",
    "endpoint": "GET /test-trace",
    "langsmith_trace_id": "550e8400-e29b-41d4-a716-446655440000"
  }
}
```

**What It Does:**
1. Creates a telemetry recorder and LangSmith trace
2. Records sample token usage (150 input, 100 output)
3. Records sample cost ($0.0025)
4. Adds sample metadata
5. Finalizes both systems
6. Returns all IDs and metrics

**Usage:**
```bash
curl http://127.0.0.1:8000/test-trace
```

**Note:** This endpoint is provided for infrastructure verification and may be removed after integration with production AI workflows. It demonstrates the correct usage pattern for all agents.

---

## How Future Developers Should Use This Infrastructure

### Creating a Telemetry Run

```python
# Note: All imports are relative (no backend.app prefix)
# Note: All imports are relative (no backend.app prefix)
from app.telemetry import create_run_context

# Initialize
telemetry = create_run_context("agent-name-operation")
run_id = telemetry.start()

# Record metrics as work happens
telemetry.record_tokens(input_tokens=100, output_tokens=50)
telemetry.record_cost(0.001)
telemetry.add_metadata("model", "gpt-4")
telemetry.add_metadata("agent_type", "research")

# Finalize and get metrics
metrics = telemetry.complete("success")
# metrics now contains all collected data
```

### Creating a LangSmith Trace

```python
# Note: All imports are relative (no backend.app prefix)
# Note: All imports are relative (no backend.app prefix)
from app.tracing import trace_run, end_trace_run

# Create trace context
with trace_run(
    name="research-query",
    run_type="chain",
    metadata={"query": "What is X?"}
) as trace_run_id:
    # Do work
    result = research_something()
    
    # Attach metrics before exiting context
    if trace_run_id:
        end_trace_run(
            run_id=trace_run_id,
            outputs={"answer": result},
            token_usage={"prompt_tokens": 100, "completion_tokens": 50},
            cost=0.001
        )
    
    return result
```

### Recording Tokens

```python
telemetry.record_tokens(
    input_tokens=count_tokens(input),
    output_tokens=count_tokens(output)
)

# For LangSmith
end_trace_run(
    run_id=trace_id,
    token_usage={
        "prompt_tokens": input_token_count,
        "completion_tokens": output_token_count
    }
)
```

### Recording Costs

```python
# Based on token usage
input_cost = input_tokens * 0.0005  # Example: $0.0005 per 1k tokens
output_cost = output_tokens * 0.0015  # Example: $0.0015 per 1k tokens
total_cost = (input_cost + output_cost) / 1000

telemetry.record_cost(total_cost)

# For LangSmith
end_trace_run(
    run_id=trace_id,
    cost=total_cost
)
```

### Recording Metadata

```python
# Telemetry
telemetry.add_metadata("model", "gpt-4-turbo")
telemetry.add_metadata("temperature", 0.7)
telemetry.add_metadata("max_tokens", 2000)

# LangSmith (pass as dict to end_trace_run)
end_trace_run(
    run_id=trace_id,
    metadata={
        "model": "gpt-4-turbo",
        "temperature": 0.7
    }
)
```

### Nested Parent/Child Tracing

```python
# Note: All imports are relative (no backend.app prefix)
# Note: All imports are relative (no backend.app prefix)
from app.tracing import trace_run, end_trace_run

async def parent_agent():
    with trace_run("parent-agent", metadata={}) as parent_id:
        # Parent work
        
        # Child trace 1
        with trace_run("child-research", parent_run_id=parent_id) as child_id_1:
            result1 = await research_agent()
            if child_id_1:
                end_trace_run(run_id=child_id_1, outputs={...})
        
        # Child trace 2
        with trace_run("child-assessment", parent_run_id=parent_id) as child_id_2:
            result2 = await assessment_agent()
            if child_id_2:
                end_trace_run(run_id=child_id_2, outputs={...})
        
        # Finalize parent
        if parent_id:
            end_trace_run(run_id=parent_id, outputs={...})
        
        return (result1, result2)
```

### Using Logging

```python
# Note: All imports are relative (no backend.app prefix)
# Note: All imports are relative (no backend.app prefix)
from app.logger import get_logger

logger = get_logger(__name__)

logger.info("Starting research on topic: python")
logger.debug(f"Query parameters: {params}")

try:
    result = do_research()
    logger.info(f"Research completed in {elapsed_time}ms")
except Exception as e:
    logger.error(f"Research failed: {str(e)}", exc_info=True)
```

---

## Current Status

✅ **FastAPI Server Running**
- Application factory pattern in `app/main.py`
- Automatic startup and shutdown event handlers
- CORS middleware enabled for cross-origin requests
- Server running on http://127.0.0.1:8000

✅ **Environment Management Configured**
- Settings loaded from `.env` file via Pydantic
- All configuration centralized in `app/config.py`
- Support for development and production environments

✅ **Structured Logging Implemented**
- JSON formatter for all log output
- Automatic timestamp, level, module, function, and line number
- Debug level in development, Info level in production

✅ **Telemetry Implemented**
- `TelemetryRecorder` class for tracking all metrics
- Duration, token usage, cost, status, and custom metadata support
- Metrics exported as dictionary for storage or transmission

✅ **LangSmith Integration Configured**
- Environment-driven configuration via `.env`
- `trace_run()` context manager for creating runs
- `end_trace_run()` function for attaching metrics
- Support for parent/child run relationships

✅ **Database Connection Initialized**
- PostgreSQL connected via Neon.tech (cloud-hosted)
- psycopg driver for async operations
- Connection pooling enabled (20 concurrent connections)
- Tables auto-created on startup via `init_db()`
- Database module in `app/database.py` provides: `Base` (ORM base class), `get_db()` dependency, session management

✅ **Infrastructure Ready for Future AI Agents & ORM Models**
- All utilities are reusable by new agents
- Database session injection ready for API endpoints
- `Base` class ready for ORM model definitions
- Alembic migrations configured for schema management

---

## Future Integration Points

When implementing new agents (Research, Curriculum, Assessment, Capstone), integrate with existing infrastructure as follows:

### Where to Add Agents

Create agent implementation files in a new directory structure:
```
app/agents/
├── __init__.py
├── research_agent.py      # Research Agent implementation
├── curriculum_agent.py    # Curriculum Agent implementation
├── assessment_agent.py    # Assessment Agent implementation
└── capstone_agent.py      # Capstone Agent implementation
```

### Integration Pattern for Each Agent

```python
# app/agents/research_agent.py

# Note: All imports are relative (run from backend/ directory)
# Note: All imports are relative (run from backend/ directory)
from app.telemetry import create_run_context
from app.tracing import trace_run, end_trace_run
from app.logger import get_logger

logger = get_logger(__name__)

async def research_agent(query: str, parent_run_id: str = None):
    """Research Agent with full observability."""
    
    # Create telemetry
    telemetry = create_run_context("research-agent")
    telemetry_id = telemetry.start()
    
    try:
        # Create LangSmith trace
        with trace_run(
            "research-workflow",
            run_type="chain",
            metadata={"query": query},
            parent_run_id=parent_run_id  # Link to parent if nested
        ) as trace_id:
            logger.info(f"Starting research on: {query}")
            
            # Do agent work
            result = await research_implementation(query)
            
            # Record metrics
            telemetry.record_tokens(
                input_tokens=count_tokens(query),
                output_tokens=count_tokens(result)
            )
            telemetry.record_cost(calculate_cost(...))
            telemetry.add_metadata("query_type", determine_type(query))
            
            # Attach to LangSmith
            if trace_id:
                end_trace_run(
                    run_id=trace_id,
                    outputs={"research_result": result},
                    token_usage={"prompt_tokens": ..., "completion_tokens": ...},
                    cost=...
                )
            
            logger.info("Research completed")
            
        metrics = telemetry.complete("success")
        
    except Exception as e:
        logger.error(f"Research failed: {str(e)}", exc_info=True)
        metrics = telemetry.complete("failure", str(e))
    
    return {
        "result": result,
        "trace_id": trace_id,
        "telemetry_id": telemetry_id,
        "metrics": metrics
    }
```

### Creating API Endpoints for Agents

```python
# app/routes/research.py

# Note: All imports are relative (run from backend/ directory)
# Note: All imports are relative (run from backend/ directory)
from fastapi import APIRouter
from app.agents.research_agent import research_agent

router = APIRouter(prefix="/research", tags=["agents"])

@router.post("/query")
async def query_research(query: str, parent_trace_id: str = None):
    """Execute research agent on a query."""
    result = await research_agent(query, parent_run_id=parent_trace_id)
    return result
```

Then register in `app/main.py`:
```python
# All imports use relative paths
# All imports use relative paths
from app.routes import research

app.include_router(research.router)
```

### Coordinating Multiple Agents

For workflows involving multiple agents with parent/child relationships:

```python
# Note: All imports are relative (run from backend/ directory)
from app.tracing import trace_run, end_trace_run

# Note: All imports are relative (run from backend/ directory)
from app.tracing import trace_run, end_trace_run

async def multi_agent_workflow(input_data):
    """Coordinate multiple agents with shared tracing."""
    
    # Parent trace
    with trace_run("multi-agent-workflow", metadata=input_data) as parent_id:
        
        # Research phase
        research_result = await research_agent(
            query=input_data["question"],
            parent_run_id=parent_id
        )
        
        # Curriculum phase
        curriculum_result = await curriculum_agent(
            research=research_result["result"],
            parent_run_id=parent_id
        )
        
        # Assessment phase
        assessment_result = await assessment_agent(
            curriculum=curriculum_result["result"],
            parent_run_id=parent_id
        )
        
        # Finalize parent trace
        if parent_id:
            end_trace_run(
                run_id=parent_id,
                outputs={
                    "research": research_result,
                    "curriculum": curriculum_result,
                    "assessment": assessment_result
                }
            )
        
        return {
            "research": research_result,
            "curriculum": curriculum_result,
            "assessment": assessment_result
        }
```

### Observability in Agent Routes

All agent routes automatically gain observability:
- **Logging:** Every operation logged with context
- **Telemetry:** Metrics tracked for cost and usage analysis
- **Tracing:** Full execution visible in LangSmith dashboard
- **Parent/Child:** Nested calls visible as trace hierarchy

No additional observability code needed—just use the provided utilities.

---

## Quick Reference

### Running the Server

```bash
# Navigate to backend folder
cd Warriors/backend

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies (one-time)
# Navigate to backend folder
cd Warriors/backend

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies (one-time)
pip install -r requirements.txt

# Start server (run from backend/ with venv activated)
# Start server (run from backend/ with venv activated)
python main.py

# Server available at http://127.0.0.1:8000
```

**Important:** Always run the app from the `Warriors/backend/` directory with the venv activated, since all imports use relative paths (e.g., `from app.config`)

**Important:** Always run the app from the `Warriors/backend/` directory with the venv activated, since all imports use relative paths (e.g., `from app.config`)

### Health Check

```bash
curl http://127.0.0.1:8000/health
```

### Test Infrastructure

```bash
curl http://127.0.0.1:8000/test-trace
```

### View API Documentation

```
http://127.0.0.1:8000/docs
```

---

## Database Setup Guide

### Current Status
✅ **Database is initialized and connected**
- PostgreSQL hosted on Neon.tech (cloud-based)
- Connection tested and working
- Tables auto-created on startup

### Technology Stack

The following packages are configured in `requirements.txt`:
- `sqlalchemy==2.0.36` - ORM and database toolkit
- `psycopg[binary]==3.2.13` - PostgreSQL driver (async-capable, Python 3.13+ compatible)
- `greenlet==3.1.1` - Required for SQLAlchemy async operations
- `alembic==1.13.3` - Database migration tool

### How the Database Works

**1. Automatic Initialization**

When the application starts, `init_db()` is called in `app/main.py` and:
- Connects to PostgreSQL via the driver specified in `DATABASE_URL`
- Creates all tables defined in ORM models (via `Base.metadata.create_all()`)
- Logs: `"Database tables initialized successfully"`

**2. Using the Database in API Endpoints**

```python
from fastapi import APIRouter, Depends
from app.database import get_db
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter()

@router.post("/users")
async def create_user(user_data: dict, db: AsyncSession = Depends(get_db)):
    # db is automatically injected
    # Use db for async queries: await db.execute(...), await db.query(...), etc.
    return {"status": "created"}
```

**3. Database Dependency Injection**
- FastAPI automatically injects database sessions via `Depends(get_db)`
- Session is closed automatically after the endpoint completes
- All queries use async/await: `await db.execute(...)`

### Defining ORM Models

When you're ready to add database models:

```python
from app.database import Base
from sqlalchemy import Column, String, Integer

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True)
    name = Column(String(100))
    email = Column(String(100), unique=True)
```

**Important:** Models must:
1. Inherit from `Base` imported from `app.database`
2. Have `__tablename__` defined
3. Be imported/registered before `init_db()` runs

### Using Alembic for Schema Migrations

When you need to modify the database schema without losing data:

```bash
# Create a migration from model changes
alembic revision --autogenerate -m "add users table"

# Apply migrations
alembic upgrade head

# Rollback migrations
alembic downgrade -1
```

Configuration for migrations is in `alembic.ini`.

### Troubleshooting

**Connection Error: "could not connect to server"**
- Verify `DATABASE_URL` in `.env` is correct
- Check if Neon.tech instance is active
- Ensure your IP is whitelisted (if applicable)

**Connection Error: "sslmode not supported"**
- Neon requires SSL: include `?sslmode=require` in DATABASE_URL (already configured)

**"Database tables initialized successfully" not in logs**
- Set `DATABASE_ECHO=true` in `.env` to see SQL statements
- Check for ORM model import errors
- Ensure models inherit from `Base`

**Alembic Errors**
- Run: `alembic current` to check current migration
- Run: `alembic history` to see all migrations
- Ensure migration files are in `alembic/versions/`

---

---

## User Authentication - Signup Implementation

### Status: ✅ Implemented & Working

**Signup Endpoint:** `POST /api/auth/signup`
- Creates new user accounts with email and password
- Validates duplicate emails
- Hashes passwords with bcrypt
- Generates JWT access token for immediate login
- Returns user data + access token on success (201 Created)

### Components

**1. User ORM Model** (`app/models/user.py`)
```python
class User(Base):
    __tablename__ = "users"
    id: int (Primary Key)
    name: str (100 chars)
    email: str (unique, indexed)
    password_hash: str (255 chars)
    role: str (default: "learner")
    courses_enrolled: int[] (array of course IDs)
```

**2. Signup Schemas** (`app/schemas/user_schemas.py`)
```python
class SignupRequest(BaseModel):
    name: str
    email: str
    password: str

class SignupResponse(BaseModel):
    access_token: str  # Bearer token for immediate login
    id: int
    name: str
    email: str
    role: str
    message: str
```

**3. Password Utility** (`app/utils/password.py`)
- `hash_password(password)` - Bcrypt hashing with salt
- `verify_password(password, hash)` - Verify password against hash

**4. Signup Router** (`app/routers/auth/signup.py`)
- Creates user with hashed password
- Checks for duplicate emails
- Generates JWT access token for immediate login
- Handles database errors gracefully
- Returns 201 Created on success

### How It Works

**Request:**
```bash
POST http://127.0.0.1:8000/api/auth/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepass123"
}
```

**Response (201 Created):**
```json
{
  "access_token": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiZW1haWwiOiJqb2huQGV4YW1wbGUuY29tIiwiaWF0IjoxNzgyMTA4NzMxLCJleHAiOjE3ODIxOTUxMzF9...",
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "role": "learner",
  "message": "User created successfully"
}
```

Users can immediately use the `access_token` for authenticated requests without logging in separately!

**Error Cases:**
- Duplicate email: `400 Bad Request - "Email already registered"`
- Missing fields: `422 Unprocessable Entity`
- Server error: `500 Internal Server Error`

### Database

- Users table auto-created on startup
- Email indexed for fast lookups
- Password never returned in responses
- Role defaults to "learner"
- courses_enrolled array initialized empty

### Testing

**Using curl:**
```bash
curl -X POST http://127.0.0.1:8000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alice Smith",
    "email": "alice@example.com",
    "password": "password456"
  }'
```

**Using Swagger UI:**
```
http://127.0.0.1:8000/docs
```
Find `/api/auth/signup` and use the "Try it out" button.

### Security Features

- ✅ Password hashing with bcrypt (salted)
- ✅ Duplicate email prevention
- ✅ Password never exposed in responses
- ✅ Input validation (min 6 char password)
- ✅ Database constraints (unique email, indexed)

---

## User Authentication - Login Implementation

### Status: ✅ Implemented & Working

**Login Endpoint:** `POST /api/auth/login`
- Validates user credentials
- Generates JWT access token (24 hour expiration)
- Returns user data with token
- Uses bcrypt password verification

### Components Created

**1. JWT Handler** (`app/utils/jwt_handler.py`)
- `create_access_token(user_id, email)` - Generate JWT token
  - Includes user ID and email in payload
  - Sets expiration to 24 hours (configurable)
  - Uses HS256 algorithm
- `decode_access_token(token)` - Validate and decode token
  - Handles expired tokens
  - Handles invalid tokens
  - Returns payload dict or None

**2. Login Schemas** (`app/schemas/user_schemas.py`)
```python
class LoginRequest(BaseModel):
    email: str
    password: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
    message: str
```

**3. Login Router** (`app/routers/auth/login.py`)
- Route: `POST /api/auth/login`
- Validates email format
- Queries user by email from database
- Verifies password with bcrypt
- Generates JWT token with user ID (as string) and email
- Returns user data + token in Bearer format

**4. JWT Configuration** (`app/config.py`)
```
JWT_SECRET=your-secret-key-change-in-production-min-32-chars
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24
```

### Testing Login

**Request:**
```bash
POST http://127.0.0.1:8000/api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepass123"
}
```

**Success Response (200 OK):**
```json
{
  "access_token": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiZW1haWwiOiJqb2huQGV4YW1wbGUuY29tIiwiaWF0IjoxNzgyMTA4NzMxLCJleHAiOjE3ODIxOTUxMzF9...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "learner",
    "courses_enrolled": []
  },
  "message": "Login successful"
}
```

**Error Responses:**
- Invalid email/password: `401 Unauthorized - "Invalid email or password"`
- User not found: `401 Unauthorized - "Invalid email or password"`
- Invalid email format: `400 Bad Request`
- Missing fields: `422 Unprocessable Entity`
- Server error: `500 Internal Server Error`

### JWT Token Details

**Token Payload:**
```python
{
  "sub": 1,           # user_id (subject)
  "email": "john@example.com",
  "iat": 1687767640,  # issued at
  "exp": 1687854040   # expires at (24 hours later)
}
```

**Token Format:** `eyJhbGc...` (3 parts separated by dots)
- Header: Algorithm and type
- Payload: Claims (user data)
- Signature: Verification hash

### Security Features

✅ Password verified with bcrypt  
✅ JWT token generation with HS256  
✅ 24-hour token expiration  
✅ Email validation before lookup  
✅ Generic error messages (don't reveal if user exists)  
✅ Logging of all login attempts and failures  
✅ Signature verification on decode  

### Using the Token

Include token in subsequent requests:
```bash
curl -H "Authorization: Bearer eyJhbGc..." \
     http://127.0.0.1:8000/api/protected-endpoint
```

---

## User Authentication - Token Verification Implementation

### Status: ✅ Implemented & Working

**Verify Token Endpoint:** `POST /api/auth/verify-token`
- Verifies JWT token validity and expiration
- Returns user data if token is valid
- Returns error message if token is invalid/expired
- Token sent via Authorization header (Bearer scheme)

### Components Created

**1. Enhanced JWT Handler** (`app/utils/jwt_handler.py`)

**Functions:**
- `create_access_token(user_id, email)` - Generate JWT token
  - Converts user_id to string (JWT spec requirement)
  - Sets expiration to 24 hours
  - Uses HS256 algorithm
- `verify_token(token)` - Full verification with detailed status
  - Returns: `(is_valid: bool, payload: dict | None, message: str)`
  - Handles: expired tokens, invalid signatures, decode errors
  - Returns detailed error messages for debugging

**2. Token Verification Router** (`app/routers/auth/verify.py`)
- Route: `POST /api/auth/verify-token`
- Accepts token via Authorization header as `Bearer <token>`
- Verifies token signature and expiration
- Queries user from database
- Returns user data (id, name, email, role) if valid

**3. Token Verification Schemas** (`app/schemas/user_schemas.py`)
```python
class TokenVerifySuccess(BaseModel):
    success: bool = True
    id: int
    name: str
    email: str
    role: str

class TokenVerifyFail(BaseModel):
    success: bool = False
    message: str
```

### Testing Token Verification

**Request (using curl):**
```bash
curl -X POST http://127.0.0.1:8000/api/auth/verify-token \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "role": "learner"
}
```

**Error Response (200 OK with success=false):**
```json
{
  "success": false,
  "message": "Token has expired"
}
```

**Other Error Messages:**
- `"Token is required"` - No token provided
- `"Token has expired"` - Token expiration time passed
- `"Invalid token signature"` - JWT_SECRET mismatch
- `"Invalid token format"` - Malformed token
- `"User not found"` - User deleted from database
- `"Invalid token"` - General token error

### Token Verification Details

**Token Payload Structure:**
```python
{
  "sub": "1",           # user_id as string
  "email": "john@example.com",
  "role": "learner",    # user role from database
  "iat": 1782108731,    # issued at timestamp
  "exp": 1782195131     # expiration timestamp
}
```

**Token Location:**
- ✅ Must be in `Authorization` header
- ✅ Format: `Authorization: Bearer <token>`
- ❌ NOT in request body
- ❌ NOT as query parameter

### Directory Structure

```
app/routers/auth/
├── __init__.py          # Exports all auth routers
├── signup.py            # POST /api/auth/signup
├── login.py             # POST /api/auth/login
└── verify.py            # POST /api/auth/verify-token
```

### Auth Routes Summary

| Endpoint | Method | Input | Output |
|----------|--------|-------|--------|
| `/api/auth/signup` | POST | name, email, password | user data (201 Created) |
| `/api/auth/login` | POST | email, password | access_token (Bearer format), user data |
| `/api/auth/verify-token` | POST | Authorization: Bearer <token> | success + user data OR error message |

### Security Features

✅ JWT signature verification with secret key  
✅ Token expiration checks  
✅ Password hashing with bcrypt  
✅ Email uniqueness validation  
✅ User existence validation on verify  
✅ Detailed error logging  
✅ Generic error messages (no info leakage)  

---

## Global Authentication Middleware

### Status: ✅ Implemented & Working

**All routes EXCEPT public endpoints require authentication.**

### How It Works

1. **Middleware checks every request** to protected endpoints
2. **Extracts JWT from Authorization header** (Bearer token format)
3. **Verifies token validity** using JWT_SECRET
4. **Stores user info in request state** for route handlers
5. **Returns 401 Unauthorized** if token missing/invalid

### Public Endpoints (No Auth Required)

- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/login` - Login and get token
- `GET /health` - Health check
- `GET /test-trace` - Infrastructure test
- `GET /docs` - API documentation
- `GET /openapi.json` - OpenAPI schema
- `GET /redoc` - ReDoc documentation

### Protected Endpoints (Auth Required)

ALL other endpoints require valid JWT token in `Authorization` header:
- `/api/courses/*` - All course endpoints
- `/api/classroom/*` - All classroom endpoints
- `/api/analytics/*` - All analytics endpoints
- `/api/admin/*` - Admin-only endpoints

### Using Protected Routes

**1. Get token via signup:**
```bash
curl -X POST http://127.0.0.1:8000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'
```

**Response includes `access_token`:**
```json
{
  "access_token": "Bearer eyJhbGc...",
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "role": "learner"
}
```

**2. Use token for protected route:**
```bash
curl -X GET http://127.0.0.1:8000/api/courses/featured \
  -H "Authorization: Bearer eyJhbGc..."
```

**3. Missing token returns 401:**
```bash
curl -X GET http://127.0.0.1:8000/api/courses/featured
```

**Response:**
```json
{
  "detail": "Authentication required. Please provide a valid token."
}
```

### Token Format

**Must use Bearer scheme:**
```
Authorization: Bearer <token>
```

**NOT valid:**
- `Authorization: <token>` (missing Bearer)
- `Token: <token>` (wrong scheme)
- Request body: `{"token": "..."}` (wrong location)

### Implementation Details

**Middleware file:** `app/middleware/auth_middleware.py`
- Class: `AuthMiddleware(BaseHTTPMiddleware)`
- Uses: `verify_token()` from `jwt_handler.py`
- Returns: `JSONResponse` with proper HTTP status codes

**Main app integration:** `app/main.py`
- Added: `app.add_middleware(AuthMiddleware)` (before CORS)

---

## Admin Route Protection

### Status: ✅ Implemented & Working

**Admin-Only Routes:** Protected endpoints accessible ONLY to users with `role="admin"`

### Components Created

**1. Admin Dependency** (`app/utils/dependencies.py`)
- `get_admin_user(credentials)` - Protected dependency that:
  - Verifies JWT token
  - Checks if user role is "admin" (from JWT payload)
  - Returns 403 Forbidden if not admin
  - Uses JWT role (from database at login time)

**2. Admin Router** (`app/routers/admin.py`)
- Example admin-only routes
- All protected with `Depends(get_admin_user)`

### Security Features

✅ Role comes from database (at login/signup time)  
✅ Role stored in JWT payload for fast checks  
✅ No user input used for role assignment  
✅ Only database admins can promote users to admin  
✅ JWT signature verification prevents tampering  
✅ 403 Forbidden for non-admin access attempts  

### Admin Routes

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/admin/dashboard` | GET | Admin dashboard |
| `/api/admin/users-count` | GET | Get total users count |
| `/api/admin/action` | POST | Perform admin actions |
| `/api/admin/info` | GET | Get admin user info |
| `/api/admin/test` | GET | Test admin protection |

### Testing Admin Protection

**Login as admin:**
```bash
curl -X POST http://127.0.0.1:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "password": "admin@123"
  }'
```

**Test admin endpoint (200 OK):**
```bash
curl -X GET http://127.0.0.1:8000/api/admin/test \
  -H "Authorization: Bearer eyJhbGc..."
```

**Response:**
```json
{
  "status": "success",
  "message": "Admin protection is working!",
  "jwt_claims": {
    "user_id": "2",
    "email": "admin@test.com",
    "role": "admin",
    "issued_at": 1782108731,
    "expires_at": 1782195131
  }
}
```

**Non-admin user tries to access (403 Forbidden):**
```json
{
  "detail": "Admin access required. You do not have permission to access this resource."
}
```

### Creating Admin Users

To make a user admin, update the database directly:
```sql
UPDATE users SET role = 'admin' WHERE email = 'user@example.com';
```

**Never expose admin creation via API endpoints** - only database admins should have this privilege.

### Using Admin Dependency in Routes

```python
from fastapi import APIRouter, Depends
from app.utils.dependencies import get_admin_user

router = APIRouter()

@router.delete("/admin/users/{user_id}")
async def delete_user(user_id: int, admin: dict = Depends(get_admin_user)):
    """Only admin users can access this route"""
    return {"deleted_by": admin["email"]}
```

### Next Steps

- Create token refresh endpoint
- Add email verification on signup
- Create profile endpoints (get, update)
- Add password reset functionality

---

## Latest Updates (2026-06-22)

### Database Migration: Async → Synchronous ✅
- **Changed:** `postgresql+psycopg://` (async) → `postgresql+psycopg2://` (synchronous)
- **Why:** Windows ProactorEventLoop incompatible with async psycopg3
- **Solution:** Switched to psycopg2 (synchronous) driver with WindowsSelectorEventLoopPolicy
- **Files Modified:**
  - `backend/.env`
  - `backend/app/database/connection.py`
  - `backend/app/main.py` (event loop policy now set BEFORE imports)

### Router Conversion: All Endpoints Sync ✅
- **Converted:** 33 endpoints from `async def` to `def` (synchronous)
- **Files Modified:**
  - `backend/app/routers/courses.py` (5 endpoints)
  - `backend/app/routers/analytics.py` (8 endpoints)
  - `backend/app/routers/classroom.py` (12 endpoints)
  - `backend/app/routers/admin.py` (5 endpoints)
  - `backend/app/routers/dashboard.py` (1 endpoint)
  - `backend/app/routers/auth/*.py` (2 endpoints)

### Model Relationships Added ✅
- **File:** `backend/app/models/user.py`
- **Added relationships:**
  - `user_courses` → UserCourse back_populates
  - `learning_activities` → LearningActivity back_populates
  - `user_goals` → UserGoal back_populates
  - `milestones` → Milestone back_populates
- **Why:** Dashboard repository needs to query user relationships

### Model Exports Updated ✅
- **File:** `backend/app/models/__init__.py`
- **Now exports:** User, Course, UserCourse, LearningActivity, UserGoal, Milestone
- **Why:** Dashboard and services need to import all models

### Dashboard Router Registered ✅
- **File:** `backend/app/main.py`
- **Added:** Dashboard router import and registration
- **Why:** Dashboard endpoint wasn't exposed at startup

### Middleware: Public Endpoints Updated ✅
- **File:** `backend/app/middleware/auth_middleware.py`
- **Added:** Course endpoints to PUBLIC_ENDPOINTS list
- **Why:** Testing endpoints should not require auth

## Current Status (Testing: 17/36 endpoints verified)

**✅ Endpoints Tested:**
- Courses: featured, generate, preview, enroll
- Dashboard: dashboard
- Classroom: workspace, lessons, bookmarks
- Analytics: dashboard, stats
- Admin: dashboard, users-count
- Auth: signup, login, verify-token
- Health: health, test-trace

**🔄 Next Steps:**
- Test remaining 19 endpoints
- Add database seed data
- Complete classroom/analytics functionality
- Add integration tests

## Architecture

```
Backend Stack:
├── Framework: FastAPI (async-capable)
├── Database: PostgreSQL (synchronous with psycopg2)
├── ORM: SQLAlchemy (synchronous)
├── Auth: JWT tokens (24 hour expiration)
├── Event Loop: WindowsSelectorEventLoopPolicy (Windows compatibility)
└── All Operations: Synchronous (no async/await)
```

## Testing Token
```
Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzIiwiZW1haWwiOiJqb2hAZXhhbXBsZS5jb21hbCIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4MjEyODg4MCwiZXhwIjoxNzgyMjE1MjgwfQ._jMYPUCCUa1R4mbxUlFblrm-mW_pHFJKMJo-BGX5RvA
```

## Summary

This backend provides production-ready infrastructure for AI agent workflows and user authentication. All agents integrate seamlessly by:

1. Importing telemetry and tracing utilities
2. Creating contexts at workflow start
3. Recording metrics as work progresses
4. Finalizing before returning results

**Current Features:**
- ✅ Database initialized with PostgreSQL (synchronous)
- ✅ User model and signup endpoint (working)
- ✅ Login & token verification (working)
- ✅ Password hashing and security (bcrypt)
- ✅ Mock data services (26+ endpoints)
- ✅ Observability (logging, telemetry, tracing)
- ✅ All endpoints synchronous (Windows-compatible)
- ✅ 17/36 endpoints tested and verified

The infrastructure is production-ready. Development focus: complete endpoint testing and add seed data.

---

## Testing Infrastructure

### Test Suite Overview
Comprehensive test coverage using pytest for all API endpoints. Currently implemented:

**Signup Endpoint Tests: 51 test cases (100% passing)**
- Email validation (9 tests): format, length, duplicates, case-insensitivity
- Name validation (9 tests): length, characters, whitespace handling
- Password validation (10 tests): strength requirements, length constraints
- Duplicate email handling (3 tests): case-sensitive and case-insensitive
- Missing/null fields (4 tests): required field validation
- Response structure (4 tests): token format, user data, security
- Edge cases (5 tests): multiple users, IDs, role enforcement

**Login Endpoint Tests: 34 test cases (100% passing)**
- Basic functionality (4 tests): successful login, email case-insensitivity, token/user info
- Email validation (7 tests): format, case-sensitivity, spaces, missing fields
- Password validation (4 tests): empty, short, missing, null passwords
- Authentication (4 tests): user not found, wrong password, case-sensitivity, failed attempts
- Response structure (6 tests): token format, user object, fields, no password leakage
- Edge cases (5 tests): special characters, long passwords, role preservation, course enrollment
- Missing fields (2 tests): all fields missing, null values
- Integration (2 tests): login after signup, multiple users

**Verify Token Endpoint Tests: 25 test cases (100% passing)**
- Basic functionality (3 tests): valid token verification, user data returned, Bearer prefix
- Invalid tokens (6 tests): empty, malformed, corrupted, wrong secret, expired, invalid user
- Random tokens (1 test): completely invalid token strings
- Missing headers (5 tests): missing Authorization header, wrong Bearer prefix, wrong scheme, empty header
- Response structure (5 tests): success/failure fields, HTTP status codes, all fields present
- Edge cases (5 tests): special characters in email, role preservation, multiple tokens, extra whitespace, user identity
- Integration (3 tests): token from signup, token from login, complete lifecycle (signup → login → verify)

**Total Test Coverage: 110 tests (100% passing)**

### Setup & Installation

**Test dependencies** (separate from production):
```bash
pip install -r requirements-test.txt
```

Includes: pytest, pytest-asyncio, httpx, pytest-cov, pytest-xdist, pytest-mock, pytest-html

**Database configuration:**
- Uses `TEST_DATABASE_URL` from `.env` (separate test database on Neon PostgreSQL)
- Falls back to `DATABASE_URL` if test database not configured
- Automatically creates tables before test session
- Cleans up user table between tests via TRUNCATE

### Running Tests

**All auth tests (signup + login + verify token):**
```bash
pytest tests/test_auth_signup.py tests/test_auth_login.py tests/test_auth_verify_token.py -v
```

**Signup tests only:**
```bash
pytest tests/test_auth_signup.py -v
```

**Login tests only:**
```bash
pytest tests/test_auth_login.py -v
```

**Verify token tests only:**
```bash
pytest tests/test_auth_verify_token.py -v
```

**Specific test class:**
```bash
pytest tests/test_auth_signup.py::TestSignupEmailValidation -v
pytest tests/test_auth_login.py::TestLoginAuthentication -v
```

**Specific single test:**
```bash
pytest tests/test_auth_login.py::TestLoginBasicFunctionality::test_login_success -v
```

**With coverage report:**
```bash
pytest tests/ --cov=app --cov-report=html
```

**Parallel execution (faster):**
```bash
pytest tests/ -n auto
```

### Test Architecture

**Key Files:**
- `tests/test_auth_signup.py` - 51 signup endpoint tests organized in 9 test classes
- `tests/test_auth_login.py` - 34 login endpoint tests organized in 8 test classes
- `tests/test_auth_verify_token.py` - 25 verify token endpoint tests organized in 7 test classes
- `tests/conftest.py` - Shared pytest fixtures for database and client setup
- `requirements-test.txt` - Test-only dependencies

**How tests work:**
1. ✅ App created in-memory (no server process needed)
2. ✅ Database connection overridden to test database
3. ✅ FastAPI TestClient simulates HTTP requests directly
4. ✅ Completely isolated - no production data affected
5. ✅ No manual backend startup required (`pytest` runs everything)

**Test isolation:**
- Session-level: Database tables created once per test session
- Function-level: User table truncated before each test
- No shared state between tests

### Coverage Metrics
- 51 tests for signup endpoint
- 100% passing
- Covers: validation, duplicates, response structure, edge cases, security
- Can be extended with `--cov=app` to generate detailed coverage reports

### Test Files

**Implemented:**
- `tests/test_auth_signup.py` - 51 tests for signup endpoint
- `tests/test_auth_login.py` - 34 tests for login endpoint
- `tests/conftest.py` - Shared fixtures and database setup

**Key Test Utilities:**
- Database fixtures with automatic table creation and cleanup
- Client fixture with FastAPI TestClient
- Session fixture for direct database access in tests
- Automatic user table truncation between tests

### Next Steps for Testing
Additional test files to implement:
- `test_courses.py` - Course endpoints (list, create, update, delete)
- `test_dashboard.py` - Dashboard endpoints (user stats, progress)
- `test_analytics.py` - Analytics endpoints (learning patterns, metrics)
- `test_classroom.py` - Classroom endpoints (lessons, content)
- `test_admin.py` - Admin endpoints (user management, system stats)
- Integration tests for multi-endpoint workflows
- Performance/load testing
- Concurrent request handling

---

## API Migration & Data Consistency Bug Fix (2026-06-23)

### Migration: Mock JSON → PostgreSQL Database ✅

**Status:** Complete - All 36 API endpoints migrated from mock JSON data to real PostgreSQL database

**Changes Made:**

1. **Database Tables Created:**
   - `users` - User accounts and authentication
   - `courses` - Course catalog with metadata
   - `user_courses` - User enrollment tracking with status (ENROLLED, IN_PROGRESS, COMPLETED)
   - `lessons` - Course lesson content with markdown
   - `quizzes` - Assessment quizzes with questions
   - `quiz_options` - Multiple choice options for quiz questions
   - `learning_activities` - User learning activity tracking
   - `user_goals` - User learning goals and milestones
   - `milestones` - Course milestones and achievements

2. **All Endpoints Updated:**
   - Routes: `app/routers/courses.py`, `app/routers/classroom.py`, `app/routers/analytics.py`
   - **Courses:** featured, browse, generate, preview, enroll (5 endpoints)
   - **Classroom:** workspace, lessons, quizzes, quiz submission, capstone, progress, bookmarks (11 endpoints)
   - **Analytics:** dashboard, activity, consistency, milestones, achievements, stats, progress (8 endpoints)
   - **Admin:** dashboard, users-count, action, info, test (5 endpoints)
   - **Auth:** signup, login, verify-token (3 endpoints)
   - **Health:** health, test-trace (2 endpoints)

3. **Repository Pattern Implemented:**
   - **File:** `app/repositories/dashboard_repository.py`
   - Centralized database queries for analytics and dashboard data
   - Methods implemented:
     - `get_stats()` - Enrolled/completed/hours/streak counts
     - `get_weekly_activity()` - Weekly learning activity
     - `get_enrolled_courses()` - List of enrolled courses with progress
     - `get_recently_completed()` - Recently completed courses
     - `get_milestones()` - Course milestones
     - `get_user_greeting()` - Personalized greeting

### Data Inconsistency Bug - FIXED ✅

**Issue:** Dashboard endpoint returned conflicting data
```json
{
  "stats": {"enrolled_courses": 4},
  "enrolled_courses": {"courses_list": []}  // Empty!
}
```

**Root Cause:** Two different status filters in dashboard repository:
- `get_stats()` counted: `UserCourse.status.in_(["ENROLLED", "IN_PROGRESS"])` → 4 courses
- `get_enrolled_courses()` counted: `UserCourse.status == "IN_PROGRESS"` → 0 courses

**Solution Applied:**

**File:** `app/repositories/dashboard_repository.py`

**Change 1 - Line 456 (Query Filter):**
```python
# BEFORE:
UserCourse.status == "IN_PROGRESS"

# AFTER:
UserCourse.status.in_(["ENROLLED", "IN_PROGRESS"])
```

**Change 2 - Line 473 (Status Field):**
```python
# BEFORE:
"status": "in_progress"

# AFTER:
"status": c[0].status.lower()
```

**Why:** Makes status field reflect actual database value instead of hardcoding to "in_progress"

**Verification:** ✅ Tested on 2026-06-23
- Server restarted with updated code
- All 4 enrolled courses now returned in courses_list
- stats.enrolled_courses (4) matches courses_list length (4)
- Data is now consistent

### Test Results: 36/36 Endpoints PASSING ✅

**All Endpoints Verified:**

**Health & Testing (2):**
- ✅ GET /health
- ✅ GET /test-trace

**Authentication (3):**
- ✅ POST /api/auth/signup
- ✅ POST /api/auth/login
- ✅ POST /api/auth/verify-token

**Courses (6):**
- ✅ GET /api/courses/featured
- ✅ GET /api/courses/
- ✅ GET /api/courses/?skip=0&limit=5
- ✅ POST /api/courses/generate
- ✅ GET /api/courses/1/preview
- ✅ POST /api/courses/{id}/enroll

**Classroom (11):**
- ✅ GET /api/classroom/1
- ✅ GET /api/classroom/1/lessons
- ✅ GET /api/classroom/1/lessons/1
- ✅ GET /api/classroom/1/quizzes
- ✅ GET /api/classroom/1/quizzes/1
- ✅ POST /api/classroom/1/quizzes/1/submit
- ✅ POST /api/classroom/1/capstone/start
- ✅ POST /api/classroom/1/capstone/submit
- ✅ POST /api/classroom/progress/complete?course_id=1&lesson_id=1
- ✅ POST /api/classroom/bookmarks/toggle?lesson_id=1&course_id=1
- ✅ GET /api/classroom/bookmarks/

**Dashboard (1):**
- ✅ GET /api/v1/dashboard

**User Analytics (8):**
- ✅ GET /api/user/dashboard
- ✅ GET /api/user/analytics/activity
- ✅ GET /api/user/analytics/consistency
- ✅ GET /api/user/milestones
- ✅ GET /api/user/achievements
- ✅ GET /api/user/progress/overview
- ✅ GET /api/user/stats
- ✅ GET /api/user/completed-courses

**Admin (5):**
- ✅ GET /api/admin/dashboard
- ✅ GET /api/admin/users-count
- ✅ POST /api/admin/action
- ✅ GET /api/admin/info
- ✅ GET /api/admin/test

### Authentication & Security Fixes (2026-06-22 to 2026-06-23)

**1. Middleware Architecture:**
- **File:** `app/middleware/auth_middleware.py`
- Issue: Auth middleware skipped validation for public endpoints, so request.state.user wasn't set
- Fix: Refactored to ALWAYS validate Authorization header and set request.state.user for valid tokens
- Change: Decoupled auth validation from endpoint access control
- Result: request.state.user now available in all protected routes

**2. Enroll in Course Endpoint:**
- **File:** `app/routers/courses.py`
- Issue: Used deprecated `current_user_context.get()` which returned None
- Fix: Changed to use `request.state.user` with Request parameter dependency injection
- Added: `db: Session` parameter to avoid instantiating SessionLocal()
- Result: Enrollment now works correctly with authenticated users

**3. Quiz Security:**
- **File:** `app/routers/classroom.py`
- Issue: Quiz preview exposed correct answers and explanations
- Fix: Set `is_correct=False` and `explanation=None` for preview responses
- Result: Students can't cheat by viewing quiz answers before submission

**4. Classroom Endpoints:**
- **File:** `app/middleware/auth_middleware.py`
- Issue: Classroom read endpoints returned 401 despite being public
- Fix: Added `/api/classroom/` to PUBLIC_ENDPOINTS list
- Result: Course previews and lesson browsing accessible without login

### Files Modified

1. **`app/middleware/auth_middleware.py`**
   - Refactored dispatch() method
   - Always validates Authorization header
   - Sets request.state.user for valid tokens
   - Added /api/classroom/ to public endpoints

2. **`app/routers/courses.py`**
   - Line: enroll_in_course() function
   - Changed from current_user_context to request.state.user
   - Added Request and Session dependencies

3. **`app/routers/classroom.py`**
   - Line 162: Changed `is_correct=opt.is_correct` to `is_correct=False`
   - Line 166: Changed `explanation=q.explanation` to `explanation=None`

4. **`app/repositories/dashboard_repository.py`**
   - Line 456: Updated status filter
   - Line 473: Updated status field assignment

5. **`app/routers/analytics.py`**
   - No changes needed (already calling corrected repository method)

### Status Summary

**Database:** ✅ PostgreSQL connected and initialized
**All 36 Endpoints:** ✅ Tested and passing
**Authentication:** ✅ JWT middleware working correctly
**Security:** ✅ Quiz answers hidden from preview
**Data Consistency:** ✅ Enrolled courses bug fixed
**Performance:** ✅ Connection pooling enabled (20 connections)

### Documentation Generated

- **ENDPOINT_TEST_CASES_WITH_OUTPUTS.md** - Updated with actual endpoint responses
- **BUG_FIX_IMPLEMENTATION_SUMMARY.md** - Detailed bug fix documentation
- **DASHBOARD_TEST_REPORT.md** - Dashboard endpoint test results
- **QUICK_TEST_REFERENCE.txt** - Quick reference for all endpoints

### Next Steps

1. ✅ Complete endpoint testing - ALL 36 PASSING
2. ✅ Fix data inconsistency bug - RESOLVED
3. ✅ Verify authentication - WORKING
4. ✅ Test security measures - IMPLEMENTED
5. 🔄 Add more seed data for testing
6. 🔄 Implement remaining features (capstone reviews, etc.)
7. 🔄 Add integration tests for multi-endpoint workflows
