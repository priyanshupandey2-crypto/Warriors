from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import IntegrityError
from app.database import get_db
from app.models.user import User
from app.schemas.user_schemas import SignupRequest, SignupResponse
from app.utils.password import hash_password
from app.utils.validators import validate_signup_input
from app.utils.jwt_handler import create_access_token
from app.logger import get_logger
from sqlalchemy import select

logger = get_logger(__name__)
router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/signup", response_model=SignupResponse, status_code=status.HTTP_201_CREATED)
async def signup(request: SignupRequest, db: AsyncSession = Depends(get_db)) -> SignupResponse:
    """
    User signup endpoint.
    Creates a new user account with email and password.
    Validates input and checks for duplicate emails.
    """
    try:
        # Validate input
        validated = validate_signup_input(request.name, request.email, request.password)
        logger.info(f"Signup attempt for email: {validated['email']}")

        # Check if user already exists
        stmt = select(User).where(User.email == validated['email'])
        result = await db.execute(stmt)
        existing_user = result.scalar_one_or_none()

        if existing_user:
            logger.warning(f"Signup failed: Email already registered - {validated['email']}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )

        # Hash password
        password_hash = hash_password(validated['password'])

        # Create new user
        new_user = User(
            name=validated['name'],
            email=validated['email'],
            password_hash=password_hash,
            role="learner",
            courses_enrolled=[]
        )

        db.add(new_user)
        await db.commit()
        await db.refresh(new_user)

        # Generate access token for immediate login with role from database
        # Role is always "learner" for new signups, never from user input
        access_token = create_access_token(new_user.id, new_user.email, new_user.role)

        logger.info(f"User created successfully - ID: {new_user.id}, Email: {new_user.email}")

        return SignupResponse(
            access_token=f"Bearer {access_token}",
            id=new_user.id,
            name=new_user.name,
            email=new_user.email,
            role=new_user.role,
            message="User created successfully"
        )

    except HTTPException:
        raise
    except IntegrityError as e:
        await db.rollback()
        logger.error(f"Database integrity error during signup: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    except Exception as e:
        await db.rollback()
        logger.error(f"Signup failed with exception: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Signup failed. Please try again later."
        )
