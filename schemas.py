"""Type definitions for AI Generation Layer"""

from typing import List, Optional, Dict, Any
from enum import Enum
from pydantic import BaseModel, Field


class DifficultyLevel(str, Enum):
    """Learning difficulty levels"""
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"


class BloomLevel(str, Enum):
    """Bloom's taxonomy levels"""
    REMEMBER = "remember"
    UNDERSTAND = "understand"
    APPLY = "apply"
    ANALYZE = "analyze"
    EVALUATE = "evaluate"
    CREATE = "create"


# ============================================================================
# STAGE 1: OUTLINE GENERATOR SCHEMAS
# ============================================================================

class Module(BaseModel):
    """Module within course outline"""
    id: str = Field(..., description="Unique module identifier")
    name: str = Field(..., description="Module name")
    sequence: int = Field(..., description="Module sequence order")
    description: str = Field(..., description="Module description")
    estimated_hours: int = Field(..., description="Estimated learning hours")
    lessons: List[str] = Field(default_factory=list, description="List of lesson IDs")


class OutlineSchema(BaseModel):
    """Verified outline structure from Stage 1"""
    title: str = Field(..., description="Course title")
    description: str = Field(..., description="Course description")
    difficulty: DifficultyLevel = Field(..., description="Course difficulty level")
    target_audience: str = Field(..., description="Target audience description")
    total_hours: int = Field(..., description="Total estimated hours")
    modules: List[Module] = Field(..., description="List of course modules")
    learning_objectives: List[str] = Field(..., description="High-level learning objectives")
    prerequisites: List[str] = Field(default_factory=list, description="Course prerequisites")


# ============================================================================
# STAGE 2: CONTENT ELABORATOR SCHEMAS
# ============================================================================

class Concept(BaseModel):
    """Key concept explanation"""
    name: str = Field(..., description="Concept name")
    explanation: str = Field(..., description="Detailed explanation")
    bloom_level: BloomLevel = Field(..., description="Bloom's taxonomy level")
    examples: List[str] = Field(..., description="Practical examples")


class LessonContent(BaseModel):
    """Content for a single lesson"""
    lesson_id: str = Field(..., description="Unique lesson identifier")
    title: str = Field(..., description="Lesson title")
    module_id: str = Field(..., description="Parent module ID")
    sequence: int = Field(..., description="Lesson sequence in module")
    learning_objectives: List[str] = Field(..., description="Lesson-level learning objectives")
    introduction: str = Field(..., description="Lesson introduction/context")
    main_concepts: List[Concept] = Field(..., description="Key concepts covered")
    real_world_applications: List[str] = Field(..., description="Real-world applications and use cases")
    common_misconceptions: List[Dict[str, str]] = Field(
        default_factory=list,
        description="Common misconceptions with corrections"
    )
    key_takeaways: List[str] = Field(..., description="Key takeaways from lesson")
    estimated_duration_minutes: int = Field(..., description="Estimated lesson duration")


class ElaboratedContent(BaseModel):
    """Complete elaborated content from Stage 2"""
    course_id: str = Field(..., description="Unique course identifier")
    outline: OutlineSchema = Field(..., description="Course outline from Stage 1")
    lessons: List[LessonContent] = Field(..., description="All lesson contents")
    total_lessons: int = Field(..., description="Total number of lessons")


# ============================================================================
# STAGE 3: ASSESSMENT WEAVER SCHEMAS
# ============================================================================

class QuizQuestion(BaseModel):
    """Single quiz question"""
    id: str = Field(..., description="Question ID")
    question_text: str = Field(..., description="Question text")
    question_type: str = Field(..., description="Question type: multiple_choice, short_answer, true_false")
    options: Optional[List[str]] = Field(default=None, description="Answer options for multiple choice")
    correct_answer: str = Field(..., description="Correct answer")
    explanation: str = Field(..., description="Explanation of correct answer")
    bloom_level: BloomLevel = Field(..., description="Bloom's level tested")
    difficulty: DifficultyLevel = Field(..., description="Question difficulty")


class LessonQuiz(BaseModel):
    """Quiz for a lesson"""
    lesson_id: str = Field(..., description="Associated lesson ID")
    quiz_questions: List[QuizQuestion] = Field(..., description="Quiz questions")
    passing_score_percentage: int = Field(default=70, description="Passing score percentage")
    estimated_duration_minutes: int = Field(..., description="Estimated quiz duration")


class CapstoneProject(BaseModel):
    """Capstone project definition"""
    id: str = Field(..., description="Capstone project ID")
    title: str = Field(..., description="Project title")
    description: str = Field(..., description="Detailed project description")
    learning_objectives: List[str] = Field(..., description="Skills demonstrated")
    requirements: List[str] = Field(..., description="Project requirements")
    submission_format: str = Field(..., description="How to submit project")
    evaluation_criteria: List[Dict[str, str]] = Field(..., description="Evaluation criteria with descriptions")
    estimated_hours: int = Field(..., description="Estimated project duration")
    bloom_levels: List[BloomLevel] = Field(..., description="Bloom's levels addressed by project")


class AssessmentSuite(BaseModel):
    """Complete assessment suite from Stage 3"""
    course_id: str = Field(..., description="Associated course ID")
    outline: OutlineSchema = Field(..., description="Course outline")
    elaborated_content: ElaboratedContent = Field(..., description="Elaborated content from Stage 2")
    lesson_quizzes: List[LessonQuiz] = Field(..., description="Quiz for each lesson")
    capstone_projects: List[CapstoneProject] = Field(..., description="Capstone projects")
    unit_assessments: List[Dict[str, Any]] = Field(
        default_factory=list,
        description="End-of-unit assessments"
    )


# ============================================================================
# GENERATION REQUEST & RESPONSE
# ============================================================================

class GenerationRequest(BaseModel):
    """Request for content generation"""
    topic: str = Field(..., description="Learning topic")
    difficulty: DifficultyLevel = Field(..., description="Difficulty level")
    target_audience: str = Field(..., description="Target audience description")
    duration_weeks: int = Field(..., description="Course duration in weeks")
    tags: List[str] = Field(default_factory=list, description="Topic tags/keywords")
    context: Optional[str] = Field(default=None, description="Additional context")


class GenerationResult(BaseModel):
    """Result of complete 3-stage generation"""
    request: GenerationRequest = Field(..., description="Original request")
    stage_1_outline: OutlineSchema = Field(..., description="Stage 1 verified outline")
    stage_2_content: ElaboratedContent = Field(..., description="Stage 2 elaborated content")
    stage_3_assessments: AssessmentSuite = Field(..., description="Stage 3 assessment suite")
    generation_timestamp: str = Field(..., description="ISO timestamp of generation")
    total_duration_seconds: float = Field(..., description="Total generation time")
