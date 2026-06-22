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
│   │   ├── config.py                # Environment configuration
│   │   ├── logger.py                # Structured JSON logging utilities
│   │   ├── telemetry.py             # Execution metrics recording
│   │   ├── tracing.py               # LangSmith integration
│   │   │
│   │   ├── routes/                  # Foundation infrastructure endpoints
│   │   │   ├── __init__.py
│   │   │   ├── health.py            # Health check endpoint
│   │   │   └── test_trace.py        # Infrastructure verification endpoint
│   │   │
│   │   ├── routers/                 # Mock data API endpoints (26 endpoints)
│   │   │   ├── __init__.py
│   │   │   ├── auth.py              # Authentication (signup, login, profile)
│   │   │   ├── courses.py           # Courses (featured, browse, generate, preview, enroll)
│   │   │   ├── classroom.py         # Learning workspace (lessons, quizzes, capstone, bookmarks)
│   │   │   └── analytics.py         # User analytics & dashboard
│   │   │
│   │   ├── schemas/                 # Pydantic validation models
│   │   │   ├── __init__.py
│   │   │   ├── auth_schemas.py      # Auth models (LoginRequest, TokenResponse, etc)
│   │   │   ├── course_schemas.py    # Course models (CoursePreview, FeaturedCourse, etc)
│   │   │   └── classroom_schemas.py # Classroom models (LessonContent, QuizStructure, etc)
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

```bash
# Navigate to backend folder
cd Warriors/backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### Environment Variables (.env)

**Current Configuration (Development):**
```
APP_ENV=development
DEBUG=true
HOST=127.0.0.1
PORT=8000

LANGSMITH_API_KEY=optional
LANGSMITH_PROJECT=optional
LANGSMITH_TRACING=false

DATABASE_URL=postgresql://user:password@localhost:5432/lxp_db
JWT_SECRET=your-secret-key-here-min-32-chars-for-jwt-encoding
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24
```

**For Future Developers - Integration Guide:**

| Variable | Current Value | Purpose | Team | Action Required |
|----------|--------------|---------|------|-----------------|
| `DATABASE_URL` | `postgresql://user:password@localhost:5432/lxp_db` | PostgreSQL connection | Database Team | Update with real connection string when DB is ready |
| `JWT_SECRET` | `your-secret-key-here-min-32-chars...` | JWT token signing | Auth Team | Replace with real 32+ character secret when implementing auth |
| `JWT_ALGORITHM` | `HS256` | Token encryption method | Auth Team | Keep as-is or update if needed |
| `JWT_EXPIRATION_HOURS` | `24` | Token expiration time | Auth Team | Adjust based on security requirements |

**When Database Team Takes Over:**
- Update `DATABASE_URL` to actual PostgreSQL instance
- Database schema already exists: `users`, `courses`, `send_for_global_approval`
- No code changes needed - just swap the connection string

**When Auth Team Takes Over:**
- Update `JWT_SECRET` with real secret (use `secrets` module to generate)
- Implement JWT validation in auth routers
- Update mock auth endpoints to use real authentication
- Add JWT middleware to protected endpoints

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

### Configuration

**File:** `app/config.py`

The `Settings` class uses Pydantic to load and validate configuration from environment variables. Configuration is centralized in one place and accessible throughout the application via the `settings` singleton.

**Supported Environment Variables:**

| Variable | Default | Purpose |
|----------|---------|---------|
| `APP_ENV` | development | Deployment environment (development/production) |
| `DEBUG` | True | Enable debug mode for development |
| `LANGSMITH_API_KEY` | None | API key for LangSmith authentication |
| `LANGSMITH_PROJECT` | None | LangSmith project name for organizing runs |
| `LANGSMITH_TRACING` | False | Enable/disable LangSmith tracing |
| `LANGSMITH_ENDPOINT` | https://api.smith.langchain.com | LangSmith API endpoint URL |
| `HOST` | 127.0.0.1 | Server bind address |
| `PORT` | 8000 | Server listen port |

