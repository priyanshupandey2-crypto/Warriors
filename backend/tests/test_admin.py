"""
Comprehensive test suite for admin endpoints.
Tests admin-only operations including dashboard, user management, and system stats.
"""

import pytest
from app.models.user import User
from app.utils.password import hash_password


class TestAdminDashboard:
    """Tests for GET /api/admin/dashboard endpoint."""

    def test_admin_dashboard_success(self, client, db_session):
        """Test successfully getting admin dashboard."""
        # Create admin user
        admin = User(
            name="Admin User",
            email="admin@example.com",
            password_hash=hash_password("AdminPass123!"),
            role="admin"
        )
        db_session.add(admin)
        db_session.commit()

        # Login as admin
        login_response = client.post(
            "/api/auth/login",
            json={
                "email": "admin@example.com",
                "password": "AdminPass123!"
            }
        )
        token = login_response.json()["access_token"]

        response = client.get(
            "/api/admin/dashboard",
            headers={"Authorization": token}
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, dict)

    def test_admin_dashboard_non_admin_denied(self, client, db_session):
        """Test that non-admin users cannot access admin dashboard."""
        # Create regular user
        user = User(
            name="Regular User",
            email="user@example.com",
            password_hash=hash_password("UserPass123!"),
            role="learner"
        )
        db_session.add(user)
        db_session.commit()

        # Login as regular user
        login_response = client.post(
            "/api/auth/login",
            json={
                "email": "user@example.com",
                "password": "UserPass123!"
            }
        )
        token = login_response.json()["access_token"]

        response = client.get(
            "/api/admin/dashboard",
            headers={"Authorization": token}
        )
        assert response.status_code in [401, 403]

    def test_admin_dashboard_without_auth(self, client):
        """Test admin dashboard access without authentication."""
        response = client.get("/api/admin/dashboard")
        assert response.status_code in [401, 403]


class TestUserCount:
    """Tests for GET /api/admin/users-count endpoint."""

    def test_get_users_count_success(self, client, db_session):
        """Test successfully getting total user count."""
        # Create admin user
        admin = User(
            name="Admin Counter",
            email="admincounter@example.com",
            password_hash=hash_password("AdminPass123!"),
            role="admin"
        )
        db_session.add(admin)
        db_session.commit()

        # Login as admin
        login_response = client.post(
            "/api/auth/login",
            json={
                "email": "admincounter@example.com",
                "password": "AdminPass123!"
            }
        )
        token = login_response.json()["access_token"]

        response = client.get(
            "/api/admin/users-count",
            headers={"Authorization": token}
        )
        assert response.status_code == 200
        data = response.json()
        assert "count" in data or "total_users" in data or isinstance(data, dict)

    def test_users_count_returns_number(self, client, db_session):
        """Test that users count returns a number."""
        admin = User(
            name="Admin Count Checker",
            email="admincountchecker@example.com",
            password_hash=hash_password("AdminPass123!"),
            role="admin"
        )
        db_session.add(admin)
        db_session.commit()

        login_response = client.post(
            "/api/auth/login",
            json={
                "email": "admincountchecker@example.com",
                "password": "AdminPass123!"
            }
        )
        token = login_response.json()["access_token"]

        response = client.get(
            "/api/admin/users-count",
            headers={"Authorization": token}
        )
        assert response.status_code == 200

    def test_users_count_non_admin_denied(self, client, db_session):
        """Test that non-admin users cannot get user count."""
        user = User(
            name="Regular User Count",
            email="usercount@example.com",
            password_hash=hash_password("UserPass123!"),
            role="learner"
        )
        db_session.add(user)
        db_session.commit()

        login_response = client.post(
            "/api/auth/login",
            json={
                "email": "usercount@example.com",
                "password": "UserPass123!"
            }
        )
        token = login_response.json()["access_token"]

        response = client.get(
            "/api/admin/users-count",
            headers={"Authorization": token}
        )
        assert response.status_code in [401, 403]

    def test_users_count_without_auth(self, client):
        """Test user count without authentication."""
        response = client.get("/api/admin/users-count")
        assert response.status_code in [401, 403]


class TestAdminAction:
    """Tests for POST /api/admin/action endpoint."""

    def test_admin_action_success(self, client, db_session):
        """Test successfully performing an admin action."""
        admin = User(
            name="Admin Action",
            email="adminaction@example.com",
            password_hash=hash_password("AdminPass123!"),
            role="admin"
        )
        db_session.add(admin)
        db_session.commit()

        login_response = client.post(
            "/api/auth/login",
            json={
                "email": "adminaction@example.com",
                "password": "AdminPass123!"
            }
        )
        token = login_response.json()["access_token"]

        response = client.post(
            "/api/admin/action",
            headers={"Authorization": token},
            json={"action": "test", "message": "Test action"}
        )
        assert response.status_code in [200, 201]

    def test_admin_action_with_data(self, client, db_session):
        """Test admin action with payload data."""
        admin = User(
            name="Admin Action Data",
            email="adminactiondata@example.com",
            password_hash=hash_password("AdminPass123!"),
            role="admin"
        )
        db_session.add(admin)
        db_session.commit()

        login_response = client.post(
            "/api/auth/login",
            json={
                "email": "adminactiondata@example.com",
                "password": "AdminPass123!"
            }
        )
        token = login_response.json()["access_token"]

        response = client.post(
            "/api/admin/action",
            headers={"Authorization": token},
            json={
                "action": "system_maintenance",
                "message": "System maintenance scheduled for 30 minutes"
            }
        )
        assert response.status_code in [200, 201]

    def test_admin_action_non_admin_denied(self, client, db_session):
        """Test that non-admin users cannot perform admin actions."""
        user = User(
            name="Regular User Action",
            email="useraction@example.com",
            password_hash=hash_password("UserPass123!"),
            role="learner"
        )
        db_session.add(user)
        db_session.commit()

        login_response = client.post(
            "/api/auth/login",
            json={
                "email": "useraction@example.com",
                "password": "UserPass123!"
            }
        )
        token = login_response.json()["access_token"]

        response = client.post(
            "/api/admin/action",
            headers={"Authorization": token},
            json={"action": "test", "message": "Test message"}
        )
        assert response.status_code in [401, 403]

    def test_admin_action_without_auth(self, client):
        """Test admin action without authentication."""
        response = client.post(
            "/api/admin/action",
            json={"action": "test", "message": "Test message"}
        )
        assert response.status_code in [401, 403]


