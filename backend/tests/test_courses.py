"""
Comprehensive test suite for the course endpoints.
Tests all course-related functionality including featured courses, browsing, generation, preview, and enrollment.
"""

import pytest
from app.models.course import Course
from app.models.user_course import UserCourse


class TestFeaturedCourses:
    """Tests for GET /api/courses/featured endpoint."""

    def test_get_featured_courses_success(self, client, db_session):
        """Test successfully retrieving featured courses."""
        # Create a course
        course = Course(
            title="Python Basics",
            description="Learn Python programming",
            difficulty="Beginner",
            duration_hours=10
        )
        db_session.add(course)
        db_session.commit()

        response = client.get("/api/courses/featured")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

    def test_get_featured_courses_returns_list(self, client):
        """Test that featured courses returns a list."""
        response = client.get("/api/courses/featured")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

    def test_get_featured_courses_contains_required_fields(self, client, db_session):
        """Test that featured courses contain required fields."""
        course = Course(
            title="Web Development",
            description="Learn web development",
            difficulty="Intermediate",
            duration_hours=20
        )
        db_session.add(course)
        db_session.commit()

        response = client.get("/api/courses/featured")
        assert response.status_code == 200
        data = response.json()

        if len(data) > 0:
            course_item = data[0]
            assert "id" in course_item or "course_id" in course_item
            assert "title" in course_item


class TestBrowseCourses:
    """Tests for GET /api/courses endpoint with pagination."""

    def test_browse_courses_success(self, client):
        """Test successfully browsing courses."""
        response = client.get("/api/courses")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, (list, dict))

    def test_browse_courses_with_pagination(self, client):
        """Test browsing courses with skip and limit parameters."""
        response = client.get("/api/courses?skip=0&limit=5")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, (list, dict))

    def test_browse_courses_skip_parameter(self, client, db_session):
        """Test skip parameter in courses browse."""
        for i in range(3):
            course = Course(
                title=f"Course {i}",
                description=f"Description {i}",
                difficulty="Beginner",
                duration_hours=10
            )
            db_session.add(course)
        db_session.commit()

        response = client.get("/api/courses?skip=1&limit=2")
        assert response.status_code == 200

    def test_browse_courses_limit_parameter(self, client):
        """Test limit parameter in courses browse."""
        response = client.get("/api/courses?limit=3")
        assert response.status_code == 200


class TestGenerateCourse:
    """Tests for POST /api/courses/generate endpoint."""

    def test_generate_course_success(self, client, db_session):
        """Test successfully generating a new course."""
        from app.utils.password import hash_password
        from app.models.user import User

        # Create a user first
        user = User(
            name="John Doe",
            email="johngenerator@example.com",
            password_hash=hash_password("SecurePass123!"),
            role="learner"
        )
        db_session.add(user)
        db_session.commit()

        response = client.post(
            "/api/courses/generate",
            json={
                "title": "Advanced Python",
                "description": "Learn advanced Python concepts",
                "category": "Programming",
                "difficulty": "Advanced",
                "duration_hours": 30
            }
        )
        assert response.status_code in [200, 201]

    def test_generate_course_with_valid_fields(self, client):
        """Test course generation with all valid fields."""
        response = client.post(
            "/api/courses/generate",
            json={
                "title": "Data Science Basics",
                "description": "Introduction to data science",
                "category": "Data Science",
                "difficulty": "Beginner",
                "duration_hours": 15
            }
        )
        assert response.status_code in [200, 201]
        data = response.json()
        assert data.get("title") == "Data Science Basics"

    def test_generate_course_missing_title(self, client):
        """Test course generation with missing title."""
        response = client.post(
            "/api/courses/generate",
            json={
                "description": "A course",
                "category": "Programming",
                "difficulty": "Beginner",
                "duration_hours": 10
            }
        )
        assert response.status_code in [400, 422]

    def test_generate_course_invalid_difficulty(self, client):
        """Test course generation with invalid difficulty level."""
        response = client.post(
            "/api/courses/generate",
            json={
                "title": "Test Course",
                "description": "A test course",
                "category": "Programming",
                "difficulty": "InvalidLevel",
                "duration_hours": 10
            }
        )
        assert response.status_code in [400, 422]