**Helper Methods:**

- `is_production()` - Returns True if `APP_ENV` is "production"
- `is_tracing_enabled()` - Returns True if both `LANGSMITH_TRACING=true` and API key is set

**Usage:**
```python
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

✅ **FastAPI Server Configured**
- Application factory pattern in `app/main.py`
- Automatic startup and shutdown event handlers
- CORS middleware enabled for cross-origin requests

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

✅ **Tracing Enabled**
- Startup logs confirm LangSmith configuration
- Traces appear in LangSmith dashboard with all metrics
- Test endpoint (`GET /test-trace`) demonstrates integration

✅ **Infrastructure Ready for Future AI Agents**
- All utilities are reusable by new agents
- No changes to existing infrastructure required
- Agents import and use utilities directly

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
from app.routes import research

app.include_router(research.router)
```

### Coordinating Multiple Agents

For workflows involving multiple agents with parent/child relationships:

```python
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
pip install -r requirements.txt

# Start server (run from backend/ with venv activated)
python main.py

# Server available at http://127.0.0.1:8000
```

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

---

## Dashboard API (Phase 7: PostgreSQL Database Integration)

**Status**: ✅ LIVE WITH DATABASE  
**Phase**: Phase 7 - Full PostgreSQL Integration Complete  
**Last Updated**: 2026-06-22  
**Endpoint**: `GET /api/v1/dashboard`  
**Database**: PostgreSQL (auralearn_db)

### Overview

The Dashboard API now provides a single aggregated endpoint that returns all data from PostgreSQL database. Migration from mock JSON to live database is **complete and tested**.

### Database Integration Status

✅ **Phase 3**: All 6 SQLAlchemy ORM models created (User, Course, UserCourse, LearningActivity, UserGoal, Milestone)  
✅ **Phase 4**: PostgreSQL connection configured with connection pooling  
✅ **Phase 5**: Dashboard repository with 8 optimized query methods  
✅ **Phase 6**: Service layer for business logic  
✅ **Phase 7**: API routes fully integrated with database  
✅ **Phase 8**: Ready for JWT authentication implementation

### Features

- **Single Aggregated Endpoint**: Reduces frontend network requests from 5-6 to 1
- **Complete Data Contract**: Pydantic-validated schemas ensure type safety
- **Live Database Integration**: All data fetched from PostgreSQL (Phase 7)
- **Service Layer Architecture**: Clean separation between routes and business logic
- **Optimized Queries**: 8 repository methods with proper indexing and joins
- **Test Data Included**: Sample data pre-loaded for immediate testing

### API Specification

#### Endpoint
```
GET /api/v1/dashboard
```

#### Response Model
```python
DashboardResponse {
  stats: Stats,
  weekly_activity: WeeklyActivity,
  weekly_goal: WeeklyGoal,
  monthly_consistency: MonthlyConsistency,
  milestones: Milestones,
  enrolled_courses: EnrolledCourses,
  recently_completed: RecentlyCompleted
}
```

#### Example Response (Abbreviated)
```json
{
  "stats": {
    "enrolled_courses": 12,
    "completed_courses": 4,
    "learning_hours": 84.5,
    "streak_days": 7
  },
  "weekly_activity": {
    "week_data": [
      {"day": "Mon", "minutes": 45},
      {"day": "Tue", "minutes": 60},
      ...
    ]
  },
  "weekly_goal": {
    "completed_hours": 12.0,
    "target_hours": 15.0,
    "percentage": 80
  },
  "monthly_consistency": {
    "consistency_data": [
      {"date": "2026-06-01", "minutes": 0},
      {"date": "2026-06-02", "minutes": 120},
      ...
    ]
  },
  "milestones": {
    "milestones_list": [
      {
        "id": 1,
        "title": "UX Design Sprint",
        "due_date": "2026-06-25",
        "status": "pending"
      }
    ]
  },
  "enrolled_courses": {
    "courses_list": [
      {
        "id": 1,
        "title": "Mastering UX Psychology",
        "difficulty": "Advanced",
        "thumbnail_url": "https://...",
        "current_module": "Module 4: Cognitive Biases",
        "progress_percentage": 65,
        "completed_lessons": 12,
        "total_lessons": 18,
        "status": "in_progress"
      }
    ]
  },
  "recently_completed": {
    "completed_list": [
      {
        "id": 1,
        "course_name": "AI Foundations",
        "certificate_earned": true,
        "completion_date": "2026-06-20"
      }
    ]
  }
}
```

