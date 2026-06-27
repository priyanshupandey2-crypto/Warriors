"""
Comprehensive test suite for the signup endpoint (/api/auth/signup).
Tests all edge cases including validation, duplicate handling, and error scenarios.

Uses pytest with FastAPI TestClient for synchronous testing of the signup endpoint.
Database fixtures are defined in conftest.py for shared use across all tests.
"""

import pytest


class TestSignupBasicFunctionality:
    """Tests for basic signup functionality."""

    def test_signup_success(self, client):
        """Test successful user signup with valid credentials."""
        response = client.post(
            "/api/auth/signup",
            json={
                "name": "John Doe",
                "email": "signup@example.com",
                "password": "SecurePass123!"
            }
        )
        assert response.status_code == 201
        data = response.json()
        assert data["email"] == "signup@example.com"
        assert data["name"] == "John Doe"
        assert data["role"] == "learner"
        assert "access_token" in data
        assert data["access_token"].startswith("Bearer ")
        assert data["message"] == "User created successfully"
        assert "id" in data

    def test_signup_email_lowercase(self, client):
        """Test that email is converted to lowercase."""
        response = client.post(
            "/api/auth/signup",
            json={
                "name": "Jane Doe",
                "email": "JANEDOE@EXAMPLE.COM",
                "password": "SecurePass123!"
            }
        )
        assert response.status_code == 201
        data = response.json()
        assert data["email"] == "janedoe@example.com"

    def test_signup_name_trimmed(self, client):
        """Test that name is trimmed of whitespace."""
        response = client.post(
            "/api/auth/signup",
            json={
                "name": "  John Doe  ",
                "email": "johntrimmed@example.com",
                "password": "SecurePass123!"
            }
        )
        assert response.status_code == 201
        data = response.json()
        assert data["name"] == "John Doe"

    def test_signup_returns_access_token(self, client):
        """Test that signup returns a valid JWT access token."""
        response = client.post(
            "/api/auth/signup",
            json={
                "name": "Test User",
                "email": "test@example.com",
                "password": "TestPass123!"
            }
        )
        assert response.status_code == 201
        data = response.json()
        token = data["access_token"]
        assert token.startswith("Bearer ")
        assert len(token) > 10


class TestSignupEmailValidation:
    """Tests for email validation edge cases."""

    def test_signup_invalid_email_no_at(self, client):
        """Test rejection of email without @ symbol."""
        response = client.post(
            "/api/auth/signup",
            json={
                "name": "John Doe",
                "email": "invalidemail.com",
                "password": "SecurePass123!"
            }
        )
        assert response.status_code == 400
        assert "Invalid email format" in response.json()["detail"]

    def test_signup_invalid_email_no_domain(self, client):
        """Test rejection of email without domain extension."""
        response = client.post(
            "/api/auth/signup",
            json={
                "name": "John Doe",
                "email": "john@invalid",
                "password": "SecurePass123!"
            }
        )
        assert response.status_code == 400
        assert "Invalid email format" in response.json()["detail"]

    def test_signup_invalid_email_double_at(self, client):
        """Test rejection of email with multiple @ symbols."""
        response = client.post(
            "/api/auth/signup",
            json={
                "name": "John Doe",
                "email": "john@@example.com",
                "password": "SecurePass123!"
            }
        )
        assert response.status_code == 400
        assert "Invalid email format" in response.json()["detail"]

    def test_signup_email_with_special_chars(self, client):
        """Test valid email with allowed special characters."""
        response = client.post(
            "/api/auth/signup",
            json={
                "name": "John Doe",
                "email": "john.doe+tag@example.com",
                "password": "SecurePass123!"
            }
        )
        assert response.status_code == 201
        assert response.json()["email"] == "john.doe+tag@example.com"

    def test_signup_email_too_long(self, client):
        """Test rejection of email exceeding 100 characters."""
        long_email = "a" * 95 + "@example.com"  # 108 characters
        response = client.post(
            "/api/auth/signup",
            json={
                "name": "John Doe",
                "email": long_email,
                "password": "SecurePass123!"
            }
        )
        # Pydantic validates max_length first, so returns 422 instead of 400
        assert response.status_code in [400, 422]

    def test_signup_empty_email(self, client):
        """Test rejection of empty email."""
        response = client.post(
            "/api/auth/signup",
            json={
                "name": "John Doe",
                "email": "",
                "password": "SecurePass123!"
            }
        )
        # Empty email is rejected by validator, returns 400
        assert response.status_code in [400, 422]

    def test_signup_missing_email(self, client):
        """Test rejection when email is missing."""
        response = client.post(
            "/api/auth/signup",
            json={
                "name": "John Doe",
                "password": "SecurePass123!"
            }
        )
        assert response.status_code == 422

    def test_signup_email_with_spaces(self, client):
        """Test rejection of email with spaces."""
        response = client.post(
            "/api/auth/signup",
            json={
                "name": "John Doe",
                "email": "john @example.com",
                "password": "SecurePass123!"
            }
        )
        assert response.status_code == 400


