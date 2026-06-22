from fastapi import APIRouter, HTTPException, status
from app.schemas.auth_schemas import UserProfile

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.get("/me", response_model=UserProfile)
async def get_current_user(user_id: str = "user-123") -> UserProfile:
    """Get current user profile (mock endpoint)."""
    return UserProfile(
        id=user_id,
        email="alice@example.com",
        full_name="Alice Johnson",
        avatar_url="https://via.placeholder.com/150",
        created_at="2026-06-01T10:00:00Z"
    )
