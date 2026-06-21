from fastapi import APIRouter
from pydantic import BaseModel
import time

from app.tracing import trace_run, end_trace_run
from app.telemetry import create_run_context
from app.logger import get_logger

logger = get_logger(__name__)
router = APIRouter(prefix="/test-trace", tags=["testing"])


class TraceTestResponse(BaseModel):
    """Response model for trace test endpoint."""

    status: str
    message: str
    trace_run_id: str | None
    telemetry_run_id: str
    duration_ms: float
    tokens_recorded: dict
    cost_recorded: float
    metadata_recorded: dict


@router.get("", response_model=TraceTestResponse)
async def test_trace() -> TraceTestResponse:
    """
    Test endpoint to verify LangSmith tracing and telemetry are working end-to-end.

    This endpoint:
    1. Starts a LangSmith trace
    2. Creates a telemetry recorder
    3. Records sample token usage
    4. Records a sample cost
    5. Adds sample metadata
    6. Completes the run
    """
    logger.info("Starting LangSmith trace and telemetry test")

    # Create telemetry recorder
    telemetry = create_run_context("test-workflow")
    telemetry_run_id = telemetry.start()

    trace_run_id = None
    start_time = time.time()

    try:
        # Start LangSmith trace with telemetry run ID as metadata
        with trace_run(
            name="test-trace-validation",
            run_type="chain",
            metadata={"telemetry_run_id": telemetry_run_id, "purpose": "LangSmith observability verification"},
            tags=["test", "validation"],
        ) as run_id:
            trace_run_id = run_id
            logger.info(f"LangSmith trace started with ID: {trace_run_id}")

            # Simulate some work
            time.sleep(0.1)

            # Record sample token usage
            telemetry.record_tokens(input_tokens=150, output_tokens=100)
            logger.info("Sample token usage recorded")

            # Record sample cost
            telemetry.record_cost(0.0025)
            logger.info("Sample cost recorded")

            # Add sample metadata
            telemetry.add_metadata("test_type", "end-to-end-verification")
            telemetry.add_metadata("endpoint", "GET /test-trace")
            telemetry.add_metadata("langsmith_trace_id", trace_run_id)
            logger.info("Sample metadata added")

            # Attach metrics to LangSmith run BEFORE exiting context
            if trace_run_id:
                end_trace_run(
                    run_id=trace_run_id,
                    outputs={"status": "success", "result": "Test completed"},
                    token_usage={"prompt_tokens": 150, "completion_tokens": 100},
                    cost=0.0025,
                    metadata={"test_type": "end-to-end-verification"},
                )
                logger.info(f"Metrics attached to LangSmith run: {trace_run_id}")

        # Complete the run
        metrics = telemetry.complete("success")
        duration_ms = (time.time() - start_time) * 1000

        logger.info(f"Trace test completed successfully in {duration_ms:.2f}ms")

        return TraceTestResponse(
            status="success",
            message="LangSmith tracing and telemetry are working correctly",
            trace_run_id=trace_run_id,
            telemetry_run_id=telemetry_run_id,
            duration_ms=duration_ms,
            tokens_recorded=metrics["token_usage"],
            cost_recorded=metrics["estimated_cost"],
            metadata_recorded={
                "test_type": metrics["metadata"].get("test_type"),
                "endpoint": metrics["metadata"].get("endpoint"),
                "langsmith_trace_id": metrics["metadata"].get("langsmith_trace_id"),
            },
        )

    except Exception as e:
        logger.error(f"Trace test failed: {str(e)}", exc_info=True)
        duration_ms = (time.time() - start_time) * 1000
        telemetry.complete("failure", str(e))

        return TraceTestResponse(
            status="error",
            message=f"Test failed: {str(e)}",
            trace_run_id=trace_run_id,
            telemetry_run_id=telemetry_run_id,
            duration_ms=duration_ms,
            tokens_recorded={},
            cost_recorded=0.0,
            metadata_recorded={},
        )
