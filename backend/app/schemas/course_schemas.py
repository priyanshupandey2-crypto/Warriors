from pydantic import BaseModel
from typing import List, Optional


class ModulePreview(BaseModel):
    id: str
    title: str
    description: str
    duration_hours: float
    lessons_count: int
    order: int


class LessonSummary(BaseModel):
    id: str
    title: str
    duration_minutes: int
    order: int


class CoursePreview(BaseModel):
    id: str
    title: str
    description: str
    difficulty_level: str
    total_duration_hours: float
    learning_objectives: List[str]
    overview: str
    modules: List[ModulePreview]
    lesson_sequence: List[LessonSummary]
    learning_roadmap: str


class CourseGenerateRequest(BaseModel):
    topic: str
    difficulty_level: str
    target_audience: str
    duration_weeks: int
    tags: List[str]


class FeaturedCourse(BaseModel):
    id: str
    title: str
    description: str
    difficulty_level: str
    duration_weeks: int
    modules_count: int
    tags: List[str]
    thumbnail_url: Optional[str] = None
    rating: Optional[float] = None
    enrollments: int = 0
    category: Optional[str] = None
