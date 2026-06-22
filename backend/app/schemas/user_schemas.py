from pydantic import BaseModel, Field
from typing import List, Optional


class UserBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    email: str = Field(..., max_length=100)
    role: str = Field(default="learner", max_length=50)


class UserCreate(UserBase):
    password: str = Field(..., min_length=6)


class UserUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    email: Optional[str] = Field(None, max_length=100)
    role: Optional[str] = Field(None, max_length=50)


class UserResponse(UserBase):
    id: int
    courses_enrolled: List[int] = []

    class Config:
        from_attributes = True


class SignupRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    email: str = Field(..., max_length=100)
    password: str = Field(..., min_length=6)


class SignupResponse(BaseModel):
    access_token: str  # JWT token in Bearer format for immediate login
    id: int
    name: str
    email: str
    role: str
    message: str = "User created successfully"

    class Config:
        from_attributes = True


class LoginRequest(BaseModel):
    email: str = Field(..., max_length=100)
    password: str = Field(..., min_length=6)


class LoginResponse(BaseModel):
    access_token: str  # Full "Bearer <token>" ready to use in Authorization header
    user: UserResponse
    message: str = "Login successful"
