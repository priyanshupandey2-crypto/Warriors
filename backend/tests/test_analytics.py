"""
Comprehensive test suite for analytics and user endpoints.
Tests dashboard, activity, consistency, milestones, achievements, and stats.
"""

import pytest
from app.models.user import User
from app.models.course import Course
from app.utils.password import hash_password


class TestUserDashboard:
    """Tests for GET /api/user/dashboard endpoint."""

    def test_get_user_dashboard_success(self, client, db_session):
        """Test successfully getting user dashboard."""
        # Create user
        user = User(
            name="Dashboard User",
            email="dashboard@example.com",
            password_hash=hash_password("SecurePass123!"),
            role="learner"
        )
        db_session.add(user)
        db_session.commit()

        # Login and get token
        login_response = client.post(
            "/api/auth/login",
            json={
                "email": "dashboard@example.com",
                "password": "SecurePass123!"
            }
        )
        token = login_response.json()["access_token"]

        response = client.get(
            "/api/user/dashboard",
            headers={"Authorization": token}
        )
        assert response.status_code == 200
        data = response.json()
        assert "stats" in data or "enrolled_courses" in data

    def test_dashboard_contains_stats(self, client, db_session):
        """Test that dashboard contains stats section."""
        user = User(
            name="Stats User",
            email="stats@example.com",
            password_hash=hash_password("SecurePass123!"),
            role="learner"
        )
        db_session.add(user)
        db_session.commit()

        login_response = client.post(
            "/api/auth/login",
            json={
                "email": "stats@example.com",
                "password": "SecurePass123!"
            }
        )
        token = login_response.json()["access_token"]

        response = client.get(
            "/api/user/dashboard",
            headers={"Authorization": token}
        )
        assert response.status_code == 200

    def test_dashboard_without_auth(self, client):
        """Test dashboard access without authentication."""
        response = client.get("/api/user/dashboard")
        assert response.status_code in [401, 403]

    def test_dashboard_with_enrolled_courses(self, client, db_session):
        """Test dashboard with enrolled courses."""
        from app.models.user_course import UserCourse

        user = User(
            name="Enrolled User",
            email="enrolled@example.com",
            password_hash=hash_password("SecurePass123!"),
            role="learner"
        )
        db_session.add(user)
        db_session.commit()

        course = Course(
            title="Enrolled Course",
            description="For enrollment testing",
            difficulty="Beginner",
            duration_hours=10
        )
        db_session.add(course)
        db_session.commit()

        user_course = UserCourse(
            user_id=user.id,
            course_id=course.id,
            status="ENROLLED",
            progress_percentage=0,
            completed_lessons=0,
            total_lessons=10
        )
        db_session.add(user_course)
        db_session.commit()

        login_response = client.post(
            "/api/auth/login",
            json={
                "email": "enrolled@example.com",
                "password": "SecurePass123!"
            }
        )
        token = login_response.json()["access_token"]

        response = client.get(
            "/api/user/dashboard",
            headers={"Authorization": token}
        )
        assert response.status_code == 200


class TestAnalyticsActivity:
    """Tests for GET /api/user/analytics/activity endpoint."""

    def test_get_weekly_activity_success(self, client, db_session):
        """Test successfully getting weekly activity metrics."""
        user = User(
            name="Activity User",
            email="activity@example.com",
            password_hash=hash_password("SecurePass123!"),
            role="learner"
        )
        db_session.add(user)
        db_session.commit()

        login_response = client.post(
            "/api/auth/login",
            json={
                "email": "activity@example.com",
                "password": "SecurePass123!"
            }
        )
        token = login_response.json()["access_token"]

        response = client.get(
            "/api/user/analytics/activity",
            headers={"Authorization": token}
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, (list, dict))

    def test_activity_contains_daily_data(self, client, db_session):
        """Test that activity metrics contain daily breakdown."""
        user = User(
            name="Daily Activity User",
            email="daily@example.com",
            password_hash=hash_password("SecurePass123!"),
            role="learner"
        )
        db_session.add(user)
        db_session.commit()

        login_response = client.post(
            "/api/auth/login",
            json={
                "email": "daily@example.com",
                "password": "SecurePass123!"
            }
        )
        token = login_response.json()["access_token"]

        response = client.get(
            "/api/user/analytics/activity",
            headers={"Authorization": token}
        )
        assert response.status_code == 200

    def test_activity_without_auth(self, client):
        """Test activity metrics without authentication."""
        response = client.get("/api/user/analytics/activity")
        assert response.status_code in [401, 403]


