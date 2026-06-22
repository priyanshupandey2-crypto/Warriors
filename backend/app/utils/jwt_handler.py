from datetime import datetime, timedelta, timezone
from typing import Dict, Optional
import jwt
from app.config import settings
from app.logger import get_logger

logger = get_logger(__name__)


def create_access_token(user_id: int, email: str) -> str:
    """
    Create JWT access token.

    Args:
        user_id: User ID to include in token
        email: User email to include in token

    Returns:
        JWT token string
    """
    payload = {
        "sub": user_id,
        "email": email,
        "iat": datetime.now(timezone.utc),
        "exp": datetime.now(timezone.utc) + timedelta(hours=settings.JWT_EXPIRATION_HOURS)
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
