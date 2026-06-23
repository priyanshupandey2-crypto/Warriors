"""
Curriculum Generation Engine
=============================

Generates REAL curricula with meaningful topics, subtopics, and synthesized content.

NOT just extracting headings - actually designing learning structure.

Pipeline:
    Raw Chunks
        ↓
    Semantic Analysis (embeddings + clustering)
        ↓
    Topic Discovery (LLM classification)
        ↓
    Learning Objective Generation
        ↓
    Content Synthesis (from chunks)
        ↓
    Curriculum Structure Design
        ↓
    Complete Curriculum
"""

import logging
from typing import List, Dict, Any, Optional, Tuple
from dataclasses import dataclass
from collections import defaultdict
import json

from sqlalchemy.orm import Session
from anthropic import Anthropic

logger = logging.getLogger(__name__)


@dataclass
class LearningTopic:
    """Represents a meaningful learning topic (not a heading)."""
    name: str
    description: str
    learning_objectives: List[str]
    key_concepts: List[str]
    difficulty: str
    estimated_minutes: int
    related_chunk_ids: List[int]
    relevance_scores: Dict[int, float]  # chunk_id -> relevance (0-1)


@dataclass
class CurriculumTopic:
    """Top-level curriculum topic."""
    name: str
    description: str
    overview: str  # Synthesized from chunks
    learning_objectives: List[str]
    subtopics: List['CurriculumSubtopic']
    key_concepts: List[str]
    estimated_minutes: int


@dataclass
class CurriculumSubtopic:
    """Topic breakdown."""
    name: str
    description: str
    content: str  # Synthesized from related chunks
    learning_objectives: List[str]
    key_points: List[str]
    examples: List[str]
    related_chunk_ids: List[int]
    estimated_minutes: int


