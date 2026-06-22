from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database import get_db
from app.utils.dependencies import get_admin_user
from app.logger import get_logger

logger = get_logger(__name__)
router = APIRouter(prefix="/api/admin", tags=["admin"])


class AdminAction(BaseModel):
    action: str
    message: str


@router.get("/dashboard")
def admin_dashboard(admin: dict = Depends(get_admin_user)):
    """
    Admin-only dashboard endpoint.
    Only accessible by users with admin role.
    """
    logger.info(f"Admin dashboard accessed by: {admin.get('email')}")
    return {
        "message": "Welcome to admin dashboard",
        "admin_email": admin.get("email"),
        "user_id": admin.get("sub")
    }


@router.get("/users-count")
def get_users_count(admin: dict = Depends(get_admin_user), db: Session = Depends(get_db)):
    """
    Admin-only endpoint to get total users count.
    Only accessible by users with admin role.
    """
    from app.models.user import User

    try:
        total_users = db.query(User).count()

        logger.info(f"Admin {admin.get('email')} accessed users count")
        return {
            "total_users": total_users,
            "accessed_by": admin.get("email")
        }
    except Exception as e:
        logger.error(f"Error getting users count: {str(e)}")
        return {"error": "Failed to get users count"}


@router.post("/action")
def admin_action(action: AdminAction, admin: dict = Depends(get_admin_user)):
    """
    Admin-only endpoint to perform admin actions.
    Only accessible by users with admin role.
    """
    logger.info(f"Admin action '{action.action}' performed by: {admin.get('email')}")
    return {
        "status": "success",
        "action": action.action,
        "message": action.message,
        "performed_by": admin.get("email")
    }


@router.get("/info")
def admin_info(admin: dict = Depends(get_admin_user)):
    """
    Get admin user information.
    Only accessible by users with admin role.
    """
    return {
        "role": "admin",
        "email": admin.get("email"),
        "user_id": admin.get("sub")
    }


@router.get("/test")
def admin_test(admin: dict = Depends(get_admin_user)):
    """
    Test endpoint to verify admin protection is working.
    Only accessible by users with admin role.

    Returns full JWT payload to verify role and other claims.
    """
    logger.info(f"Admin test endpoint accessed by: {admin.get('email')}")
    return {
        "status": "success",
        "message": "Admin protection is working!",
        "jwt_claims": {
            "user_id": admin.get("sub"),
            "email": admin.get("email"),
            "role": admin.get("role"),
            "issued_at": admin.get("iat"),
            "expires_at": admin.get("exp")
        }
    }