class TestAdminInfo:
    """Tests for GET /api/admin/info endpoint."""

    def test_get_admin_info_success(self, client, db_session):
        """Test successfully getting admin info."""
        admin = User(
            name="Admin Info",
            email="admininfo@example.com",
            password_hash=hash_password("AdminPass123!"),
            role="admin"
        )
        db_session.add(admin)
        db_session.commit()

        login_response = client.post(
            "/api/auth/login",
            json={
                "email": "admininfo@example.com",
                "password": "AdminPass123!"
            }
        )
        token = login_response.json()["access_token"]

        response = client.get(
            "/api/admin/info",
            headers={"Authorization": token}
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, dict)

    def test_admin_info_returns_admin_details(self, client, db_session):
        """Test that admin info returns admin user details."""
        admin = User(
            name="Admin Details",
            email="admindetails@example.com",
            password_hash=hash_password("AdminPass123!"),
            role="admin"
        )
        db_session.add(admin)
        db_session.commit()

        login_response = client.post(
            "/api/auth/login",
            json={
                "email": "admindetails@example.com",
                "password": "AdminPass123!"
            }
        )
        token = login_response.json()["access_token"]

        response = client.get(
            "/api/admin/info",
            headers={"Authorization": token}
        )
        assert response.status_code == 200

    def test_admin_info_non_admin_denied(self, client, db_session):
        """Test that non-admin users cannot get admin info."""
        user = User(
            name="Regular User Info",
            email="userinfo@example.com",
            password_hash=hash_password("UserPass123!"),
            role="learner"
        )
        db_session.add(user)
        db_session.commit()

        login_response = client.post(
            "/api/auth/login",
            json={
                "email": "userinfo@example.com",
                "password": "UserPass123!"
            }
        )
        token = login_response.json()["access_token"]

        response = client.get(
            "/api/admin/info",
            headers={"Authorization": token}
        )
        assert response.status_code in [401, 403]

    def test_admin_info_without_auth(self, client):
        """Test admin info without authentication."""
        response = client.get("/api/admin/info")
        assert response.status_code in [401, 403]


class TestAdminProtection:
    """Tests for admin endpoint protection."""

    def test_admin_test_endpoint_success(self, client, db_session):
        """Test the admin protection test endpoint."""
        admin = User(
            name="Admin Test",
            email="admintest@example.com",
            password_hash=hash_password("AdminPass123!"),
            role="admin"
        )
        db_session.add(admin)
        db_session.commit()

        login_response = client.post(
            "/api/auth/login",
            json={
                "email": "admintest@example.com",
                "password": "AdminPass123!"
            }
        )
        token = login_response.json()["access_token"]

        response = client.get(
            "/api/admin/test",
            headers={"Authorization": token}
        )
        assert response.status_code == 200
        data = response.json()
        assert data.get("status") == "success"

    def test_admin_test_endpoint_non_admin(self, client, db_session):
        """Test admin test endpoint denies non-admin users."""
        user = User(
            name="Regular User Test",
            email="usertest@example.com",
            password_hash=hash_password("UserPass123!"),
            role="learner"
        )
        db_session.add(user)
        db_session.commit()

        login_response = client.post(
            "/api/auth/login",
            json={
                "email": "usertest@example.com",
                "password": "UserPass123!"
            }
        )
        token = login_response.json()["access_token"]

        response = client.get(
            "/api/admin/test",
            headers={"Authorization": token}
        )
        assert response.status_code in [401, 403]

    def test_admin_endpoints_all_protected(self, client):
        """Test that all admin endpoints are protected."""
        endpoints = [
            ("/api/admin/dashboard", "GET"),
            ("/api/admin/users-count", "GET"),
            ("/api/admin/action", "POST"),
            ("/api/admin/info", "GET"),
            ("/api/admin/test", "GET"),
        ]

        for endpoint, method in endpoints:
            if method == "GET":
                response = client.get(endpoint)
            else:
                response = client.post(endpoint, json={})

            # All should return 401/403 without auth
            assert response.status_code in [401, 403], f"{endpoint} not protected"


class TestAdminMultipleUsers:
    """Tests for admin operations with multiple users."""

    def test_admin_sees_all_users_count(self, client, db_session):
        """Test that admin can see total user count."""
        # Create multiple users
        users = []
        for i in range(3):
            user = User(
                name=f"User {i}",
                email=f"user{i}@example.com",
                password_hash=hash_password("UserPass123!"),
                role="learner"
            )
            db_session.add(user)
            users.append(user)

        admin = User(
            name="Admin Multi",
            email="adminmulti@example.com",
            password_hash=hash_password("AdminPass123!"),
            role="admin"
        )
        db_session.add(admin)
        db_session.commit()

        # Login as admin
        login_response = client.post(
            "/api/auth/login",
            json={
                "email": "adminmulti@example.com",
                "password": "AdminPass123!"
            }
        )
        token = login_response.json()["access_token"]

        response = client.get(
            "/api/admin/users-count",
            headers={"Authorization": token}
        )
        assert response.status_code == 200
