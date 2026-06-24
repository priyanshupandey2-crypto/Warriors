"""
Curriculum Service - Production Version
========================================

Real curriculum generation using Hugging Face LLM + Firecrawl.

Architecture:
    Routes (routers/curriculum.py)
        ↓
    Service (curriculum_service.py + Hugging Face LLM)
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
from openai import OpenAI

from app.config import settings
from app.services.firecrawl_service import FirecrawlService, ContentSourceType
from app.repositories.curriculum_repository import CurriculumRepository
from app.schemas.curriculum import (
    CurriculumDiscoveryRequest,
    CurriculumResponse,
    URLValidationResponse,
)

logger = logging.getLogger(__name__)

# Initialize Hugging Face client with OpenAI-compatible API
hf_client = OpenAI(
    api_key=settings.HUGGINGFACE_API_KEY,
    base_url=settings.HUGGINGFACE_API_URL
)


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
        self.model = "meta-llama/Llama-2-7b-chat-hf"

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

        # FIX 4: REQUIRE SUFFICIENT EDUCATIONAL CONTENT
        sources = extraction_result["sources"]
        chunks = extraction_result["chunks"]

        # Enforce strict thresholds to prevent invalid content
        min_valid_sources = 1
        min_total_chunks = 3

        if extraction_result["successful"] == 0:
            logger.error(f"Failed to extract any sources for {request.topic}")
            logger.error(f"Failed URLs: {extraction_result.get('errors', [])}")
            raise Exception(
                "Failed to extract content from sources. "
                "Ensure FIRECRAWL_API_KEY is set and accessible."
            )

        if len(sources) < min_valid_sources:
            logger.error(
                f"Insufficient sources: {len(sources)} < {min_valid_sources} required. "
                f"Errors: {extraction_result.get('errors', [])}"
            )
            raise Exception(
                f"Insufficient educational content found. "
                f"Topic '{request.topic}' has no valid sources. "
                f"Please try a different topic."
            )

        if len(chunks) < min_total_chunks:
            logger.error(
                f"Insufficient chunks: {len(chunks)} < {min_total_chunks} required. "
                f"Sources extracted: {len(sources)}"
            )
            raise Exception(
                f"Insufficient educational content extracted for topic '{request.topic}'. "
                f"Content must have at least {min_total_chunks} sections. "
                f"Please try a different topic."
            )

        logger.info(
            f"Content validation passed: {len(sources)} valid sources, "
            f"{len(chunks)} chunks extracted for topic '{request.topic}'"
        )

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
        """
        FIX 1: Semantic URL generation using Claude.

        Instead of blind slug guessing, ask Claude to generate the most likely
        real URLs for this topic across trusted educational sources.
        Falls back to deterministic patterns only as a last resort.
        """
        logger.info(f"Generating semantic source URLs for topic '{topic}' via Claude")

        prompt = f"""You are a curriculum researcher. Generate the most likely real, working URLs for educational content about "{topic}".

