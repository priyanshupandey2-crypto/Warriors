"""
Curriculum and Knowledge Pack Schemas
======================================

Pydantic models for curriculum discovery, building, and chunk management.
Used for request/response validation and database serialization.
"""

from typing import List, Dict, Any, Optional
from datetime import datetime
from pydantic import BaseModel, Field


class CurriculumSourceSchema(BaseModel):
    """A single extracted content source."""
    url: str = Field(..., description="Source URL")
    source_type: str = Field(..., description="Type: W3Schools, MDN, etc.")
    title: str = Field(..., description="Page title")
    description: Optional[str] = Field(None, description="Page description")
    raw_markdown: str = Field(..., description="Extracted markdown content")
    headings: List[str] = Field(default_factory=list, description="Page heading hierarchy")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Additional metadata")
    fetched_at: datetime = Field(default_factory=datetime.utcnow, description="Extraction timestamp")

    class Config:
        from_attributes = True


class CurriculumChunkSchema(BaseModel):
    """A semantic chunk of content from a source."""
    source_url: str = Field(..., description="URL this chunk came from")
    chunk_index: int = Field(..., description="Position in source")
    heading_path: str = Field(..., description="Hierarchical heading path")
    content: str = Field(..., description="Chunk content")
    token_count: int = Field(..., description="Approximate token count")
    concepts: List[str] = Field(default_factory=list, description="Extracted concepts")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Chunk metadata")

    class Config:
        from_attributes = True


class KnowledgePackSchema(BaseModel):
    """Complete knowledge pack with sources and chunks."""
    topic: str = Field(..., description="Learning topic")
    difficulty: str = Field(..., description="Difficulty level")
    duration: str = Field(..., description="Estimated duration")
    extraction_metadata: Dict[str, Any] = Field(
        default_factory=dict,
        description="Extraction process metadata"
    )
    sources: List[CurriculumSourceSchema] = Field(
        default_factory=list,
        description="Extracted sources"
    )
    chunks: List[CurriculumChunkSchema] = Field(
        default_factory=list,
        description="Content chunks"
    )
    errors: List[Dict[str, str]] = Field(
        default_factory=list,
        description="Failed URLs with errors"
    )

    class Config:
        from_attributes = True


class CurriculumDiscoveryRequest(BaseModel):
    """Request to discover or build curriculum."""
    topic: str = Field(..., description="Learning topic", min_length=1)
    difficulty: str = Field(
        ...,
        description="Difficulty level",
        pattern="^(Beginner|Intermediate|Advanced)$"
    )
    duration: str = Field(
        ...,
        description="Estimated duration (e.g., '30 minutes', '2 hours', '1 week', '6 weeks')",
        min_length=1
    )
    tags: Optional[List[str]] = Field(default_factory=list, description="Optional tags")

    class Config:
        json_schema_extra = {
            "example": {
                "topic": "Python Async/Await",
                "difficulty": "Intermediate",
                "duration": "2 hours",
                "tags": ["python", "concurrency", "async"]
            },
            "examples": [
                {
                    "topic": "Python Async/Await",
                    "difficulty": "Intermediate",
                    "duration": "2 hours",
                    "tags": ["python", "concurrency"]
                },
                {
                    "topic": "HTML",
                    "difficulty": "Beginner",
                    "duration": "6 weeks",
                    "tags": ["web", "markup"]
                },
                {
                    "topic": "React Advanced",
                    "difficulty": "Advanced",
                    "duration": "1 month",
                    "tags": ["react", "advanced"]
                }
            ]
        }


class CurriculumTemplateSchema(BaseModel):
    """Curriculum template with extracted structure."""
    topic: str = Field(..., description="Learning topic")
    difficulty: str = Field(..., description="Difficulty level")
    extracted_topics: List[str] = Field(default_factory=list, description="Cleaned and normalized topics")
    extracted_subtopics: Dict[str, List[str]] = Field(default_factory=dict, description="Topic hierarchy")
    curriculum_structure: Dict[str, List[str]] = Field(
        default_factory=dict,
        description="Topics organized by importance: core, advanced, supporting"
    )
    concept_summary: List[str] = Field(default_factory=list, description="Top extracted concepts")
    source_breakdown: List[Dict[str, Any]] = Field(default_factory=list, description="Source statistics")
    knowledge_pack_summary: Dict[str, Any] = Field(default_factory=dict, description="Overall summary")
    quality_metrics: Dict[str, Any] = Field(
        default_factory=dict,
        description="Extraction quality metrics (noise removed, concepts found)"
    )

    class Config:
        from_attributes = True


class CurriculumResponse(BaseModel):
    """API response for curriculum discovery/building."""
    success: bool = Field(..., description="Operation success")
    curriculum_id: Optional[str] = Field(None, description="Curriculum database ID")
    topic: str = Field(..., description="Learning topic")
    difficulty: str = Field(..., description="Difficulty level")
    duration: str = Field(..., description="Estimated duration")
    sources_count: int = Field(..., description="Number of sources extracted")
    chunks_count: int = Field(..., description="Number of chunks created")
    message: str = Field(..., description="Operation message")
    data: Optional[CurriculumTemplateSchema] = Field(None, description="Curriculum template")

    class Config:
        json_schema_extra = {
            "example": {
                "success": True,
                "curriculum_id": "curr_123abc",
                "topic": "Python Async/Await",
                "difficulty": "Intermediate",
                "duration": "2 hours",
                "sources_count": 4,
                "chunks_count": 24,
                "message": "Curriculum built successfully",
                "data": {
                    "topic": "Python Async/Await",
                    "difficulty": "Intermediate",
                    "duration": "2 hours",
                    "sources": [],
                    "chunks": [],
                    "errors": []
                }
            }
        }


class URLValidationRequest(BaseModel):
    """Request to validate URLs before extraction."""
    urls: List[str] = Field(..., description="URLs to validate", min_items=1)

    class Config:
        json_schema_extra = {
            "example": {
                "urls": [
                    "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise",
                    "https://www.w3schools.com/whatis/whatis_asyncawait.asp"
                ]
            }
        }


class URLValidationResponse(BaseModel):
    """Response for URL validation."""
    total: int = Field(..., description="Total URLs submitted")
    valid: int = Field(..., description="Number of valid URLs")
    invalid: int = Field(..., description="Number of invalid URLs")
    results: List[Dict[str, Any]] = Field(..., description="Per-URL validation results")

    class Config:
        json_schema_extra = {
            "example": {
                "total": 2,
                "valid": 2,
                "invalid": 0,
                "results": [
                    {
                        "url": "https://developer.mozilla.org/...",
                        "valid": True,
                        "source_type": "MDN",
                        "status_code": 200
                    }
                ]
            }
        }
