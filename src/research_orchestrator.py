"""Research Orchestrator - Coordination and API Layer"""

import asyncio
from datetime import datetime
from typing import Dict, List, Optional, Callable
from .research_engine import AIResearchEngine
from .langsmith_integration import LangSmithIntegration
from .types import (
    ResearchRequest,
    ResearchOutput,
    ResearchProgress,
    ProgressStatus,
    ReasoningStep,
    ReasoningVisualization,
    TimelineEntry,
    DependencyNode,
)


class ResearchOrchestrator:
    """High-level orchestration with progress tracking and caching"""

    def __init__(
        self,
        model: str = "claude-opus-4-8",
        langsmith_enabled: bool = False,
        langsmith_api_key: Optional[str] = None,
        langsmith_project: str = "ai-lxp-research",
        enable_caching: bool = True,
        enable_rag: bool = True,
    ):
        """Initialize orchestrator

        Args:
            model: Claude model to use
            langsmith_enabled: Enable LangSmith tracing
            langsmith_api_key: LangSmith API key
            langsmith_project: LangSmith project name
            enable_caching: Enable result caching
            enable_rag: Enable RAG for grounded research
        """
        self.engine = AIResearchEngine(model=model, enable_rag=enable_rag)
        self.langsmith = None
        if langsmith_enabled and langsmith_api_key:
            self.langsmith = LangSmithIntegration(
                api_key=langsmith_api_key,
                project_name=langsmith_project,
            )
        self.enable_caching = enable_caching
        self.enable_rag = enable_rag
        self.research_cache: Dict[str, ResearchOutput] = {}
        self.progress_callbacks: List[Callable[[ResearchProgress], None]] = []

    def on_progress(self, callback: Callable[[ResearchProgress], None]) -> None:
        """Subscribe to progress updates"""
        self.progress_callbacks.append(callback)

    def _report_progress(self, progress: ResearchProgress) -> None:
        """Report progress to subscribers"""
        for callback in self.progress_callbacks:
            try:
                callback(progress)
            except Exception as e:
                print(f"Progress callback error: {e}")

    def _get_cache_key(self, request: ResearchRequest) -> str:
        """Generate cache key"""
        return f"{request.topic}:{request.difficulty}:{request.duration}"

    async def research(self, request: ResearchRequest) -> ResearchOutput:
        """Execute complete research workflow"""
        start_time = datetime.now()
        cache_key = self._get_cache_key(request)

        # Check cache
        if self.enable_caching and cache_key in self.research_cache:
            print(f"[Cache] Returning cached research for: {cache_key}")
            return self.research_cache[cache_key]

        self._report_progress(
            ResearchProgress(
                status=ProgressStatus.PENDING,
                current_step="initializing",
                progress=0.0,
                elapsed_time=0,
                estimated_time_remaining=300000,
            )
        )

        try:
            result = await self.engine.research(request)

            if self.enable_caching:
                self.research_cache[cache_key] = result

            elapsed_ms = int((datetime.now() - start_time).total_seconds() * 1000)
            self._report_progress(
                ResearchProgress(
                    status=ProgressStatus.COMPLETED,
                    current_step="complete",
                    progress=1.0,
                    elapsed_time=elapsed_ms,
                    estimated_time_remaining=0,
                )
            )

            return result

        except Exception as e:
            elapsed_ms = int((datetime.now() - start_time).total_seconds() * 1000)
            self._report_progress(
                ResearchProgress(
                    status=ProgressStatus.FAILED,
                    current_step="error",
                    progress=0.0,
                    elapsed_time=elapsed_ms,
                    estimated_time_remaining=0,
                    errors=[str(e)],
                )
            )
            raise

    def get_trace_id(self) -> str:
        """Get trace ID"""
        return self.engine.get_trace_id()

    def get_reasoning_trace(self) -> List[ReasoningStep]:
        """Get reasoning trace"""
        return self.engine.get_reasoning_trace()

    def export_trace_as_markdown(self) -> str:
        """Export trace as markdown"""
        return self.engine.export_trace_as_markdown()

    def get_reasoning_visualization(self) -> ReasoningVisualization:
        """Get reasoning visualization"""
        trace = self.get_reasoning_trace()

        # Build timeline
        timeline = []
        for i, step in enumerate(trace):
            duration = 0
            if i < len(trace) - 1:
                time1 = datetime.fromisoformat(step.timestamp)
                time2 = datetime.fromisoformat(trace[i + 1].timestamp)
                duration = int((time2 - time1).total_seconds() * 1000)

            timeline.append(
                TimelineEntry(
                    step=step.step,
                    action=step.action,
                    timestamp=step.timestamp,
                    duration=duration,
                )
            )

        # Build dependency graph (linear for now)
        dependencies = [
            DependencyNode(
                id=step.step,
                action=step.action,
                depends_on=[trace[i - 1].step] if i > 0 else [],
                outputs=list(step.output.keys()),
            )
            for i, step in enumerate(trace)
        ]

        return ReasoningVisualization(
            steps=len(trace),
            timeline=timeline,
            dependencies=dependencies,
        )

    def clear_cache(self) -> None:
        """Clear cache"""
        self.research_cache.clear()

    def get_cache_stats(self) -> Dict[str, any]:
        """Get cache statistics"""
        return {
            "size": len(self.research_cache),
            "keys": list(self.research_cache.keys()),
        }