### Project Structure

```
backend/
├── app/
│   ├── models/                          # SQLAlchemy ORM Models (Phase 3)
│   │   ├── user.py                      # Users table
│   │   ├── course.py                    # Courses table  
│   │   ├── user_course.py               # User enrollments (Most Critical!)
│   │   ├── learning_activity.py         # Daily learning tracking
│   │   ├── user_goal.py                 # Weekly goal targets
│   │   └── milestone.py                 # Upcoming deadlines
│   │
│   ├── database/                        # Database Layer (Phase 4)
│   │   ├── connection.py                # SQLAlchemy engine, session, Base class
│   │   └── __init__.py                  # Exports SessionLocal, Base, engine, get_db
│   │
│   ├── repositories/                    # Data Access Layer (Phase 5)
│   │   └── dashboard_repository.py      # 8 optimized query methods
│   │
│   ├── services/                        # Business Logic Layer (Phase 6)
│   │   └── dashboard_service.py         # Orchestrates repository + formatting
│   │
│   ├── routers/                         # API Routes (Phase 7)
│   │   └── dashboard.py                 # GET /api/v1/dashboard endpoint
│   │
│   ├── schemas/                         # Pydantic Models
│   │   └── dashboard.py                 # DashboardResponse + sub-schemas
│   │
│   └── data/
│       └── dashboard.json               # Legacy mock data (KEPT for reference)
│
├── create_tables.py                     # Helper script to create all 6 tables
├── insert_test_data.py                  # Helper script to insert test data
├── test_connection.py                   # Helper script to verify DB connection
├── check_tables.py                      # Helper script to verify tables exist
└── .env                                 # PostgreSQL credentials
```

### Architecture

The dashboard API follows a clean 3-layer architecture:

```
HTTP Request
    ↓
Router (dashboard.py)           [API Layer]
    ↓
Service (dashboard_service.py)  [Business Logic Layer]
    ↓
Data Source (dashboard.json)    [Data Layer]
    ↓
HTTP Response (DashboardResponse)
```

**Benefits**:
- Easy to test each layer independently
- Service layer can be reused across routes
- Mock data can be replaced with DB queries without changing routes
- Clear separation of concerns

### Service Layer Methods

The `DashboardService` class provides methods to fetch individual dashboard sections:

```python
# Get complete dashboard
DashboardService.get_dashboard() -> DashboardResponse

# Get individual sections
DashboardService.get_stats() -> dict
DashboardService.get_weekly_activity() -> dict
DashboardService.get_weekly_goal() -> dict
DashboardService.get_monthly_consistency() -> dict
DashboardService.get_milestones() -> dict
DashboardService.get_enrolled_courses() -> dict
DashboardService.get_recently_completed() -> dict
```

### Frontend Integration

#### Using Fetch API
```javascript
// Fetch dashboard data
const response = await fetch('http://localhost:8000/api/v1/dashboard');
const dashboardData = await response.json();

// Access sections
const stats = dashboardData.stats;           // User statistics
const activity = dashboardData.weekly_activity;  // Weekly chart
const goal = dashboardData.weekly_goal;      // Goal progress
const consistency = dashboardData.monthly_consistency;  // Heatmap
const milestones = dashboardData.milestones; // Deadlines
const courses = dashboardData.enrolled_courses;  // In-progress
const completed = dashboardData.recently_completed;  // Completed
```

