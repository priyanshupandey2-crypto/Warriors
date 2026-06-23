"""
Curriculum Database Models
===========================

Tables:
    - curriculum_sources: Raw extracted content from URLs
    - curriculum_chunks: Semantically chunked content with concepts
    - curriculum_registry: Cached curriculum templates (topic, difficulty, duration)
    - curriculum_learning_paths: Generated learning sequences

Relationships:
    - curriculum_sources (1) -> (many) curriculum_chunks
    - curriculum_registry (1) -> (many) curriculum_learning_paths
"""

from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Text, DateTime, ForeignKey, JSON, Index, UniqueConstraint
)
from sqlalchemy.orm import relationship
from app.database import Base


class CurriculumSource(Base):
    """
    Raw extracted content from a single URL.

    Stores:
        - Original URL and source type
        - Extracted markdown content
        - Extracted headings and metadata
        - Fetch timestamp for cache invalidation

    Used by: CurriculumChunk (extracted chunks come from these sources)
    """

    __tablename__ = "curriculum_sources"

    id = Column(Integer, primary_key=True, index=True)

    url = Column(String(2048), nullable=False, unique=True, index=True)
    source_type = Column(String(100), nullable=False)
    title = Column(String(500), nullable=False)
    description = Column(Text, nullable=True)

    raw_markdown = Column(Text, nullable=False)
    headings = Column(JSON, default=list, nullable=False)

    source_metadata = Column(JSON, default=dict, nullable=False)

    fetched_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    chunks = relationship(
        "CurriculumChunk",
        back_populates="source",
        cascade="all, delete-orphan",
        lazy="dynamic"
    )

    __table_args__ = (
        Index("idx_source_type", "source_type"),
        Index("idx_fetched_at", "fetched_at"),
    )

    def __repr__(self):
        return f"<CurriculumSource(url='{self.url}', type='{self.source_type}')>"


class CurriculumChunk(Base):
    """
    Semantic chunk of extracted content.

    Stores:
        - Content chunk (respects token limits)
        - Hierarchical heading path
        - Extracted concepts and keywords
        - Metadata for search/filtering

    Used by: CurriculumRegistry (chunks are combined into curricula)
    """

    __tablename__ = "curriculum_chunks"

    id = Column(Integer, primary_key=True, index=True)

    source_id = Column(Integer, ForeignKey("curriculum_sources.id"), nullable=False, index=True)
    chunk_index = Column(Integer, nullable=False)

    heading_path = Column(String(1000), nullable=True, index=True)
    content = Column(Text, nullable=False)

    token_count = Column(Integer, default=0)
    concepts = Column(JSON, default=list, nullable=False)

    chunk_metadata = Column(JSON, default=dict, nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    source = relationship("CurriculumSource", back_populates="chunks")

    __table_args__ = (
        UniqueConstraint("source_id", "chunk_index", name="uq_source_chunk_index"),
        Index("idx_heading_path", "heading_path"),
        Index("idx_token_count", "token_count"),
    )

    def __repr__(self):
        return f"<CurriculumChunk(source={self.source_id}, index={self.chunk_index})>"


class CurriculumRegistry(Base):
    """
    Cached curriculum template (topic, difficulty, duration).

    Stores:
        - Topic, difficulty, duration combination
        - Extracted curriculum structure and topics
        - List of selected chunks for this curriculum
        - Generation timestamp for cache validation

    Query: Check if curriculum exists before extraction
    Cache: Avoid re-extracting same topic/difficulty/duration
    """

    __tablename__ = "curriculum_registry"

    id = Column(Integer, primary_key=True, index=True)

    topic = Column(String(500), nullable=False, index=True)
    difficulty = Column(String(50), nullable=False)
    duration = Column(String(100), nullable=False)

    extracted_topics = Column(JSON, default=list, nullable=False)
    extracted_subtopics = Column(JSON, default=dict, nullable=False)
    learning_order = Column(JSON, default=list, nullable=False)

    chunk_ids = Column(JSON, default=list, nullable=False)

    sources_count = Column(Integer, default=0)
    chunks_count = Column(Integer, default=0)
    total_tokens = Column(Integer, default=0)

    registry_metadata = Column(JSON, default=dict, nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    expires_at = Column(DateTime, nullable=True, index=True)

    learning_paths = relationship(
        "CurriculumLearningPath",
        back_populates="curriculum",
        cascade="all, delete-orphan",
        lazy="dynamic"
    )

    __table_args__ = (
        UniqueConstraint("topic", "difficulty", "duration", name="uq_curriculum_key"),
        Index("idx_registry_topic", "topic"),
        Index("idx_registry_difficulty", "difficulty"),
        Index("idx_registry_expires_at", "expires_at"),
    )

    def __repr__(self):
        return f"<CurriculumRegistry(topic='{self.topic}', difficulty='{self.difficulty}')>"


class CurriculumLearningPath(Base):
    """
    Generated learning sequence for a curriculum.

    Stores:
        - Ordered lesson sequence
        - Recommended learning order (topics → subtopics)
        - Estimated time per lesson
        - Learning objectives for each step

    Used by: Course generation to create lesson modules
    """

    __tablename__ = "curriculum_learning_paths"

    id = Column(Integer, primary_key=True, index=True)

    curriculum_id = Column(Integer, ForeignKey("curriculum_registry.id"), nullable=False, index=True)

    path_index = Column(Integer, nullable=False)
    title = Column(String(500), nullable=False)
    description = Column(Text, nullable=True)

    topic = Column(String(300), nullable=False)
    subtopic = Column(String(300), nullable=True)

    chunk_ids = Column(JSON, default=list, nullable=False)
    estimated_minutes = Column(Integer, nullable=True)

    learning_objectives = Column(JSON, default=list, nullable=False)
    prerequisites = Column(JSON, default=list, nullable=False)

    path_metadata = Column(JSON, default=dict, nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    curriculum = relationship("CurriculumRegistry", back_populates="learning_paths")

    __table_args__ = (
        UniqueConstraint("curriculum_id", "path_index", name="uq_curriculum_path_index"),
        Index("idx_topic", "topic"),
    )

    def __repr__(self):
        return f"<CurriculumLearningPath(curriculum={self.curriculum_id}, index={self.path_index})>"
