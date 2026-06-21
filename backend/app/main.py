from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.logger import configure_logging, get_logger
from app.routers import analytics, auth, classroom
from app.routes import health
from app.tracing import configure_langsmith
from app.routes import test_trace
from app.routers import courses
from app.database import init_db, close_db

logger = get_logger(__name__)


def create_app() -> FastAPI:
    """Factory function to create and configure the FastAPI application."""

    app = FastAPI(
        title="AI Backend Service",
        description="Production-ready backend service with LangSmith observability and telemetry support",
        version="1.0.0",
        debug=settings.DEBUG,
    )

    # Configure logging
    configure_logging()

    # Configure LangSmith tracing
    configure_langsmith()

    # Add CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Include routers
    app.include_router(health.router)
    app.include_router(test_trace.router)
    app.include_router(auth.router)
    app.include_router(courses.router)
    app.include_router(classroom.router)
    app.include_router(analytics.router)

    @app.on_event("startup")
    async def startup_event():
        """Log application startup and initialize database."""
        logger.info(f"Application startup - Environment: {settings.APP_ENV}, Debug: {settings.DEBUG}")
        logger.info(f"LangSmith tracing enabled: {settings.is_tracing_enabled()}")
        await init_db()
        logger.info("Database initialized successfully")

    @app.on_event("shutdown")
    async def shutdown_event():
        """Log application shutdown and close database."""
        await close_db()
        logger.info("Application shutdown")

    return app


app = create_app()
