from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.user import User
from app.schemas.user_schemas import LoginRequest, LoginResponse, UserResponse
from app.utils.password import verify_password
from app.utils.jwt_handler import create_access_token
from app.utils.validators import validate_email
from app.logger import get_logger

logger = get_logger(__name__)
router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/login", response_model=LoginResponse, status_code=status.HTTP_200_OK)
async def login(request: LoginRequest, db: AsyncSession = Depends(get_db)) -> LoginResponse:
    """
    User login endpoint.
    Validates credentials and returns JWT access token.
    """
    try:
        # Validate email format
        validated_email = validate_email(request.email)
        logger.info(f"Login attempt for email: {validated_email}")

        # Find user by email
        stmt = select(User).where(User.email == validated_email)
        result = await db.execute(stmt)
        user = result.scalar_one_or_none()

        if not user:
            logger.warning(f"Login failed: User not found - {validated_email}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )

        # Verify password
        if not verify_password(request.password, user.password_hash):
            logger.warning(f"Login failed: Invalid password - {validated_email}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )

        # Create access token with user role from database
        # Role comes from database, never from user input
        access_token = create_access_token(user.id, user.email, user.role)

        # Build user response
        user_response = UserResponse(
            id=user.id,
            name=user.name,
            email=user.email,
            role=user.role,
            courses_enrolled=user.courses_enrolled or []
        )

        logger.info(f"User logged in successfully - ID: {user.id}, Email: {user.email}")

        return LoginResponse(
            access_token=f"Bearer {access_token}",
            user=user_response,
            message="Login successful"
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login failed with exception: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Login failed. Please try again later."
        )
