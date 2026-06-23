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
    from sqlalchemy import text

    # Drop all tables first to ensure clean state
    with engine.begin() as conn:
        conn.execute(text("DROP SCHEMA public CASCADE"))
        conn.execute(text("CREATE SCHEMA public"))

    # Create all tables for the test session
    Base.metadata.create_all(bind=engine)
    yield
    # Clean up after all tests
    Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def test_db():
    """Create a fresh session for each test with clean data."""
    from app.database.connection import SessionLocal, engine
    from sqlalchemy import text

    # Truncate all data before each test
    try:
        with engine.begin() as conn:
            # Disable foreign key constraints temporarily
            conn.execute(text("SET session_replication_role = 'replica'"))

            # Get all table names and truncate them in reverse order (to respect FK constraints)
            tables = conn.execute(text(
                "SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename DESC"
            )).fetchall()

            for (table,) in tables:
                try:
                    conn.execute(text(f"TRUNCATE TABLE {table} RESTART IDENTITY CASCADE"))
                except Exception as e:
                    pass

            # Re-enable foreign key constraints
            conn.execute(text("SET session_replication_role = 'origin'"))
    except Exception as e:
        # If truncate fails, log but continue
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
def unique_email(request):
    """Generate a unique email based on the test function name."""
    # Get test class and function name to create unique email
    class_name = request.cls.__name__ if request.cls else ""
    func_name = request.function.__name__
    test_id = f"{class_name}_{func_name}".lower().replace("test", "").strip("_")
    return f"{test_id}@example.com"


@pytest.fixture
def client(db_session):
    """Create a test client with database dependency override."""
    from app.database.connection import get_db
    from app.main import create_app

    app = create_app()

    def override_get_db():
        # Return the test_db session to ensure all requests use the same session
        # This guarantees that data created in db_session is visible in API calls
        return db_session

    app.dependency_overrides[get_db] = override_get_db

    # Create a test client
    test_client = TestClient(app)

    # Yield the client for use in tests
    yield test_client

    # Clean up: clear overrides
    app.dependency_overrides.clear()
