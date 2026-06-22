from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthCredentials
from app.utils.jwt_handler import verify_token
from app.logger import get_logger

logger = get_logger(__name__)

security = HTTPBearer()


async def get_current_user(credentials: HTTPAuthCredentials = Depends(security)) -> dict:
    """
    Dependency for protected routes.
    Verifies JWT token from Authorization header and returns user info.

    Usage in route:
        @router.get("/protected")
        async def protected_endpoint(current_user: dict = Depends(get_current_user)):
            return {"user_id": current_user["sub"], "email": current_user["email"]}
    """
    token = credentials.credentials

    is_valid, payload, message = verify_token(token)

    if not is_valid:
        logger.warning(f"Unauthorized access attempt: {message}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=message,
            headers={"WWW-Authenticate": "Bearer"}
        )

    return payload


async def get_current_user_optional(credentials: HTTPAuthCredentials | None = Depends(security)) -> dict | None:
    """
    Optional dependency for routes that work with or without authentication.
    Returns user info if token is valid, None if not provided or invalid.

    Usage in route:
        @router.get("/semi-protected")
        async def semi_protected(current_user: dict | None = Depends(get_current_user_optional)):
            if current_user:
                return {"authenticated": True, "user_id": current_user["sub"]}
            return {"authenticated": False}
    """
    if not credentials:
        return None

    token = credentials.credentials

    is_valid, payload, message = verify_token(token)

    if not is_valid:
        return None

    return payload
