import re
from fastapi import HTTPException, status


def validate_email(email: str) -> str:
    """Validate email format."""
    email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if not re.match(email_regex, email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid email format"
        )
    if len(email) > 100:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email must be less than 100 characters"
        )
    return email.lower()


def validate_name(name: str) -> str:
    """Validate user name."""
    if not name or len(name.strip()) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Name cannot be empty"
        )
    if len(name) < 2:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Name must be at least 2 characters"
        )
    if len(name) > 100:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Name must be less than 100 characters"
        )
    # Allow letters, spaces, hyphens, and apostrophes
    name_regex = r'^[a-zA-Z\s\'-]+$'
    if not re.match(name_regex, name):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Name can only contain letters, spaces, hyphens, and apostrophes"
        )
    return name.strip()


def validate_password(password: str) -> str:
    """Validate password strength."""
    if not password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password cannot be empty"
        )
    if len(password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 6 characters"
        )
    if len(password) > 255:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be less than 255 characters"
        )

    # Password strength requirements
    has_uppercase = any(c.isupper() for c in password)
    has_lowercase = any(c.islower() for c in password)
    has_digit = any(c.isdigit() for c in password)
    has_special = any(c in '!@#$%^&*()_+-=[]{}|;:,.<>?' for c in password)

    strength_score = sum([has_uppercase, has_lowercase, has_digit, has_special])

    if strength_score < 2:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must contain at least uppercase, lowercase, and one of: digit or special character"
        )

    return password


def validate_signup_input(name: str, email: str, password: str) -> dict:
    """Validate all signup inputs together."""
    validated_name = validate_name(name)
    validated_email = validate_email(email)
    validated_password = validate_password(password)

    return {
        "name": validated_name,
        "email": validated_email,
        "password": validated_password
    }
