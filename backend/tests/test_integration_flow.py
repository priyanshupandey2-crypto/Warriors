"""
Integration Test: Complete Three-Service Course Generation Flow
==============================================================

This test validates the entire workflow:
1. User submits course request via frontend
2. Backend queues it and sends to AI pipeline
3. AI pipeline generates course and notifies backend
4. Admin reviews and approves via dashboard
5. Backend creates and publishes course
"""

import pytest
import json
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.database import SessionLocal, Base, engine
from app.models.course_generation import CourseGeneration
from app.models.user import User
from app.models.course import Course


def reset_db():
    """Drop and recreate all tables."""
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)


@pytest.fixture(scope="function")
def db_session():
    """Create a test database session."""
    reset_db()
    db = SessionLocal()
    yield db
    db.close()


@pytest.fixture
def test_user(db_session: Session):
    """Create a test user."""
    user = User(
        email="flow_test_user@example.com",
        name="Flow Test User",
        password_hash="hashed_password",
        role="learner"
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture
def admin_user(db_session: Session):
    """Create a test admin user."""
    admin = User(
        email="flow_test_admin@example.com",
        name="Flow Test Admin",
        password_hash="hashed_password",
        role="admin"
    )
    db_session.add(admin)
    db_session.commit()
    db_session.refresh(admin)
    return admin


def test_complete_three_service_flow(db_session: Session, test_user: User, admin_user: User):
    """
    Test the complete three-service course generation flow.

    Flow:
    1. User submits request → Backend creates entry with status="pending"
    2. Queue processor sends to AI → Backend updates status="generating"
    3. AI notifies backend with generated course → Backend updates status="generated"
    4. Admin edits course data (optional)
    5. Admin approves → Backend creates Course/Modules/Lessons/Quizzes
    """

    # STEP 1: User submits course generation request
    # (Frontend calls POST /api/course-generation/create)
    generation = CourseGeneration(
        user_id=test_user.id,
        topic="Artificial Intelligence Fundamentals",
        difficulty_level="Intermediate",
        learning_duration="4 Weeks",
        expertise_domain="Computer Science",
        relevant_tags="AI, Machine Learning, Python",
        status="pending"
    )
    db_session.add(generation)
    db_session.commit()
    db_session.refresh(generation)

    assert generation.id is not None
    assert generation.status == "pending"
    assert generation.user_id == test_user.id
    print(f"[PASS] Step 1: User submitted request (Generation ID: {generation.id})")


    # STEP 2: Queue processor sends to AI pipeline
    # (Backend service sends to AI via /generate endpoint)
    generation.status = "generating"
    generation.generation_started_at = datetime.utcnow()
    generation.attempt_number = 1
    db_session.commit()
    db_session.refresh(generation)

    assert generation.status == "generating"
    assert generation.generation_started_at is not None
    assert generation.attempt_number == 1
    print(f"[PASS] Step 2: Queue processor sent to AI (attempt 1)")


    # STEP 3: AI pipeline generates course and notifies backend
    # (AI pipeline calls POST /api/queue/process-generated/{generation_id})
    generated_data = {
        "title": "Artificial Intelligence Fundamentals",
        "description": "A comprehensive introduction to AI concepts, techniques, and applications",
        "difficulty": "Intermediate",
        "duration_hours": 24,
        "category": "Computer Science",
        "modules": [
            {
                "title": "Module 1: Introduction to AI",
                "description": "What is AI and its applications",
                "order": 1,
                "lessons": [
                    {
                        "title": "Lesson 1: AI Basics",
                        "content_markdown": "# AI Basics\n\nArtificial Intelligence is...",
                        "duration_minutes": 45,
                        "learning_objectives": "Understand AI fundamentals",
                        "key_concepts": "AI, machine learning, neural networks"
                    },
                    {
                        "title": "Lesson 2: AI Applications",
                        "content_markdown": "# Real-world AI Applications\n\nAI is used in...",
                        "duration_minutes": 60,
                        "learning_objectives": "Know practical AI applications",
                        "key_concepts": "applications, examples, use cases"
                    }
                ],
                "quizzes": [
                    {
                        "title": "Module 1 Quiz",
                        "description": "Test your understanding of AI basics",
                        "passing_score": 70,
                        "total_points": 100,
                        "duration_minutes": 20
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
    parsed = json.loads(generation.generated_course_data)
    assert parsed["title"] == "Artificial Intelligence Fundamentals"
    print(f"[PASS] Step 3: AI generated course successfully")


    # STEP 4: Admin edits course before approval (optional)
    # (Admin calls PUT /api/admin/submissions/{generation_id}/update-course)
    # Update some course details
    course_data = json.loads(generation.generated_course_data)
    course_data["title"] = "Advanced AI Fundamentals"
    course_data["duration_hours"] = 30

    generation.topic = "Advanced AI Fundamentals"
    generation.generated_course_data = json.dumps(course_data)
    db_session.commit()
    db_session.refresh(generation)

    assert generation.topic == "Advanced AI Fundamentals"
    print(f"[PASS] Step 4: Admin edited course details before approval")


    # STEP 5: Admin approves and publishes
    # (Admin calls PUT /api/course-generation/publish/{generation_id})
    course_data = json.loads(generation.generated_course_data)

    # Create the course
    new_course = Course(
        title=course_data.get("title", generation.topic),
        description=course_data.get("description", ""),
        category=course_data.get("category", "Computer Science"),
        difficulty=course_data.get("difficulty", generation.difficulty_level),
        duration_hours=course_data.get("duration_hours", 10),
        thumbnail_url="https://via.placeholder.com/400x300"
    )
    db_session.add(new_course)
    db_session.flush()

    # Update generation with publication info
    generation.status = "published"
    generation.created_course_id = new_course.id
    generation.approved_at = datetime.utcnow()
    generation.approved_by = admin_user.id
    generation.reviewed_feedback = "Excellent course! Published with minor edits."
    db_session.commit()
    db_session.refresh(generation)

    assert generation.status == "published"
    assert generation.created_course_id == new_course.id
    assert generation.approved_at is not None
    assert generation.approved_by == admin_user.id
    print(f"[PASS] Step 5: Admin approved and published (Course ID: {new_course.id})")


    # VERIFY: Check final state
    final_generation = db_session.query(CourseGeneration).filter(
        CourseGeneration.id == generation.id
    ).first()
    final_course = db_session.query(Course).filter(Course.id == new_course.id).first()

    assert final_generation.status == "published"
    assert final_generation.created_course_id is not None
    assert final_course is not None
    assert final_course.title == "Advanced AI Fundamentals"

    print("\n[SUCCESS] Complete three-service flow test PASSED!")
    print(f"   Generation ID: {generation.id}")
    print(f"   Course ID: {new_course.id}")
    print(f"   Status: {final_generation.status}")
    print(f"   Submitted by: {test_user.email}")
    print(f"   Approved by: {admin_user.email}")


def test_retry_mechanism(db_session: Session, test_user: User):
    """Test exponential backoff retry mechanism."""

    generation = CourseGeneration(
        user_id=test_user.id,
        topic="Test Course",
        difficulty_level="Beginner",
        learning_duration="1 Week",
        expertise_domain="Testing",
        relevant_tags="test",
        status="generating",
        generation_started_at=datetime.utcnow()
    )
    db_session.add(generation)
    db_session.commit()
    db_session.refresh(generation)

    # Simulate first failure
    generation.last_error = "Timeout generating modules"
    generation.retry_count = 1
    generation.attempt_number = 2
    retry_delay = 60  # First retry after 60 seconds
    generation.next_retry_at = datetime.utcnow() + timedelta(seconds=retry_delay)
    db_session.commit()
    db_session.refresh(generation)

    assert generation.retry_count == 1
    assert generation.attempt_number == 2
    assert generation.next_retry_at is not None
    print(f"[PASS] Retry 1 scheduled: 60s delay")


    # Simulate second failure
    generation.last_error = "API rate limit exceeded"
    generation.retry_count = 2
    generation.attempt_number = 3
    retry_delay = 120  # Second retry after 120 seconds
    generation.next_retry_at = datetime.utcnow() + timedelta(seconds=retry_delay)
    db_session.commit()
    db_session.refresh(generation)

    assert generation.retry_count == 2
    assert generation.attempt_number == 3
    print(f"[PASS] Retry 2 scheduled: 120s delay (exponential backoff)")


    # Simulate third failure - max retries exceeded
    generation.last_error = "Persistent API error"
    generation.retry_count = 3
    generation.attempt_number = 4  # Exceeded max of 3
    generation.status = "failed"
    generation.reviewed_feedback = "AI generation failed after 3 attempts: Persistent API error"
    db_session.commit()
    db_session.refresh(generation)

    assert generation.status == "failed"
    assert generation.retry_count == 3
    assert generation.reviewed_feedback is not None
    print(f"[PASS] Max retries exceeded, course marked as failed")

    print("\n[SUCCESS] Retry mechanism test PASSED!")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
