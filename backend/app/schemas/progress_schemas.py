"""
Schemas for course and lesson progress tracking
"""

from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class LessonProgressCreate(BaseModel):
    lesson_id: int
    is_completed: bool = False
    time_spent_minutes: int = 0


class LessonProgressUpdate(BaseModel):
    is_completed: Optional[bool] = None
    time_spent_minutes: Optional[int] = None


class LessonProgress(BaseModel):
    id: int
    user_id: int
    lesson_id: int
    course_id: int
    is_completed: bool
    completed_at: Optional[datetime]
    last_accessed_at: datetime
    time_spent_minutes: int

    class Config:
        from_attributes = True


class CourseEnrollRequest(BaseModel):
    course_id: int


class CourseEnrollResponse(BaseModel):
    id: int
    user_id: int
    course_id: int
    status: str
    progress_percentage: int
    completed_lessons: int
    total_lessons: int
    enrolled_at: datetime
    last_accessed_at: Optional[datetime]
    completed_at: Optional[datetime]

    class Config:
        from_attributes = True


class UserCourseProgress(BaseModel):
    id: int
    course_id: int
    course_title: str
    status: str
    progress_percentage: int
    completed_lessons: int
    total_lessons: int
    enrolled_at: datetime
    last_accessed_at: Optional[datetime]
    completed_at: Optional[datetime]


class UserEnrolledCourses(BaseModel):
    enrolled_count: int
    in_progress_count: int
    completed_count: int
    courses: List[UserCourseProgress]


class CourseProgressResponse(BaseModel):
    course_id: int
    course_title: str
    status: str
    progress_percentage: int
    completed_lessons: int
    total_lessons: int
    lesson_progress: List[LessonProgress]


class LessonCompletionRequest(BaseModel):
    lesson_id: int
    time_spent_minutes: int = 0