#### Using Axios
```javascript
import axios from 'axios';

const dashboardData = await axios.get('http://localhost:8000/api/v1/dashboard');
const data = dashboardData.data;
```

### Testing

#### In Browser
Visit: `http://localhost:8000/api/v1/dashboard`

#### With cURL
```bash
curl http://localhost:8000/api/v1/dashboard
```

#### Interactive Swagger UI
Visit: `http://localhost:8000/docs`

### Data Specifications

#### Stats
- `enrolled_courses` (int, ≥0): Total enrolled courses
- `completed_courses` (int, ≥0): Completed courses
- `learning_hours` (float, ≥0): Total learning hours
- `streak_days` (int, ≥0): Current streak in days

#### Weekly Activity
- Array of 7 days (Mon-Sun)
- Each day: `{day: string, minutes: int}`

#### Weekly Goal
- `completed_hours` (float, ≥0): Hours learned this week
- `target_hours` (float, >0): Weekly goal in hours
- `percentage` (int, 0-100): Progress percentage

#### Monthly Consistency
- Array of dates in current month
- Each day: `{date: "YYYY-MM-DD", minutes: int}`
- Includes days with 0 minutes for consistency view

#### Milestones
- Array of upcoming deadlines
- Fields: `id`, `title`, `due_date` (YYYY-MM-DD), `status` (pending/completed/overdue)
- Sorted by due_date ascending

#### Enrolled Courses
- Array of in-progress courses
- Fields: `id`, `title`, `difficulty` (Beginner/Intermediate/Advanced), `thumbnail_url`, `current_module`, `progress_percentage` (0-100), `completed_lessons`, `total_lessons`, `status`

#### Recently Completed
- Array of completed courses (most recent first)
- Fields: `id`, `course_name`, `certificate_earned` (bool), `completion_date` (YYYY-MM-DD)

### Future Enhancements (Phase 2+)

#### Database Integration
```python
# Current (Mock)
def get_dashboard():
    return DashboardService.get_dashboard()

# Future (Database)
def get_dashboard(user_id: int):
    return DashboardService.get_dashboard_from_db(user_id)
```

#### Authentication
```python
@router.get("/dashboard")
async def get_dashboard(current_user: User = Depends(get_current_user)):
    return DashboardService.get_dashboard(current_user.id)
```

#### Query Parameters
```python
@router.get("/dashboard")
async def get_dashboard(
    user_id: int,
    month: str = Query("current"),  # current, previous, etc
    include_sections: List[str] = Query(["stats", "courses"])
):
    ...
```

### Test Data Integration (2026-06-22)

#### Mock JSON File (PRESERVED)
**Location**: `app/data/dashboard.json`  
**Status**: ✅ KEPT for reference/migration documentation  
**Purpose**: Shows the original mock data structure used during Phase 1-2 development

This file is NO LONGER used by the API (which now uses PostgreSQL) but is preserved to document:
- What mock data structure was used
- Migration history from JSON to database
- Can be referenced if reverting to mock mode needed

#### Test Data in PostgreSQL

**What was inserted**: Sample data for user "Alex Chen" (user_id=1)