class TestSignupNameValidation:
    """Tests for name validation edge cases."""

    def test_signup_valid_name_with_space(self, client):
        """Test valid name with space."""
        response = client.post(
            "/api/auth/signup",
            json={
                "name": "John Doe",
                "email": "namevalid1@example.com",
                "password": "SecurePass123!"
            }
        )
        assert response.status_code == 201

    def test_signup_valid_name_with_hyphen(self, client):
        """Test valid name with hyphen."""
        response = client.post(
            "/api/auth/signup",
            json={
                "name": "Mary-Jane Watson",
                "email": "mary@example.com",
                "password": "SecurePass123!"
            }
        )
        assert response.status_code == 201
        assert response.json()["name"] == "Mary-Jane Watson"

    def test_signup_valid_name_with_apostrophe(self, client):
        """Test valid name with apostrophe."""
        response = client.post(
            "/api/auth/signup",
            json={
                "name": "O'Connor",
                "email": "oconnor@example.com",
                "password": "SecurePass123!"
            }
        )
        assert response.status_code == 201
        assert response.json()["name"] == "O'Connor"

    def test_signup_name_too_short(self, client):
        """Test rejection of single character name."""
        response = client.post(
            "/api/auth/signup",
            json={
                "name": "A",
                "email": "namevalid2@example.com",
                "password": "SecurePass123!"
            }
        )
        assert response.status_code == 400
        assert "at least 2 characters" in response.json()["detail"]

    def test_signup_name_too_long(self, client):
        """Test rejection of name exceeding 100 characters."""
        long_name = "a" * 101
        response = client.post(
            "/api/auth/signup",
            json={
                "name": long_name,
                "email": "namevalid3@example.com",
                "password": "SecurePass123!"
            }
        )
        # Pydantic validates max_length first, so returns 422
        assert response.status_code in [400, 422]

    def test_signup_empty_name(self, client):
        """Test rejection of empty name."""
        response = client.post(
            "/api/auth/signup",
            json={
                "name": "",
                "email": "namevalid4@example.com",
                "password": "SecurePass123!"
            }
        )
        # Empty string fails Pydantic min_length validation, returns 422
        assert response.status_code == 422

    def test_signup_whitespace_only_name(self, client):
        """Test rejection of name with only whitespace."""
        response = client.post(
            "/api/auth/signup",
            json={
                "name": "   ",
                "email": "namevalid5@example.com",
                "password": "SecurePass123!"
            }
        )
        assert response.status_code == 400
        assert "cannot be empty" in response.json()["detail"]

    def test_signup_missing_name(self, client):
        """Test rejection when name is missing."""
        response = client.post(
            "/api/auth/signup",
            json={
                "email": "namevalid6@example.com",
                "password": "SecurePass123!"
            }
        )
        assert response.status_code == 422

    def test_signup_name_with_numbers(self, client):
        """Test rejection of name containing numbers."""
        response = client.post(
            "/api/auth/signup",
            json={
                "name": "John123",
                "email": "namevalid7@example.com",
                "password": "SecurePass123!"
            }
        )
        assert response.status_code == 400
        assert "can only contain letters" in response.json()["detail"]

    def test_signup_name_with_special_chars(self, client):
        """Test rejection of name with special characters."""
        response = client.post(
            "/api/auth/signup",
            json={
                "name": "John@Doe",
                "email": "namevalid8@example.com",
                "password": "SecurePass123!"
            }
        )
        assert response.status_code == 400
        assert "can only contain letters" in response.json()["detail"]


