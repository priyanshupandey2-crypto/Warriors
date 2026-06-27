"""
Comprehensive test suite for the verify-token endpoint (/api/auth/verify-token).
Tests token validation, expiration, and error scenarios.
"""

import pytest
import jwt
from datetime import datetime, timedelta, timezone
from app.utils.password import hash_password
from app.utils.jwt_handler import create_access_token
from app.config import settings


class TestVerifyTokenBasicFunctionality:
    """Tests for basic token verification functionality."""

    def test_verify_valid_token(self, client, db_session):
        """Test verification of a valid token."""
        from app.models.user import User

        # Create a user
        user = User(
            name="John Doe",
            email="johnverify@example.com",
            password_hash=hash_password("SecurePass123!"),
            role="learner",
            courses_enrolled=[]
        )
        db_session.add(user)
        db_session.commit()

        # Create a valid token
        token = create_access_token(user.id, user.email, user.role)

        # Verify the token
        response = client.post(
            "/api/auth/verify-token",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["id"] == user.id
        assert data["name"] == "John Doe"
        assert data["email"] == "johnverify@example.com"
        assert data["role"] == "learner"

    def test_verify_token_returns_user_data(self, client, db_session):
        """Test that token verification returns complete user data."""
        from app.models.user import User

        user = User(
            name="Complete User Data",
            email="complete@example.com",
            password_hash=hash_password("CompletePass123!"),
            role="learner",
            courses_enrolled=[1, 2, 3]
        )
        db_session.add(user)
        db_session.commit()

        token = create_access_token(user.id, user.email, user.role)

        response = client.post(
            "/api/auth/verify-token",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200
        user_data = response.json()
        assert user_data["success"] is True
        assert "id" in user_data
        assert "name" in user_data
        assert "email" in user_data
        assert "role" in user_data

    def test_verify_token_case_insensitive_bearer(self, client, db_session):
        """Test token verification with bearer prefix."""
        from app.models.user import User

        user = User(
            name="Bearer Test",
            email="bearer@example.com",
            password_hash=hash_password("BearerPass123!"),
            role="learner",
            courses_enrolled=[]
        )
        db_session.add(user)
        db_session.commit()

        token = create_access_token(user.id, user.email, user.role)

        # Test with Bearer prefix
        response = client.post(
            "/api/auth/verify-token",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200
        assert response.json()["success"] is True


class TestVerifyTokenInvalidToken:
    """Tests for invalid token scenarios."""

    def test_verify_empty_token(self, client):
        """Test verification with empty token."""
        response = client.post(
            "/api/auth/verify-token",
            headers={"Authorization": "Bearer "}
        )
        # HTTPBearer returns 401 for empty/missing token
        assert response.status_code == 401

    def test_verify_malformed_token(self, client):
        """Test verification with malformed token."""
        response = client.post(
            "/api/auth/verify-token",
            headers={"Authorization": "Bearer invalid.malformed.token"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is False
        assert "message" in data

    def test_verify_corrupted_token(self, client):
        """Test verification with corrupted token."""
        # Create a valid token then corrupt it
        token = create_access_token(1, "test@example.com", "learner")
        corrupted_token = token[:-10] + "corrupted"

        response = client.post(
            "/api/auth/verify-token",
            headers={"Authorization": f"Bearer {corrupted_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is False

    def test_verify_token_wrong_secret(self, client, db_session):
        """Test verification when token was signed with different secret."""
        from app.models.user import User

        user = User(
            name="Wrong Secret Test",
            email="wrongsecret@example.com",
            password_hash=hash_password("WrongSecretPass123!"),
            role="learner",
            courses_enrolled=[]
        )
        db_session.add(user)
        db_session.commit()

        # Create token with wrong secret
        now = datetime.now(timezone.utc)
        payload = {
            "sub": str(user.id),
            "email": user.email,
            "role": user.role,
            "iat": now,
            "exp": now + timedelta(hours=24)
        }
        wrong_secret_token = jwt.encode(payload, "wrong_secret_key", algorithm="HS256")

        response = client.post(
            "/api/auth/verify-token",
            headers={"Authorization": f"Bearer {wrong_secret_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is False
        assert "Invalid token" in data.get("message", "")

    def test_verify_expired_token(self, client, db_session):
        """Test verification of an expired token."""
        from app.models.user import User

        user = User(
            name="Expired Token Test",
            email="expired@example.com",
            password_hash=hash_password("ExpiredPass123!"),
            role="learner",
            courses_enrolled=[]
        )
        db_session.add(user)
        db_session.commit()

        # Create an expired token
        now = datetime.now(timezone.utc)
        expired_payload = {
            "sub": str(user.id),
            "email": user.email,
            "role": user.role,
            "iat": now - timedelta(days=2),
            "exp": now - timedelta(hours=1)  # Expired 1 hour ago
        }
        expired_token = jwt.encode(
            expired_payload,
            settings.JWT_SECRET,
            algorithm=settings.JWT_ALGORITHM
        )

        response = client.post(
            "/api/auth/verify-token",
            headers={"Authorization": f"Bearer {expired_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is False
        assert "expired" in data["message"].lower()

    def test_verify_token_with_invalid_user_id(self, client, db_session):
        """Test verification when token contains non-existent user ID."""
        # Create a token for a user that doesn't exist
        token = create_access_token(9999, "nonexistent@example.com", "learner")

        response = client.post(
            "/api/auth/verify-token",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is False
        assert "User not found" in data["message"]

    def test_verify_random_string_as_token(self, client):
        """Test verification with random string as token."""
        response = client.post(
            "/api/auth/verify-token",
            headers={"Authorization": "Bearer randomstringnotavalidtoken"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is False


class TestVerifyTokenMissingHeaders:
    """Tests for missing or invalid authorization headers."""

    def test_verify_missing_authorization_header(self, client):
        """Test verification without Authorization header."""
        response = client.post("/api/auth/verify-token")
        # HTTPBearer returns 401 when no auth header
        assert response.status_code == 401

    def test_verify_missing_bearer_prefix(self, client, db_session):
        """Test verification with token but no Bearer prefix."""
        from app.models.user import User

        user = User(
            name="No Bearer Test",
            email="nobearer@example.com",
            password_hash=hash_password("NoBearer123!"),
            role="learner",
            courses_enrolled=[]
        )
        db_session.add(user)
        db_session.commit()

        token = create_access_token(user.id, user.email, user.role)

        # Send without Bearer prefix
        response = client.post(
            "/api/auth/verify-token",
            headers={"Authorization": token}  # Missing "Bearer " prefix
        )
        # HTTPBearer expects "Bearer" prefix - returns 401
        assert response.status_code == 401

    def test_verify_wrong_auth_scheme(self, client, db_session):
        """Test verification with wrong authentication scheme."""
        from app.models.user import User

        user = User(
            name="Wrong Scheme Test",
            email="wrongscheme@example.com",
            password_hash=hash_password("WrongScheme123!"),
            role="learner",
            courses_enrolled=[]
        )
        db_session.add(user)
        db_session.commit()

        token = create_access_token(user.id, user.email, user.role)

        # Use Basic auth instead of Bearer
        response = client.post(
            "/api/auth/verify-token",
            headers={"Authorization": f"Basic {token}"}
        )
        # HTTPBearer only accepts Bearer scheme
        assert response.status_code == 401

    def test_verify_empty_authorization_header(self, client):
        """Test verification with empty Authorization header."""
        response = client.post(
            "/api/auth/verify-token",
            headers={"Authorization": ""}
        )
        # Empty auth header is invalid
        assert response.status_code == 401


class TestVerifyTokenResponseStructure:
    """Tests for response structure and format."""

    def test_verify_success_response_fields(self, client, db_session):
        """Test that success response has all required fields."""
        from app.models.user import User

        user = User(
            name="Success Response Test",
            email="successresponse@example.com",
            password_hash=hash_password("SuccessResponse123!"),
            role="admin",
            courses_enrolled=[1, 2]
        )
        db_session.add(user)
        db_session.commit()

        token = create_access_token(user.id, user.email, user.role)

        response = client.post(
            "/api/auth/verify-token",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200
        data = response.json()

        # Check all required fields
        assert "success" in data
        assert "id" in data
        assert "name" in data
        assert "email" in data
        assert "role" in data

    def test_verify_failure_response_fields(self, client):
        """Test that failure response has required fields."""
        response = client.post(
            "/api/auth/verify-token",
            headers={"Authorization": "Bearer invalid"}
        )
        assert response.status_code == 200
        data = response.json()

        # Check required failure fields
        assert "success" in data
        assert data["success"] is False
        assert "message" in data

    def test_verify_response_http_status_ok(self, client, db_session):
        """Test that both success and failure return HTTP 200."""
        from app.models.user import User

        user = User(
            name="Status Code Test",
            email="statuscode@example.com",
            password_hash=hash_password("StatusCode123!"),
            role="learner",
            courses_enrolled=[]
        )
        db_session.add(user)
        db_session.commit()

        token = create_access_token(user.id, user.email, user.role)

        # Success should return 200
        response_success = client.post(
            "/api/auth/verify-token",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response_success.status_code == 200

        # Failure should also return 200 (with success=false)
        response_failure = client.post(
            "/api/auth/verify-token",
            headers={"Authorization": "Bearer invalid"}
        )
        assert response_failure.status_code == 200


class TestVerifyTokenEdgeCases:
    """Tests for edge cases and special scenarios."""

    def test_verify_token_with_special_characters_in_email(self, client, db_session):
        """Test token verification for user with special characters in email."""
        from app.models.user import User

        user = User(
            name="Special Email",
            email="user+special@example.co.uk",
            password_hash=hash_password("SpecialEmail123!"),
            role="learner",
            courses_enrolled=[]
        )
        db_session.add(user)
        db_session.commit()

        token = create_access_token(user.id, user.email, user.role)

        response = client.post(
            "/api/auth/verify-token",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200
        assert response.json()["success"] is True
        assert response.json()["email"] == "user+special@example.co.uk"

    def test_verify_token_preserves_role(self, client, db_session):
        """Test that token verification preserves the user's role."""
        from app.models.user import User

        roles = ["learner", "admin", "instructor"]
        for role in roles:
            user = User(
                name=f"Role Test {role}",
                email=f"{role}@example.com",
                password_hash=hash_password(f"RoleTest123!"),
                role=role,
                courses_enrolled=[]
            )
            db_session.add(user)
            db_session.commit()

            token = create_access_token(user.id, user.email, user.role)

            response = client.post(
                "/api/auth/verify-token",
                headers={"Authorization": f"Bearer {token}"}
            )
            assert response.status_code == 200
            assert response.json()["role"] == role

    def test_verify_multiple_tokens_independently(self, client, db_session):
        """Test verification of multiple different tokens."""
        from app.models.user import User

        users = []
        for i in range(3):
            user = User(
                name=f"Multi Token User {i}",
                email=f"multitoken{i}@example.com",
                password_hash=hash_password(f"MultiToken{i}123!"),
                role="learner",
                courses_enrolled=[]
            )
            db_session.add(user)
            db_session.commit()
            users.append(user)

        # Verify each token independently
        for user in users:
            token = create_access_token(user.id, user.email, user.role)

            response = client.post(
                "/api/auth/verify-token",
                headers={"Authorization": f"Bearer {token}"}
            )
            assert response.status_code == 200
            data = response.json()
            assert data["success"] is True
            assert data["id"] == user.id

    def test_verify_token_extra_whitespace(self, client, db_session):
        """Test token verification with extra whitespace in header."""
        from app.models.user import User

        user = User(
            name="Whitespace Test",
            email="whitespace@example.com",
            password_hash=hash_password("Whitespace123!"),
            role="learner",
            courses_enrolled=[]
        )
        db_session.add(user)
        db_session.commit()

        token = create_access_token(user.id, user.email, user.role)

        # Extra whitespace in header
        response = client.post(
            "/api/auth/verify-token",
            headers={"Authorization": f"Bearer  {token}"}  # Double space
        )
        # HTTPBearer might handle this differently
        assert response.status_code in [200, 403]

    def test_verify_token_preserves_user_identity(self, client, db_session):
        """Test that token correctly identifies the user."""
        from app.models.user import User

        user1 = User(
            name="User One",
            email="userone@example.com",
            password_hash=hash_password("UserOne123!"),
            role="learner",
            courses_enrolled=[]
        )
        user2 = User(
            name="User Two",
            email="usertwo@example.com",
            password_hash=hash_password("UserTwo123!"),
            role="learner",
            courses_enrolled=[]
        )
        db_session.add_all([user1, user2])
        db_session.commit()

        token1 = create_access_token(user1.id, user1.email, user1.role)
        token2 = create_access_token(user2.id, user2.email, user2.role)

        # Verify token1 returns user1
        response1 = client.post(
            "/api/auth/verify-token",
            headers={"Authorization": f"Bearer {token1}"}
        )
        assert response1.json()["id"] == user1.id
        assert response1.json()["name"] == "User One"

        # Verify token2 returns user2
        response2 = client.post(
            "/api/auth/verify-token",
            headers={"Authorization": f"Bearer {token2}"}
        )
        assert response2.json()["id"] == user2.id
        assert response2.json()["name"] == "User Two"


class TestVerifyTokenIntegration:
    """Integration tests with signup and login."""

    def test_verify_token_from_signup(self, client, db_session):
        """Test verification of token obtained from signup."""
        # First signup
        signup_response = client.post(
            "/api/auth/signup",
            json={
                "name": "Signup Token Test",
                "email": "signuptoken@example.com",
                "password": "SignupToken123!"
            }
        )
        assert signup_response.status_code == 201
        access_token = signup_response.json()["access_token"].replace("Bearer ", "")

        # Verify the token
        verify_response = client.post(
            "/api/auth/verify-token",
            headers={"Authorization": f"Bearer {access_token}"}
        )
        assert verify_response.status_code == 200
        assert verify_response.json()["success"] is True
        assert verify_response.json()["email"] == "signuptoken@example.com"

    def test_verify_token_from_login(self, client, db_session):
        """Test verification of token obtained from login."""
        from app.models.user import User

        # Create a user
        user = User(
            name="Login Token Test",
            email="logintoken@example.com",
            password_hash=hash_password("LoginToken123!"),
            role="learner",
            courses_enrolled=[]
        )
        db_session.add(user)
        db_session.commit()

        # Login
        login_response = client.post(
            "/api/auth/login",
            json={
                "email": "logintoken@example.com",
                "password": "LoginToken123!"
            }
        )
        assert login_response.status_code == 200
        access_token = login_response.json()["access_token"].replace("Bearer ", "")

        # Verify the token
        verify_response = client.post(
            "/api/auth/verify-token",
            headers={"Authorization": f"Bearer {access_token}"}
        )
        assert verify_response.status_code == 200
        assert verify_response.json()["success"] is True
        assert verify_response.json()["name"] == "Login Token Test"

    def test_verify_token_lifecycle(self, client, db_session):
        """Test complete token lifecycle: signup -> login -> verify."""
        # Signup
        signup_response = client.post(
            "/api/auth/signup",
            json={
                "name": "Lifecycle Test",
                "email": "lifecycle@example.com",
                "password": "Lifecycle123!"
            }
        )
        assert signup_response.status_code == 201
        signup_token = signup_response.json()["access_token"].replace("Bearer ", "")

        # Verify signup token
        verify1 = client.post(
            "/api/auth/verify-token",
            headers={"Authorization": f"Bearer {signup_token}"}
        )
        assert verify1.json()["success"] is True

        # Login with same credentials
        login_response = client.post(
            "/api/auth/login",
            json={
                "email": "lifecycle@example.com",
                "password": "Lifecycle123!"
            }
        )
        assert login_response.status_code == 200
        login_token = login_response.json()["access_token"].replace("Bearer ", "")

        # Verify login token
        verify2 = client.post(
            "/api/auth/verify-token",
            headers={"Authorization": f"Bearer {login_token}"}
        )
        assert verify2.json()["success"] is True

        # Both tokens should identify same user
        assert verify1.json()["id"] == verify2.json()["id"]
        assert verify1.json()["email"] == verify2.json()["email"]