```
USERS TABLE:
- id: 1
- name: Alex Chen
- email: alex.chen@example.com
- created_at: 2026-06-22 08:48:48

COURSES TABLE: 4 courses
- id=1: Mastering UX Psychology (Advanced)
- id=2: Python for Data Science (Intermediate)
- id=3: Digital Brand Identity (Beginner)
- id=4: AI Foundations (Beginner)

USER_COURSES TABLE: 4 enrollments
- Course 1: IN_PROGRESS, 65% complete (12/18 lessons)
- Course 2: IN_PROGRESS, 32% complete (4/12 lessons)
- Course 3: IN_PROGRESS, 88% complete (10/11 lessons)
- Course 4: COMPLETED, 100% complete (15/15 lessons)

LEARNING_ACTIVITIES TABLE: 7 days of data
- Monday: 45 minutes, 2 lessons
- Tuesday: 90 minutes, 3 lessons
- Wednesday: 110 minutes, 4 lessons
- Thursday: 70 minutes, 2 lessons
- Friday: 30 minutes, 1 lesson
- Saturday: 60 minutes, 2 lessons
- Sunday: 65 minutes, 2 lessons
- Total this week: 470 minutes (7.83 hours)

USER_GOALS TABLE: 1 weekly goal
- target_hours: 15.0
- current_hours: 7.83
- week: 2026-06-22 to 2026-06-28

MILESTONES TABLE: 2 pending deadlines
- UX Design Sprint (due 2026-06-24)
- Python Basics Final (due 2026-06-23)
```

#### How Test Data Was Inserted

**File**: `backend/insert_test_data.py`

This script was created to populate the database with realistic test data. It:
1. Clears existing data (commented out to prevent accidents)
2. Creates 1 user (Alex Chen)
3. Creates 4 sample courses
4. Creates 4 enrollments (3 in-progress, 1 completed)
5. Creates 7 days of learning activities
6. Creates 1 weekly goal
7. Creates 2 upcoming milestones

**How to re-insert test data**:
```bash
python insert_test_data.py
```

**Note**: Running twice will fail with "duplicate key" error (data already inserted). To clear and reinitialize:
```bash
# Drop tables (PostgreSQL)
psql -U postgres -d auralearn_db -c "DROP TABLE IF EXISTS milestones, user_goals, learning_activities, user_courses, courses, users CASCADE;"

# Recreate tables
python create_tables.py

# Reinitialize data
python insert_test_data.py
```

### Database Architecture

#### 3-Layer Architecture

```
HTTP Request (GET /api/v1/dashboard)
    ↓
API Router (app/routers/dashboard.py)           [Layer 1: HTTP]
    ↓ Calls get_dashboard(user_id)
Service (app/services/dashboard_service.py)     [Layer 2: Business Logic]
    ↓ Calls repo methods
Repository (app/repositories/dashboard_repository.py) [Layer 3: Data Access]
    ↓ Executes SQL
PostgreSQL Database                             [Layer 4: Persistence]
    ↓
HTTP Response (DashboardResponse JSON)
```

#### Repository Query Methods (8 methods in Phase 5)

1. **get_user_greeting()** → "Hello, Alex Chen"
2. **get_stats()** → {enrolled_courses: 3, completed_courses: 1, learning_hours: 7.8, streak_days: 7}
3. **get_weekly_activity()** → 7-day chart [Mon: 45min, Tue: 90min, ...]
4. **get_weekly_goal()** → {completed_hours: 7.83, target_hours: 15, percentage: 52}
5. **get_monthly_consistency()** → All days this month with minutes spent
6. **get_milestones()** → [2 pending milestones sorted by due_date]
7. **get_enrolled_courses()** → [3 in-progress courses with progress details]
8. **get_recently_completed()** → [1 completed course with certificate info]

### Maintenance Notes

**File Locations**:
- Models: `app/models/*.py` (6 files)
- Database Connection: `app/database/connection.py`
- Repository: `app/repositories/dashboard_repository.py`
- Service: `app/services/dashboard_service.py`
- Routes: `app/routers/dashboard.py`
- Schemas: `app/schemas/dashboard.py`
- Mock Data (Legacy): `app/data/dashboard.json` (PRESERVED)
- Test Data Script: `insert_test_data.py`
- Table Creation Script: `create_tables.py`

**When adding new dashboard features**:
1. Add new model in `app/models/` if new table needed
2. Add repository method in `dashboard_repository.py`
3. Add service method to call repository
4. Update `DashboardResponse` schema
5. Routes automatically work (no changes needed!)

