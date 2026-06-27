from fastapi import APIRouter, Depends
from fastapi.security import HTTPBearer
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.utils.jwt_handler import verify_token
from app.logger import get_logger

logger = get_logger(__name__)
router = APIRouter(prefix="/api/auth", tags=["auth"])
security = HTTPBearer()


class TokenVerifySuccess(BaseModel):
    success: bool = True
    id: int
    name: str
    email: str
    role: str


class TokenVerifyFail(BaseModel):
    success: bool = False
    message: str


@router.post("/verify-token", response_model=TokenVerifySuccess | TokenVerifyFail)
def verify_token_endpoint(credentials = Depends(security), db: Session = Depends(get_db)):
    """
    Verify JWT token and return user data if valid.
    Token must be sent in Authorization header as: Authorization: Bearer <token>

    Returns:
        - success=true with user data if token is valid
        - success=false with error message if token is invalid or expired
    """
    access_token = credentials.credentials

    if not access_token:
        logger.warning("Token verification failed: access_token is required")
        return TokenVerifyFail(
            success=False,
            message="Access token is required"
        )

    # Verify token
    is_valid, payload, message = verify_token(access_token)

    if not is_valid:
        logger.warning(f"Token verification failed: {message}")
        return TokenVerifyFail(
            success=False,
            message=message
        )

    # Get user from database
    user_id = int(payload.get("sub"))  # Convert string back to int
    try:
        user = db.query(User).filter(User.id == user_id).first()

        if not user:
            logger.warning(f"Token verification failed: user not found - {user_id}")
            return TokenVerifyFail(
                success=False,
                message="User not found"
            )

        logger.info(f"Token verified successfully for user: {user_id}")
        return TokenVerifySuccess(
            success=True,
            id=user.id,
            name=user.name,
            email=user.email,
            role=user.role
        )

    except Exception as e:
        logger.error(f"Token verification error: {str(e)}")
        return TokenVerifyFail(
            success=False,
            message="Token verification failed"
        )