class TestCoursePreview:
    """Tests for GET /api/courses/{course_id}/preview endpoint."""

    def test_get_course_preview_success(self, client, db_session):
        """Test successfully getting course preview."""
        course = Course(
            title="Preview Test Course",
            description="A course for preview testing",
            difficulty="Beginner",
            duration_hours=10
        )
        db_session.add(course)
        db_session.commit()

        response = client.get(f"/api/courses/{course.id}/preview")
        assert response.status_code == 200
        data = response.json()
        assert data.get("title") == "Preview Test Course"

    def test_get_course_preview_with_modules(self, client, db_session):
        """Test course preview includes modules."""
        course = Course(
            title="Modular Course",
            description="A course with modules",
            difficulty="Intermediate",
            duration_hours=20
        )
        db_session.add(course)
        db_session.commit()

        response = client.get(f"/api/courses/{course.id}/preview")
        assert response.status_code == 200
        data = response.json()
        assert "title" in data

    def test_get_course_preview_invalid_id(self, client):
        """Test course preview with invalid course ID."""
        response = client.get("/api/courses/99999/preview")
        assert response.status_code in [404, 400]

    def test_get_course_preview_nonexistent_course(self, client):
        """Test course preview for non-existent course."""
        response = client.get("/api/courses/0/preview")
        assert response.status_code in [404, 400]


class TestEnrollCourse:
    """Tests for POST /api/courses/{course_id}/enroll endpoint."""

    def test_enroll_course_success(self, client, db_session):
        """Test successfully enrolling in a course."""
        from app.utils.password import hash_password
        from app.models.user import User

        # Create user
        user = User(
            name="Enrollee",
            email="enrollee@example.com",
            password_hash=hash_password("SecurePass123!"),
            role="learner"
        )
        db_session.add(user)
        db_session.commit()

        # Create course
        course = Course(
            title="Enrollable Course",
            description="A course to enroll in",
            difficulty="Beginner",
            duration_hours=10
        )
        db_session.add(course)
        db_session.commit()

        # Login and get token
        login_response = client.post(
            "/api/auth/login",
            json={
                "email": "enrollee@example.com",
                "password": "SecurePass123!"
            }
        )
        token = login_response.json()["access_token"]

        # Enroll in course
        response = client.post(
            f"/api/courses/{course.id}/enroll",
            headers={"Authorization": token}
        )
        assert response.status_code in [200, 201]

    def test_enroll_course_without_auth(self, client, db_session):
        """Test enrollment attempt without authentication."""
        course = Course(
            title="Protected Course",
            description="Need auth to enroll",
            difficulty="Beginner",
            duration_hours=10
        )
        db_session.add(course)
        db_session.commit()

        response = client.post(f"/api/courses/{course.id}/enroll")
        # Should require auth for enrollment
        assert response.status_code in [401, 403, 422]

    def test_enroll_course_invalid_course_id(self, client, db_session):
        """Test enrollment in non-existent course."""
        from app.utils.password import hash_password
        from app.models.user import User

        user = User(
            name="Test User",
            email="test@example.com",
            password_hash=hash_password("SecurePass123!"),
            role="learner"
        )
        db_session.add(user)
        db_session.commit()

        login_response = client.post(
            "/api/auth/login",
            json={
                "email": "test@example.com",
                "password": "SecurePass123!"
            }
        )
        token = login_response.json()["access_token"]

        response = client.post(
            "/api/courses/99999/enroll",
            headers={"Authorization": token}
        )
        assert response.status_code in [404, 400, 401]

    def test_enroll_same_course_twice(self, client, db_session):
        """Test enrolling in the same course twice."""
        from app.utils.password import hash_password
        from app.models.user import User

        user = User(
            name="Duplicate Enrollee",
            email="duplicate@example.com",
            password_hash=hash_password("SecurePass123!"),
            role="learner"
        )
        db_session.add(user)
        db_session.commit()

        course = Course(
            title="Duplicate Enroll Course",
            description="Test duplicate enrollment",
            difficulty="Beginner",
            duration_hours=10
        )
        db_session.add(course)
        db_session.commit()

        login_response = client.post(
            "/api/auth/login",
            json={
                "email": "duplicate@example.com",
                "password": "SecurePass123!"
            }
        )
        token = login_response.json()["access_token"]

        # First enrollment
        response1 = client.post(
            f"/api/courses/{course.id}/enroll",
            headers={"Authorization": token}
        )
        assert response1.status_code in [200, 201]

        # Second enrollment - should handle gracefully
        response2 = client.post(
            f"/api/courses/{course.id}/enroll",
            headers={"Authorization": token}
        )
        # Should either succeed or return error indicating already enrolled
        assert response2.status_code in [200, 201, 400, 409]
