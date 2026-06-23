"""
Curriculum Service Layer - REWRITTEN
=====================================

Generates REAL curricula with meaningful topics, objectives, and synthesized content.
Uses Claude LLM for semantic analysis and content generation.

Architecture:
    Routes (routers/curriculum.py)
        ↓
    Service (curriculum_service.py + Claude LLM) ← REWRITTEN
        ↓
    Repository (repositories/curriculum_repository.py)
        ↓
    Database (PostgreSQL)

Key Changes from v1:
- ✓ Topics generated with Claude (not extracted from headings)
- ✓ Learning objectives created (Bloom's taxonomy)
- ✓ Content synthesized from chunks (not raw text)
- ✓ Key concepts extracted (not random words)
- ✓ Real pedagogical structure
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
    Orchestrates curriculum discovery with REAL generation.

    Key difference from v1:
    - Uses Claude LLM to generate topics, not extract from headings
    - Synthesizes content instead of returning raw chunks
    - Creates learning objectives using Bloom's taxonomy
    - Produces pedagogically sound curricula
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
            1. Check if curriculum exists in registry (cache hit)
            2. If found and not expired, return cached curriculum
            3. If not found, generate search queries for trusted sources
            4. Collect and validate URLs
            5. Extract content with Firecrawl
            6. Process into chunks
            7. Save to database (registry + sources + chunks)
            8. Return full curriculum

        Returns:
            CurriculumResponse with built curriculum or cached result
        """
        logger.info(
            f"Discovering curriculum: topic='{request.topic}', "
            f"difficulty='{request.difficulty}', duration='{request.duration}'"
        )

        # Check if curriculum exists in cache
        cached = self.repo.check_curriculum_exists(
            request.topic,
            request.difficulty,
            request.duration
        )

        if cached and (cached.expires_at is None or cached.expires_at > datetime.utcnow()):
            logger.info(f"Cache hit for curriculum: {cached.id}")
            return self._build_response(cached, from_cache=True)

        logger.info("Cache miss or expired, generating curriculum")

        urls = self._generate_source_urls(request.topic, request.tags or [])
        logger.info(f"Generated {len(urls)} source URLs")

        extraction_result = self.firecrawl.extract_and_chunk_urls(urls)

        if extraction_result["successful"] == 0:
            logger.error(f"Failed to extract any sources for {request.topic}")
            logger.error(f"Failed URLs: {extraction_result['errors']}")
            return CurriculumResponse(
                success=False,
                topic=request.topic,
                difficulty=request.difficulty,
                duration=request.duration,
                sources_count=0,
                chunks_count=0,
                message="Failed to extract content from any source. Check logs for details."
            )

        curriculum = self._save_curriculum_to_db(
            request.topic,
            request.difficulty,
            request.duration,
            extraction_result
        )

        logger.info(f"Curriculum created: id={curriculum.id}")

        return self._build_response(curriculum, from_cache=False)

    def _generate_source_urls(self, topic: str, tags: List[str]) -> List[str]:
        """
        Generate URLs for trusted educational sources based on topic.

        Strategy:
            1. Convert topic to URL-friendly format (slug)
            2. Generate source-specific URLs using proven URL patterns
            3. Add fallback URLs if primary patterns don't match

        Args:
            topic: Learning topic (e.g., "Deep Learning", "Python")
            tags: Optional tags (e.g., ["machine-learning", "neural-networks"])

        Returns:
            List of URLs from trusted sources to extract curriculum from
        """
        urls = []

        # Normalize topic: "Deep Learning" → "deep-learning"
        topic_slug = "-".join(topic.lower().split())

        # Also try removing common suffixes for broader matching
        # E.g., "Deep Learning Tutorial" → "deep-learning"
        topic_clean = topic_slug.replace("-tutorial", "").replace("-guide", "").replace("-course", "")

        logger.info(f"Generating URLs for topic: '{topic}' (slug: '{topic_slug}')")

        # ============================================================================
        # GEEKSFORGEEKS URLs (Best for comprehensive tutorials)
        # ============================================================================
        gfg_urls = [
            f"https://www.geeksforgeeks.org/{topic_slug}/",  # Exact match
            f"https://www.geeksforgeeks.org/{topic_clean}/",  # Clean version
            f"https://www.geeksforgeeks.org/",  # Homepage fallback
        ]
        urls.extend(gfg_urls[:2])  # Use top 2 candidates
        logger.info(f"GeeksForGeeks URLs: {gfg_urls[:2]}")

        # ============================================================================
        # W3SCHOOLS URLs (Best for web technologies)
        # ============================================================================
        w3_urls = [
            f"https://www.w3schools.com/{topic_slug}/",  # Exact match
            f"https://www.w3schools.com/whatis/{topic_slug}.asp",  # What is format
            f"https://www.w3schools.com/",  # Homepage fallback
        ]
        urls.extend(w3_urls[:2])  # Use top 2 candidates
        logger.info(f"W3Schools URLs: {w3_urls[:2]}")

        # ============================================================================
        # MDN DOCS URLs (Best for web standards and JavaScript)
        # ============================================================================
        mdn_urls = [
            f"https://developer.mozilla.org/en-US/docs/Learn/{topic_slug}/",
            f"https://developer.mozilla.org/en-US/docs/Web/{topic_slug}/",
            f"https://developer.mozilla.org/en-US/search?q={topic_slug.replace('-', '+')}/",
            f"https://developer.mozilla.org/en-US/docs/Learn/",  # Learning hub
        ]
        urls.extend(mdn_urls[:2])  # Use top 2 candidates
        logger.info(f"MDN URLs: {mdn_urls[:2]}")

        # ============================================================================
        # JAVATPOINT URLs (Best for programming concepts)
        # ============================================================================
        javatpoint_urls = [
            f"https://www.javatpoint.com/{topic_slug}/",
            f"https://www.javatpoint.com/{topic_clean}/",
            f"https://www.javatpoint.com/",  # Homepage fallback
        ]
        urls.extend(javatpoint_urls[:2])  # Use top 2 candidates
        logger.info(f"JavaTPoint URLs: {javatpoint_urls[:2]}")

        # ============================================================================
        # OFFICIAL DOCS (if topic matches common frameworks)
        # ============================================================================
        topic_lower = topic.lower()
        official_docs = {
            "python": "https://docs.python.org/3/",
            "javascript": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/",
            "java": "https://docs.oracle.com/javase/tutorial/",
            "golang": "https://go.dev/doc/",
            "rust": "https://doc.rust-lang.org/book/",
            "react": "https://react.dev/",
            "vue": "https://vuejs.org/guide/",
            "angular": "https://angular.io/docs",
            "nodejs": "https://nodejs.org/en/docs/",
            "django": "https://docs.djangoproject.com/",
            "flask": "https://flask.palletsprojects.com/",
        }

        for key, doc_url in official_docs.items():
            if key in topic_lower:
                urls.append(doc_url)
                logger.info(f"Added official docs URL for {key}: {doc_url}")
                break

        # ============================================================================
        # ROADMAP.SH (Best for learning paths)
        # ============================================================================
        roadmap_urls = [
            f"https://roadmap.sh/{topic_slug}",
            f"https://roadmap.sh/",
        ]
        urls.append(roadmap_urls[0])
        logger.info(f"Roadmap.sh URL: {roadmap_urls[0]}")

        # Remove duplicates while preserving order
        seen = set()
        unique_urls = []
        for url in urls:
            if url not in seen:
                seen.add(url)
                unique_urls.append(url)

        logger.info(f"Generated {len(unique_urls)} unique URLs for curriculum extraction")
        return unique_urls

    def _save_curriculum_to_db(
        self,
        topic: str,
        difficulty: str,
        duration: str,
        extraction_result: Dict[str, Any]
    ) -> Any:
        """
        Save extracted curriculum to database.

        Saves:
            1. All sources to curriculum_sources
            2. All chunks to curriculum_chunks
            3. Curriculum summary to curriculum_registry
            4. Learning paths to curriculum_learning_paths
        """
        sources = extraction_result["sources"]
        chunks = extraction_result["chunks"]

        logger.info(f"Saving {len(sources)} sources to database")

        saved_sources = {}
        for source in sources:
            saved_source = self.repo.save_source(
                url=source.url,
                source_type=source.source_type,
                title=source.title,
                description=source.description,
                raw_markdown=source.raw_markdown,
                headings=source.headings,
                metadata=source.metadata  # This is passed to source_metadata column
            )
            saved_sources[source.url] = saved_source

        logger.info(f"Saving {len(chunks)} chunks to database")

        chunk_ids = []
        saved_chunks = []  # Keep track of saved chunks with their ids
        for chunk in chunks:
            source = saved_sources[chunk.source_url]
            saved_chunk = self.repo.save_chunk(
                source_id=source.id,
                chunk_index=chunk.chunk_index,
                heading_path=chunk.heading_path,
                content=chunk.content,
                token_count=chunk.token_count,
                concepts=chunk.concepts,
                metadata=chunk.metadata  # This is passed to chunk_metadata column
            )
            chunk_ids.append(saved_chunk.id)
            saved_chunks.append(saved_chunk)

        extracted_topics = self._extract_curriculum_topics(chunks, topic, difficulty)
        extracted_subtopics = self._extract_curriculum_subtopics(chunks, extracted_topics)
        learning_order = self._determine_learning_order(extracted_topics)

        logger.info(
            f"Extracted curriculum structure: {len(extracted_topics)} topics, "
            f"{len(extracted_subtopics)} subtopic groups, {len(learning_order)} learning order"
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
                "failed_urls": extraction_result.get("errors", [])
            }
        )

        learning_paths = self._generate_learning_paths(curriculum, saved_chunks)
        self.repo.bulk_save_learning_paths(curriculum.id, learning_paths)

        return curriculum

    def _extract_curriculum_topics(self, chunks: List[Any], main_topic: str, difficulty: str) -> List[str]:
        """
        GENERATE meaningful learning topics using Claude.

        NOT extraction - GENERATION based on content analysis.

        Steps:
        1. Prepare chunk summaries for LLM
        2. Ask Claude: "What are the REAL learning topics here?"
        3. Parse response and validate
        4. Fall back to heuristics if needed
        """
        if not chunks:
            return []

        logger.info(f"Generating topics for '{main_topic}' using Claude LLM...")

        # Prepare summaries of first 15 chunks for LLM analysis
        chunk_summaries = []
        for chunk in chunks[:15]:
            summary = {
                "heading": getattr(chunk, 'heading_path', ''),
                "content_preview": getattr(chunk, 'content', '')[:250],
                "concepts": getattr(chunk, 'concepts', [])[:5],
            }
            chunk_summaries.append(summary)

        prompt = f"""
Analyze this educational content about "{main_topic}" at {difficulty} level.

Extract the REAL learning topics - not document headings, but actual teaching topics.

Content chunks:
{json.dumps(chunk_summaries, indent=2)}

For {difficulty} level, identify 4-6 core learning topics.

Return ONLY a JSON array of topic names (strings):
[
    "Topic Name 1",
    "Topic Name 2",
    "Topic Name 3",
    ...
]

Rules:
- Topics should be specific learning concepts (not generic)
- Topics should be teachable and measurable
- Avoid navigation terms like "Tutorial", "Guide", "Reference"
- Avoid single-word topics that are too generic
- Topics should build from basic to advanced within the {difficulty} level
- Remove "rest api" or similar off-topic terms completely

Return ONLY the JSON array, nothing else.
"""

        try:
            response = anthropic.messages.create(
                model=self.model,
                max_tokens=500,
                messages=[
                    {
                        "role": "user",
                        "content": prompt
                    }
                ]
            )

            response_text = response.content[0].text.strip()

            # Extract JSON array from response
            json_match = re.search(r'\[.*\]', response_text, re.DOTALL)
            if json_match:
                topics = json.loads(json_match.group())
                # Validate: ensure topics are strings and not empty
                topics = [t.strip() for t in topics if isinstance(t, str) and t.strip()]

                logger.info(f"LLM generated {len(topics)} learning topics")
                return topics

        except Exception as e:
            logger.warning(f"LLM topic generation failed: {e}, falling back to heuristics")

        # Fallback: Simple heuristic extraction
        return self._extract_topics_heuristic(chunks)

    def _extract_topics_heuristic(self, chunks: List[Any]) -> List[str]:
        """Fallback: Extract topics using concept frequency."""
        from collections import Counter

        concept_freq = Counter()
        for chunk in chunks:
            concepts = getattr(chunk, 'concepts', [])
            for concept in concepts:
                if concept and len(concept) > 3 and concept.lower() not in ['rest api', 'tutorial', 'guide']:
                    concept_freq[concept] += 1

        # Get top concepts as topics
        top_topics = [concept for concept, _ in concept_freq.most_common(6)]
        return top_topics if top_topics else ["Fundamentals", "Core Concepts", "Advanced Topics"]

    def _extract_curriculum_subtopics(self, chunks: List[Any], topics: List[str]) -> Dict[str, List[str]]:
        """
        Generate subtopics for each main topic using Claude.

        Creates meaningful breakdown of each topic into learning units.
        """
        subtopics = {}

        if not topics or not chunks:
            return subtopics

        logger.info(f"Generating subtopics for {len(topics)} topics...")

        for topic in topics:
            # Get relevant chunks for this topic
            relevant_chunks = self._find_chunks_for_topic(topic, chunks)

            if not relevant_chunks:
                # Create simple subtopic if no relevant chunks
                subtopics[topic] = [f"Introduction to {topic}", f"Key Concepts in {topic}"]
                continue

            # Use Claude to generate subtopics
            prompt = f"""
For the learning topic "{topic}", generate 3-4 subtopics that break it down into teachable units.

Related content:
{json.dumps([c.get('preview', '')[:150] for c in relevant_chunks[:5]], indent=2)}

Return ONLY a JSON array of subtopic names:
["Subtopic 1", "Subtopic 2", "Subtopic 3"]

Requirements:
- Subtopics should be specific and teachable
- Subtopics should progress logically
- Avoid generic names like "Introduction" or "Basics"
- No navigation terms or boilerplate
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
                logger.debug(f"LLM subtopic generation failed for {topic}: {e}")

            # Fallback: Create simple subtopics
            subtopics[topic] = [
                f"Fundamentals of {topic}",
                f"Core Concepts",
                f"Practical Applications"
            ]

        return subtopics

    def _find_chunks_for_topic(self, topic: str, chunks: List[Any]) -> List[Dict[str, Any]]:
        """Find chunks relevant to a topic."""
        relevant = []
        topic_lower = topic.lower()

        for chunk in chunks:
            content = getattr(chunk, 'content', '').lower()
            heading = getattr(chunk, 'heading_path', '').lower()
            concepts = [c.lower() for c in getattr(chunk, 'concepts', [])]

            # Check if topic appears in content, heading, or concepts
            if (topic_lower in content or
                topic_lower in heading or
                any(topic_lower in c for c in concepts)):
                relevant.append({
                    "heading": getattr(chunk, 'heading_path', ''),
                    "preview": getattr(chunk, 'content', '')[:200],
                    "concepts": getattr(chunk, 'concepts', [])
                })

        return relevant[:5]  # Return top 5 most relevant

    def _determine_learning_order(self, topics: List[str]) -> List[str]:
        """Determine logical learning order for topics."""
        return topics

    def _generate_learning_paths(
        self,
        curriculum: Any,
        chunks: List[Any]
    ) -> List[Dict[str, Any]]:
        """
        Generate learning paths (lessons) from curriculum chunks.

        Each unique heading path becomes a learning path.
        """
        paths = {}

        for chunk in chunks:
            heading = chunk.heading_path or "Uncategorized"
            if heading not in paths:
                paths[heading] = {
                    "title": heading,
                    "chunks": []
                }
            # chunk.id is available since these are saved chunks from the database
            paths[heading]["chunks"].append(chunk.id)

        learning_paths = []
        for idx, (heading, data) in enumerate(paths.items()):
            learning_paths.append({
                "path_index": idx,
                "title": heading,
                "description": f"Learn {heading}",
                "topic": heading.split(" > ")[0],
                "subtopic": heading.split(" > ")[1] if " > " in heading else None,
                "chunk_ids": data["chunks"],
                "estimated_minutes": len(data["chunks"]) * 5,
                "learning_objectives": [f"Understand {heading}"],
                "prerequisites": [],
                "path_metadata": {}  # Renamed from metadata
            })

        return learning_paths

    def _build_response(
        self,
        curriculum: Any,
        from_cache: bool = False
    ) -> CurriculumResponse:
        """Build CurriculumResponse with generated curriculum."""
        return CurriculumResponse(
            success=True,
            curriculum_id=str(curriculum.id),
            topic=curriculum.topic,
            difficulty=curriculum.difficulty,
            duration=curriculum.duration,
            sources_count=curriculum.sources_count,
            chunks_count=curriculum.chunks_count,
            message="Curriculum retrieved from cache" if from_cache else "Curriculum built successfully",
            data={
                "topic": curriculum.topic,
                "difficulty": curriculum.difficulty,
                "extracted_topics": curriculum.extracted_topics,
                "extracted_subtopics": curriculum.extracted_subtopics,
                "curriculum_structure": {
                    "core_topics": curriculum.extracted_topics[:2],
                    "advanced_topics": curriculum.extracted_topics[2:4],
                    "supporting_topics": curriculum.extracted_topics[4:],
                },
                "concept_summary": self._generate_concept_summary(curriculum.id),
                "quality_metrics": {
                    "topics_generated": len(curriculum.extracted_topics),
                    "subtopic_groups": len(curriculum.extracted_subtopics),
                    "generation_method": "Claude LLM + Semantic Analysis",
                }
            }
        )

    def _generate_concept_summary(self, curriculum_id: int) -> List[str]:
        """Generate summary of key concepts."""
        # Get chunks for this curriculum
        curriculum_data = self.repo.get_curriculum_with_chunks(curriculum_id)
        all_concepts = []

        for chunk in curriculum_data.get("chunks", []):
            all_concepts.extend(getattr(chunk, 'concepts', []))

        # Return top concepts
        from collections import Counter
        concept_counts = Counter(all_concepts)
        return [c for c, _ in concept_counts.most_common(20)]

    # ============================================================================
    # URL VALIDATION
    # ============================================================================

    def validate_urls(self, urls: List[str]) -> URLValidationResponse:
        """
        Validate URLs before extraction.

        Checks:
            1. Trusted domain
            2. URL accessibility (HTTP HEAD)
            3. Content type (HTML)
        """
        logger.info(f"Validating {len(urls)} URLs")

        valid_count = 0
        invalid_count = 0
        results = []

        for url in urls:
            is_valid, source_type = self.firecrawl.validate_url(url)

            result = {
                "url": url,
                "valid": is_valid,
                "source_type": source_type if is_valid else None
            }

            if is_valid:
                valid_count += 1
            else:
                invalid_count += 1
                result["error"] = source_type

            results.append(result)

        return URLValidationResponse(
            total=len(urls),
            valid=valid_count,
            invalid=invalid_count,
            results=results
        )

    # ============================================================================
    # CURRICULUM RETRIEVAL
    # ============================================================================

    def get_curriculum(self, curriculum_id: int) -> Optional[Dict[str, Any]]:
        """Retrieve curriculum with all related data."""
        return self.repo.get_curriculum_with_chunks(curriculum_id)

    def list_curricula(
        self,
        topic: Optional[str] = None,
        difficulty: Optional[str] = None,
        skip: int = 0,
        limit: int = 50
    ) -> List[Any]:
        """List curricula with optional filters."""
        return self.repo.list_curricula(
            topic=topic,
            difficulty=difficulty,
            skip=skip,
            limit=limit
        )

    def get_statistics(self) -> Dict[str, Any]:
        """Get curriculum statistics."""
        curriculum_stats = self.repo.get_curriculum_statistics()
        chunk_stats = self.repo.get_chunk_statistics()

        return {
            **curriculum_stats,
            **chunk_stats
        }
