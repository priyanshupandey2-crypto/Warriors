"""LangSmith Integration for observability and tracing"""

import os
from typing import Optional, Dict, Any
from datetime import datetime


class LangSmithIntegration:
    """LangSmith integration for workflow tracing"""

    def __init__(self, api_key: str, project_name: str = "ai-lxp-research"):
        """Initialize LangSmith integration

        Args:
            api_key: LangSmith API key
            project_name: Project name for organizing traces
        """
        self.api_key = api_key
        self.project_name = project_name
        self.enabled = bool(api_key)

        # Set environment variables for langsmith
        if self.enabled:
            os.environ["LANGSMITH_API_KEY"] = api_key
            os.environ["LANGSMITH_PROJECT"] = project_name
            os.environ["LANGSMITH_TRACING_V2"] = "true"

    async def trace_research_workflow(
        self,
        topic_name: str,
        workflow_fn,
    ) -> Any:
        """Trace research workflow

        Args:
            topic_name: Topic being researched
            workflow_fn: Async function to trace

        Returns:
            Result from workflow function
        """
        if not self.enabled:
            return await workflow_fn()

        try:
            # For now, just execute the workflow
            # In production, this would send traces to LangSmith
            result = await workflow_fn()
            return result
        except Exception as e:
            print(f"LangSmith tracing error: {e}")
            raise

    async def trace_step(
        self,
        step_name: str,
        step_fn,
        inputs: Optional[Dict[str, Any]] = None,
    ) -> Any:
        """Trace a single step

        Args:
            step_name: Name of the step
            step_fn: Async function to trace
            inputs: Input data for the step

        Returns:
            Result from step function
        """
        if not self.enabled:
            return await step_fn()

        try:
            # Execute step
            result = await step_fn()

            # In production, record step to LangSmith
            if inputs is None:
                inputs = {}

            return result
        except Exception as e:
            print(f"LangSmith step tracing error: {e}")
            raise

    def get_trace_url(self, trace_id: str) -> str:
        """Get URL to view trace in LangSmith

        Args:
            trace_id: Trace ID

        Returns:
            URL to trace in LangSmith
        """
        return f"https://smith.langchain.com/projects/{self.project_name}/traces/{trace_id}"
