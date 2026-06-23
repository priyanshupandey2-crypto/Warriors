"""
Curriculum Service - Production Version
========================================

Real curriculum generation using Claude LLM + Firecrawl.

Architecture:
    Routes (routers/curriculum.py)
        ↓
    Service (curriculum_service.py + Claude LLM)
        ↓
    Firecrawl (extract real web content)
        ↓
    Repository (repositories/curriculum_repository.py)
        ↓
    Database (PostgreSQL)
"""

import logging
import json
import re
from typing import List, Optional, Dict, Any
from datetime import datetime
from sqlalchemy.orm import Session
from anthropic import Anthropic

from app.services.firecrawl_service import FirecrawlService, ContentSourceType
from app.repositories.curriculum_repository import CurriculumRepository
from app.schemas.curriculum import (
    CurriculumDiscoveryRequest,
    CurriculumResponse,
    URLValidationResponse,
)

logger = logging.getLogger(__name__)

# Initialize Claude client
anthropic = Anthropic()


class CurriculumService:
    """
    Orchestrates curriculum discovery with Firecrawl + Claude LLM.

    Key features:
    - Firecrawl extracts real web content
    - Claude LLM generates meaningful topics (not headings)
    - Semantic subtopic generation
    - Backward compatible API
    """

    def __init__(self, db: Session):
        self.db = db
        self.repo = CurriculumRepository(db)
        self.firecrawl = FirecrawlService(db)
        self.model = "claude-3-5-sonnet-20241022"

    # ============================================================================
    # CURRICULUM DISCOVERY
    # ============================================================================

    def discover_curriculum(self, request: CurriculumDiscoveryRequest) -> CurriculumResponse:
        """
        Discover or build curriculum for a topic.

        Flow:
            1. Check cache
            2. Generate source URLs
            3. Extract content with Firecrawl (required)
            4. Generate topics with Claude
            5. Generate subtopics with Claude
            6. Save to database
            7. Return curriculum

        Returns:
            CurriculumResponse with generated curriculum
        """
        logger.info(
            f"Discovering curriculum: topic='{request.topic}', "
            f"difficulty='{request.difficulty}', duration='{request.duration}'"
        )

        # Check cache
        cached = self.repo.check_curriculum_exists(
            request.topic,
            request.difficulty,
            request.duration
        )

        if cached and (cached.expires_at is None or cached.expires_at > datetime.utcnow()):
            logger.info(f"Cache hit for curriculum: {cached.id}")
            return self._build_response(cached, from_cache=True)

        logger.info("Cache miss or expired, generating curriculum")

        # Generate source URLs
        urls = self._generate_source_urls(request.topic, request.tags or [])
        logger.info(f"Generated {len(urls)} source URLs")

        # Extract content with Firecrawl (required, no fallback)
        extraction_result = self.firecrawl.extract_and_chunk_urls(urls)

        # Require successful extraction
        if extraction_result["successful"] == 0:
            logger.error(f"Failed to extract any sources for {request.topic}")
            logger.error(f"Failed URLs: {extraction_result.get('errors', [])}")
            raise Exception(
                "Failed to extract content from sources. "
                "Ensure FIRECRAWL_API_KEY is set and accessible."
            )

        sources = extraction_result["sources"]
        chunks = extraction_result["chunks"]

        logger.info(f"Using {len(chunks)} chunks from {len(sources)} sources")

        # Save and return
        curriculum = self._save_curriculum_to_db(
            request.topic,
            request.difficulty,
            request.duration,
            sources,
            chunks
        )

        logger.info(f"Curriculum created: id={curriculum.id}")
        return self._build_response(curriculum, from_cache=False)


    def _generate_source_urls(self, topic: str, tags: List[str]) -> List[str]:
        """Generate URLs for curriculum extraction."""
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

        urls.append(f"https://roadmap.sh/{topic_slug}")

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
        chunks: List[Any]
    ) -> Any:
        """Save curriculum with GENERATED topics and subtopics."""
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

        # GENERATE topics with Claude
        extracted_topics = self._extract_curriculum_topics(chunks, topic, difficulty)
        extracted_subtopics = self._extract_curriculum_subtopics(chunks, extracted_topics)
        learning_order = self._determine_learning_order(extracted_topics)

        logger.info(
            f"Generated curriculum: {len(extracted_topics)} topics, "
            f"{len(extracted_subtopics)} subtopic groups"
        )

        total_tokens = sum(c.token_count for c in chunks)

        curriculum = self.repo.save_curriculum(
            topic=topic,
            difficulty=difficulty,
            duration=duration,
            extracted_topics=extracted_topics,
            extracted_subtopics=extracted_subtopics,
            learning_order=learning_order,
            chunk_ids=chunk_ids,
            sources_count=len(sources),
            chunks_count=len(chunks),
            total_tokens=total_tokens,
            registry_metadata={
                "extracted_at": datetime.utcnow().isoformat(),
                "source_types": list(set(s.source_type for s in sources)),
                "generation_method": "Claude LLM"
            }
        )

        return curriculum

    def _extract_curriculum_topics(self, chunks: List[Any], main_topic: str, difficulty: str) -> List[str]:
        """Generate meaningful learning topics using Claude."""
        if not chunks:
            return []

        logger.info(f"Generating topics for '{main_topic}' using Claude")

        # Prepare chunk summaries
        chunk_summaries = []
        for chunk in chunks[:10]:
            summary = {
                "heading": getattr(chunk, 'heading_path', ''),
                "preview": getattr(chunk, 'content', '')[:200],
                "concepts": getattr(chunk, 'concepts', [])[:5],
            }
            chunk_summaries.append(summary)

        prompt = f"""
Analyze this educational content about "{main_topic}" at {difficulty} level.

Extract the REAL learning topics - not document headings, but actual teaching topics.

Content preview:
{json.dumps(chunk_summaries, indent=2)}

For {difficulty} level, identify 4-6 core learning topics.

Return ONLY a JSON array of topic names:
["Topic 1", "Topic 2", "Topic 3", "Topic 4"]

Rules:
- Topics should be specific and teachable
- Progress from basic to advanced
- Avoid generic words like "Tutorial", "Guide"
- No single-word topics
- No off-topic terms

Return ONLY the JSON array.
"""

        try:
            response = anthropic.messages.create(
                model=self.model,
                max_tokens=500,
                messages=[{"role": "user", "content": prompt}]
            )

            response_text = response.content[0].text.strip()
            json_match = re.search(r'\[.*\]', response_text, re.DOTALL)
            if json_match:
                topics = json.loads(json_match.group())
                topics = [t.strip() for t in topics if isinstance(t, str) and t.strip()]
                logger.info(f"Generated {len(topics)} topics with Claude")
                return topics

        except Exception as e:
            logger.warning(f"Claude generation failed: {e}, using fallback")

        return self._extract_topics_heuristic(chunks)

    def _extract_topics_heuristic(self, chunks: List[Any]) -> List[str]:
        """Fallback topic extraction."""
        from collections import Counter

        concept_freq = Counter()
        for chunk in chunks:
            concepts = getattr(chunk, 'concepts', [])
            for concept in concepts:
                if concept and len(concept) > 3:
                    concept_freq[concept] += 1

        top_topics = [c for c, _ in concept_freq.most_common(6)]
        return top_topics if top_topics else ["Fundamentals", "Core Concepts", "Advanced Topics"]

    def _extract_curriculum_subtopics(self, chunks: List[Any], topics: List[str]) -> Dict[str, List[str]]:
        """Generate subtopics for each topic."""
        subtopics = {}

        for topic in topics:
            prompt = f"""
For the learning topic "{topic}", generate 3-4 subtopics that break it into teachable units.

Return ONLY a JSON array:
["Subtopic 1", "Subtopic 2", "Subtopic 3"]

Make subtopics specific, progressive, and teachable.
Return ONLY the JSON array.
"""

            try:
                response = anthropic.messages.create(
                    model=self.model,
                    max_tokens=300,
                    messages=[{"role": "user", "content": prompt}]
                )

                response_text = response.content[0].text.strip()
                json_match = re.search(r'\[.*\]', response_text, re.DOTALL)
                if json_match:
                    subs = json.loads(json_match.group())
                    subtopics[topic] = [s.strip() for s in subs if isinstance(s, str) and s.strip()]
                    continue

            except Exception as e:
                logger.debug(f"Subtopic generation failed for {topic}: {e}")

            # Fallback
            subtopics[topic] = [
                f"Fundamentals of {topic}",
                f"Core Concepts",
                f"Advanced Topics"
            ]

        return subtopics

    def _determine_learning_order(self, topics: List[str]) -> List[str]:
        """Determine learning order for topics."""
        return topics

    def _build_response(
        self,
        curriculum: Any,
        from_cache: bool = False
    ) -> CurriculumResponse:
        """Build response from curriculum data."""
        from app.schemas.curriculum import CurriculumTemplateSchema

        topics = curriculum.extracted_topics or []
        subtopics = curriculum.extracted_subtopics or {}

        # Build curriculum structure (organize by difficulty)
        curriculum_structure = {
            "core_topics": topics[:2] if len(topics) > 2 else topics,
            "advanced_topics": topics[2:] if len(topics) > 2 else [],
            "supporting_concepts": list(set(
                s for subs in subtopics.values() for s in subs[:2]
            ))[:5]
        }

        # Extract concept summary from subtopics
        concept_summary = []
        for topic, subs in subtopics.items():
            concept_summary.append(topic)
            concept_summary.extend([s for s in subs[:2] if not s.startswith("[")])
        concept_summary = list(set(concept_summary))[:20]

        # Build source breakdown
        sources = self.repo.get_sources_for_curriculum(curriculum.id) if hasattr(curriculum, 'id') else []
        source_breakdown = []
        if sources:
            for source in sources[:curriculum.sources_count]:
                source_breakdown.append({
                    "url": getattr(source, 'url', ''),
                    "type": getattr(source, 'source_type', 'Unknown'),
                    "chunks_count": len([c for c in self.repo.get_chunks_for_curriculum(curriculum.id)
                                        if getattr(c, 'source_url', '') == getattr(source, 'url', '')]),
                    "content_quality": "high" if len(concept_summary) > 0 else "medium"
                })

        # Build knowledge pack summary
        knowledge_pack_summary = {
            "total_topics": len(topics),
            "total_subtopics": sum(len(v) for v in subtopics.values()),
            "estimated_learning_time": curriculum.duration,
            "difficulty_level": curriculum.difficulty,
            "key_focus_areas": topics[:3],
            "prerequisites": ["Basic programming knowledge"] if "Advanced" in curriculum.difficulty else ["None"],
            "learning_outcomes": [
                f"Master {topic}" for topic in topics[:3]
            ]
        }

        template_data = CurriculumTemplateSchema(
            topic=curriculum.topic,
            difficulty=curriculum.difficulty,
            extracted_topics=topics,
            extracted_subtopics=subtopics,
            curriculum_structure=curriculum_structure,
            concept_summary=concept_summary,
            source_breakdown=source_breakdown,
            knowledge_pack_summary=knowledge_pack_summary,
            quality_metrics={
                "generation_method": "Claude LLM",
                "topics_generated": len(topics),
                "from_cache": from_cache,
                "chunks_analyzed": curriculum.chunks_count,
                "sources_used": curriculum.sources_count,
                "subtopics_generated": sum(len(v) for v in subtopics.values())
            }
        )

        return CurriculumResponse(
            success=True,
            curriculum_id=str(curriculum.id),
            topic=curriculum.topic,
            difficulty=curriculum.difficulty,
            duration=curriculum.duration,
            sources_count=curriculum.sources_count,
            chunks_count=curriculum.chunks_count,
            message="Curriculum generated successfully",
            data=template_data
        )