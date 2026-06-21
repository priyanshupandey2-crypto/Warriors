from dataclasses import dataclass, asdict, field
from typing import Optional, Dict, Any
from datetime import datetime
import time
import uuid

from app.logger import get_logger

logger = get_logger(__name__)


@dataclass
class TelemetryMetrics:
    """Container for execution telemetry metrics."""

    run_id: str = field(default_factory=lambda: str(uuid.uuid4()))
    start_time: float = field(default_factory=time.time)
    end_time: Optional[float] = None
    duration_ms: Optional[float] = None
    status: str = "running"  # running, success, failure
    error_message: Optional[str] = None
    token_usage: Dict[str, int] = field(default_factory=lambda: {"input": 0, "output": 0, "total": 0})
    estimated_cost: Optional[float] = None
    metadata: Dict[str, Any] = field(default_factory=dict)

    def complete(self, status: str = "success", error_message: Optional[str] = None) -> None:
        """Mark the run as complete."""
        self.end_time = time.time()
        self.duration_ms = (self.end_time - self.start_time) * 1000
        self.status = status
        self.error_message = error_message

    def add_tokens(self, input_tokens: int = 0, output_tokens: int = 0) -> None:
        """Record token usage."""
        self.token_usage["input"] += input_tokens
        self.token_usage["output"] += output_tokens
        self.token_usage["total"] = self.token_usage["input"] + self.token_usage["output"]

    def set_cost(self, cost: float) -> None:
        """Set the estimated cost."""
        self.estimated_cost = cost

    def add_metadata(self, key: str, value: Any) -> None:
        """Add metadata to the run."""
        self.metadata[key] = value

    def to_dict(self) -> Dict[str, Any]:
        """Convert metrics to dictionary."""
        return asdict(self)


class TelemetryRecorder:
    """Record telemetry for AI workflow execution."""

    def __init__(self, workflow_name: str, parent_run_id: Optional[str] = None):
        self.workflow_name = workflow_name
        self.parent_run_id = parent_run_id
        self.metrics = TelemetryMetrics(metadata={"workflow": workflow_name})

        if parent_run_id:
            self.metrics.add_metadata("parent_run_id", parent_run_id)

    def start(self) -> str:
        """Start tracking a run. Returns the run ID."""
        logger.info(f"Starting telemetry recording for workflow: {self.workflow_name}")
        return self.metrics.run_id

    def record_tokens(self, input_tokens: int, output_tokens: int) -> None:
        """Record token usage."""
        self.metrics.add_tokens(input_tokens, output_tokens)
        logger.info(
            f"Tokens recorded - Input: {input_tokens}, Output: {output_tokens}, Total: {self.metrics.token_usage['total']}"
        )

    def record_cost(self, cost: float) -> None:
        """Record estimated cost."""
        self.metrics.set_cost(cost)
        logger.info(f"Estimated cost recorded: ${cost:.4f}")

    def add_metadata(self, key: str, value: Any) -> None:
        """Add custom metadata."""
        self.metrics.add_metadata(key, value)

    def complete(self, status: str = "success", error_message: Optional[str] = None) -> Dict[str, Any]:
        """Mark the run as complete and return metrics."""
        self.metrics.complete(status, error_message)

        metrics_dict = self.metrics.to_dict()
        status_msg = f"Workflow '{self.workflow_name}' completed with status: {status}"
        if error_message:
            status_msg += f" - Error: {error_message}"

        logger.info(status_msg)
        logger.info(f"Duration: {self.metrics.duration_ms:.2f}ms, Tokens: {self.metrics.token_usage['total']}")

        return metrics_dict


def create_run_context(workflow_name: str, parent_run_id: Optional[str] = None) -> TelemetryRecorder:
    """Factory function to create a telemetry recorder for a workflow."""
    return TelemetryRecorder(workflow_name, parent_run_id)
