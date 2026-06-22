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

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from app.config import settings
from app.logger import get_logger

logger = get_logger(__name__)

# DATABASE INTEGRATION - Phase 4: Create Synchronous SQLAlchemy Engine
# Using synchronous driver (psycopg2) for Windows compatibility
# pool_size=20: Maximum 20 connections in the pool
# max_overflow=0: Don't create additional connections beyond pool_size
db_url = settings.DATABASE_URL.replace("postgresql+psycopg://", "postgresql://")
try:
    engine = create_engine(
        db_url,
        pool_size=settings.DATABASE_POOL_SIZE,
        max_overflow=settings.DATABASE_MAX_OVERFLOW,
        echo=settings.DATABASE_ECHO,
        pool_pre_ping=True,
    )
except Exception as e:
    logger.warning(f"Failed to create database engine: {str(e)}")
    engine = None

# DATABASE INTEGRATION - Phase 4: Session Factory
# Creates a new database session for each request
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# DATABASE INTEGRATION - Phase 4: Declarative Base
# All SQLAlchemy models must inherit from this Base class
# This allows SQLAlchemy to track all models and create tables
Base = declarative_base()


# DATABASE INTEGRATION - Phase 4: Dependency Injection Function
# Use this in FastAPI route dependencies to get a database session
def get_db():
    """
    Generator function that provides a database session to routes.

    Usage in routes:
        @router.get("/endpoint")
        def my_endpoint(db: Session = Depends(get_db)):
            # Use db to query database
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Initialize database tables."""
    try:
        if engine:
            Base.metadata.create_all(bind=engine)
            logger.info("Database tables initialized successfully")
    except Exception as e:
        logger.warning(f"Database initialization skipped (not available): {str(e)}")


def close_db():
    """Close database engine."""
    if engine:
        engine.dispose()
    logger.info("Database engine closed")
