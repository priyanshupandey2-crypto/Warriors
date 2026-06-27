"""
Test Complete Course Generation Flow
=====================================

Tests the entire flow from user request through admin approval.
"""

import pytest
import json
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.database import SessionLocal, Base, engine
from app.models.course_generation import CourseGeneration
from app.models.user import User


@pytest.fixture
def db_session():
    """Create a test database session."""
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # Clear course_generation table before test
    db.query(CourseGeneration).delete()
    db.commit()

    yield db

    # Cleanup after test
    db.query(CourseGeneration).delete()
    db.commit()
    db.close()


@pytest.fixture
def test_user(db_session: Session):
    """Create a test user."""
    user = User(
        email="testuser@example.com",
        name="Test User",
        password_hash="hashed_password"
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture
def admin_user(db_session: Session):
    """Create a test admin user."""
    admin = User(
        email="admin@example.com",
        name="Admin User",
        password_hash="hashed_password"
    )
    db_session.add(admin)
    db_session.commit()
    db_session.refresh(admin)
    return admin


def test_01_create_review_queue_entry(db_session: Session, test_user: User):
    """
    Test: Step 1 - User submits course generation request
    Expected: Entry created in course_generation with status "pending"
    """
    generation = CourseGeneration(
        user_id=test_user.id,
        topic="Machine Learning Basics",
        difficulty_level="Beginner",
        learning_duration="1 Week",
        expertise_domain="Computer Science",
        relevant_tags="Python, AI, ML",
        status="pending"
    )
    db_session.add(generation)
    db_session.commit()
    db_session.refresh(generation)

    assert generation.id is not None
    assert generation.status == "pending"
    assert generation.user_id == test_user.id
    assert generation.topic == "Machine Learning Basics"
    assert generation.created_at is not None
    assert generation.retry_count == 0


def test_02_create_course_queue_entry(db_session: Session, test_user: User):
    """
    Test: Step 2 - Queue processor updates generation status
    Expected: Entry updated in course_generation with status "generating"
    """
    # Create course_generation entry
    generation = CourseGeneration(
        user_id=test_user.id,
        topic="Python Basics",
        difficulty_level="Beginner",
        learning_duration="2 Weeks",
        expertise_domain="Programming",
        relevant_tags="Python",
        status="pending"
    )
    db_session.add(generation)
    db_session.commit()

    # Update to generating status
    generation.status = "generating"
    generation.generation_started_at = datetime.utcnow()
    generation.attempt_number = 1
    db_session.commit()
    db_session.refresh(generation)

    assert generation.id is not None
    assert generation.status == "generating"
    assert generation.attempt_number == 1
    assert generation.max_attempts == 3


def test_03_update_status_to_generating(db_session: Session, test_user: User):
    """
    Test: Step 3 - Queue processor sends to AI and updates status
    Expected: course_generation status changed to "generating"
    """
    generation = CourseGeneration(
        user_id=test_user.id,
        topic="Web Development",
        difficulty_level="Intermediate",
        learning_duration="1 Month",
        expertise_domain="Web Development",
        relevant_tags="React, JavaScript",
        status="pending"
    )
    db_session.add(generation)
    db_session.commit()

    # Simulate sending to AI pipeline
    generation.status = "generating"
    generation.generation_started_at = datetime.utcnow()
    db_session.commit()
    db_session.refresh(generation)

    assert generation.status == "generating"
    assert generation.generation_started_at is not None


def test_04_receive_generated_course(db_session: Session, test_user: User):
    """
    Test: Step 4 - Backend receives generated course from AI
    Expected: generated_course_data stored, status changed to "generated"
    """
    generation = CourseGeneration(
        user_id=test_user.id,
        topic="Data Science",
        difficulty_level="Advanced",
        learning_duration="1 Month",
        expertise_domain="Data Science",
        relevant_tags="Python, SQL, Statistics",
        status="generating",
        generation_started_at=datetime.utcnow()
    )
    db_session.add(generation)
    db_session.commit()

    # Simulate receiving generated course from AI
    generated_data = {
        "title": "Data Science Fundamentals",
        "description": "A comprehensive course on data science",
        "difficulty": "Advanced",
        "duration_hours": 40,
        "category": "Data Science",
        "modules": [
            {
                "title": "Module 1: Introduction to Data Science",
                "description": "Getting started",
                "lessons": [
                    {
                        "title": "Lesson 1: What is Data Science?",
                        "content_markdown": "# What is Data Science?\n\nData science...",
                        "duration_minutes": 45,
                        "learning_objectives": "Understand data science",
                        "key_concepts": "data, science"
                    }
                ],
                "quizzes": [
                    {
                        "title": "Quiz 1: Basics",
                        "description": "Test your understanding",
                        "passing_score": 70,
                        "total_points": 100,
                        "duration_minutes": 15
                    }
                ]
            }
        ]
    }

    generation.generated_course_data = json.dumps(generated_data)
    generation.status = "generated"
    generation.generation_completed_at = datetime.utcnow()
    db_session.commit()
    db_session.refresh(generation)

    assert generation.status == "generated"
    assert generation.generated_course_data is not None
    assert generation.generation_completed_at is not None

    # Verify we can parse the JSON
    parsed_data = json.loads(generation.generated_course_data)
    assert parsed_data["title"] == "Data Science Fundamentals"
    assert len(parsed_data["modules"]) == 1


def test_05_admin_approves_course(db_session: Session, test_user: User, admin_user: User):
    """
    Test: Step 5 - Admin approves the generated course
    Expected: course_generation status changed to "published", course_id set
    """
    generation = CourseGeneration(
        user_id=test_user.id,
        topic="Advanced Python",
        difficulty_level="Advanced",
        learning_duration="2 Weeks",
        expertise_domain="Programming",
        relevant_tags="Python, Advanced",
        status="generated",
        generated_course_data=json.dumps({
            "title": "Advanced Python",
            "description": "Advanced Python course"
        })
    )
    db_session.add(generation)
    db_session.commit()

    # Simulate admin approval
    generation.status = "published"
    generation.approved_at = datetime.utcnow()
    generation.approved_by = admin_user.id
    generation.created_course_id = 999  # Simulating created course ID
    generation.reviewed_feedback = "Great course!"
    db_session.commit()
    db_session.refresh(generation)

    assert generation.status == "published"
    assert generation.approved_at is not None
    assert generation.approved_by == admin_user.id
    assert generation.created_course_id == 999


def test_06_handle_generation_failure_with_retry(db_session: Session, test_user: User):
    """
    Test: Step 6 - Handle generation failure with exponential backoff retry
    Expected: Retry scheduled, status remains "generating" for retries
    """
    generation = CourseGeneration(
        user_id=test_user.id,
        topic="Machine Learning",
        difficulty_level="Beginner",
        learning_duration="1 Week",
        expertise_domain="AI",
        relevant_tags="ML",
        status="generating",
        generation_started_at=datetime.utcnow()
    )
    db_session.add(generation)
    db_session.commit()

    # Simulate first failure
    retry_delays = [60, 120, 240]
    error_msg = "Failed to generate module content"

    generation.last_error = error_msg
    generation.retry_count = 1
    generation.attempt_number = 2

    # Schedule retry with exponential backoff
    delay = retry_delays[min(generation.attempt_number - 2, len(retry_delays) - 1)]
    generation.next_retry_at = datetime.utcnow() + timedelta(seconds=delay)

    db_session.commit()
    db_session.refresh(generation)

    assert generation.retry_count == 1
    assert generation.attempt_number == 2
    assert generation.next_retry_at is not None
    assert (generation.next_retry_at - datetime.utcnow()).total_seconds() < 90


def test_07_max_retries_exceeded(db_session: Session, test_user: User):
    """
    Test: Step 7 - Max retries exceeded, course failed
    Expected: course_generation status changed to "failed"
    """
    generation = CourseGeneration(
        user_id=test_user.id,
        topic="Complex Topic",
        difficulty_level="Advanced",
        learning_duration="1 Month",
        expertise_domain="Engineering",
        relevant_tags="Complex",
        status="generating",
        retry_count=3,
        attempt_number=4  # Fourth attempt (exceeded max of 3)
    )
    db_session.add(generation)
    db_session.commit()

    # Mark as failed after max retries
    generation.status = "failed"
    generation.reviewed_feedback = "AI generation failed after 3 attempts: Persistent generation failure"
    db_session.commit()

    assert generation.status == "failed"
    assert generation.reviewed_feedback is not None


def test_08_query_pending_courses(db_session: Session, test_user: User):
    """
    Test: Query for courses awaiting admin approval
    Expected: Only courses with status "generated" returned
    """
    # Create multiple generations with different statuses
    for i in range(3):
        status = "generated" if i < 2 else "published"
        generation = CourseGeneration(
            user_id=test_user.id,
            topic=f"Course {i}",
            difficulty_level="Beginner",
            learning_duration="1 Week",
            expertise_domain="CS",
            relevant_tags="test",
            status=status,
            generated_course_data=json.dumps({"title": f"Course {i}"})
        )
        db_session.add(generation)
    db_session.commit()

    # Query only pending approval
    pending = db_session.query(CourseGeneration).filter(
        CourseGeneration.status == "generated"
    ).all()

    assert len(pending) == 2
    for item in pending:
        assert item.status == "generated"


def test_09_user_can_check_own_course_status(db_session: Session, test_user: User):
    """
    Test: User can check status of their own course
    Expected: Status retrieved for user's course
    """
    generation = CourseGeneration(
        user_id=test_user.id,
        topic="My Course",
        difficulty_level="Beginner",
        learning_duration="1 Week",
        expertise_domain="CS",
        relevant_tags="test",
        status="generating"
    )
    db_session.add(generation)
    db_session.commit()

    # User retrieves status
    result = db_session.query(CourseGeneration).filter(
        CourseGeneration.id == generation.id,
        CourseGeneration.user_id == test_user.id
    ).first()

    assert result is not None
    assert result.user_id == test_user.id
    assert result.status == "generating"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
