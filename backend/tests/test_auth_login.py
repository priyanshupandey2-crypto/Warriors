"""
Comprehensive test suite for the login endpoint (/api/auth/login).
Tests all edge cases including validation, authentication, and error scenarios.
"""

import pytest
from app.utils.password import hash_password


class TestLoginBasicFunctionality:
    """Tests for basic login functionality."""

    def test_login_success(self, client, db_session):
        """Test successful login with valid credentials."""
        # First, create a user
        from app.models.user import User
        user = User(
            name="John Doe",
            email="john@example.com",
            password_hash=hash_password("SecurePass123!"),
            role="learner",
            courses_enrolled=[]
        )
        db_session.add(user)
        db_session.commit()

        # Now try to login
        response = client.post(
            "/api/auth/login",
            json={
                "email": "john@example.com",
                "password": "SecurePass123!"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["access_token"].startswith("Bearer ")
        assert data["user"]["email"] == "john@example.com"
        assert data["user"]["name"] == "John Doe"
        assert data["user"]["role"] == "learner"
        assert data["message"] == "Login successful"

    def test_login_email_case_insensitive(self, client, db_session):
        """Test that login email is case-insensitive."""
        from app.models.user import User
        user = User(
            name="Jane Doe",
            email="jane@example.com",
            password_hash=hash_password("SecurePass123!"),
            role="learner",
            courses_enrolled=[]
        )
        db_session.add(user)
        db_session.commit()

        # Login with uppercase email
        response = client.post(
            "/api/auth/login",
            json={
                "email": "JANE@EXAMPLE.COM",
                "password": "SecurePass123!"
            }
        )
        assert response.status_code == 200
        assert response.json()["user"]["email"] == "jane@example.com"

    def test_login_returns_access_token(self, client, db_session):
        """Test that login returns a valid JWT access token."""
        from app.models.user import User
        user = User(
            name="Test User",
            email="accesstoken@example.com",
            password_hash=hash_password("TestPass123!"),
            role="learner",
            courses_enrolled=[]
        )
        db_session.add(user)
        db_session.commit()

        response = client.post(
            "/api/auth/login",
            json={
                "email": "accesstoken@example.com",
                "password": "TestPass123!"
            }
        )
        assert response.status_code == 200
        token = response.json()["access_token"]
        assert token.startswith("Bearer ")
        assert len(token) > 10

    def test_login_returns_user_info(self, client, db_session):
        """Test that login returns all user information."""
        from app.models.user import User
        user = User(
            name="Full Name Test",
            email="fullname@example.com",
            password_hash=hash_password("FullPass123!"),
            role="learner",
            courses_enrolled=[1, 2, 3]
        )
        db_session.add(user)
        db_session.commit()

        response = client.post(
            "/api/auth/login",
            json={
                "email": "fullname@example.com",
                "password": "FullPass123!"
            }
        )
        assert response.status_code == 200
        user_data = response.json()["user"]
        assert user_data["name"] == "Full Name Test"
        assert user_data["email"] == "fullname@example.com"
        assert user_data["id"] is not None
        assert user_data["courses_enrolled"] == [1, 2, 3]


class TestLoginEmailValidation:
    """Tests for email validation during login."""

    def test_login_invalid_email_format(self, client):
        """Test rejection of invalid email format."""
        response = client.post(
            "/api/auth/login",
            json={
                "email": "invalidemail.com",
                "password": "SecurePass123!"
            }
        )
        assert response.status_code == 400
        assert "Invalid email format" in response.json()["detail"]

    def test_login_invalid_email_no_domain(self, client):
        """Test rejection of email without domain extension."""
        response = client.post(
            "/api/auth/login",
            json={
                "email": "user@invalid",
                "password": "SecurePass123!"
            }
        )
        assert response.status_code == 400
        assert "Invalid email format" in response.json()["detail"]

    def test_login_invalid_email_double_at(self, client):
        """Test rejection of email with multiple @ symbols."""
        response = client.post(
            "/api/auth/login",
            json={
                "email": "user@@example.com",
                "password": "SecurePass123!"
            }
        )
        assert response.status_code == 400
        assert "Invalid email format" in response.json()["detail"]

    def test_login_email_with_spaces(self, client):
        """Test rejection of email with spaces."""
        response = client.post(
            "/api/auth/login",
            json={
                "email": "user @example.com",
                "password": "SecurePass123!"
            }
        )
        assert response.status_code == 400
        assert "Invalid email format" in response.json()["detail"]

    def test_login_empty_email(self, client):
        """Test rejection of empty email."""
        response = client.post(
            "/api/auth/login",
            json={
                "email": "",
                "password": "SecurePass123!"
            }
        )
        assert response.status_code in [400, 422]

    def test_login_missing_email(self, client):
        """Test rejection when email is missing."""
        response = client.post(
            "/api/auth/login",
            json={
                "password": "SecurePass123!"
            }
        )
        assert response.status_code == 422

    def test_login_null_email(self, client):
        """Test rejection when email is null."""
        response = client.post(
            "/api/auth/login",
            json={
                "email": None,
                "password": "SecurePass123!"
            }
        )
        assert response.status_code == 422


class TestLoginPasswordValidation:
    """Tests for password validation during login."""

    def test_login_empty_password(self, client, db_session):
        """Test rejection of empty password."""
        from app.models.user import User
        user = User(
            name="Empty Pass User",
            email="emptypass@example.com",
            password_hash=hash_password("TestPass123!"),
            role="learner",
            courses_enrolled=[]
        )
        db_session.add(user)
        db_session.commit()

        response = client.post(
            "/api/auth/login",
            json={
                "email": "emptypass@example.com",
                "password": ""
            }
        )
        assert response.status_code in [400, 422]

    def test_login_missing_password(self, client):
        """Test rejection when password is missing."""
        response = client.post(
            "/api/auth/login",
            json={
                "email": "user@example.com"
            }
        )
        assert response.status_code == 422

    def test_login_null_password(self, client):
        """Test rejection when password is null."""
        response = client.post(
            "/api/auth/login",
            json={
                "email": "user@example.com",
                "password": None
            }
        )
        assert response.status_code == 422

    def test_login_password_too_short(self, client, db_session):
        """Test rejection of password shorter than 6 characters."""
        from app.models.user import User
        user = User(
            name="Short Pass User",
            email="shortpass@example.com",
            password_hash=hash_password("TestPass123!"),
            role="learner",
            courses_enrolled=[]
        )
        db_session.add(user)
        db_session.commit()

        response = client.post(
            "/api/auth/login",
            json={
                "email": "shortpass@example.com",
                "password": "Pass1"
            }
        )
        assert response.status_code in [400, 422]


class TestLoginAuthentication:
    """Tests for authentication errors."""

    def test_login_user_not_found(self, client):
        """Test rejection when user email doesn't exist."""
        response = client.post(
            "/api/auth/login",
            json={
                "email": "nonexistent@example.com",
                "password": "SomePassword123!"
            }
        )
        assert response.status_code == 401
        assert "Invalid email or password" in response.json()["detail"]

    def test_login_wrong_password(self, client, db_session):
        """Test rejection when password is incorrect."""
        from app.models.user import User
        user = User(
            name="John Doe",
            email="wrongpass@example.com",
            password_hash=hash_password("CorrectPass123!"),
            role="learner",
            courses_enrolled=[]
        )
        db_session.add(user)
        db_session.commit()

        response = client.post(
            "/api/auth/login",
            json={
                "email": "wrongpass@example.com",
                "password": "WrongPassword123!"
            }
        )
        assert response.status_code == 401
        assert "Invalid email or password" in response.json()["detail"]

    def test_login_case_sensitive_password(self, client, db_session):
        """Test that password is case-sensitive."""
        from app.models.user import User
        user = User(
            name="Jane Doe",
            email="casesensitive@example.com",
            password_hash=hash_password("CaseSensitive123!"),
            role="learner",
            courses_enrolled=[]
        )
        db_session.add(user)
        db_session.commit()

        # Try with different case
        response = client.post(
            "/api/auth/login",
            json={
                "email": "casesensitive@example.com",
                "password": "casesensitive123!"
            }
        )
        assert response.status_code == 401
        assert "Invalid email or password" in response.json()["detail"]

    def test_login_multiple_failed_attempts(self, client, db_session):
        """Test multiple failed login attempts are handled."""
        from app.models.user import User
        user = User(
            name="Multiple Attempts User",
            email="multipleattempts@example.com",
            password_hash=hash_password("CorrectPass123!"),
            role="learner",
            courses_enrolled=[]
        )
        db_session.add(user)
        db_session.commit()

        # Multiple wrong password attempts
        for _ in range(3):
            response = client.post(
                "/api/auth/login",
                json={
                    "email": "multipleattempts@example.com",
                    "password": "WrongPassword123!"
                }
            )
            assert response.status_code == 401

        # Should still be able to login with correct password
        response = client.post(
            "/api/auth/login",
            json={
                "email": "multipleattempts@example.com",
                "password": "CorrectPass123!"
            }
        )
        assert response.status_code == 200


class TestLoginResponseStructure:
    """Tests for response structure and format."""

    def test_login_response_contains_token(self, client, db_session):
        """Test that response contains access token."""
        from app.models.user import User
        user = User(
            name="Test User",
            email="responsetoken@example.com",
            password_hash=hash_password("TestPass123!"),
            role="learner",
            courses_enrolled=[]
        )
        db_session.add(user)
        db_session.commit()

        response = client.post(
            "/api/auth/login",
            json={
                "email": "responsetoken@example.com",
                "password": "TestPass123!"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["access_token"].startswith("Bearer ")

    def test_login_response_contains_user(self, client, db_session):
        """Test that response contains user object."""
        from app.models.user import User
        user = User(
            name="Test User",
            email="responseuser@example.com",
            password_hash=hash_password("TestPass123!"),
            role="learner",
            courses_enrolled=[]
        )
        db_session.add(user)
        db_session.commit()

        response = client.post(
            "/api/auth/login",
            json={
                "email": "responseuser@example.com",
                "password": "TestPass123!"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert "user" in data
        assert isinstance(data["user"], dict)

    def test_login_response_user_fields(self, client, db_session):
        """Test that user object contains all required fields."""
        from app.models.user import User
        user = User(
            name="Test User",
            email="responsefields@example.com",
            password_hash=hash_password("TestPass123!"),
            role="learner",
            courses_enrolled=[1, 2]
        )
        db_session.add(user)
        db_session.commit()

        response = client.post(
            "/api/auth/login",
            json={
                "email": "responsefields@example.com",
                "password": "TestPass123!"
            }
        )
        assert response.status_code == 200
        user_data = response.json()["user"]
        assert "id" in user_data
        assert "name" in user_data
        assert "email" in user_data
        assert "role" in user_data
        assert "courses_enrolled" in user_data

    def test_login_response_no_password_in_response(self, client, db_session):
        """Test that password is not returned in response."""
        from app.models.user import User
        user = User(
            name="Test User",
            email="nopassresponse@example.com",
            password_hash=hash_password("TestPass123!"),
            role="learner",
            courses_enrolled=[]
        )
        db_session.add(user)
        db_session.commit()

        response = client.post(
            "/api/auth/login",
            json={
                "email": "nopassresponse@example.com",
                "password": "TestPass123!"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert "password" not in data
        assert "password_hash" not in data
        assert "password" not in data.get("user", {})

    def test_login_response_message(self, client, db_session):
        """Test that response contains success message."""
        from app.models.user import User
        user = User(
            name="Test User",
            email="responsemessage@example.com",
            password_hash=hash_password("TestPass123!"),
            role="learner",
            courses_enrolled=[]
        )
        db_session.add(user)
        db_session.commit()

        response = client.post(
            "/api/auth/login",
            json={
                "email": "responsemessage@example.com",
                "password": "TestPass123!"
            }
        )
        assert response.status_code == 200
        assert response.json()["message"] == "Login successful"


class TestLoginEdgeCases:
    """Tests for edge cases and special scenarios."""

    def test_login_with_special_characters_in_password(self, client, db_session):
        """Test login with special characters in password."""
        from app.models.user import User
        password = "P@ssw0rd!#$%"
        user = User(
            name="Test User",
            email="specialchar@example.com",
            password_hash=hash_password(password),
            role="learner",
            courses_enrolled=[]
        )
        db_session.add(user)
        db_session.commit()

        response = client.post(
            "/api/auth/login",
            json={
                "email": "specialchar@example.com",
                "password": password
            }
        )
        assert response.status_code == 200

    def test_login_with_long_password(self, client, db_session):
        """Test login with very long password."""
        from app.models.user import User
        password = "VeryLongPassword" * 10 + "123!"
        user = User(
            name="Test User",
            email="longpass@example.com",
            password_hash=hash_password(password),
            role="learner",
            courses_enrolled=[]
        )
        db_session.add(user)
        db_session.commit()

        response = client.post(
            "/api/auth/login",
            json={
                "email": "longpass@example.com",
                "password": password
            }
        )
        assert response.status_code == 200

    def test_login_preserves_user_role(self, client, db_session):
        """Test that logged-in user's role is preserved from database."""
        from app.models.user import User
        user = User(
            name="Admin User",
            email="adminrole@example.com",
            password_hash=hash_password("AdminPass123!"),
            role="admin",
            courses_enrolled=[]
        )
        db_session.add(user)
        db_session.commit()

        response = client.post(
            "/api/auth/login",
            json={
                "email": "adminrole@example.com",
                "password": "AdminPass123!"
            }
        )
        assert response.status_code == 200
        assert response.json()["user"]["role"] == "admin"

    def test_login_with_empty_courses_enrolled(self, client, db_session):
        """Test login when user has no enrolled courses."""
        from app.models.user import User
        user = User(
            name="New User",
            email="new@example.com",
            password_hash=hash_password("NewPass123!"),
            role="learner",
            courses_enrolled=[]
        )
        db_session.add(user)
        db_session.commit()

        response = client.post(
            "/api/auth/login",
            json={
                "email": "new@example.com",
                "password": "NewPass123!"
            }
        )
        assert response.status_code == 200
        assert response.json()["user"]["courses_enrolled"] == []

    def test_login_with_multiple_enrolled_courses(self, client, db_session):
        """Test login when user has multiple enrolled courses."""
        from app.models.user import User
        courses = [1, 2, 3, 4, 5]
        user = User(
            name="Active User",
            email="active@example.com",
            password_hash=hash_password("ActivePass123!"),
            role="learner",
            courses_enrolled=courses
        )
        db_session.add(user)
        db_session.commit()

        response = client.post(
            "/api/auth/login",
            json={
                "email": "active@example.com",
                "password": "ActivePass123!"
            }
        )
        assert response.status_code == 200
        assert response.json()["user"]["courses_enrolled"] == courses

    def test_login_http_status_code(self, client, db_session):
        """Test that successful login returns HTTP 200 (not 201)."""
        from app.models.user import User
        user = User(
            name="Test User",
            email="httpstatus@example.com",
            password_hash=hash_password("TestPass123!"),
            role="learner",
            courses_enrolled=[]
        )
        db_session.add(user)
        db_session.commit()

        response = client.post(
            "/api/auth/login",
            json={
                "email": "httpstatus@example.com",
                "password": "TestPass123!"
            }
        )
        # Login should return 200, not 201 (unlike signup)
        assert response.status_code == 200


class TestLoginWithMissingFields:
    """Tests for missing required fields."""

    def test_login_missing_all_fields(self, client):
        """Test rejection when all fields are missing."""
        response = client.post(
            "/api/auth/login",
            json={}
        )
        assert response.status_code == 422

    def test_login_null_email_and_password(self, client):
        """Test rejection when both fields are null."""
        response = client.post(
            "/api/auth/login",
            json={
                "email": None,
                "password": None
            }
        )
        assert response.status_code == 422


class TestLoginIntegration:
    """Integration tests for login with signup."""

    def test_login_after_signup(self, client, db_session):
        """Test that user can login after signup."""
        # First signup
        signup_response = client.post(
            "/api/auth/signup",
            json={
                "name": "Integration Test",
                "email": "integration@example.com",
                "password": "IntegrationPass123!"
            }
        )
        assert signup_response.status_code == 201

        # Then login with same credentials
        login_response = client.post(
            "/api/auth/login",
            json={
                "email": "integration@example.com",
                "password": "IntegrationPass123!"
            }
        )
        assert login_response.status_code == 200
        assert login_response.json()["user"]["email"] == "integration@example.com"

    def test_login_with_different_emails(self, client, db_session):
        """Test that different users can login independently."""
        from app.models.user import User

        # Create two users
        user1 = User(
            name="User One",
            email="useronedifferent@example.com",
            password_hash=hash_password("Pass1User123!"),
            role="learner",
            courses_enrolled=[]
        )
        user2 = User(
            name="User Two",
            email="usertwodifferent@example.com",
            password_hash=hash_password("Pass2User123!"),
            role="learner",
            courses_enrolled=[]
        )
        db_session.add(user1)
        db_session.add(user2)
        db_session.commit()

        # Login as first user
        response1 = client.post(
            "/api/auth/login",
            json={
                "email": "useronedifferent@example.com",
                "password": "Pass1User123!"
            }
        )
        assert response1.status_code == 200
        assert response1.json()["user"]["name"] == "User One"

        # Login as second user
        response2 = client.post(
            "/api/auth/login",
            json={
                "email": "usertwodifferent@example.com",
                "password": "Pass2User123!"
            }
        )
        assert response2.status_code == 200
        assert response2.json()["user"]["name"] == "User Two"
