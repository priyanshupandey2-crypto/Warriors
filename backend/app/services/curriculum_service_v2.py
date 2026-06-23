"""
Updated Curriculum Service - Using Real Curriculum Generation

Uses CurriculumGenerationEngine to create REAL curricula, not just extract headings.

Flow:
    Firecrawl Extraction
        ↓
    Chunk Content
        ↓
    CurriculumGenerationEngine (NEW - uses LLM + semantic analysis)
        ↓
    Meaningful Topics + Subtopics + Synthesized Content
        ↓
    Save to Database
        ↓
    Return Complete Curriculum
"""

import logging
from typing import List, Optional, Dict, Any
from datetime import datetime
from sqlalchemy.orm import Session

from app.services.firecrawl_service import FirecrawlService
from app.services.curriculum_generation_engine import CurriculumGenerationEngine
from app.repositories.curriculum_repository import CurriculumRepository
from app.schemas.curriculum import CurriculumDiscoveryRequest, CurriculumResponse

logger = logging.getLogger(__name__)


class CurriculumServiceV2:
    """
    Updated curriculum service using real curriculum generation.

    Key difference from v1:
    - v1: Extracted topics from headings (wrong)
    - v2: GENERATES topics using LLM + semantic analysis (right)
    """

    def __init__(self, db: Session):
        self.db = db
        self.repo = CurriculumRepository(db)
        self.firecrawl = FirecrawlService(db)
        self.curriculum_engine = CurriculumGenerationEngine(db)

    def discover_curriculum(self, request: CurriculumDiscoveryRequest) -> CurriculumResponse:
        """
        Discover and GENERATE curriculum (not extract).

        Different from v1:
        - v1: Extract -> Topics from headings
        - v2: Extract -> Generate -> Topics from analysis
        """
        logger.info(
            f"Generating curriculum: topic='{request.topic}', "
            f"difficulty='{request.difficulty}', duration='{request.duration}'"
        )

        # Step 1: Extract sources and chunks (same as v1)
        urls = self._generate_source_urls(request.topic, request.tags or [])
        logger.info(f"Generated {len(urls)} source URLs")

        extraction_result = self.firecrawl.extract_and_chunk_urls(urls)

        if extraction_result["successful"] == 0:
            logger.error(f"Failed to extract any sources for {request.topic}")
            return CurriculumResponse(
                success=False,
                topic=request.topic,
                difficulty=request.difficulty,
                duration=request.duration,
                sources_count=0,
                chunks_count=0,
                message="Failed to extract content from any source"
            )

        sources = extraction_result["sources"]
        chunks = extraction_result["chunks"]

        logger.info(f"Extracted {len(chunks)} chunks from {len(sources)} sources")

        # Step 2: GENERATE curriculum (NEW - this is the key change)
        logger.info("Generating curriculum structure using LLM + semantic analysis...")
        generated_curriculum = self.curriculum_engine.generate_curriculum(
            topic=request.topic,
            chunks=chunks,
            difficulty=request.difficulty
        )

        logger.info(f"Generated curriculum with {len(generated_curriculum['topics'])} topics")

        # Step 3: Save to database
        curriculum = self._save_curriculum_to_db(
            request.topic,
            request.difficulty,
            request.duration,
            sources,
            chunks,
            generated_curriculum
        )

        # Step 4: Return response with generated content
        return self._build_response(curriculum, generated_curriculum)

    def _generate_source_urls(self, topic: str, tags: List[str]) -> List[str]:
        """Same URL generation as v1."""
        urls = []
        topic_slug = "-".join(topic.lower().split())
        topic_clean = topic_slug.replace("-tutorial", "").replace("-guide", "")

        gfg_urls = [
            f"https://www.geeksforgeeks.org/{topic_slug}/",
            f"https://www.geeksforgeeks.org/{topic_clean}/",
        ]
        urls.extend(gfg_urls)

        w3_urls = [
            f"https://www.w3schools.com/{topic_slug}/",
            f"https://www.w3schools.com/whatis/{topic_slug}.asp",
        ]
        urls.extend(w3_urls)

        mdn_urls = [
            f"https://developer.mozilla.org/en-US/docs/Learn/{topic_slug}/",
            f"https://developer.mozilla.org/en-US/docs/Web/{topic_slug}/",
        ]
        urls.extend(mdn_urls)

        javatpoint_urls = [
            f"https://www.javatpoint.com/{topic_slug}/",
            f"https://www.javatpoint.com/{topic_clean}/",
        ]
        urls.extend(javatpoint_urls)

        urls.append(f"https://roadmap.sh/{topic_slug}")

        # Remove duplicates
        seen = set()
        unique_urls = []
        for url in urls:
            if url not in seen:
                seen.add(url)
                unique_urls.append(url)

        return unique_urls

    def _save_curriculum_to_db(
        self,
        topic: str,
        difficulty: str,
        duration: str,
        sources: List[Any],
        chunks: List[Any],
        generated_curriculum: Dict[str, Any]
    ) -> Any:
        """
        Save curriculum to database.

        Now includes:
        - Generated topics (not extracted)
        - Generated subtopics (not extracted)
        - Synthesized content
        """
        logger.info(f"Saving {len(sources)} sources to database")

        # Save sources
        saved_sources = {}
        for source in sources:
            saved_source = self.repo.save_source(
                url=source.url,
                source_type=source.source_type,
                title=source.title,
                description=source.description,
                raw_markdown=source.raw_markdown,
                headings=source.headings,
                metadata=source.metadata
            )
            saved_sources[source.url] = saved_source

        logger.info(f"Saving {len(chunks)} chunks to database")

        # Save chunks
        chunk_ids = []
        for chunk in chunks:
            source = saved_sources[chunk.source_url]
            saved_chunk = self.repo.save_chunk(
                source_id=source.id,
                chunk_index=chunk.chunk_index,
                heading_path=chunk.heading_path,
                content=chunk.content,
                token_count=chunk.token_count,
                concepts=chunk.concepts,
                metadata=chunk.metadata
            )
            chunk_ids.append(saved_chunk.id)

        # Save curriculum with GENERATED content (not extracted)
        total_tokens = sum(c.token_count for c in chunks)

        curriculum = self.repo.save_curriculum(
            topic=topic,
            difficulty=difficulty,
            duration=duration,
            extracted_topics=[t['name'] for t in generated_curriculum.get('topics', [])],
            extracted_subtopics=self._extract_subtopics_from_generated(generated_curriculum),
            learning_order=[t['name'] for t in generated_curriculum.get('topics', [])],
            chunk_ids=chunk_ids,
            sources_count=len(sources),
            chunks_count=len(chunks),
            total_tokens=total_tokens,
            registry_metadata={
                "extracted_at": datetime.utcnow().isoformat(),
                "source_types": list(set(s.source_type for s in sources)),
                "generation_method": "LLM + Semantic Analysis (v2)",
                "generated_curriculum": generated_curriculum,  # Store full generated curriculum
            }
        )

        return curriculum

    def _extract_subtopics_from_generated(self, generated_curriculum: Dict[str, Any]) -> Dict[str, List[str]]:
        """Extract subtopics from generated curriculum."""
        subtopics = {}
        for topic in generated_curriculum.get('topics', []):
            topic_name = topic.get('name')
            topic_subtopics = [
                sub.get('name') for sub in topic.get('subtopics', [])
            ]
            if topic_subtopics:
                subtopics[topic_name] = topic_subtopics
        return subtopics

    def _build_response(
        self,
        curriculum: Any,
        generated_curriculum: Dict[str, Any]
    ) -> CurriculumResponse:
        """Build response with generated content."""
        return CurriculumResponse(
            success=True,
            curriculum_id=str(curriculum.id),
            topic=curriculum.topic,
            difficulty=curriculum.difficulty,
            duration=curriculum.duration,
            sources_count=curriculum.sources_count,
            chunks_count=curriculum.chunks_count,
            message="Curriculum generated successfully",
            data={
                "topic": curriculum.topic,
                "difficulty": curriculum.difficulty,
                "overview": generated_curriculum.get('overview', ''),
                "topics": generated_curriculum.get('topics', []),
                "total_estimated_minutes": generated_curriculum.get('total_estimated_minutes', 0),
                "key_concepts": generated_curriculum.get('key_concepts', []),
                "learning_outcomes": generated_curriculum.get('learning_outcomes', []),
            }
        )

    def get_curriculum(self, curriculum_id: int) -> Optional[Dict[str, Any]]:
        """Retrieve curriculum with generated content."""
        curriculum = self.repo.get_curriculum_by_id(curriculum_id)
        if curriculum:
            # Return generated curriculum from metadata
            metadata = curriculum.registry_metadata or {}
            return metadata.get('generated_curriculum', {})
        return None
