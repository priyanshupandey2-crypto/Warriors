from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer
from app.utils.jwt_handler import verify_token
from app.logger import get_logger

logger = get_logger(__name__)

security = HTTPBearer()


async def get_current_user(credentials = Depends(security)) -> dict:
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


async def get_current_user_optional(credentials = Depends(security)) -> dict | None:
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


async def get_admin_user(credentials = Depends(security)) -> dict:
    """
    Dependency for admin-only protected routes.
    Verifies JWT token and checks if user has admin role (from JWT payload).
    Raises 403 Forbidden if user is not admin.

    Usage in route:
        @router.delete("/admin/users/{user_id}")
        async def delete_user(user_id: int, admin: dict = Depends(get_admin_user)):
            # Only admin users can access this route
            return {"message": "User deleted", "deleted_by": admin["email"]}
    """
    token = credentials.credentials

    # Verify token
    is_valid, payload, message = verify_token(token)

    if not is_valid:
        logger.warning(f"Unauthorized admin access attempt: {message}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=message,
            headers={"WWW-Authenticate": "Bearer"}
        )

    # Check if user has admin role (from JWT payload)
    role = payload.get("role", "")
    if role != "admin":
        logger.warning(f"Forbidden admin access attempt by user: {payload.get('sub')}, Role: {role}")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required. You do not have permission to access this resource."
        )

    logger.info(f"Admin access granted for user: {payload.get('sub')}")
    return payload
