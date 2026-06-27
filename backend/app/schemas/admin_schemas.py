"""
ADMIN DASHBOARD - Pydantic Schemas
===================================

All request/response models for admin dashboard endpoints.
Separate from user-facing schemas to avoid conflicts.
"""

from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


# ==================== COURSE ADMIN SCHEMAS ====================

class CourseAdminResponse(BaseModel):
    """Response schema for admin dashboard course listing"""
    id: int
    title: str
    category: Optional[str] = None
    lead_instructor: Optional[str] = None
    description: Optional[str] = None
    difficulty: str
    duration_hours: Optional[int] = None
    thumbnail_url: Optional[str] = None
    enrollments: int  # Calculated from user_courses
    completion_rate: float  # Calculated from avg progress
    avg_rating: float
    status: str
    created_at: datetime

    class Config:
        from_attributes = True  # Allow ORM model to dict conversion


class CoursePaginatedAdminResponse(BaseModel):
    """Paginated response for course listing"""
    items: List[CourseAdminResponse]
    total: int
    skip: int
    limit: int


class CourseStatsResponse(BaseModel):
    """Dashboard statistics for all courses"""
    total_courses: int  # Total number of courses
    avg_completion: float  # Average completion rate across all courses
    total_enrollments: int  # Total enrollments across all courses
    avg_rating: float  # Average rating of all courses
    trend_month: int  # New courses this month (e.g., +4)
    trend_improvement: float  # Completion improvement this month (e.g., +2.1)


class CourseCreateAdminRequest(BaseModel):
    """Request body for creating a new course"""
    title: str
    description: Optional[str] = None
    category: Optional[str] = None
    lead_instructor: Optional[str] = None
    difficulty: str
    duration_hours: Optional[int] = None
    thumbnail_url: Optional[str] = None


class CourseUpdateAdminRequest(BaseModel):
    """Request body for updating a course (all fields optional)"""
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    lead_instructor: Optional[str] = None
    difficulty: Optional[str] = None
    duration_hours: Optional[int] = None
    thumbnail_url: Optional[str] = None
    avg_rating: Optional[float] = None


class CourseDeleteResponse(BaseModel):
    """Response when course is deleted"""
    status: str
    message: str
    course_id: int


# ==================== SUBMISSION ADMIN SCHEMAS ====================

class CourseSubmissionResponse(BaseModel):
    """Response schema for submission listing"""
    id: int
    user_id: int
    user_name: Optional[str] = None  # Name from User table
    user_role: Optional[str] = None  # Role from User table
    title: str
    submission_date: datetime
    type: str  # "AI-Generated" or "User-Tailored"
    status: str  # "pending", "approved", "rejected"
    feedback: Optional[str] = None

    class Config:
        from_attributes = True


class CourseSubmissionDetailResponse(CourseSubmissionResponse):
    """Detailed response with full content"""
    description: Optional[str] = None
    content: Optional[str] = None
    reviewed_by: Optional[int] = None
    reviewed_at: Optional[datetime] = None


class CourseSubmissionPaginatedResponse(BaseModel):
    """Paginated response for submissions"""
    items: List[CourseSubmissionResponse]
    total: int
    pending_count: int  # Count of pending submissions
    skip: int
    limit: int


class CourseSubmissionApproveRequest(BaseModel):
    """Request to approve a submission"""
    feedback: Optional[str] = None


class CourseSubmissionRejectRequest(BaseModel):
    """Request to reject a submission"""
    feedback: str  # Rejection reason (required)


class CourseSubmissionCreateRequest(BaseModel):
    """Request to create a new submission"""
    title: str
    description: Optional[str] = None
    content: Optional[str] = None
    type: str  # "AI-Generated" or "User-Tailored"


class SubmissionApproveResponse(BaseModel):
    """Response when submission is approved"""
    status: str
    message: str
    submission_id: int
    course_id: Optional[int] = None  # ID of newly created course


class SubmissionRejectResponse(BaseModel):
    """Response when submission is rejected"""
    status: str
    message: str
    submission_id: int


class SubmissionStatsResponse(BaseModel):
    """Statistics for submissions"""
    pending_count: int
    approved_count: int
    rejected_count: int
    today_new: int