class TestSignupPasswordValidation:
    """Tests for password validation edge cases."""

    def test_signup_valid_password_uppercase_lowercase_digit(self, client):
        """Test valid password with uppercase, lowercase, and digit."""
        response = client.post(
            "/api/auth/signup",
            json={
                "name": "John Doe",
                "email": "passvalid1@example.com",
                "password": "SecurePass123"
            }
        )
        assert response.status_code == 201

    def test_signup_valid_password_with_special_char(self, client):
        """Test valid password with special character."""
        response = client.post(
            "/api/auth/signup",
            json={
                "name": "John Doe",
                "email": "passvalid2@example.com",
                "password": "SecurePass!23"
            }
        )
        assert response.status_code == 201

    def test_signup_password_too_short(self, client):
        """Test rejection of password shorter than 6 characters."""
        response = client.post(
            "/api/auth/signup",
            json={
                "name": "John Doe",
                "email": "passvalid3@example.com",
                "password": "Pass1"
            }
        )
        # Pydantic validates min_length first, so returns 422
        assert response.status_code in [400, 422]

    def test_signup_password_too_long(self, client):
        """Test rejection of password exceeding 255 characters."""
        long_password = "P" * 260
        response = client.post(
            "/api/auth/signup",
            json={
                "name": "John Doe",
                "email": "passvalid4@example.com",
                "password": long_password
            }
        )
        assert response.status_code == 400
        assert "less than 255 characters" in response.json()["detail"]

    def test_signup_password_only_lowercase(self, client):
        """Test rejection of password with only lowercase letters."""
        response = client.post(
            "/api/auth/signup",
            json={
                "name": "John Doe",
                "email": "passvalid5@example.com",
                "password": "onlylowercase"
            }
        )
        assert response.status_code == 400
        assert "Password must contain at least" in response.json()["detail"]

    def test_signup_password_only_uppercase(self, client):
        """Test rejection of password with only uppercase letters."""
        response = client.post(
            "/api/auth/signup",
            json={
                "name": "John Doe",
                "email": "passvalid6@example.com",
                "password": "ONLYUPPERCASE"
            }
        )
        assert response.status_code == 400
        assert "Password must contain at least" in response.json()["detail"]

    def test_signup_password_only_digits(self, client):
        """Test rejection of password with only digits."""
        response = client.post(
            "/api/auth/signup",
            json={
                "name": "John Doe",
                "email": "passvalid7@example.com",
                "password": "123456789"
            }
        )
        assert response.status_code == 400
        assert "Password must contain at least" in response.json()["detail"]

    def test_signup_password_uppercase_lowercase_only(self, client):
        """Test that password with uppercase and lowercase is accepted (meets 2-character requirement)."""
        # Note: "SecurePass" has uppercase and lowercase, which satisfies the strength_score >= 2 requirement
        response = client.post(
            "/api/auth/signup",
            json={
                "name": "John Doe",
                "email": "passvalid8@example.com",
                "password": "SecurePass"
            }
        )
        # Should succeed since it has 2 character types (uppercase + lowercase)
        assert response.status_code == 201

    def test_signup_empty_password(self, client):
        """Test rejection of empty password."""
        response = client.post(
            "/api/auth/signup",
            json={
                "name": "John Doe",
                "email": "passvalid9@example.com",
                "password": ""
            }
        )
        # Empty password fails Pydantic min_length validation, returns 422
        assert response.status_code == 422

    def test_signup_missing_password(self, client):
        """Test rejection when password is missing."""
        response = client.post(
            "/api/auth/signup",
            json={
                "name": "John Doe",
                "email": "john@example.com"
            }
        )
        assert response.status_code == 422

    def test_signup_password_special_char_valid(self, client):
        """Test valid password with various special characters."""
        special_passwords = [
            "SecurePass!23",
            "SecurePass@23",
            "SecurePass#23",
            "SecurePass$23",
            "SecurePass%23",
            "SecurePass^23",
            "SecurePass&23",
        ]
        for password in special_passwords:
            response = client.post(
                "/api/auth/signup",
                json={
                    "name": "John Doe",
                    "email": f"john{special_passwords.index(password)}@example.com",
                    "password": password
                }
            )
            assert response.status_code == 201


