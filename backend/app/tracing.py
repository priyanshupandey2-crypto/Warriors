from typing import Optional, Dict, Any
from contextlib import contextmanager
import os
import time
import uuid

from backend.app.config import settings
from backend.app.logger import get_logger

logger = get_logger(__name__)

# Module-level reference to track active run for metrics
_active_run = None


def configure_langsmith() -> None:
    """Initialize LangSmith tracing based on configuration."""
    if not settings.is_tracing_enabled():
        logger.info("LangSmith tracing is disabled")
        return

    # Configure environment variables for LangSmith
    if settings.LANGSMITH_API_KEY:
        os.environ["LANGSMITH_API_KEY"] = settings.LANGSMITH_API_KEY

    if settings.LANGSMITH_PROJECT:
        os.environ["LANGSMITH_PROJECT"] = settings.LANGSMITH_PROJECT

    if settings.LANGSMITH_ENDPOINT:
        os.environ["LANGSMITH_ENDPOINT"] = settings.LANGSMITH_ENDPOINT

    # Enable tracing
    os.environ["LANGSMITH_TRACING"] = "true"

    logger.info(
        f"LangSmith tracing configured - Project: {settings.LANGSMITH_PROJECT}, Endpoint: {settings.LANGSMITH_ENDPOINT}"
    )


@contextmanager
def trace_run(
    name: str,
    run_type: str = "chain",
    metadata: Optional[Dict[str, Any]] = None,
    tags: Optional[list] = None,
    parent_run_id: Optional[str] = None,
):
    """
    Context manager for tracing a run with LangSmith.

    Creates a run in LangSmith and yields the run ID. Metrics (tokens, cost, outputs)
    should be attached to the run using update_run() before exiting the context.

    IMPORTANT: LangSmith's client.create_run() returns None, not a Run object.
    We generate the run_id ourselves and pass it to create_run() using the id parameter.

    Args:
        name: Name of the run
        run_type: Type of run (e.g., 'chain', 'llm', 'tool', 'agent')
        metadata: Additional metadata for the run (appears in Inputs)
        tags: List of tags for the run
        parent_run_id: ID of the parent run for nested tracing

    Usage:
        with trace_run("my-workflow", metadata={"input": "data"}) as run_id:
            # Perform work
            result = do_something()
            # Metrics are updated before exiting context
            pass
    """
    if not settings.is_tracing_enabled():
        yield None
        return

    run_id = None
    run_start_time = time.time()

    try:
        from langsmith import Client

        client = Client()

        # Generate run_id ourselves (LangSmith doesn't return it from create_run)
        run_id = str(uuid.uuid4())

        logger.info(f"Creating LangSmith trace: name={name}, run_type={run_type}, id={run_id}")

        # client.create_run() returns None - it creates the run server-side
        # We must pass the id parameter ourselves
        client.create_run(
            id=run_id,
            name=name,
            run_type=run_type,
            inputs=metadata or {},
            tags=tags or [],
            parent_run_id=parent_run_id,
        )

        logger.info(f"Trace run created: {name} (ID: {run_id})")

        # Store reference to active run for metric updates
        global _active_run
        _active_run = {"client": client, "run_id": run_id, "start_time": run_start_time}

        yield run_id

    except ImportError:
        logger.warning("LangSmith not installed or Client unavailable")
        yield None
    except Exception as e:
        logger.error(f"Error creating trace run: {str(e)}", exc_info=True)
        yield None
    finally:
        # Clear active run reference
        _active_run = None


def end_trace_run(
    run_id: str,
    outputs: Optional[Dict[str, Any]] = None,
    error: Optional[str] = None,
    token_usage: Optional[Dict[str, int]] = None,
    cost: Optional[float] = None,
    metadata: Optional[Dict[str, Any]] = None,
) -> None:
    """
    Finalize a LangSmith run with metrics and outputs.

    Must be called before exiting the trace_run() context to attach metrics.
    LangSmith API: client.update_run()

    Args:
        run_id: The run ID from trace_run context manager
        outputs: Output data from the run (appears in Outputs tab)
        error: Error message if run failed
        token_usage: Dict with keys "prompt_tokens", "completion_tokens"
        cost: Estimated cost of the run
        metadata: Additional metadata to attach to the run
    """
    if not settings.is_tracing_enabled() or not run_id:
        return

    try:
        from langsmith import Client

        client = Client()

        # Build outputs dict with metrics
        outputs_dict = outputs or {}

        # Add token usage if provided
        if token_usage:
            outputs_dict["token_usage"] = token_usage

        # Add cost if provided
        if cost is not None:
            outputs_dict["cost"] = cost

        # Update run with outputs, metrics, and duration
        run_duration = time.time() - (
            _active_run["start_time"] if _active_run else time.time()
        )

        client.update_run(
            run_id=run_id,
            outputs=outputs_dict,
            error=error,
            end_time=None,  # Let LangSmith auto-set end_time
            extra={"duration_ms": run_duration * 1000},
        )

        logger.info(
            f"Trace run updated: {run_id} - Tokens: {token_usage}, Cost: ${cost:.4f if cost else 0}"
        )

    except Exception as e:
        logger.error(f"Error updating trace run {run_id}: {str(e)}")


def get_active_run_id() -> Optional[str]:
    """Get the currently active run ID from the context manager."""
    return _active_run["run"].id if _active_run else None


def get_tracing_enabled() -> bool:
    """Check if LangSmith tracing is enabled."""
    return settings.is_tracing_enabled()


def get_langsmith_config() -> Dict[str, Any]:
    """Get current LangSmith configuration."""
    return {
        "enabled": settings.is_tracing_enabled(),
        "project": settings.LANGSMITH_PROJECT,
        "endpoint": settings.LANGSMITH_ENDPOINT,
        "api_key_set": settings.LANGSMITH_API_KEY is not None,
    }
