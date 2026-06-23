"""FastAPI Application for AI Research Engine"""

import asyncio
import os
from typing import Optional
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.responses import StreamingResponse
import json

from .research_orchestrator import ResearchOrchestrator
from .types import (
    ResearchRequest,
    ResearchOutput,
    ResearchProgress,
    ProgressStatus,
)

# Initialize FastAPI app
app = FastAPI(
    title="AI Research Engine",
    description="AI-powered research engine for generating learning curriculum",
    version="1.0.0",
)

# Initialize orchestrator
orchestrator = ResearchOrchestrator(
    model=os.getenv("RESEARCH_MODEL", "claude-opus-4-8"),
    langsmith_enabled=os.getenv("LANGSMITH_ENABLED", "false").lower() == "true",
    langsmith_api_key=os.getenv("LANGSMITH_API_KEY"),
    langsmith_project=os.getenv("LANGSMITH_PROJECT", "ai-lxp-research"),
    enable_caching=os.getenv("ENABLE_CACHE", "true").lower() == "true",
    enable_rag=os.getenv("ENABLE_RAG", "true").lower() == "true",
)

# Global state for progress streaming
progress_updates = []


@app.on_event("startup")
async def startup_event():
    """Startup event"""
    print("AI Research Engine initialized")


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "ai-research-engine",
        "model": orchestrator.engine.model,
    }


@app.get("/trace/{trace_id}")
async def get_trace(trace_id: str):
    """Get trace by ID"""
    trace = orchestrator.get_reasoning_trace()
    if not trace:
        raise HTTPException(status_code=404, detail="Trace not found")

    return {
        "trace_id": trace_id,
        "steps": len(trace),
        "steps_detail": [
            {
                "step": s.step,
                "action": s.action,
                "timestamp": s.timestamp,
                "reasoning": s.reasoning,
            }
            for s in trace
        ],
    }


@app.get("/trace/{trace_id}/markdown")
async def get_trace_markdown(trace_id: str):
    """Get trace as markdown"""
    markdown = orchestrator.export_trace_as_markdown()
    if not markdown:
        raise HTTPException(status_code=404, detail="Trace not found")

    return {"markdown": markdown}


@app.get("/visualization")
async def get_visualization():
    """Get reasoning visualization"""
    viz = orchestrator.get_reasoning_visualization()
    return viz.model_dump()


@app.post("/research")
async def start_research(request: ResearchRequest) -> ResearchOutput:
    """Start research workflow

    Args:
        request: Research request with topic, difficulty, audience, duration, tags

    Returns:
        Complete research output with curriculum and analysis
    """
    try:
        # Progress callback
        def progress_callback(progress: ResearchProgress):
            print(
                f"[{progress.status}] {progress.current_step}: "
                f"{int(progress.progress * 100)}%"
            )

        orchestrator.on_progress(progress_callback)

        # Execute research
        result = await orchestrator.research(request)
        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/research/stream")
async def start_research_streaming(request: ResearchRequest):
    """Start research with streaming progress updates

    Returns:
        Server-sent events stream with progress updates and final result
    """

    async def event_generator():
        """Generate SSE events"""
        progress_list = []

        def progress_callback(progress: ResearchProgress):
            progress_list.append(progress)
            yield f"data: {progress.model_dump_json()}\n\n"

        orchestrator.on_progress(progress_callback)

        try:
            # Execute research
            result = await orchestrator.research(request)

            # Emit final result
            yield f"data: {json.dumps({'type': 'complete', 'result': result.model_dump()})}\n\n"

        except Exception as e:
            # Emit error
            yield f"data: {json.dumps({'type': 'error', 'error': str(e)})}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")


@app.get("/cache/stats")
async def get_cache_stats():
    """Get cache statistics"""
    stats = orchestrator.get_cache_stats()
    return {
        "cache_enabled": orchestrator.enable_caching,
        "cache_size": stats["size"],
        "cached_keys": stats["keys"],
    }


@app.delete("/cache")
async def clear_cache():
    """Clear research cache"""
    orchestrator.clear_cache()
    return {"message": "Cache cleared"}


@app.get("/config")
async def get_config():
    """Get engine configuration"""
    return {
        "model": orchestrator.engine.model,
        "caching_enabled": orchestrator.enable_caching,
        "rag_enabled": orchestrator.enable_rag,
        "langsmith_enabled": orchestrator.langsmith is not None,
        "trace_id": orchestrator.get_trace_id(),
    }


# Health check for Kubernetes/Docker
@app.get("/ready")
async def readiness_check():
    """Readiness check for deployment"""
    return {"ready": True}


@app.get("/live")
async def liveness_check():
    """Liveness check for deployment"""
    return {"alive": True}