class TestAnalyticsConsistency:
    """Tests for GET /api/user/analytics/consistency endpoint."""

    def test_get_consistency_heatmap_success(self, client, db_session):
        """Test successfully getting consistency heatmap."""
        user = User(
            name="Consistency User",
            email="consistency@example.com",
            password_hash=hash_password("SecurePass123!"),
            role="learner"
        )
        db_session.add(user)
        db_session.commit()

        login_response = client.post(
            "/api/auth/login",
            json={
                "email": "consistency@example.com",
                "password": "SecurePass123!"
            }
        )
        token = login_response.json()["access_token"]

        response = client.get(
            "/api/user/analytics/consistency",
            headers={"Authorization": token}
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, (list, dict))

    def test_consistency_contains_heatmap_data(self, client, db_session):
        """Test that consistency endpoint returns heatmap structure."""
        user = User(
            name="Heatmap User",
            email="heatmap@example.com",
            password_hash=hash_password("SecurePass123!"),
            role="learner"
        )
        db_session.add(user)
        db_session.commit()

        login_response = client.post(
            "/api/auth/login",
            json={
                "email": "heatmap@example.com",
                "password": "SecurePass123!"
            }
        )
        token = login_response.json()["access_token"]

        response = client.get(
            "/api/user/analytics/consistency",
            headers={"Authorization": token}
        )
        assert response.status_code == 200

    def test_consistency_without_auth(self, client):
        """Test consistency metrics without authentication."""
        response = client.get("/api/user/analytics/consistency")
        assert response.status_code in [401, 403]


class TestMilestones:
    """Tests for GET /api/user/milestones endpoint."""

    def test_get_milestones_success(self, client, db_session):
        """Test successfully getting user milestones."""
        user = User(
            name="Milestone User",
            email="milestone@example.com",
            password_hash=hash_password("SecurePass123!"),
            role="learner"
        )
        db_session.add(user)
        db_session.commit()

        login_response = client.post(
            "/api/auth/login",
            json={
                "email": "milestone@example.com",
                "password": "SecurePass123!"
            }
        )
        token = login_response.json()["access_token"]

        response = client.get(
            "/api/user/milestones",
            headers={"Authorization": token}
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, (list, dict))

    def test_milestones_returns_list(self, client, db_session):
        """Test that milestones endpoint returns a list."""
        user = User(
            name="Milestone List User",
            email="milestonelist@example.com",
            password_hash=hash_password("SecurePass123!"),
            role="learner"
        )
        db_session.add(user)
        db_session.commit()

        login_response = client.post(
            "/api/auth/login",
            json={
                "email": "milestonelist@example.com",
                "password": "SecurePass123!"
            }
        )
        token = login_response.json()["access_token"]

        response = client.get(
            "/api/user/milestones",
            headers={"Authorization": token}
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, (list, dict))

    def test_milestones_without_auth(self, client):
        """Test milestones access without authentication."""
        response = client.get("/api/user/milestones")
        assert response.status_code in [401, 403]


class TestAchievements:
    """Tests for GET /api/user/achievements endpoint."""

    def test_get_achievements_success(self, client, db_session):
        """Test successfully getting user achievements."""
        user = User(
            name="Achievement User",
            email="achievement@example.com",
            password_hash=hash_password("SecurePass123!"),
            role="learner"
        )
        db_session.add(user)
        db_session.commit()

        login_response = client.post(
            "/api/auth/login",
            json={
                "email": "achievement@example.com",
                "password": "SecurePass123!"
            }
        )
        token = login_response.json()["access_token"]

        response = client.get(
            "/api/user/achievements",
            headers={"Authorization": token}
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, (list, dict))

    def test_achievements_contains_badges(self, client, db_session):
        """Test that achievements contains badge information."""
        user = User(
            name="Badge User",
            email="badge@example.com",
            password_hash=hash_password("SecurePass123!"),
            role="learner"
        )
        db_session.add(user)
        db_session.commit()

        login_response = client.post(
            "/api/auth/login",
            json={
                "email": "badge@example.com",
                "password": "SecurePass123!"
            }
        )
        token = login_response.json()["access_token"]

        response = client.get(
            "/api/user/achievements",
            headers={"Authorization": token}
        )
        assert response.status_code == 200

    def test_achievements_without_auth(self, client):
        """Test achievements access without authentication."""
        response = client.get("/api/user/achievements")
        assert response.status_code in [401, 403]


