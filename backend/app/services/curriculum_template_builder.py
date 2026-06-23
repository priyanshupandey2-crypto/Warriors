"""
Curriculum Template Builder
============================

Builds a curriculum-ready template from extracted knowledge packs.

Converts raw extraction results into a structured curriculum template
without using any LLM or generative models.

Uses deterministic logic only:
- Topic cleaning (remove noise)
- Topic normalization (standardize terminology)
- Concept extraction and aggregation
- Noise filtering
- Source breakdown
- Quality metrics
"""

import logging
from typing import Dict, List, Any, Set
from collections import Counter

from app.services.topic_cleaner_service import TopicCleanerService
from app.services.topic_normalization_service import TopicNormalizationService
from app.services.source_ranking_service import SourceRankingService

logger = logging.getLogger(__name__)


class CurriculumTemplateBuilder:
    """Builds curriculum templates from extracted knowledge."""

    # Noise patterns to filter from topics/headings
    NOISE_PATTERNS = {
        "Search",
        "Contact Sales",
        "Report Error",
        "Top Tutorials",
        "Top References",
        "Top Examples",
        "Note",
        "Example",
        "Create a W3Schools account",
        "Get Certified",
        "Try it Yourself",
        "Exercises",
        "Quiz",
        "Contact Us",
        "Follow Us",
        "Share",
        "Subscribe",
        "Newsletter",
        "Advertisement",
        "Sponsored",
        "Related",
        "About",
        "Privacy",
        "Terms",
        "Cookie",
        "Navigation",
        "Footer",
        "More",
        "Previous",
        "Next",
        "Back",
        "Home",
    }

    MIN_TOPIC_LENGTH = 1  # Allow single-word topics (was 2)
    MIN_HEADING_LENGTH = 1  # Allow very short headings (was 3)

    def __init__(self):
        self.logger = logger
        self.cleaner = TopicCleanerService()
        self.normalizer = TopicNormalizationService()
        self.source_ranker = SourceRankingService()

    def build_template(
        self,
        chunks: List[Dict[str, Any]],
        sources: List[Dict[str, Any]],
        topic: str,
        difficulty: str,
    ) -> Dict[str, Any]:
        """
        Build a curriculum template from chunks and sources.

        Pipeline:
        1. Extract raw topics and concepts
        2. Clean noise (navigation, marketing, etc.)
        3. Normalize terminology (remove prefixes, map to canonical)
        4. Score topics by importance
        5. Build curriculum structure (core, advanced, supporting)
        6. Aggregate quality metrics

        Args:
            chunks: List of extracted chunks with heading_path and concepts
            sources: List of sources with source_type
            topic: Learning topic
            difficulty: Difficulty level

        Returns:
            Curriculum template with cleaned, normalized topics
        """
        self.logger.info(f"Building curriculum template for {topic}")

        # Step 1: Extract raw topics
        raw_topics = self._extract_topics(chunks)
        raw_subtopics = self._extract_subtopics(chunks, raw_topics)
        raw_concepts = self._aggregate_concepts(chunks)

        # Step 2: Clean topics (remove noise)
        cleaned_topics = self.cleaner.clean_topics(raw_topics)
        cleaned_subtopics = self.cleaner.clean_subtopics(raw_subtopics)
        cleaned_concepts = self.cleaner.clean_concepts([c["concept"] for c in raw_concepts])

        # Step 3: Normalize topics (standardize terminology)
        normalized_topics = self.normalizer.normalize_topics(cleaned_topics)
        normalized_subtopics = self.normalizer.normalize_subtopics(cleaned_subtopics)

        # Step 4: Score topics by importance
        scored_topics = self._score_topics(normalized_topics, chunks)

        # Step 5: Build curriculum structure
        curriculum_structure = self._build_curriculum_structure(scored_topics)

        # Step 6: Build source breakdown
        source_breakdown = self._build_source_breakdown(chunks, sources)

        # Step 7: Build knowledge pack summary
        knowledge_pack_summary = self._build_knowledge_pack_summary(
            chunks, sources, cleaned_concepts
        )

        # Step 8: Calculate quality metrics
        quality_metrics = self._calculate_quality_metrics(
            len(raw_topics),
            len(cleaned_topics),
            len(raw_concepts),
            len(cleaned_concepts),
        )

        template = {
            "topic": topic,
            "difficulty": difficulty,
            "extracted_topics": normalized_topics,
            "extracted_subtopics": normalized_subtopics,
            "curriculum_structure": curriculum_structure,
            "concept_summary": cleaned_concepts[:20],  # Top 20 concepts
            "source_breakdown": source_breakdown,
            "knowledge_pack_summary": knowledge_pack_summary,
            "quality_metrics": quality_metrics,
        }

        self.logger.info(
            f"Built curriculum template: {len(normalized_topics)} topics, "
            f"{len(cleaned_concepts)} concepts, {quality_metrics['noise_removed']} noise items removed"
        )

        return template

    def _extract_topics(self, chunks: List[Dict[str, Any]]) -> List[str]:
        """
        Extract main learning topics from heading hierarchy.

        Uses top-level headings (first part of heading_path) as topics.
        Filters noise and duplicates.

        Returns:
            Sorted list of unique topics
        """
        topics = set()
        all_headings = []
        filtered_count = 0

        for chunk in chunks:
            heading_path = chunk.get("heading_path", "")
            if not heading_path:
                continue

            # Get main topic (first part before >)
            main_topic = heading_path.split(" > ")[0].strip()
            all_headings.append(main_topic)

            # Skip noise
            if self._is_noise(main_topic):
                filtered_count += 1
                self.logger.debug(f"Filtered noise: {main_topic}")
                continue

            # Skip very short headings
            if len(main_topic) < self.MIN_HEADING_LENGTH:
                filtered_count += 1
                self.logger.debug(f"Filtered (too short): {main_topic}")
                continue

            # Skip if only one word (too generic)
            if len(main_topic.split()) < self.MIN_TOPIC_LENGTH:
                filtered_count += 1
                self.logger.debug(f"Filtered (single word): {main_topic}")
                continue

            topics.add(main_topic)

        # Log extraction statistics
        self.logger.info(
            f"Topic extraction: {len(all_headings)} headings found, "
            f"{filtered_count} filtered, {len(topics)} topics extracted"
        )

        # Sort for consistency
        return sorted(list(topics))

    def _extract_subtopics(
        self, chunks: List[Dict[str, Any]], main_topics: List[str]
    ) -> Dict[str, List[str]]:
        """
        Extract subtopics from heading hierarchy.

        For each main topic, extracts all second-level headings.
        Filters aggressively to keep only meaningful subtopics.

        Returns:
            Dict mapping main_topic -> [subtopics]
        """
        subtopics_map = {topic: set() for topic in main_topics}

        for chunk in chunks:
            heading_path = chunk.get("heading_path", "")
            if not heading_path or " > " not in heading_path:
                continue

            parts = heading_path.split(" > ")
            main_topic = parts[0].strip()

            # Only process known main topics
            if main_topic not in subtopics_map:
                continue

            # Get first-level subtopic
            if len(parts) > 1:
                subtopic = parts[1].strip()

                # Skip noise
                if self._is_noise(subtopic):
                    self.logger.debug(f"Filtered subtopic (noise): {subtopic} under {main_topic}")
                    continue

                # Skip very short
                if len(subtopic) < self.MIN_HEADING_LENGTH:
                    self.logger.debug(f"Filtered subtopic (too short): {subtopic} under {main_topic}")
                    continue

                # Skip if it looks like navigation or boilerplate
                subtopic_lower = subtopic.lower()
                if any(word in subtopic_lower for word in ["help", "improve", "edit", "github", "problem"]):
                    self.logger.debug(f"Filtered subtopic (boilerplate): {subtopic} under {main_topic}")
                    continue

                # Skip if it's markdown formatting
                if subtopic.startswith("**") and subtopic.endswith("**"):
                    clean_subtopic = subtopic.strip("*")
                    self.logger.debug(f"Cleaned markdown from subtopic: {subtopic} -> {clean_subtopic}")
                    subtopic = clean_subtopic

                subtopics_map[main_topic].add(subtopic)

        # Convert sets to sorted lists
        return {topic: sorted(list(subs)) for topic, subs in subtopics_map.items() if subs}

    def _aggregate_concepts(self, chunks: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Aggregate concepts from chunks with frequency counts.

        Extracts concepts from each chunk, counts frequency,
        and returns top concepts.

        Returns:
            List of {concept, frequency} sorted by frequency descending
        """
        concept_counts = Counter()

        for chunk in chunks:
            concepts = chunk.get("concepts", [])
            for concept in concepts:
                if concept and not self._is_noise(concept):
                    concept_counts[concept] += 1

        # Return top 50 concepts by frequency
        top_concepts = [
            {"concept": concept, "frequency": count}
            for concept, count in concept_counts.most_common(50)
        ]

        return top_concepts

    def _build_source_breakdown(
        self, chunks: List[Dict[str, Any]], sources: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """
        Build breakdown of chunks and tokens by source.

        Aggregates statistics by source_type.

        Returns:
            List of {source, chunks, tokens, percentage}
        """
        # Map source_id to source_type
        source_id_to_type = {
            s.get("id"): s.get("source_type", "Unknown") for s in sources
        }

        # Aggregate by source type
        source_stats = {}
        for chunk in chunks:
            source_id = chunk.get("source_id")
            source_type = source_id_to_type.get(source_id, "Unknown")

            if source_type not in source_stats:
                source_stats[source_type] = {"chunks": 0, "tokens": 0}

            source_stats[source_type]["chunks"] += 1
            source_stats[source_type]["tokens"] += chunk.get("token_count", 0)

        # Calculate percentages
        total_chunks = sum(s["chunks"] for s in source_stats.values())
        total_tokens = sum(s["tokens"] for s in source_stats.values())

        breakdown = [
            {
                "source": source_type,
                "chunks": stats["chunks"],
                "tokens": stats["tokens"],
                "chunk_percentage": round((stats["chunks"] / total_chunks * 100), 1)
                if total_chunks > 0
                else 0,
                "token_percentage": round((stats["tokens"] / total_tokens * 100), 1)
                if total_tokens > 0
                else 0,
            }
            for source_type, stats in sorted(
                source_stats.items(), key=lambda x: x[1]["chunks"], reverse=True
            )
        ]

        return breakdown

    def _build_knowledge_pack_summary(
        self, chunks: List[Dict[str, Any]], sources: List[Dict[str, Any]], concepts: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Build overall knowledge pack summary.

        Returns:
            Summary with total counts
        """
        total_tokens = sum(c.get("token_count", 0) for c in chunks)
        unique_sources = set(s.get("source_type") for s in sources)

        return {
            "total_sources": len(sources),
            "unique_source_types": len(unique_sources),
            "total_chunks": len(chunks),
            "total_tokens": total_tokens,
            "total_concepts": len(concepts),
            "average_tokens_per_chunk": round(total_tokens / len(chunks), 1)
            if chunks
            else 0,
        }

    def _score_topics(self, topics: List[str], chunks: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Score topics by frequency and importance."""
        topic_scores = {}

        for chunk in chunks:
            heading_path = chunk.get("heading_path", "")
            if not heading_path:
                continue

            # Get main topic
            main_topic = heading_path.split(" > ")[0].strip()

            # Normalize for scoring
            normalized = self.normalizer._get_canonical_form(
                self.normalizer._remove_prefix(main_topic)
            )

            if normalized and normalized in topics:
                if normalized not in topic_scores:
                    topic_scores[normalized] = {
                        "frequency": 0,
                        "token_count": 0,
                        "chunk_count": 0,
                    }

                topic_scores[normalized]["frequency"] += 1
                topic_scores[normalized]["token_count"] += chunk.get("token_count", 0)
                topic_scores[normalized]["chunk_count"] += 1

        # Calculate composite scores
        scored = []
        for topic, stats in topic_scores.items():
            # Score: frequency (40%) + token count (35%) + depth (25%)
            freq_score = min(stats["frequency"] * 10, 100)
            token_score = min((stats["token_count"] / 100), 100)
            depth_score = min(stats["chunk_count"] * 5, 100)

            composite = (freq_score * 0.4) + (token_score * 0.35) + (depth_score * 0.25)

            scored.append({"topic": topic, "score": round(composite, 1)})

        # Sort by score descending
        scored.sort(key=lambda x: x["score"], reverse=True)
        return scored

    def _build_curriculum_structure(self, scored_topics: List[Dict[str, Any]]) -> Dict[str, List[str]]:
        """Organize topics into core, advanced, and supporting."""
        if not scored_topics:
            return {"core_topics": [], "advanced_topics": [], "supporting_topics": []}

        # Get score range
        scores = [t["score"] for t in scored_topics]
        max_score = max(scores) if scores else 0
        min_score = min(scores) if scores else 0
        score_range = max_score - min_score if max_score != min_score else 1

        # Calculate thresholds
        upper_threshold = min_score + (score_range * 0.67)
        lower_threshold = min_score + (score_range * 0.33)

        structure = {
            "core_topics": [],
            "advanced_topics": [],
            "supporting_topics": [],
        }

        for item in scored_topics:
            topic = item["topic"]
            score = item["score"]

            if score >= upper_threshold:
                structure["core_topics"].append(topic)
            elif score >= lower_threshold:
                structure["advanced_topics"].append(topic)
            else:
                structure["supporting_topics"].append(topic)

        return structure

    def _calculate_quality_metrics(
        self, raw_topics: int, cleaned_topics: int, raw_concepts: int, cleaned_concepts: int
    ) -> Dict[str, Any]:
        """Calculate quality metrics for the curriculum."""
        return {
            "noise_removed": raw_topics - cleaned_topics,
            "topics_discovered": cleaned_topics,
            "concepts_discovered": cleaned_concepts,
            "noise_percentage": round(((raw_topics - cleaned_topics) / raw_topics * 100), 1)
            if raw_topics > 0
            else 0,
        }

    def _is_noise(self, text: str) -> bool:
        """Check if text is a noise pattern."""
        if not text:
            return True

        # Exact match
        if text in self.NOISE_PATTERNS:
            return True

        # Partial match (case-insensitive)
        text_lower = text.lower()
        for pattern in self.NOISE_PATTERNS:
            if pattern.lower() in text_lower:
                return True

        return False
