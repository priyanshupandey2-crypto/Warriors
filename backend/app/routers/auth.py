from fastapi import APIRouter, HTTPException, status
from backend.app.schemas.auth_schemas import LoginRequest, SignupRequest, TokenResponse, UserProfile

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/signup", response_model=TokenResponse)
async def signup(request: SignupRequest) -> TokenResponse:
    """User signup endpoint. Returns mock token."""
    if not request.email or not request.password or not request.full_name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email, password, and full name are required"
        )

    mock_user_id = f"user-{hash(request.email) % 10000}"

    return TokenResponse(
        access_token="mock-jwt-token-" + mock_user_id,
        token_type="bearer",
        user_id=mock_user_id
    )


@router.post("/login", response_model=TokenResponse)
async def login(request: LoginRequest) -> TokenResponse:
    """User login endpoint. Returns mock token."""
    if not request.email or not request.password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email and password are required"
        )

    mock_user_id = f"user-{hash(request.email) % 10000}"

    return TokenResponse(
        access_token="mock-jwt-token-" + mock_user_id,
        token_type="bearer",
        user_id=mock_user_id
    )


@router.get("/me", response_model=UserProfile)
async def get_current_user(user_id: str = "user-123") -> UserProfile:
    """Get current user profile."""
    return UserProfile(
        id=user_id,
        email="alice@example.com",
        full_name="Alice Johnson",
        avatar_url="https://via.placeholder.com/150",
        created_at="2026-06-01T10:00:00Z"
    )