**When debugging database issues**:
1. Check `.env` has correct PostgreSQL credentials
2. Verify PostgreSQL service is running
3. Run `test_connection.py` to test connection
4. Run `check_tables.py` to verify tables exist
5. Check PgAdmin for data: Right-click table → View/Edit Data → All Rows

---

## Getting Started with Database-Backed Dashboard (Phase 7)

### Quick Start (5 Steps)

**Step 1: Create Tables**
```bash
python create_tables.py
```
Creates: users, courses, user_courses, learning_activities, user_goals, milestones

**Step 2: Insert Test Data**
```bash
python insert_test_data.py
```
Inserts: 1 user (Alex Chen), 4 courses, 4 enrollments, 7 days activity, 2 milestones

**Step 3: Start Server**
```bash
python -m uvicorn app.main:app --reload --port 8000
```

**Step 4: Test in Browser**
```
http://127.0.0.1:8000/docs
```
Click `GET /api/v1/dashboard` → Try it out → Execute

**Step 5: Verify Response**
You should see:
- Greeting: "Hello, Alex Chen"
- Stats: 3 enrolled, 1 completed, 7.8 hours, 7 day streak
- Weekly activity: 7 days of minutes
- Weekly goal: 7.83 / 15 hours = 52%
- Milestones: 2 pending deadlines
- Enrolled courses: 3 in-progress courses
- Recently completed: 1 completed course

### Verify in PgAdmin

1. Open PgAdmin
2. Navigate: `auralearn_db` → `Schemas` → `public` → `Tables`
3. For each table, right-click → `View/Edit Data` → `All Rows`
4. You should see the test data inserted

### Key Changes from Mock JSON to Database (Phases 1-7)

| Phase | Component | Status | Details |
|-------|-----------|--------|---------|
| 1-2 | Mock JSON | ✅ Complete | `app/data/dashboard.json` (still preserved) |
| 3 | ORM Models | ✅ Complete | 6 SQLAlchemy models in `app/models/` |
| 4 | DB Connection | ✅ Complete | PostgreSQL connection in `app/database/connection.py` |
| 5 | Repository | ✅ Complete | 8 query methods in `dashboard_repository.py` |
| 6 | Service | ✅ Complete | Business logic in `dashboard_service.py` |
| 7 | API Route | ✅ Complete | Fully integrated in `routers/dashboard.py` |
| 8 | Authentication | ⏳ TODO | Will extract user_id from JWT token |

---

## Summary

This backend provides production-ready infrastructure for AI agent workflows and mission-critical dashboard functionality:

1. **Infrastructure** (Foundation)
   - Structured logging and observability
   - Telemetry tracking
   - Health monitoring

2. **Mock Data Services** (Development)
   - 26+ realistic API endpoints
   - JSON-based mock data
   - Ready for frontend integration

3. **Dashboard API** (Phase 7: DATABASE LIVE)
   - ✅ Single aggregated endpoint
   - ✅ Live PostgreSQL database (6 tables)
   - ✅ Complete data validation with Pydantic
   - ✅ 3-layer architecture (API → Service → Repository → DB)
   - ✅ Test data pre-loaded and ready
   - ✅ Legacy mock JSON file preserved
   - ⏳ JWT authentication (Phase 8)

### What's Working Right Now

✅ Database tables created and populated with test data  
✅ All 8 repository query methods implemented  
✅ Service layer orchestrates data fetching  
✅ API endpoint returns complete dashboard data from PostgreSQL  
✅ PgAdmin can view all tables and data  
✅ Swagger UI shows full endpoint documentation  

### Next Steps (Phase 8+)

⏳ Implement JWT authentication to extract user_id from token  
⏳ Replace hardcoded user_id=1 with token-based user_id  
⏳ Add more test users and data  
⏳ Optimize queries with additional indexes  
⏳ Implement data refresh/caching strategy  

The infrastructure is **complete and production-ready**. Database integration is live and fully functional.
