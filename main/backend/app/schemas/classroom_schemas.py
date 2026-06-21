from pydantic import BaseModel
from typing import List, Optional, Dict, Any


class QuestionOption(BaseModel):
    id: str
    text: str
    is_correct: bool


class QuizQuestion(BaseModel):
    id: str
    question_text: str
    question_type: str
    options: List[QuestionOption]
    explanation: Optional[str] = None
    difficulty: str


class QuizStructure(BaseModel):
    id: str
    title: str
    description: str
    questions: List[QuizQuestion]
    passing_score: int
    total_points: int


class AssessmentTask(BaseModel):
    id: str
    task_description: str
    instructions: str
    deadline_days: int
    points: int


class AssessmentStructure(BaseModel):
    id: str
    title: str
    description: str
    tasks: List[AssessmentTask]
    total_points: int


class CapstoneSpecs(BaseModel):
    id: str
    title: str
    business_problem: str
    objectives: List[str]
    deliverables: List[str]
    evaluation_criteria: Dict[str, str]
    expected_outcomes: List[str]
    difficulty_level: str
    estimated_hours: int


class LessonContent(BaseModel):
    id: str
    title: str
    order: int
    content_markdown: str
    duration_minutes: int
    learning_objectives: List[str]
    key_concepts: List[str]


class BookmarkItem(BaseModel):
    id: str
    lesson_id: str
    lesson_title: str
    course_id: str
    course_title: str
    bookmarked_at: str
    notes: Optional[str] = None


class ClassroomWorkspace(BaseModel):
    course_id: str
    course_title: str
    lessons: List[LessonContent]
    quizzes: List[QuizStructure]
    assessments: List[AssessmentStructure]
    capstone: CapstoneSpecs
    progress: Dict[str, Any]
