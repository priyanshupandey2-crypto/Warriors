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
from sqlalchemy.orm import declarative_base, sessionmaker
from app.config import settings

# DATABASE INTEGRATION - Phase 4: Create SQLAlchemy Engine
# This engine manages the connection to PostgreSQL
# pool_size=20: Maximum 20 connections in the pool
# max_overflow=0: Don't create additional connections beyond pool_size
engine = create_engine(
    settings.DATABASE_URL,
    pool_size=20,
    max_overflow=0,
    echo=settings.DEBUG,  # Log all SQL queries in development
)

# DATABASE INTEGRATION - Phase 4: Session Factory
# Creates a new database session for each request
# This session is what we use in our repository methods
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
        async def my_endpoint(db: Session = Depends(get_db)):
            # Use db to query database
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