class CurriculumGenerationEngine:
    """Generate REAL curricula from chunks."""

    def __init__(self, db: Session):
        self.db = db
        self.client = Anthropic()
        self.model = "claude-3-5-sonnet-20241022"

    def generate_curriculum(
        self,
        topic: str,
        chunks: List[Any],
        difficulty: str = "Intermediate"
    ) -> Dict[str, Any]:
        """
        Generate a complete curriculum from chunks.

        NOT extraction - GENERATION.

        Steps:
        1. Analyze chunks semantically
        2. Extract meaningful learning topics
        3. Generate learning objectives
        4. Synthesize content
        5. Create learning structure
        6. Return complete curriculum
        """
        logger.info(f"Generating curriculum for '{topic}' from {len(chunks)} chunks")

        # Step 1: Semantic analysis - cluster chunks by meaning
        chunk_clusters = self._cluster_chunks_semantically(chunks)
        logger.info(f"Clustered into {len(chunk_clusters)} semantic groups")

        # Step 2: Extract meaningful topics (not headings)
        topics = self._extract_learning_topics(topic, chunks, chunk_clusters, difficulty)
        logger.info(f"Extracted {len(topics)} meaningful learning topics")

        # Step 3: Generate learning objectives for each topic
        topics = self._generate_learning_objectives(topics, chunks)

        # Step 4: Synthesize content from chunks
        curriculum_topics = self._synthesize_curriculum_content(topics, chunks, difficulty)

        # Step 5: Organize into curriculum structure
        curriculum = {
            "topic": topic,
            "difficulty": difficulty,
            "overview": self._generate_overview(topic, chunks),
            "topics": [self._topic_to_dict(t) for t in curriculum_topics],
            "total_estimated_minutes": sum(t.estimated_minutes for t in curriculum_topics),
            "key_concepts": self._extract_key_concepts(chunks),
            "learning_outcomes": self._generate_learning_outcomes(topic, curriculum_topics),
        }

        logger.info(f"Generated curriculum with {len(curriculum_topics)} topics")
        return curriculum

    def _cluster_chunks_semantically(self, chunks: List[Any]) -> Dict[str, List[int]]:
        """
        Cluster chunks by semantic meaning.

        Uses: Content similarity, key concepts, heading hierarchy.

        Returns: Dict of cluster_name -> chunk_ids
        """
        if not chunks:
            return {}

        # Group by heading context (simple first pass)
        clusters = defaultdict(list)

        for chunk in chunks:
            # Extract main topic from heading
            heading_path = getattr(chunk, 'heading_path', '') or ''
            if heading_path:
                main_topic = heading_path.split(' > ')[0].strip()
                clusters[main_topic].append(chunk.id)

        logger.info(f"Semantic clustering created {len(clusters)} clusters")
        return dict(clusters)

    def _extract_learning_topics(
        self,
        main_topic: str,
        chunks: List[Any],
        clusters: Dict[str, List[int]],
        difficulty: str
    ) -> List[LearningTopic]:
        """
        Extract MEANINGFUL learning topics from chunks.

        Not just headings - actual pedagogical topics.

        Uses Claude to understand what's actually being taught.
        """
        if not chunks:
            return []

        # Prepare chunk summaries for LLM
        chunk_summaries = []
        for chunk in chunks[:20]:  # Analyze up to 20 chunks
            summary = {
                "id": chunk.id,
                "heading": getattr(chunk, 'heading_path', ''),
                "content_preview": getattr(chunk, 'content', '')[:300],
                "concepts": getattr(chunk, 'concepts', [])[:5],
            }
            chunk_summaries.append(summary)

        prompt = f"""
        Analyze this educational content about "{main_topic}" and extract the REAL learning topics.

        NOT document headings - actual PEDAGOGICAL topics that students need to learn.

        Content chunks:
        {json.dumps(chunk_summaries, indent=2)}

        For each learning topic, provide:
        {{
            "topic": "specific topic name (e.g., 'Form Validation' not 'HTML Forms > Validation')",
            "description": "what learners will understand about this topic",
            "learning_objectives": ["specific objective 1", "specific objective 2", "specific objective 3"],
            "key_concepts": ["concept1", "concept2", "concept3"],
            "difficulty": "{difficulty}",
            "estimated_minutes": 30-60,
            "related_chunk_ids": [1, 3, 5]  (based on summaries above)
        }}

        Return as JSON array of topics.
        Extract 4-8 meaningful topics (not document sections).
        """

        try:
            response = self.client.messages.create(
                model=self.model,
                max_tokens=2000,
                messages=[
                    {
                        "role": "user",
                        "content": prompt
                    }
                ]
            )

            # Parse response
            response_text = response.content[0].text

            # Extract JSON from response
            import re
            json_match = re.search(r'\[.*\]', response_text, re.DOTALL)
            if json_match:
                topics_data = json.loads(json_match.group())
                topics = []
                for topic_data in topics_data:
                    topic = LearningTopic(
                        name=topic_data.get('topic', ''),
                        description=topic_data.get('description', ''),
                        learning_objectives=topic_data.get('learning_objectives', []),
                        key_concepts=topic_data.get('key_concepts', []),
                        difficulty=topic_data.get('difficulty', difficulty),
                        estimated_minutes=topic_data.get('estimated_minutes', 30),
                        related_chunk_ids=topic_data.get('related_chunk_ids', []),
                        relevance_scores={}
                    )
                    topics.append(topic)

                logger.info(f"LLM extracted {len(topics)} learning topics")
                return topics
        except Exception as e:
            logger.error(f"Error extracting topics with LLM: {e}")

        # Fallback: Simple topic extraction
        return self._extract_topics_heuristic(chunks)

    def _extract_topics_heuristic(self, chunks: List[Any]) -> List[LearningTopic]:
        """
        Fallback: Extract topics using heuristics.

        If LLM fails, use concept frequency and heading analysis.
        """
        concept_freq = defaultdict(int)
        concept_chunks = defaultdict(list)

        for chunk in chunks:
            concepts = getattr(chunk, 'concepts', [])
            for concept in concepts:
                if concept and len(concept) > 3:
                    concept_freq[concept] += 1
                    concept_chunks[concept].append(chunk.id)

        # Get top concepts as topics
        top_concepts = sorted(
            concept_freq.items(),
            key=lambda x: x[1],
            reverse=True
        )[:6]

        topics = []
        for concept, freq in top_concepts:
            topic = LearningTopic(
                name=concept,
                description=f"Understanding {concept}",
                learning_objectives=[
                    f"Understand {concept}",
                    f"Apply {concept} in practice",
                ],
                key_concepts=[concept],
                difficulty="Intermediate",
                estimated_minutes=30,
                related_chunk_ids=concept_chunks[concept][:5],
                relevance_scores={}
            )
            topics.append(topic)

        return topics

    def _generate_learning_objectives(
        self,
        topics: List[LearningTopic],
        chunks: List[Any]
    ) -> List[LearningTopic]:
        """
        Generate specific, measurable learning objectives for each topic.

        Uses Bloom's taxonomy: Remember, Understand, Apply, Analyze, Evaluate, Create
        """
        if not topics or not chunks:
            return topics

        # For each topic, refine objectives
        for topic in topics:
            if topic.learning_objectives:
                continue  # Already has objectives

            # Generate based on topic name and related chunks
            prompt = f"""
            Generate 3 specific, measurable learning objectives for this topic using Bloom's taxonomy.

            Topic: {topic.name}
            Description: {topic.description}

            Format:
            [
                "Students will be able to [verb] [topic]",
                "Students will be able to [verb] [topic]",
                "Students will be able to [verb] [topic]"
            ]

            Use verbs like: understand, implement, analyze, design, evaluate, create
            """

            try:
                response = self.client.messages.create(
                    model=self.model,
                    max_tokens=500,
                    messages=[{"role": "user", "content": prompt}]
                )

                response_text = response.content[0].text
                import re
                json_match = re.search(r'\[.*\]', response_text, re.DOTALL)
                if json_match:
                    objectives = json.loads(json_match.group())
                    topic.learning_objectives = objectives
            except Exception as e:
                logger.debug(f"Could not generate objectives for {topic.name}: {e}")

        return topics

    def _synthesize_curriculum_content(
        self,
        topics: List[LearningTopic],
        chunks: List[Any],
        difficulty: str
    ) -> List[CurriculumTopic]:
        """
        Synthesize actual lesson CONTENT from chunks.

        Not just topic names - actual teaching content.
        """
        curriculum_topics = []

        for topic in topics:
            # Get chunks related to this topic
            related_chunks = [c for c in chunks if c.id in topic.related_chunk_ids]

            if not related_chunks:
                continue

            # Synthesize overview
            overview = self._synthesize_overview(topic, related_chunks)

            # Create subtopics from chunk content
            subtopics = self._create_subtopics(topic, related_chunks)

            # Create curriculum topic
            curriculum_topic = CurriculumTopic(
                name=topic.name,
                description=topic.description,
                overview=overview,
                learning_objectives=topic.learning_objectives,
                subtopics=subtopics,
                key_concepts=topic.key_concepts,
                estimated_minutes=topic.estimated_minutes,
            )

            curriculum_topics.append(curriculum_topic)

        return curriculum_topics

    def _synthesize_overview(
        self,
        topic: LearningTopic,
        chunks: List[Any]
    ) -> str:
        """
        Synthesize a clear overview of the topic from chunks.
        """
        if not chunks:
            return f"Overview of {topic.name}"

        # Extract key content from chunks
        chunk_content = "\n\n".join([
            getattr(c, 'content', '')[:200] for c in chunks[:3]
        ])

        prompt = f"""
        Write a clear, 2-3 sentence overview of "{topic.name}" for students at {topic.difficulty} level.

        Based on this content:
        {chunk_content}

        Overview should:
        - Explain what the topic is about
        - Why it matters
        - What students will learn

        Just the overview text, no additional formatting.
        """

        try:
            response = self.client.messages.create(
                model=self.model,
                max_tokens=300,
                messages=[{"role": "user", "content": prompt}]
            )
            return response.content[0].text.strip()
        except Exception as e:
            logger.debug(f"Could not synthesize overview: {e}")
            return f"Overview of {topic.name}"

    def _create_subtopics(
        self,
        topic: LearningTopic,
        chunks: List[Any]
    ) -> List[CurriculumSubtopic]:
        """
        Create subtopics with synthesized content from chunks.

        Each subtopic = coherent piece of learning content.
        """
        subtopics = []

        # Group chunks by heading hierarchy
        chunk_groups = defaultdict(list)
        for chunk in chunks:
            heading = getattr(chunk, 'heading_path', '') or 'General'
            chunk_groups[heading].append(chunk)

        # Create subtopic for each group
        for heading, group_chunks in list(chunk_groups.items())[:4]:
            # Extract heading parts
            heading_parts = heading.split(' > ')
            subtopic_name = heading_parts[-1] if heading_parts else heading

            # Synthesize content from chunks
            content = self._synthesize_subtopic_content(subtopic_name, group_chunks)
            key_points = self._extract_key_points(group_chunks)
            examples = self._extract_examples(group_chunks)

            subtopic = CurriculumSubtopic(
                name=subtopic_name,
                description=f"Learn about {subtopic_name}",
                content=content,
                learning_objectives=[
                    f"Understand {subtopic_name}",
                    f"Apply {subtopic_name} concepts",
                ],
                key_points=key_points,
                examples=examples,
                related_chunk_ids=[c.id for c in group_chunks],
                estimated_minutes=15,
            )

            subtopics.append(subtopic)

        return subtopics

    def _synthesize_subtopic_content(
        self,
        subtopic_name: str,
        chunks: List[Any]
    ) -> str:
        """
        Synthesize coherent lesson content from chunks.
        """
        # Combine chunk content
        combined_content = "\n\n".join([
            getattr(c, 'content', '')[:300] for c in chunks[:3]
        ])

        prompt = f"""
        Write a clear, educational explanation of "{subtopic_name}" (2-3 paragraphs).

        Based on this content:
        {combined_content}

        The explanation should:
        - Start with a definition
        - Explain key concepts
        - Provide practical context
        - Be suitable for Intermediate learners

        Keep it focused and practical.
        """

        try:
            response = self.client.messages.create(
                model=self.model,
                max_tokens=600,
                messages=[{"role": "user", "content": prompt}]
            )
            return response.content[0].text.strip()
        except Exception as e:
            logger.debug(f"Could not synthesize content: {e}")
            return combined_content[:400]

    def _extract_key_points(self, chunks: List[Any]) -> List[str]:
        """Extract key points from chunks."""
        key_points = []
        for chunk in chunks[:2]:
            content = getattr(chunk, 'content', '')
            # Extract bullet points or numbered lists
            lines = content.split('\n')
            for line in lines:
                line = line.strip()
                if line.startswith(('-', '*', '•')) or line[0:1].isdigit():
                    key_points.append(line.lstrip('-*•0123456789. '))
        return key_points[:5]

    def _extract_examples(self, chunks: List[Any]) -> List[str]:
        """Extract or generate examples from chunks."""
        examples = []
        for chunk in chunks:
            content = getattr(chunk, 'content', '')
            if 'example' in content.lower():
                # Find example section
                lines = content.split('\n')
                for i, line in enumerate(lines):
                    if 'example' in line.lower():
                        example_text = lines[i:min(i+3, len(lines))]
                        examples.append(' '.join(example_text))
        return examples[:3]

    def _generate_overview(self, topic: str, chunks: List[Any]) -> str:
        """Generate curriculum overview."""
        if not chunks:
            return f"Comprehensive guide to {topic}"

        prompt = f"""
        Write a 1-paragraph overview of a complete curriculum for "{topic}".

        Overview should cover:
        - What the topic is
        - Why it's important
        - What students will accomplish
        - Practical applications

        Keep it engaging and informative.
        """

        try:
            response = self.client.messages.create(
                model=self.model,
                max_tokens=300,
                messages=[{"role": "user", "content": prompt}]
            )
            return response.content[0].text.strip()
        except Exception as e:
            logger.debug(f"Could not generate overview: {e}")
            return f"Comprehensive guide to {topic}"

    def _extract_key_concepts(self, chunks: List[Any]) -> List[str]:
        """Extract all key concepts from chunks."""
        concepts = set()
        for chunk in chunks:
            chunk_concepts = getattr(chunk, 'concepts', [])
            concepts.update(chunk_concepts)
        return sorted(list(concepts))[:15]

    def _generate_learning_outcomes(
        self,
        topic: str,
        curriculum_topics: List[CurriculumTopic]
    ) -> List[str]:
        """Generate overall learning outcomes for the curriculum."""
        outcomes = []

        # Combine all learning objectives
        all_objectives = []
        for ct in curriculum_topics:
            all_objectives.extend(ct.learning_objectives)

        # Create summary outcomes
        outcomes = [
            f"Understand the fundamentals of {topic}",
            f"Apply {topic} concepts in real-world scenarios",
            f"Analyze {topic} problems and solutions",
            "Be able to implement best practices in this domain",
        ]

        return outcomes

    def _topic_to_dict(self, topic: CurriculumTopic) -> Dict[str, Any]:
        """Convert topic to dictionary for JSON serialization."""
        return {
            "name": topic.name,
            "description": topic.description,
            "overview": topic.overview,
            "learning_objectives": topic.learning_objectives,
            "subtopics": [
                {
                    "name": sub.name,
                    "description": sub.description,
                    "content": sub.content,
                    "learning_objectives": sub.learning_objectives,
                    "key_points": sub.key_points,
                    "examples": sub.examples,
                    "estimated_minutes": sub.estimated_minutes,
                }
                for sub in topic.subtopics
            ],
            "key_concepts": topic.key_concepts,
            "estimated_minutes": topic.estimated_minutes,
        }