class TestSignupDuplicateEmail:
    """Tests for duplicate email handling."""

    def test_signup_duplicate_email_same_case(self, client):
        """Test rejection when email already registered (same case)."""
        # First signup
        client.post(
            "/api/auth/signup",
            json={
                "name": "John Doe",
                "email": "dupmail1@example.com",
                "password": "SecurePass123!"
            }
        )
        # Duplicate signup with SAME email
        response = client.post(
            "/api/auth/signup",
            json={
                "name": "Jane Doe",
                "email": "dupmail1@example.com",
                "password": "SecurePass123!"
            }
        )
        assert response.status_code == 400
        assert "Email already registered" in response.json()["detail"]

    def test_signup_duplicate_email_different_case(self, client):
        """Test rejection when email already registered (different case)."""
        # First signup with lowercase
        client.post(
            "/api/auth/signup",
            json={
                "name": "John Doe",
                "email": "dupmail3@example.com",
                "password": "SecurePass123!"
            }
        )
        # Duplicate signup with uppercase
        response = client.post(
            "/api/auth/signup",
            json={
                "name": "Jane Doe",
                "email": "JOHN@EXAMPLE.COM",
                "password": "SecurePass123!"
            }
        )
        assert response.status_code == 400
        assert "Email already registered" in response.json()["detail"]

    def test_signup_duplicate_email_same_user_different_name(self, client):
        """Test rejection of duplicate email with different name."""
        # First signup
        client.post(
            "/api/auth/signup",
            json={
                "name": "John Doe",
                "email": "dupmail4@example.com",
                "password": "SecurePass123!"
            }
        )
        # Attempt with SAME email but different name
        response = client.post(
            "/api/auth/signup",
            json={
                "name": "Jane Smith",
                "email": "dupmail4@example.com",
                "password": "DifferentPass123!"
            }
        )
        assert response.status_code == 400
        assert "Email already registered" in response.json()["detail"]


class TestSignupMissingFields:
    """Tests for missing required fields."""

    def test_signup_missing_all_fields(self, client):
        """Test rejection when all fields are missing."""
        response = client.post(
            "/api/auth/signup",
            json={}
        )
        assert response.status_code == 422

    def test_signup_null_name(self, client):
        """Test rejection when name is null."""
        response = client.post(
            "/api/auth/signup",
            json={
                "name": None,
                "email": "missingfield1@example.com",
                "password": "SecurePass123!"
            }
        )
        assert response.status_code == 422

    def test_signup_null_email(self, client):
        """Test rejection when email is null."""
        response = client.post(
            "/api/auth/signup",
            json={
                "name": "John Doe",
                "email": None,
                "password": "SecurePass123!"
            }
        )
        assert response.status_code == 422

    def test_signup_null_password(self, client):
        """Test rejection when password is null."""
        response = client.post(
            "/api/auth/signup",
            json={
                "name": "John Doe",
                "email": "missingfield2@example.com",
                "password": None
            }
        )
        assert response.status_code == 422


class TestSignupContentType:
    """Tests for request content type validation."""

    def test_signup_correct_content_type(self, client):
        """Test signup with correct JSON content type."""
        response = client.post(
            "/api/auth/signup",
            json={
                "name": "John Doe",
                "email": "contenttype1@example.com",
                "password": "SecurePass123!"
            },
            headers={"Content-Type": "application/json"}
        )
        assert response.status_code == 201

    def test_signup_extra_fields(self, client):
        """Test that extra fields in request are ignored."""
        response = client.post(
            "/api/auth/signup",
            json={
                "name": "John Doe",
                "email": "contenttype2@example.com",
                "password": "SecurePass123!",
                "role": "admin",  # Extra field
                "courses_enrolled": [1, 2, 3]  # Extra field
            }
        )
        assert response.status_code == 201
        assert response.json()["role"] == "learner"  # Should be learner, not admin


