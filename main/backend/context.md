# Backend Infrastructure Context

## Purpose

This FastAPI-based backend provides foundational infrastructure for AI agent workflows with comprehensive observability, telemetry tracking, and LangSmith integration. The system enables future agents (Research, Curriculum, Assessment, Capstone) to operate with:

- **Structured logging** for production-grade observability
- **Telemetry tracking** for execution metrics (duration, tokens, cost)
- **LangSmith integration** for distributed tracing and parent/child run relationships
- **Environment-driven configuration** for flexibility across deployment contexts
- **Health monitoring** endpoints for infrastructure verification

---

## Project Structure

```
Warriors/main/backend/
├── app/
│   ├── __init__.py                  # Package initialization
│   ├── main.py                      # FastAPI application factory
│   ├── config.py                    # Environment configuration
│   ├── logger.py                    # Structured JSON logging utilities
│   ├── telemetry.py                 # Execution metrics recording
│   ├── tracing.py                   # LangSmith integration
│   └── routes/
│       ├── __init__.py
│       ├── health.py                # Health check endpoint
│       └── test_trace.py            # Infrastructure verification endpoint
├── main.py                          # Server entry point
├── requirements.txt                 # Python dependencies
├── .env.example                     # Environment variables template
└── context.md                       # This file
```

## Running the Project

1. Create .env from .env.example
2. Install dependencies:
   pip install -r requirements.txt

3. Start server:
   python main.py

4. Verify:
   GET /health
   GET /test-trace



### File Purposes

| File | Purpose |
|------|---------|
| `app/main.py` | FastAPI application factory; initializes logging, tracing, middleware, and routers on startup |
| `app/config.py` | Centralized settings using Pydantic; loads environment variables from `.env` |
| `app/logger.py` | Structured JSON logging with timestamp, level, module, function, and line number |
| `app/telemetry.py` | `TelemetryRecorder` class for tracking execution duration, tokens, cost, and metadata |
| `app/tracing.py` | LangSmith client wrapper; context managers for creating and finalizing runs |
| `app/routes/health.py` | `GET /health` endpoint returning server status and LangSmith configuration |
| `app/routes/test_trace.py` | `GET /test-trace` endpoint demonstrating telemetry and tracing integration |
| `main.py` | Entry point; runs Uvicorn server with settings from `app/config.py` |
| `requirements.txt` | Python package dependencies (FastAPI, Uvicorn, Pydantic, LangSmith, etc.) |
| `.env.example` | Template for environment variables (copy to `.env` and fill in real values) |

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
from app.routes import research

app.include_router(research.router)
```

### Coordinating Multiple Agents

For workflows involving multiple agents with parent/child relationships:

```python
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
# Install dependencies
pip install -r requirements.txt

# Copy environment template
cp .env.example .env
# Edit .env with your LangSmith credentials

# Start server
python main.py

# Server available at http://127.0.0.1:8000
```

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

## Summary

This backend provides production-ready infrastructure for AI agent workflows. All agents integrate seamlessly by:

1. Importing telemetry and tracing utilities
2. Creating contexts at workflow start
3. Recording metrics as work progresses
4. Finalizing before returning results

The infrastructure is complete and ready. Future development focuses on implementing agents, not on infrastructure changes.
