"""
DATABASE INTEGRATION - Phase 4: PostgreSQL Database Connection
================================================

Purpose:
    Establishes SQLAlchemy ORM connection to PostgreSQL database.
    Provides session factory for database operations.
    Sets up Base class for all SQLAlchemy models.

Configuration:
    - Uses DATABASE_URL from config.py
    - Supports both synchronous queries (for now)
    - Configured for connection pooling (20 connections default)

Usage:
    from app.database import SessionLocal, Base, engine

    # Get a database session
    db = SessionLocal()

    # Use in queries
    user = db.query(User).filter(User.id == 1).first()
    db.close()
"""

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
from app.config import settings
from app.logger import get_logger

logger = get_logger(__name__)

# DATABASE INTEGRATION - Phase 4: Create Async SQLAlchemy Engine
# This engine manages the connection to PostgreSQL with async support
# pool_size=20: Maximum 20 connections in the pool
# max_overflow=0: Don't create additional connections beyond pool_size
engine = create_async_engine(
    settings.DATABASE_URL,
    pool_size=settings.DATABASE_POOL_SIZE,
    max_overflow=settings.DATABASE_MAX_OVERFLOW,
    echo=settings.DATABASE_ECHO,
    pool_pre_ping=True,
)

# DATABASE INTEGRATION - Phase 4: Async Session Factory
# Creates a new async database session for each request
SessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
)

# DATABASE INTEGRATION - Phase 4: Declarative Base
# All SQLAlchemy models must inherit from this Base class
# This allows SQLAlchemy to track all models and create tables
Base = declarative_base()


# DATABASE INTEGRATION - Phase 4: Async Dependency Injection Function
# Use this in FastAPI route dependencies to get a database session
async def get_db():
    """
    Async generator function that provides a database session to routes.

    Usage in routes:
        @router.get("/endpoint")
        async def my_endpoint(db: AsyncSession = Depends(get_db)):
            # Use db to query database with await
    """
    async with SessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


async def init_db():
    """Initialize database tables."""
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("Database tables initialized successfully")
    except Exception as e:
        logger.warning(f"Database initialization skipped (not available): {str(e)}")


async def close_db():
    """Close database engine."""
    await engine.dispose()
    logger.info("Database engine closed")
