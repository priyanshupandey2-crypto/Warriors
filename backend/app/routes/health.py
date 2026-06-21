from fastapi import APIRouter
from pydantic import BaseModel

from backend.app.config import settings
from backend.app.tracing import get_langsmith_config

router = APIRouter(prefix="/health", tags=["health"])


class HealthResponse(BaseModel):
    """Health check response model."""

    status: str
    environment: str
    langsmith_enabled: bool
    langsmith_config: dict


@router.get("", response_model=HealthResponse)
async def health_check() -> HealthResponse:
    """Health check endpoint to verify server is running and configured correctly."""
    return HealthResponse(
        status="healthy",
        environment=settings.APP_ENV,
        langsmith_enabled=settings.is_tracing_enabled(),
        langsmith_config=get_langsmith_config(),
    )
