from datetime import datetime, timedelta, timezone
from typing import Dict, Optional, Tuple
import jwt
from app.config import settings
from app.logger import get_logger

logger = get_logger(__name__)


class TokenError(Exception):
    """Base exception for token errors"""
    pass


class TokenExpiredError(TokenError):
    """Token has expired"""
    pass


class TokenInvalidError(TokenError):
    """Token is invalid"""
    pass


def create_access_token(user_id: int, email: str) -> str:
    """
    Create JWT access token.

    Args:
        user_id: User ID to include in token
        email: User email to include in token

    Returns:
        JWT token string
    """
    now = datetime.now(timezone.utc)
    payload = {
        "sub": str(user_id),  # Convert to string - JWT spec requires sub to be string
        "email": email,
        "iat": now,
        "exp": now + timedelta(hours=settings.JWT_EXPIRATION_HOURS)
    }

    token = jwt.encode(
        payload,
        settings.JWT_SECRET,
        algorithm=settings.JWT_ALGORITHM
    )

    logger.info(f"Access token created for user: {user_id}")
    return token


def decode_access_token(token: str) -> Optional[Dict]:
    """
    Decode and validate JWT access token.

    Args:
        token: JWT token string

    Returns:
        Decoded payload dict or None if invalid
    """
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET,
            algorithms=[settings.JWT_ALGORITHM]
        )
        return payload
    except jwt.ExpiredSignatureError:
        logger.warning("Token has expired")
        return None
    except jwt.InvalidTokenError as e:
        logger.warning(f"Invalid token: {str(e)}")
        return None
    except Exception as e:
        logger.error(f"Token decode error: {str(e)}")
        return None


def verify_token(token: str) -> Tuple[bool, Optional[Dict], str]:
    """
    Verify JWT token and return status, payload, and message.

    Args:
        token: JWT token string

    Returns:
        Tuple of (is_valid: bool, payload: dict or None, message: str)
    """
    if not token:
        return False, None, "Token is required"

    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET,
            algorithms=[settings.JWT_ALGORITHM]
        )
        logger.info(f"Token verified for user: {payload.get('sub')}")
        return True, payload, "Token is valid"

    except jwt.ExpiredSignatureError:
        logger.warning("Token verification failed: Token expired")
        return False, None, "Token has expired"

    except jwt.InvalidSignatureError:
        logger.warning("Token verification failed: Invalid signature - JWT_SECRET mismatch")
        return False, None, "Invalid token signature"

    except jwt.DecodeError as e:
        logger.warning(f"Token verification failed: Decode error - {str(e)}")
        return False, None, "Invalid token format"

    except jwt.InvalidTokenError as e:
        logger.warning(f"Token verification failed: InvalidTokenError - {str(e)}")
        return False, None, f"Invalid token: {str(e)}"

    except Exception as e:
        logger.error(f"Token verification error: {str(e)}", exc_info=True)
        return False, None, f"Token verification failed: {str(e)}"


def get_token_expiration_info(token: str) -> Dict:
    """
    Get token expiration information without validation.

    Args:
        token: JWT token string

    Returns:
        Dict with expiration info or error message
    """
    try:
        # Decode without verification to read exp claim
        payload = jwt.decode(
            token,
            options={"verify_signature": False}
        )

        exp_timestamp = payload.get("exp")
        if not exp_timestamp:
            return {"error": "No expiration in token"}

        exp_datetime = datetime.fromtimestamp(exp_timestamp, tz=timezone.utc)
        now = datetime.now(timezone.utc)
        is_expired = now > exp_datetime
        time_remaining = (exp_datetime - now).total_seconds()

        return {
            "is_expired": is_expired,
            "expires_at": exp_datetime.isoformat(),
            "current_time": now.isoformat(),
            "time_remaining_seconds": max(0, int(time_remaining)),
            "time_remaining_hours": max(0, time_remaining / 3600)
        }

    except Exception as e:
        logger.error(f"Error getting token expiration info: {str(e)}")
        return {"error": str(e)}
