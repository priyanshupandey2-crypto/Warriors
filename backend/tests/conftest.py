"""
Pytest configuration and fixtures for test suite.
"""

import os

# Load environment variables from .env
from dotenv import load_dotenv
load_dotenv()

# Must set APP_ENV before any app imports
os.environ["APP_ENV"] = "testing"
os.environ["DEBUG"] = "false"

# Use TEST_DATABASE_URL if available, otherwise fall back to DATABASE_URL
test_db_url = os.getenv("TEST_DATABASE_URL")
if test_db_url:
    os.environ["DATABASE_URL"] = test_db_url
    print(f"Using TEST_DATABASE_URL for tests")
else:
    print(f"TEST_DATABASE_URL not found, using DATABASE_URL for tests")

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import sessionmaker


@pytest.fixture(scope="session", autouse=True)
def setup_test_database():
    """Set up test database with tables before running tests."""
    # Import all models to register them with Base
    from app.models import user, course, learning_activity, milestone, user_course, user_goal
    from app.database.connection import Base, engine

    # Create all tables once for the test session
    Base.metadata.create_all(bind=engine)
    yield
    # Keep tables for debugging (optional: drop_all to clean up)
    # Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def test_db():
    """Create a fresh session for each test with clean data."""
    from app.database.connection import SessionLocal, engine
    from sqlalchemy import text

    # Clean up data before each test
    session = SessionLocal()
    try:
        # Truncate all tables to ensure clean state
        with engine.connect() as conn:
            # Disable foreign key constraints temporarily
            conn.execute(text("TRUNCATE TABLE users CASCADE"))
            conn.commit()
    except Exception as e:
        # If truncate fails, it might be due to platform or table relationships
        pass

    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture
def db_session(test_db):
    """Get a database session for a test."""
    return test_db


@pytest.fixture
def client(test_db):
    """Create a test client with database dependency override."""
    from app.database.connection import get_db
    from app.main import create_app

    app = create_app()

    def override_get_db():
        return test_db

    app.dependency_overrides[get_db] = override_get_db
    return TestClient(app)
