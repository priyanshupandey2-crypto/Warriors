"""
Curriculum Repository Layer
============================

Data access layer for curriculum operations.
Handles all database queries for curriculum discovery, storage, and retrieval.

Architecture:
    Routes (routers/curriculum.py)
        ↓
    Service (services/firecrawl_service.py + curriculum_service.py)
        ↓
    Repository (repositories/curriculum_repository.py) ← YOU ARE HERE
        ↓
    Database (PostgreSQL - curriculum_*, models/curriculum.py)
"""

from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any
from sqlalchemy import and_, desc
from sqlalchemy.orm import Session

from app.models.curriculum import (
    CurriculumSource,
    CurriculumChunk,
    CurriculumRegistry,
    CurriculumLearningPath,
)


class CurriculumRepository:
    """Repository for all curriculum database operations."""

    def __init__(self, db: Session):
        self.db = db

    # ============================================================================
    # CURRICULUM SOURCE OPERATIONS
    # ============================================================================

    def save_source(
        self,
        url: str,
        source_type: str,
        title: str,
        description: Optional[str],
        raw_markdown: str,
        headings: List[str],
        metadata: Dict[str, Any]
    ) -> CurriculumSource:
        """Save extracted source to database."""
        source = CurriculumSource(
            url=url,
            source_type=source_type,
            title=title,
            description=description,
            raw_markdown=raw_markdown,
            headings=headings,
            metadata=metadata,
            fetched_at=datetime.utcnow()
        )
        self.db.add(source)
        self.db.commit()
        self.db.refresh(source)
        return source

    def get_source_by_url(self, url: str) -> Optional[CurriculumSource]:
        """Retrieve source by URL."""
        return self.db.query(CurriculumSource).filter(CurriculumSource.url == url).first()

    def get_sources_by_type(self, source_type: str) -> List[CurriculumSource]:
        """Retrieve all sources of a given type (W3Schools, MDN, etc.)."""
        return self.db.query(CurriculumSource).filter(
            CurriculumSource.source_type == source_type
        ).all()

    def get_recent_sources(self, limit: int = 50) -> List[CurriculumSource]:
        """Retrieve recently extracted sources."""
        return self.db.query(CurriculumSource).order_by(
            desc(CurriculumSource.fetched_at)
        ).limit(limit).all()

    def get_sources_needing_refresh(self, days: int = 30) -> List[CurriculumSource]:
        """Retrieve sources older than specified days (for cache invalidation)."""
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        return self.db.query(CurriculumSource).filter(
            CurriculumSource.fetched_at < cutoff_date
        ).all()

    def update_source(self, source_id: int, **kwargs) -> CurriculumSource:
        """Update source metadata."""
        source = self.db.query(CurriculumSource).filter(
            CurriculumSource.id == source_id
        ).first()
        if source:
            for key, value in kwargs.items():
                if hasattr(source, key):
                    setattr(source, key, value)
            source.updated_at = datetime.utcnow()
            self.db.commit()
            self.db.refresh(source)
        return source

    def delete_source(self, source_id: int) -> bool:
        """Delete source and cascade delete chunks."""
        source = self.db.query(CurriculumSource).filter(
            CurriculumSource.id == source_id
        ).first()
        if source:
            self.db.delete(source)
            self.db.commit()
            return True
        return False

    # ============================================================================
    # CURRICULUM CHUNK OPERATIONS
    # ============================================================================

    def save_chunk(
        self,
        source_id: int,
        chunk_index: int,
        heading_path: Optional[str],
        content: str,
        token_count: int,
        concepts: List[str],
        metadata: Dict[str, Any]
    ) -> CurriculumChunk:
        """Save content chunk to database."""
        chunk = CurriculumChunk(
            source_id=source_id,
            chunk_index=chunk_index,
            heading_path=heading_path,
            content=content,
            token_count=token_count,
            concepts=concepts,
            metadata=metadata
        )
        self.db.add(chunk)
        self.db.commit()
        self.db.refresh(chunk)
        return chunk

    def get_chunks_by_source(self, source_id: int) -> List[CurriculumChunk]:
        """Retrieve all chunks from a source."""
        return self.db.query(CurriculumChunk).filter(
            CurriculumChunk.source_id == source_id
        ).order_by(CurriculumChunk.chunk_index).all()

    def get_chunks_by_concept(self, concept: str) -> List[CurriculumChunk]:
        """Retrieve all chunks containing a concept."""
        return self.db.query(CurriculumChunk).filter(
            CurriculumChunk.concepts.contains([concept])
        ).all()

    def get_chunks_by_heading(self, heading_path: str) -> List[CurriculumChunk]:
        """Retrieve all chunks under a heading path."""
        return self.db.query(CurriculumChunk).filter(
            CurriculumChunk.heading_path.like(f"{heading_path}%")
        ).all()

    def bulk_save_chunks(
        self,
        source_id: int,
        chunks_data: List[Dict[str, Any]]
    ) -> List[CurriculumChunk]:
        """Efficiently save multiple chunks for a source."""
        chunks = []
        for data in chunks_data:
            chunk = CurriculumChunk(
                source_id=source_id,
                **data
            )
            chunks.append(chunk)

        self.db.add_all(chunks)
        self.db.commit()

        return chunks

    def get_chunk_statistics(self) -> Dict[str, Any]:
        """Get aggregate statistics about chunks."""
        from sqlalchemy import func

        total_chunks = self.db.query(CurriculumChunk).count()

        total_tokens_result = self.db.query(
            func.sum(CurriculumChunk.token_count)
        ).scalar()
        total_tokens = total_tokens_result or 0

        avg_chunk_size = 0
        if total_chunks > 0:
            avg_chunk_size = int(total_tokens / total_chunks)

        return {
            "total_chunks": total_chunks,
            "total_tokens": int(total_tokens),
            "average_chunk_size": avg_chunk_size
        }

    # ============================================================================
    # CURRICULUM REGISTRY OPERATIONS
    # ============================================================================

    def check_curriculum_exists(
        self,
        topic: str,
        difficulty: str,
        duration: str
    ) -> Optional[CurriculumRegistry]:
        """Check if curriculum already exists (cache lookup)."""
        return self.db.query(CurriculumRegistry).filter(
            and_(
                CurriculumRegistry.topic == topic,
                CurriculumRegistry.difficulty == difficulty,
                CurriculumRegistry.duration == duration
            )
        ).first()

    def save_curriculum(
        self,
        topic: str,
        difficulty: str,
        duration: str,
        extracted_topics: List[str],
        extracted_subtopics: Dict[str, List[str]],
        learning_order: List[str],
        chunk_ids: List[int],
        sources_count: int,
        chunks_count: int,
        total_tokens: int,
        registry_metadata: Dict[str, Any],
        expires_in_days: int = 30
    ) -> CurriculumRegistry:
        """Save curriculum template to registry."""
        curriculum = CurriculumRegistry(
            topic=topic,
            difficulty=difficulty,
            duration=duration,
            extracted_topics=extracted_topics,
            extracted_subtopics=extracted_subtopics,
            learning_order=learning_order,
            chunk_ids=chunk_ids,
            sources_count=sources_count,
            chunks_count=chunks_count,
            total_tokens=total_tokens,
            registry_metadata=registry_metadata,
            expires_at=datetime.utcnow() + timedelta(days=expires_in_days)
        )
        self.db.add(curriculum)
        self.db.commit()
        self.db.refresh(curriculum)
        return curriculum

    def get_curriculum(self, curriculum_id: int) -> Optional[CurriculumRegistry]:
        """Retrieve curriculum by ID."""
        return self.db.query(CurriculumRegistry).filter(
            CurriculumRegistry.id == curriculum_id
        ).first()

    def list_curricula(
        self,
        topic: Optional[str] = None,
        difficulty: Optional[str] = None,
        skip: int = 0,
        limit: int = 50
    ) -> List[CurriculumRegistry]:
        """List curricula with optional filters."""
        query = self.db.query(CurriculumRegistry)

        if topic:
            query = query.filter(CurriculumRegistry.topic.ilike(f"%{topic}%"))
        if difficulty:
            query = query.filter(CurriculumRegistry.difficulty == difficulty)

        return query.order_by(desc(CurriculumRegistry.created_at)).offset(skip).limit(limit).all()

    def get_expired_curricula(self) -> List[CurriculumRegistry]:
        """Retrieve curricula past their expiration date."""
        return self.db.query(CurriculumRegistry).filter(
            CurriculumRegistry.expires_at <= datetime.utcnow()
        ).all()

    def delete_curriculum(self, curriculum_id: int) -> bool:
        """Delete curriculum and cascade delete learning paths."""
        curriculum = self.db.query(CurriculumRegistry).filter(
            CurriculumRegistry.id == curriculum_id
        ).first()
        if curriculum:
            self.db.delete(curriculum)
            self.db.commit()
            return True
        return False

    def get_curriculum_statistics(self) -> Dict[str, Any]:
        """Get aggregate statistics about curricula."""
        from sqlalchemy import func

        total = self.db.query(CurriculumRegistry).count()

        total_chunks_result = self.db.query(
            func.sum(CurriculumRegistry.chunks_count)
        ).scalar()
        total_chunks = total_chunks_result or 0

        total_tokens_result = self.db.query(
            func.sum(CurriculumRegistry.total_tokens)
        ).scalar()
        total_tokens = total_tokens_result or 0

        return {
            "total_curricula": total,
            "total_chunks": int(total_chunks),
            "total_tokens": int(total_tokens)
        }

    # ============================================================================
    # CURRICULUM LEARNING PATH OPERATIONS
    # ============================================================================

    def save_learning_path(
        self,
        curriculum_id: int,
        path_index: int,
        title: str,
        description: Optional[str],
        topic: str,
        subtopic: Optional[str],
        chunk_ids: List[int],
        estimated_minutes: Optional[int],
        learning_objectives: List[str],
        prerequisites: List[str],
        metadata: Dict[str, Any]
    ) -> CurriculumLearningPath:
        """Save a learning path (lesson) to database."""
        path = CurriculumLearningPath(
            curriculum_id=curriculum_id,
            path_index=path_index,
            title=title,
            description=description,
            topic=topic,
            subtopic=subtopic,
            chunk_ids=chunk_ids,
            estimated_minutes=estimated_minutes,
            learning_objectives=learning_objectives,
            prerequisites=prerequisites,
            metadata=metadata
        )
        self.db.add(path)
        self.db.commit()
        self.db.refresh(path)
        return path

    def get_learning_paths(self, curriculum_id: int) -> List[CurriculumLearningPath]:
        """Retrieve all learning paths for a curriculum (ordered)."""
        return self.db.query(CurriculumLearningPath).filter(
            CurriculumLearningPath.curriculum_id == curriculum_id
        ).order_by(CurriculumLearningPath.path_index).all()

    def get_learning_path(self, path_id: int) -> Optional[CurriculumLearningPath]:
        """Retrieve a specific learning path."""
        return self.db.query(CurriculumLearningPath).filter(
            CurriculumLearningPath.id == path_id
        ).first()

    def bulk_save_learning_paths(
        self,
        curriculum_id: int,
        paths_data: List[Dict[str, Any]]
    ) -> List[CurriculumLearningPath]:
        """Efficiently save multiple learning paths for a curriculum."""
        paths = []
        for data in paths_data:
            path = CurriculumLearningPath(
                curriculum_id=curriculum_id,
                **data
            )
            paths.append(path)

        self.db.add_all(paths)
        self.db.commit()

        return paths

    # ============================================================================
    # COMPLEX QUERIES
    # ============================================================================

    def get_curriculum_with_chunks(
        self,
        curriculum_id: int
    ) -> Optional[Dict[str, Any]]:
        """
        Retrieve complete curriculum with all chunks.

        Returns:
            {
                "curriculum": CurriculumRegistry,
                "chunks": List[CurriculumChunk],
                "sources": List[CurriculumSource],
                "learning_paths": List[CurriculumLearningPath]
            }
        """
        curriculum = self.get_curriculum(curriculum_id)
        if not curriculum:
            return None

        chunk_ids = curriculum.chunk_ids
        chunks = self.db.query(CurriculumChunk).filter(
            CurriculumChunk.id.in_(chunk_ids)
        ).all() if chunk_ids else []

        source_ids = list(set(c.source_id for c in chunks))
        sources = self.db.query(CurriculumSource).filter(
            CurriculumSource.id.in_(source_ids)
        ).all() if source_ids else []

        learning_paths = self.get_learning_paths(curriculum_id)

        return {
            "curriculum": curriculum,
            "chunks": chunks,
            "sources": sources,
            "learning_paths": learning_paths
        }

    def search_chunks_by_content(self, query: str, limit: int = 20) -> List[CurriculumChunk]:
        """Full-text search on chunk content (PostgreSQL specific)."""
        return self.db.query(CurriculumChunk).filter(
            CurriculumChunk.content.ilike(f"%{query}%")
        ).limit(limit).all()

    def get_sources_for_curriculum(self, curriculum_id: int) -> List[CurriculumSource]:
        """
        Retrieve all sources used in a curriculum.

        Gets the chunks for the curriculum and extracts the unique sources from them.
        """
        curriculum = self.get_curriculum(curriculum_id)
        if not curriculum or not curriculum.chunk_ids:
            return []

        chunks = self.db.query(CurriculumChunk).filter(
            CurriculumChunk.id.in_(curriculum.chunk_ids)
        ).all()

        source_ids = list(set(c.source_id for c in chunks))
        if not source_ids:
            return []

        return self.db.query(CurriculumSource).filter(
            CurriculumSource.id.in_(source_ids)
        ).all()

    def get_chunks_for_curriculum(self, curriculum_id: int) -> List[CurriculumChunk]:
        """
        Retrieve all chunks used in a curriculum.

        Uses the chunk_ids stored in the curriculum registry.
        """
        curriculum = self.get_curriculum(curriculum_id)
        if not curriculum or not curriculum.chunk_ids:
            return []

        return self.db.query(CurriculumChunk).filter(
            CurriculumChunk.id.in_(curriculum.chunk_ids)
        ).order_by(CurriculumChunk.chunk_index).all()
