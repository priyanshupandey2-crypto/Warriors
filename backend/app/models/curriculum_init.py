"""
Curriculum Tables Initialization
==================================

This module ensures curriculum tables are created in PostgreSQL.
Run this manually if auto-initialization doesn't work:

    python -c "from app.models.curriculum_init import init_curriculum_tables; init_curriculum_tables()"

Tables created:
    - curriculum_sources: Raw extracted content
    - curriculum_chunks: Semantic chunks
    - curriculum_registry: Cached curricula
    - curriculum_learning_paths: Generated lessons
"""

from app.database import Base, engine
from app.models.curriculum import (
    CurriculumSource,
    CurriculumChunk,
    CurriculumRegistry,
    CurriculumLearningPath,
)


def init_curriculum_tables():
    """Create all curriculum tables in PostgreSQL."""
    try:
        Base.metadata.create_all(bind=engine)
        print("[OK] Curriculum tables created successfully")
        print("   - curriculum_sources")
        print("   - curriculum_chunks")
        print("   - curriculum_registry")
        print("   - curriculum_learning_paths")
    except Exception as e:
        print(f"[ERROR] Failed to create curriculum tables: {e}")
        raise


if __name__ == "__main__":
    init_curriculum_tables()