Use ONLY these trusted domains:
- geeksforgeeks.org  (e.g. https://www.geeksforgeeks.org/python-tutorial/)
- w3schools.com      (e.g. https://www.w3schools.com/python/)
- developer.mozilla.org (e.g. https://developer.mozilla.org/en-US/docs/Learn/JavaScript)
- javatpoint.com     (e.g. https://www.javatpoint.com/python-tutorial)
- roadmap.sh         (e.g. https://roadmap.sh/python)

Rules:
- Generate 6-10 URLs that most likely EXIST (not 404)
- Prefer index/overview pages (not deep sub-pages)
- Match the exact URL patterns used by each site
- Include the canonical tutorial page for this topic on each site
- For "{topic}", think about what the actual page slug would be

Return ONLY a JSON array of URLs:
["https://...", "https://..."]

No explanations. Only the JSON array."""

        try:
            response = hf_client.chat.completions.create(
                model=self.model,
                max_tokens=600,
                messages=[{"role": "user", "content": prompt}]
            )
            response_text = response.choices[0].message.content.strip()
            json_match = re.search(r'\[.*\]', response_text, re.DOTALL)
            if json_match:
                urls = json.loads(json_match.group())
                urls = [u.strip() for u in urls if isinstance(u, str) and u.startswith("http")]
                logger.info(f"Hugging Face generated {len(urls)} semantic URLs for '{topic}'")
                # Deduplicate preserving order
                seen = set()
                unique_urls = [u for u in urls if not (u in seen or seen.add(u))]
                return unique_urls
        except Exception as e:
            logger.warning(f"Hugging Face URL generation failed: {e}, falling back to patterns")

        # Deterministic fallback (improved - fewer, higher-confidence patterns)
        topic_slug = "-".join(topic.lower().split())
        topic_single = topic.lower().split()[0]
        urls = [
            f"https://www.geeksforgeeks.org/{topic_slug}/",
            f"https://www.geeksforgeeks.org/{topic_single}-tutorial/",
            f"https://www.w3schools.com/{topic_single}/",
            f"https://www.javatpoint.com/{topic_slug}.html",
            f"https://roadmap.sh/{topic_single}",
        ]
        seen = set()
        unique_urls = [u for u in urls if not (u in seen or seen.add(u))]
        logger.info(f"Fallback generated {len(unique_urls)} URLs for '{topic}'")
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
        """
        Semantic topic extraction — robust against thin/ToC-only sources.
        Detects thin content and falls back to knowledge-based generation.
        """
        if not chunks:
            return self._generate_topics_from_knowledge(main_topic, difficulty)

        logger.info(f"Generating semantically rich topics for '{main_topic}' using Claude")

        # Curate: deduplicate by heading, skip thin noise chunks
        seen_headings = set()
        curated_chunks = []
        for chunk in chunks:
            heading = getattr(chunk, 'heading_path', '') or ''
            token_count = getattr(chunk, 'token_count', 0)
            if token_count < 20:
                continue
            heading_key = heading.lower().strip()
            if heading_key and heading_key in seen_headings:
                continue
            if heading_key:
                seen_headings.add(heading_key)
            curated_chunks.append(chunk)

        curated_chunks = sorted(curated_chunks, key=lambda c: getattr(c, 'token_count', 0), reverse=True)[:12]

        # If average tokens < 80, chunks are likely just ToC headings — use knowledge instead
        avg_tokens = sum(getattr(c, 'token_count', 0) for c in curated_chunks) / max(len(curated_chunks), 1)
        if avg_tokens < 80:
            logger.info(f"Chunks are thin (avg {avg_tokens:.0f} tokens) — switching to knowledge-based generation")
            return self._generate_topics_from_knowledge(main_topic, difficulty)

        # Build context from actual content
        chunk_contexts = []
        for chunk in curated_chunks:
            heading_path = getattr(chunk, 'heading_path', '') or 'Root'
            content = getattr(chunk, 'content', '') or ''
            concepts = getattr(chunk, 'concepts', []) or []
            content_preview = content[:400].replace('\n', ' ').strip()
            chunk_contexts.append(
                f"[Section: {heading_path}]\n"
                f"Content: {content_preview}\n"
                f"Key terms: {', '.join(concepts[:8]) if concepts else 'none'}"
            )

        context_text = "\n\n".join(chunk_contexts)
        n_topics = 4 if difficulty.lower() in ('beginner', 'intermediate') else 6

        prompt = (
            f'You are a curriculum designer creating a {difficulty}-level course on "{main_topic}".\n\n'
            f'EXTRACTED EDUCATIONAL CONTENT:\n{context_text}\n\n'
            f'TASK: Identify exactly {n_topics} core LEARNING TOPICS for this course.\n\n'
            f'CRITICAL RULES:\n'
            f'- A learning topic is a TEACHABLE SKILL/CONCEPT, not a document section title\n'
            f'- GOOD: "Pod Lifecycle and Health Checks", "Services and Load Balancing", "Rolling Deployments"\n'
            f'- BAD (FORBIDDEN): "Basics of {main_topic}", "Advanced {main_topic}", "{main_topic} Tutorial"\n'
            f'- NEVER copy section headings verbatim from the content above\n'
            f'- NEVER include "{main_topic}" in the topic name\n'
            f'- Each topic must be 2-6 words, specific, and independently teachable\n'
            f'- Order: foundational first, advanced last\n\n'
            f'Return ONLY a JSON array of exactly {n_topics} topics:\n'
            f'["Topic 1", "Topic 2", "Topic 3", "Topic 4"]'
        )

        try:
            response = hf_client.chat.completions.create(
                model=self.model,
                max_tokens=600,
                messages=[{"role": "user", "content": prompt}]
            )
            response_text = response.choices[0].message.content.strip()
            json_match = re.search(r'\[.*\]', response_text, re.DOTALL)
            if json_match:
                topics = json.loads(json_match.group())
                bad_patterns = ["basics of", "advanced", "tutorial", "overview",
                                "introduction", "getting started", main_topic.lower()]
                topics = [
                    t.strip() for t in topics
                    if isinstance(t, str) and t.strip() and len(t.split()) >= 2
                    and not any(t.lower().startswith(p) for p in bad_patterns)
                ]
                if topics:
                    logger.info(f"Hugging Face generated {len(topics)} semantic topics for '{main_topic}'")
                    return topics
        except Exception as e:
            logger.warning(f"Hugging Face topic generation failed: {e}")

        return self._generate_topics_from_knowledge(main_topic, difficulty)

    def _generate_topics_from_knowledge(self, main_topic: str, difficulty: str) -> List[str]:
        """
        Generate high-quality topics from Claude's own knowledge.
        Used when extracted content is thin, ToC-only, or unavailable.
        """
        logger.info(f"Generating topics from Claude knowledge for '{main_topic}' ({difficulty})")
        n_topics = 4 if difficulty.lower() in ('beginner', 'intermediate') else 6

        prompt = (
            f'You are a senior software engineering educator designing a {difficulty}-level course on "{main_topic}".\n\n'
            f'Generate exactly {n_topics} core learning topics for this course.\n\n'
            f'Requirements:\n'
            f'- Each topic is a specific, teachable skill/concept (not a vague category)\n'
            f'- Topics progress from foundational to advanced\n'
            f'- Each topic is 2-6 words\n'
            f'- NEVER include "{main_topic}" in the topic name\n'
            f'- NEVER use: "Introduction", "Overview", "Basics", "Advanced {main_topic}", "Tutorial"\n'
            f'- Think: what must a student actually learn and practice to become competent?\n\n'
            f'Example for "Kubernetes" beginner: ["Container Orchestration Concepts", '
            f'"Pod Lifecycle and Health Checks", "Services and Load Balancing", '
            f'"ConfigMaps and Environment Variables"]\n\n'
            f'Now generate {n_topics} topics for "{main_topic}" at {difficulty} level.\n'
            f'Return ONLY a JSON array: ["Topic 1", "Topic 2", ...]'
        )

        try:
            response = hf_client.chat.completions.create(
                model=self.model,
                max_tokens=500,
                messages=[{"role": "user", "content": prompt}]
            )
            response_text = response.choices[0].message.content.strip()
            json_match = re.search(r'\[.*\]', response_text, re.DOTALL)
            if json_match:
                topics = json.loads(json_match.group())
                topics = [t.strip() for t in topics if isinstance(t, str) and t.strip() and len(t.split()) >= 2]
                if topics:
                    logger.info(f"Knowledge-based: {len(topics)} topics for '{main_topic}'")
                    return topics
        except Exception as e:
            logger.warning(f"Knowledge-based topic generation failed: {e}")

        return self._extract_topics_heuristic([])

    def _extract_topics_heuristic(self, chunks: List[Any]) -> List[str]:
        """
        Heuristic fallback: derive topics from heading hierarchy (not raw concept words).
        Uses H1/H2 heading paths as proxies for actual learning topics.
        """
        from collections import Counter

        # Collect heading segments at depth 1-2 (most meaningful structural topics)
        heading_freq: Counter = Counter()
        for chunk in chunks:
            heading_path = getattr(chunk, 'heading_path', '') or ''
            if ' > ' in heading_path:
                # Take the second-level heading (most likely a real topic)
                parts = heading_path.split(' > ')
                candidate = parts[1].strip() if len(parts) > 1 else parts[0].strip()
            else:
                candidate = heading_path.strip()

            if candidate and len(candidate.split()) >= 2 and len(candidate) > 5:
                # Filter obvious navigation
                if not any(g in candidate.lower() for g in ["introduction", "overview", "tutorial", "home", "login"]):
                    heading_freq[candidate] += 1

        top_topics = [h for h, _ in heading_freq.most_common(6)]
        if top_topics:
            return top_topics

        # Last resort concept fallback
        concept_freq: Counter = Counter()
        for chunk in chunks:
            concepts = getattr(chunk, 'concepts', []) or []
            for concept in concepts:
                if concept and len(concept.split()) >= 2:
                    concept_freq[concept] += 1

        top_concepts = [c for c, _ in concept_freq.most_common(6)]
        return top_concepts if top_concepts else ["Core Concepts", "Practical Application", "Advanced Patterns"]

    def _extract_curriculum_subtopics(self, chunks: List[Any], topics: List[str]) -> Dict[str, List[str]]:
        """
        Real subtopic discovery. Uses content-grounded approach when chunks are rich,
        falls back to Claude knowledge-based generation when content is thin.
        """
        subtopics = {}

        # Build lookup: chunk data for relevance matching
        chunk_data = []
        for chunk in chunks:
            heading = getattr(chunk, 'heading_path', '') or ''
            content = getattr(chunk, 'content', '') or ''
            concepts = getattr(chunk, 'concepts', []) or []
            token_count = getattr(chunk, 'token_count', 0)
            if token_count >= 20:
                chunk_data.append({
                    "heading": heading,
                    "content_preview": content[:300],
                    "concepts": concepts[:6],
                    "tokens": token_count,
                })

        # Determine if we have real content or just ToC
        avg_tokens = sum(cd["tokens"] for cd in chunk_data) / max(len(chunk_data), 1) if chunk_data else 0
        use_knowledge_mode = avg_tokens < 80

        if use_knowledge_mode:
            logger.info(f"Thin content (avg {avg_tokens:.0f} tokens) — using knowledge-based subtopics")

        for topic in topics:
            if use_knowledge_mode or not chunk_data:
                # Knowledge-based: ask Claude to generate subtopics from its training
                subtopics[topic] = self._generate_subtopics_from_knowledge(topic)
                continue

            # Find chunks relevant to this topic
            topic_words = set(topic.lower().split())
            relevant = []
            for cd in chunk_data:
                heading_words = set(cd["heading"].lower().split())
                concept_words = set(w.lower() for c in cd["concepts"] for w in c.split())
                overlap = len(topic_words & (heading_words | concept_words))
                if overlap > 0:
                    relevant.append((overlap, cd))

            relevant.sort(key=lambda x: x[0], reverse=True)
            top_chunks = [cd for _, cd in relevant[:5]] or chunk_data[:5]

            context = "\n".join(
                f"[{cd['heading']}]: {cd['content_preview']} | terms: {', '.join(cd['concepts'])}"
                for cd in top_chunks
            )

            prompt = (
                f'You are a curriculum designer breaking down the learning topic "{topic}" into subtopics.\n\n'
                f'Relevant content:\n{context}\n\n'
                f'TASK: Generate 3-4 specific subtopics for "{topic}".\n'
                f'Each subtopic must be a concrete, teachable unit — NOT a generic label.\n'
                f'FORBIDDEN: "Introduction", "Basics", "Advanced", "Overview", any heading copied verbatim.\n'
                f'Return ONLY a JSON array: ["Subtopic 1", "Subtopic 2", "Subtopic 3"]'
            )

            try:
                response = hf_client.chat.completions.create(
                    model=self.model,
                    max_tokens=300,
                    messages=[{"role": "user", "content": prompt}]
                )
                response_text = response.choices[0].message.content.strip()
                json_match = re.search(r'\[.*\]', response_text, re.DOTALL)
                if json_match:
                    subs = json.loads(json_match.group())
                    bad = ["fundamentals of", "core concepts", "advanced topics",
                           "introduction to", "basics of", "overview of"]
                    filtered = [
                        s.strip() for s in subs
                        if isinstance(s, str) and s.strip()
                        and len(s.split()) >= 2
                        and not any(s.lower().startswith(b) for b in bad)
                    ]
                    if filtered:
                        subtopics[topic] = filtered
                        logger.info(f"Content-grounded subtopics for '{topic}': {filtered}")
                        continue
            except Exception as e:
                logger.debug(f"Subtopic generation failed for '{topic}': {e}")

            # Fallback to knowledge
            subtopics[topic] = self._generate_subtopics_from_knowledge(topic)

        return subtopics

    def _generate_subtopics_from_knowledge(self, topic: str) -> List[str]:
        """Generate subtopics from Claude knowledge when content is unavailable."""
        prompt = (
            f'Break down the learning topic "{topic}" into 3-4 concrete, teachable subtopics.\n\n'
            f'Requirements:\n'
            f'- Each subtopic is a specific skill or concept, not a vague category\n'
            f'- FORBIDDEN: "Introduction to X", "Basics of X", "Advanced X", "Overview"\n'
            f'- Each subtopic should be 3-7 words\n'
            f'- Order: fundamental mechanics first, application/edge-cases last\n\n'
            f'Return ONLY a JSON array: ["Subtopic 1", "Subtopic 2", "Subtopic 3"]'
        )
        try:
            response = hf_client.chat.completions.create(
                model=self.model,
                max_tokens=300,
                messages=[{"role": "user", "content": prompt}]
            )
            response_text = response.choices[0].message.content.strip()
            json_match = re.search(r'\[.*\]', response_text, re.DOTALL)
            if json_match:
                subs = json.loads(json_match.group())
                result = [s.strip() for s in subs if isinstance(s, str) and s.strip() and len(s.split()) >= 2]
                if result:
                    logger.info(f"Knowledge subtopics for '{topic}': {result}")
                    return result
        except Exception as e:
            logger.debug(f"Knowledge subtopic gen failed for '{topic}': {e}")

        # Absolute last resort — derive from topic words, not generic placeholders
        words = topic.split()
        main_concept = words[-1] if len(words) > 1 else topic
        return [
            f"{main_concept} Architecture and Design",
            f"Configuring and Managing {main_concept}",
            f"{main_concept} Troubleshooting and Debugging",
        ]

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
            # FIX: get all chunks once and group by source_id (not source_url which doesn't exist on DB model)
            all_chunks = self.repo.get_chunks_for_curriculum(curriculum.id)
            chunks_by_source_id = {}
            for c in all_chunks:
                chunks_by_source_id.setdefault(c.source_id, 0)
                chunks_by_source_id[c.source_id] += 1

            for source in sources[:curriculum.sources_count]:
                source_breakdown.append({
                    "url": getattr(source, 'url', ''),
                    "type": getattr(source, 'source_type', 'Unknown'),
                    "chunks_count": chunks_by_source_id.get(source.id, 0),  # FIX: use source.id not source_url
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