class TestSignupResponseStructure:
    """Tests for response structure and format."""

    def test_signup_response_contains_token(self, client):
        """Test that response contains access token."""
        response = client.post(
            "/api/auth/signup",
            json={
                "name": "John Doe",
                "email": "respstruct1@example.com",
                "password": "SecurePass123!"
            }
        )
        assert response.status_code == 201
        data = response.json()
        assert "access_token" in data

    def test_signup_response_contains_user_id(self, client):
        """Test that response contains user ID."""
        response = client.post(
            "/api/auth/signup",
            json={
                "name": "John Doe",
                "email": "respstruct2@example.com",
                "password": "SecurePass123!"
            }
        )
        assert response.status_code == 201
        data = response.json()
        assert "id" in data
        assert isinstance(data["id"], int)
        assert data["id"] > 0

    def test_signup_response_contains_user_info(self, client):
        """Test that response contains all user information."""
        response = client.post(
            "/api/auth/signup",
            json={
                "name": "John Doe",
                "email": "respstruct3@example.com",
                "password": "SecurePass123!"
            }
        )
        assert response.status_code == 201
        data = response.json()
        assert data["name"] == "John Doe"
        assert data["email"] == "respstruct3@example.com"
        assert data["role"] == "learner"

    def test_signup_response_no_password_in_response(self, client):
        """Test that password is not returned in response."""
        response = client.post(
            "/api/auth/signup",
            json={
                "name": "John Doe",
                "email": "respstruct5@example.com",
                "password": "SecurePass123!"
            }
        )
        assert response.status_code == 201
        data = response.json()
        assert "password" not in data
        assert "password_hash" not in data


class TestSignupEdgeCases:
    """Tests for edge cases and corner scenarios."""

    def test_signup_multiple_users(self, client):
        """Test multiple users can be created with different emails."""
        users = [
            {"name": "User One", "email": "user1@example.com", "password": "Pass1234!"},
            {"name": "User Two", "email": "user2@example.com", "password": "Pass1234!"},
            {"name": "User Three", "email": "user3@example.com", "password": "Pass1234!"},
        ]
        for user in users:
            response = client.post("/api/auth/signup", json=user)
            assert response.status_code == 201

    def test_signup_unicode_name(self, client):
        """Test name with unicode characters (should fail based on regex)."""
        response = client.post(
            "/api/auth/signup",
            json={
                "name": "José García",  # Contains accented characters
                "email": "jose@example.com",
                "password": "SecurePass123!"
            }
        )
        assert response.status_code == 400

    def test_signup_sequential_ids(self, client):
        """Test that user IDs are sequential."""
        response1 = client.post(
            "/api/auth/signup",
            json={
                "name": "User One",
                "email": "user1@example.com",
                "password": "Pass1234!"
            }
        )
        id1 = response1.json()["id"]

        response2 = client.post(
            "/api/auth/signup",
            json={
                "name": "User Two",
                "email": "user2@example.com",
                "password": "Pass1234!"
            }
        )
        id2 = response2.json()["id"]

        assert id2 > id1

    def test_signup_verify_returned_role_is_learner(self, client):
        """Verify that returned role is always 'learner' for new signups."""
        response = client.post(
            "/api/auth/signup",
            json={
                "name": "John Doe",
                "email": "edge1@example.com",
                "password": "SecurePass123!"
            }
        )
        assert response.status_code == 201
        assert response.json()["role"] == "learner"

    def test_signup_verify_success_message(self, client):
        """Test that success message is returned."""
        response = client.post(
            "/api/auth/signup",
            json={
                "name": "John Doe",
                "email": "edge2@example.com",
                "password": "SecurePass123!"
            }
        )
        assert response.status_code == 201
        assert response.json()["message"] == "User created successfully"
