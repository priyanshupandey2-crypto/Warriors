"""Type definitions for AI Research Engine"""

from typing import List, Optional, Dict, Any
from enum import Enum
from pydantic import BaseModel
from datetime import datetime


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


class SourceType(str, Enum):
    """Research source types"""
    ACADEMIC = "academic"
    INDUSTRY = "industry"
    EDUCATIONAL = "educational"
    PRACTICAL = "practical"


class ProgressStatus(str, Enum):
    """Research progress status"""
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"


class ResearchRequest(BaseModel):
    """Research request"""
    topic: str
    difficulty: DifficultyLevel
    targetAudience: str
    duration: int  # in weeks
    tags: List[str]
    context: Optional[str] = None


class LearningObjective(BaseModel):
    """Learning objective using Bloom's taxonomy"""
    id: str
    objective: str
    level: BloomLevel
    description: str


class ConceptNode(BaseModel):
    """Domain concept with relationships"""
    id: str
    name: str
    description: str
    difficulty: DifficultyLevel
    prerequisites: List[str] = []  # IDs of prerequisite concepts
    applications: List[str] = []
    industry_relevance: float  # 0-1 score


class WeeklyBlock(BaseModel):
    """Weekly learning block"""
    week: int
    focus: str
    learning_concepts: List[str]
    estimated_hours: int


class SkillDevelopment(BaseModel):
    """Skill progression"""
    skill: str
    progression: str  # foundational, developing, intermediate, advanced
    weeks_to_develop: int
    applications: List[str]


class LearningProgression(BaseModel):
    """Complete learning roadmap"""
    total_weeks: int
    weekly_breakdown: List[WeeklyBlock]
    skill_development_path: List[SkillDevelopment]


class CurriculumBlock(BaseModel):
    """Structured curriculum block"""
    id: str
    sequence: int
    title: str
    duration: int  # in days
    concepts: List[str]
    key_topics: List[str]


class TopicOverview(BaseModel):
    """Topic analysis and overview"""
    topic: str
    summary: str
    industry_context: str
    relevance_score: float  # 0-1
    key_areas: List[str]
    learning_duration_weeks: int


class ResearchSource(BaseModel):
    """Research source reference"""
    title: str
    type: SourceType
    relevance: float  # 0-1
    url: Optional[str] = None
    description: str


class ReasoningStep(BaseModel):
    """Step in reasoning trace"""
    step: int
    action: str
    input: Dict[str, Any]
    output: Dict[str, Any]
    reasoning: str
    timestamp: str  # ISO format


class ConfidenceMetrics(BaseModel):
    """Confidence scores for research output"""
    curriculum_confidence: float
    objective_confidence: float
    industry_relevance_confidence: float
    progression_confidence: float


class ResearchOutput(BaseModel):
    """Complete research output"""
    id: str
    timestamp: str
    request: ResearchRequest
    topic_overview: TopicOverview
    learning_objectives: List[LearningObjective]
    curriculum_structure: List[CurriculumBlock]
    industry_relevant_concepts: List[ConceptNode]
    learning_progression: LearningProgression
    research_sources: List[ResearchSource]
    reasoning_trace: List[ReasoningStep]
    confidence_scores: ConfidenceMetrics
    langsmith_trace_id: Optional[str] = None


class ResearchProgress(BaseModel):
    """Progress tracking"""
    status: ProgressStatus
    current_step: str
    progress: float  # 0-1
    elapsed_time: int  # ms
    estimated_time_remaining: int  # ms
    errors: List[str] = []


class TimelineEntry(BaseModel):
    """Timeline entry for visualization"""
    step: int
    action: str
    timestamp: str
    duration: int  # ms


class DependencyNode(BaseModel):
    """Dependency graph node"""
    id: int
    action: str
    depends_on: List[int]
    outputs: List[str]


class ReasoningVisualization(BaseModel):
    """Reasoning visualization data"""
    steps: int
    timeline: List[TimelineEntry]
    dependencies: List[DependencyNode]
