"""Core AI Research Engine with RAG support"""

import json
import os
from datetime import datetime
from typing import Dict, Any, List, Optional
import anthropic

from .rag_engine import RAGEngine
from .types import (
    ResearchRequest,
    ResearchOutput,
    TopicOverview,
    LearningObjective,
    ConceptNode,
    CurriculumBlock,
    LearningProgression,
    ResearchSource,
    ReasoningStep,
    ConfidenceMetrics,
    BloomLevel,
    DifficultyLevel,
    SourceType,
    WeeklyBlock,
    SkillDevelopment,
)


class AIResearchEngine:
    """Core research engine powered by Claude AI with RAG support"""

    def __init__(
        self, model: str = "claude-opus-4-8", enable_rag: bool = True
    ):
        """Initialize research engine

        Args:
            model: Claude model to use (default: claude-opus-4-8)
            enable_rag: Enable RAG for grounded research (default: True)
        """
        self.client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
        self.model = model
        self.trace_id = self._generate_trace_id()
        self.reasoning_trace: List[ReasoningStep] = []
        self.enable_rag = enable_rag
        self.rag_engine: Optional[RAGEngine] = None
        if enable_rag:
            self.rag_engine = RAGEngine()

    def _generate_trace_id(self) -> str:
        """Generate unique trace ID"""
        import time
        import random
        import string
        timestamp = int(time.time() * 1000)
        random_suffix = "".join(random.choices(string.ascii_lowercase + string.digits, k=9))
        return f"research-{timestamp}-{random_suffix}"

    def _add_reasoning_step(
        self,
        action: str,
        input_data: Dict[str, Any],
        output_data: Dict[str, Any],
        reasoning: str,
    ) -> None:
        """Add step to reasoning trace"""
        step = ReasoningStep(
            step=len(self.reasoning_trace) + 1,
            action=action,
            input=input_data,
            output=output_data,
            reasoning=reasoning,
            timestamp=datetime.now().isoformat(),
        )
        self.reasoning_trace.append(step)

    def _call_claude(self, prompt: str, max_tokens: int = 2048) -> str:
        """Call Claude API"""
        message = self.client.messages.create(
            model=self.model,
            max_tokens=max_tokens,
            messages=[{"role": "user", "content": prompt}],
        )
        return message.content[0].text

    def _extract_json(self, text: str) -> Dict[str, Any]:
        """Extract JSON from response"""
        import re

        # Try to find JSON object
        match = re.search(r"\{.*\}", text, re.DOTALL)
        if match:
            try:
                return json.loads(match.group())
            except json.JSONDecodeError:
                pass

        # Try to find JSON array
        match = re.search(r"\[.*\]", text, re.DOTALL)
        if match:
            try:
                return json.loads(match.group())
            except json.JSONDecodeError:
                pass

        raise ValueError("Could not extract JSON from response")

    async def research(self, request: ResearchRequest) -> ResearchOutput:
        """Execute complete research workflow"""
        start_time = datetime.now()

        # Step 1: Topic Overview
        topic_overview = await self._generate_topic_overview(request)
        self._add_reasoning_step(
            "generate_topic_overview",
            {"topic": request.topic, "difficulty": request.difficulty},
            {"overview": topic_overview.model_dump()},
            f"Generated comprehensive overview of {request.topic} for {request.difficulty} level learners",
        )

        # Step 2: Learning Objectives
        objectives = await self._generate_learning_objectives(request, topic_overview)
        self._add_reasoning_step(
            "generate_learning_objectives",
            {"topic": request.topic, "overview": topic_overview.summary},
            {"count": len(objectives)},
            f"Generated {len(objectives)} Bloom's taxonomy-aligned learning objectives",
        )

        # Step 3: Concepts
        concepts = await self._generate_concepts(request, topic_overview, objectives)
        self._add_reasoning_step(
            "generate_concepts",
            {"topic": request.topic, "objective_count": len(objectives)},
            {"concept_count": len(concepts)},
            f"Identified {len(concepts)} industry-relevant concepts with prerequisite relationships",
        )

        # Step 4: Curriculum Structure
        curriculum = await self._generate_curriculum_structure(request, concepts, objectives)
        self._add_reasoning_step(
            "generate_curriculum_structure",
            {"topic": request.topic, "concepts": len(concepts), "duration": request.duration},
            {"blocks": len(curriculum)},
            f"Structured curriculum into {len(curriculum)} blocks spanning {request.duration} weeks",
        )

        # Step 5: Learning Progression
        progression = await self._generate_learning_progression(request, curriculum, objectives)
        self._add_reasoning_step(
            "generate_learning_progression",
            {"curriculum": len(curriculum)},
            {"weekly_breakdown": len(progression.weekly_breakdown)},
            "Created detailed weekly learning progression with skill development milestones",
        )

        # Step 6: Research Sources
        sources = await self._generate_research_sources(request, topic_overview, concepts)
        self._add_reasoning_step(
            "generate_research_sources",
            {"topic": request.topic},
            {"sources": len(sources)},
            f"Compiled {len(sources)} research sources across academic, industry, and practical domains",
        )

        # Step 7: Confidence Scores
        confidence = self._calculate_confidence_scores(objectives, curriculum, concepts, progression)

        output = ResearchOutput(
            id=self.trace_id,
            timestamp=datetime.now().isoformat(),
            request=request,
            topic_overview=topic_overview,
            learning_objectives=objectives,
            curriculum_structure=curriculum,
            industry_relevant_concepts=concepts,
            learning_progression=progression,
            research_sources=sources,
            reasoning_trace=self.reasoning_trace,
            confidence_scores=confidence,
        )

        elapsed = (datetime.now() - start_time).total_seconds()
        print(f"[Research Complete] Total time: {elapsed:.2f}s")
        print(f"[Trace ID] {self.trace_id}")

        return output

    async def _generate_topic_overview(self, request: ResearchRequest) -> TopicOverview:
        """Generate topic overview with RAG support"""
        base_prompt = f"""
You are an expert curriculum designer. Analyze the following topic and provide a comprehensive overview.

Topic: {request.topic}
Difficulty Level: {request.difficulty}
Target Audience: {request.targetAudience}
Duration: {request.duration} weeks
Tags: {', '.join(request.tags)}

Generate a JSON response with this structure:
{{
  "topic": "string",
  "summary": "2-3 sentence overview",
  "industry_context": "How this is applied in industry",
  "relevance_score": 0.8,
  "key_areas": ["area1", "area2", "area3"],
  "learning_duration_weeks": {request.duration}
}}"""

        # Augment with RAG if enabled
        if self.rag_engine:
            prompt = await self.rag_engine.generate_augmented_prompt(
                base_prompt, request.topic
            )
        else:
            prompt = base_prompt

        response = self._call_claude(prompt, max_tokens=1024)
        data = self._extract_json(response)
        return TopicOverview(**data)

    async def _generate_learning_objectives(
        self, request: ResearchRequest, overview: TopicOverview
    ) -> List[LearningObjective]:
        """Generate learning objectives using Bloom's taxonomy"""
        prompt = f"""
You are an educational specialist creating learning objectives using Bloom's taxonomy.

Topic: {request.topic}
Summary: {overview.summary}
Difficulty: {request.difficulty}
Key Areas: {', '.join(overview.key_areas)}

Create 8-12 learning objectives that progress from remember → understand → apply → analyze → evaluate → create.

Return a JSON array:
[
  {{
    "id": "obj_1",
    "objective": "By the end of this course, learners will be able to...",
    "level": "remember|understand|apply|analyze|evaluate|create",
    "description": "Why this matters and connections"
  }}
]"""

        response = self._call_claude(prompt, max_tokens=2048)
        data = self._extract_json(response)

        # Ensure it's a list
        if not isinstance(data, list):
            data = [data]

        return [LearningObjective(**item) for item in data]

    async def _generate_concepts(
        self,
        request: ResearchRequest,
        overview: TopicOverview,
        objectives: List[LearningObjective],
    ) -> List[ConceptNode]:
        """Generate industry-relevant concepts"""
        prompt = f"""
You are a subject matter expert identifying key concepts and their relationships.

Topic: {request.topic}
Key Areas: {', '.join(overview.key_areas)}
Difficulty: {request.difficulty}

Identify 15-20 core concepts with:
1. Clear prerequisite relationships
2. Industry-relevant applications
3. Appropriate difficulty

Return a JSON array:
[
  {{
    "id": "concept_1",
    "name": "Concept Name",
    "description": "What and why",
    "difficulty": "beginner|intermediate|advanced",
    "prerequisites": ["concept_id1"],
    "applications": ["Real-world app 1", "Real-world app 2"],
    "industry_relevance": 0.85
  }}
]"""

        response = self._call_claude(prompt, max_tokens=3000)
        data = self._extract_json(response)

        if not isinstance(data, list):
            data = [data]

        return [ConceptNode(**item) for item in data]

    async def _generate_curriculum_structure(
        self,
        request: ResearchRequest,
        concepts: List[ConceptNode],
        _objectives: List[LearningObjective],
    ) -> List[CurriculumBlock]:
        """Generate curriculum structure"""
        concept_names = ", ".join([c.name for c in concepts[:10]])
        block_count = max(3, request.duration // 2)

        prompt = f"""
You are a curriculum architect designing a learning path.

Topic: {request.topic}
Duration: {request.duration} weeks
Target Blocks: {block_count}
Concepts: {concept_names}...
Difficulty: {request.difficulty}

Design {block_count} curriculum blocks that progress logically and group related concepts.

Return a JSON array:
[
  {{
    "id": "block_1",
    "sequence": 1,
    "title": "Block Title",
    "duration": 7,
    "concepts": ["concept_name1", "concept_name2"],
    "key_topics": ["Topic 1", "Topic 2"]
  }}
]"""

        response = self._call_claude(prompt, max_tokens=2500)
        data = self._extract_json(response)

        if not isinstance(data, list):
            data = [data]

        blocks = [CurriculumBlock(**item) for item in data]
        # Ensure sequence is correct
        for i, block in enumerate(blocks):
            block.sequence = i + 1
            block.id = f"block_{i + 1}"

        return blocks

    async def _generate_learning_progression(
        self,
        request: ResearchRequest,
        curriculum: List[CurriculumBlock],
        _objectives: List[LearningObjective],
    ) -> LearningProgression:
        """Generate learning progression roadmap"""
        prompt = f"""
You are a learning experience designer creating a detailed progression roadmap.

Topic: {request.topic}
Duration: {request.duration} weeks
Curriculum Blocks: {len(curriculum)}

Create a detailed weekly breakdown and skill development path.

Return a JSON object:
{{
  "total_weeks": {request.duration},
  "weekly_breakdown": [
    {{
      "week": 1,
      "focus": "Introduction to fundamentals",
      "learning_concepts": ["concept1", "concept2"],
      "estimated_hours": 10
    }}
  ],
  "skill_development_path": [
    {{
      "skill": "Skill Name",
      "progression": "foundational|developing|intermediate|advanced",
      "weeks_to_develop": 4,
      "applications": ["App1", "App2"]
    }}
  ]
}}"""

        response = self._call_claude(prompt, max_tokens=3000)
        data = self._extract_json(response)

        weekly_blocks = [WeeklyBlock(**w) for w in data.get("weekly_breakdown", [])]
        skill_paths = [SkillDevelopment(**s) for s in data.get("skill_development_path", [])]

        return LearningProgression(
            total_weeks=request.duration,
            weekly_breakdown=weekly_blocks,
            skill_development_path=skill_paths,
        )

    async def _generate_research_sources(
        self,
        request: ResearchRequest,
        overview: TopicOverview,
        concepts: List[ConceptNode],
    ) -> List[ResearchSource]:
        """Generate research sources with RAG support"""
        # If RAG enabled, use actual retrieved sources
        if self.rag_engine:
            sources = await self.rag_engine.get_research_sources_from_retrieval(
                request.topic, request.topic
            )
            if sources:
                self._add_reasoning_step(
                    "generate_research_sources",
                    {"topic": request.topic},
                    {"sources": len(sources), "from_rag": True},
                    f"Retrieved {len(sources)} research sources from knowledge base and web search",
                )
                return sources

        # Fallback to AI generation if RAG not enabled or returns no results
        prompt = f"""
You are a research librarian compiling authoritative sources.

Topic: {request.topic}
Key Areas: {', '.join(overview.key_areas)}
Difficulty: {request.difficulty}

Recommend 10-15 high-quality resources covering academic, industry, educational, and practical sources.

Return a JSON array:
[
  {{
    "title": "Resource Title",
    "type": "academic|industry|educational|practical",
    "relevance": 0.95,
    "url": "https://example.com",
    "description": "Why valuable and what it covers"
  }}
]"""

        response = self._call_claude(prompt, max_tokens=2000)
        data = self._extract_json(response)

        if not isinstance(data, list):
            data = [data]

        sources = [ResearchSource(**item) for item in data]
        return sources

    def _calculate_confidence_scores(
        self,
        objectives: List[LearningObjective],
        curriculum: List[CurriculumBlock],
        concepts: List[ConceptNode],
        progression: LearningProgression,
    ) -> ConfidenceMetrics:
        """Calculate confidence scores"""
        objective_coverage = len(objectives) / 10  # Base expectation: 10
        curriculum_completeness = 1.0 if curriculum else 0.0
        concept_density = sum(1 for c in concepts if c.industry_relevance > 0.7) / max(1, len(concepts))
        progression_structure = 1.0 if progression.weekly_breakdown else 0.0

        return ConfidenceMetrics(
            curriculum_confidence=min(1.0, (curriculum_completeness + progression_structure) / 2),
            objective_confidence=min(1.0, objective_coverage),
            industry_relevance_confidence=concept_density,
            progression_confidence=progression_structure,
        )

    def get_trace_id(self) -> str:
        """Get trace ID"""
        return self.trace_id

    def get_reasoning_trace(self) -> List[ReasoningStep]:
        """Get reasoning trace"""
        return self.reasoning_trace

    def export_trace_as_markdown(self) -> str:
        """Export trace as markdown"""
        markdown = "# Research Trace Report\n\n"
        markdown += f"**Trace ID**: {self.trace_id}\n\n"

        for step in self.reasoning_trace:
            markdown += f"## Step {step.step}: {step.action}\n\n"
            markdown += f"**Reasoning**: {step.reasoning}\n\n"
            markdown += f"**Input**:\n```json\n{json.dumps(step.input, indent=2)}\n```\n\n"
            markdown += f"**Output Summary**:\n```json\n{json.dumps(step.output, indent=2)}\n```\n\n"
            markdown += f"**Timestamp**: {step.timestamp}\n\n"
            markdown += "---\n\n"

        return markdown