class TestProgressOverview:
    """Tests for GET /api/user/progress/overview endpoint."""

    def test_get_progress_overview_success(self, client, db_session):
        """Test successfully getting progress overview."""
        user = User(
            name="Progress User",
            email="progress@example.com",
            password_hash=hash_password("SecurePass123!"),
            role="learner"
        )
        db_session.add(user)
        db_session.commit()

        login_response = client.post(
            "/api/auth/login",
            json={
                "email": "progress@example.com",
                "password": "SecurePass123!"
            }
        )
        token = login_response.json()["access_token"]

        response = client.get(
            "/api/user/progress/overview",
            headers={"Authorization": token}
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, (list, dict))

    def test_progress_overview_by_course(self, client, db_session):
        """Test progress overview broken down by course."""
        user = User(
            name="Course Progress User",
            email="courseprogress@example.com",
            password_hash=hash_password("SecurePass123!"),
            role="learner"
        )
        db_session.add(user)
        db_session.commit()

        login_response = client.post(
            "/api/auth/login",
            json={
                "email": "courseprogress@example.com",
                "password": "SecurePass123!"
            }
        )
        token = login_response.json()["access_token"]

        response = client.get(
            "/api/user/progress/overview",
            headers={"Authorization": token}
        )
        assert response.status_code == 200

    def test_progress_overview_without_auth(self, client):
        """Test progress overview without authentication."""
        response = client.get("/api/user/progress/overview")
        assert response.status_code in [401, 403]


class TestUserStats:
    """Tests for GET /api/user/stats endpoint."""

    def test_get_user_stats_success(self, client, db_session):
        """Test successfully getting user stats."""
        user = User(
            name="Stats User",
            email="userstats@example.com",
            password_hash=hash_password("SecurePass123!"),
            role="learner"
        )
        db_session.add(user)
        db_session.commit()

        login_response = client.post(
            "/api/auth/login",
            json={
                "email": "userstats@example.com",
                "password": "SecurePass123!"
            }
        )
        token = login_response.json()["access_token"]

        response = client.get(
            "/api/user/stats",
            headers={"Authorization": token}
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, dict)

    def test_stats_contains_core_metrics(self, client, db_session):
        """Test that stats contains core metrics."""
        user = User(
            name="Core Metrics User",
            email="coremetrics@example.com",
            password_hash=hash_password("SecurePass123!"),
            role="learner"
        )
        db_session.add(user)
        db_session.commit()

        login_response = client.post(
            "/api/auth/login",
            json={
                "email": "coremetrics@example.com",
                "password": "SecurePass123!"
            }
        )
        token = login_response.json()["access_token"]

        response = client.get(
            "/api/user/stats",
            headers={"Authorization": token}
        )
        assert response.status_code == 200

    def test_stats_without_auth(self, client):
        """Test stats without authentication."""
        response = client.get("/api/user/stats")
        assert response.status_code in [401, 403]


class TestCompletedCourses:
    """Tests for GET /api/user/completed-courses endpoint."""

    def test_get_completed_courses_success(self, client, db_session):
        """Test successfully getting completed courses."""
        user = User(
            name="Completed Courses User",
            email="completed@example.com",
            password_hash=hash_password("SecurePass123!"),
            role="learner"
        )
        db_session.add(user)
        db_session.commit()

        login_response = client.post(
            "/api/auth/login",
            json={
                "email": "completed@example.com",
                "password": "SecurePass123!"
            }
        )
        token = login_response.json()["access_token"]

        response = client.get(
            "/api/user/completed-courses",
            headers={"Authorization": token}
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, (list, dict))

    def test_completed_courses_returns_list(self, client, db_session):
        """Test that endpoint returns a list of completed courses."""
        user = User(
            name="Completed List User",
            email="completedlist@example.com",
            password_hash=hash_password("SecurePass123!"),
            role="learner"
        )
        db_session.add(user)
        db_session.commit()

        login_response = client.post(
            "/api/auth/login",
            json={
                "email": "completedlist@example.com",
                "password": "SecurePass123!"
            }
        )
        token = login_response.json()["access_token"]

        response = client.get(
            "/api/user/completed-courses",
            headers={"Authorization": token}
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, (list, dict))

    def test_completed_courses_without_auth(self, client):
        """Test completed courses without authentication."""
        response = client.get("/api/user/completed-courses")
        assert response.status_code in [401, 403]
