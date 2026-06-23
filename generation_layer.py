"""3-Stage AI Generation Layer for Curriculum Development"""

import json
import os
import time
from datetime import datetime
from typing import Dict, Any, Optional
from huggingface_hub import InferenceClient

try:
    # Try relative import first (when used as package)
    from .schemas import (
        GenerationRequest,
        GenerationResult,
        OutlineSchema,
        ElaboratedContent,
        AssessmentSuite,
        Module,
        LessonContent,
        Concept,
        QuizQuestion,
        LessonQuiz,
        CapstoneProject,
    )
except ImportError:
    # Fall back to absolute import (when run as script)
    from schemas import (
        GenerationRequest,
        GenerationResult,
        OutlineSchema,
        ElaboratedContent,
        AssessmentSuite,
        Module,
        LessonContent,
        Concept,
        QuizQuestion,
        LessonQuiz,
        CapstoneProject,
    )


class Stage1OutlineGenerator:
    """Stage 1: Generate high-level course outline with module and lesson structure"""

    def __init__(self, client: InferenceClient, model: str = "mistralai/Mistral-7B-Instruct-v0.1"):
        """Initialize outline generator

        Args:
            client: HuggingFace InferenceClient
            model: Model to use for generation
        """
        self.client = client
        self.model = model

    def generate(self, request: GenerationRequest) -> OutlineSchema:
        """Generate course outline structure

        Args:
            request: Generation request with topic, difficulty, etc.

        Returns:
            OutlineSchema: Verified outline with modules and lessons
        """
        prompt = self._build_outline_prompt(request)

        response = self.client.text_generation(
            prompt,
            max_new_tokens=2048,
            temperature=0.7,
            top_p=0.95,
        )

        response_text = response
        outline_dict = self._extract_json(response_text)

        outline = OutlineSchema(**outline_dict)
        return outline

    def _build_outline_prompt(self, request: GenerationRequest) -> str:
        """Build Stage 1 prompt for outline generation"""
        return f"""Create a course outline for: {request.topic}

Topic: {request.topic}
Difficulty: {request.difficulty.value}
Audience: {request.target_audience}
Duration: {request.duration_weeks} weeks

Design {request.duration_weeks // 2}-{request.duration_weeks}-week course with 4-5 modules.
Each module should have 3-4 lessons.

Return JSON only:
{{
    "title": "Course Title",
    "description": "Brief description",
    "difficulty": "{request.difficulty.value}",
    "target_audience": "string",
    "total_hours": {request.duration_weeks * 10},
    "modules": [
        {{
            "id": "module_1",
            "name": "Module Name",
            "sequence": 1,
            "description": "Module description",
            "estimated_hours": 20,
            "lessons": ["lesson_1_1", "lesson_1_2", "lesson_1_3"]
        }}
    ],
    "learning_objectives": ["Objective 1", "Objective 2", "Objective 3"],
    "prerequisites": []
}}"""

    def _extract_json(self, text: str) -> Dict[str, Any]:
        """Extract JSON from response text"""
        import re

        match = re.search(r'\{[\s\S]*\}', text)
        if match:
            try:
                return json.loads(match.group())
            except json.JSONDecodeError as e:
                raise ValueError(f"Failed to parse JSON: {e}")
        raise ValueError("No JSON found in response")


class Stage2ContentElaborator:
    """Stage 2: Elaborate outline into detailed lesson content"""

    def __init__(self, client: InferenceClient, model: str = "mistralai/Mistral-7B-Instruct-v0.1"):
        """Initialize content elaborator

        Args:
            client: HuggingFace InferenceClient
            model: Model to use for generation
        """
        self.client = client
        self.model = model

    def generate(self, request: GenerationRequest, outline: OutlineSchema) -> ElaboratedContent:
        """Generate detailed lesson content based on outline

        Args:
            request: Original generation request
            outline: Course outline from Stage 1

        Returns:
            ElaboratedContent: Complete lesson content for all modules
        """
        lessons = []
        lesson_counter = 0

        for module in outline.modules:
            module_lessons = self._generate_module_lessons(
                request, outline, module, lesson_counter
            )
            lessons.extend(module_lessons)
            lesson_counter = len(lessons)

        elaborated = ElaboratedContent(
            course_id=self._generate_course_id(),
            outline=outline,
            lessons=lessons,
            total_lessons=len(lessons)
        )
        return elaborated

    def _generate_module_lessons(
        self,
        request: GenerationRequest,
        outline: OutlineSchema,
        module: Module,
        lesson_offset: int
    ) -> list[LessonContent]:
        """Generate lessons for a single module"""
        prompt = self._build_content_prompt(request, outline, module)

        response = self.client.text_generation(
            prompt,
            max_new_tokens=3000,
            temperature=0.7,
            top_p=0.95,
        )

        response_text = response
        lessons_dict = self._extract_json(response_text)

        lessons = []
        for idx, lesson_dict in enumerate(lessons_dict.get("lessons", [])):
            lesson_dict["module_id"] = module.id
            lesson_dict["sequence"] = idx + 1

            # Parse concepts
            if "main_concepts" in lesson_dict:
                concepts = []
                for concept_dict in lesson_dict["main_concepts"]:
                    concepts.append(Concept(**concept_dict))
                lesson_dict["main_concepts"] = concepts

            lesson = LessonContent(**lesson_dict)
            lessons.append(lesson)

        return lessons

    def _build_content_prompt(
        self,
        request: GenerationRequest,
        outline: OutlineSchema,
        module: Module
    ) -> str:
        """Build Stage 2 prompt for content elaboration"""
        return f"""Create detailed lesson content for module: {module.name}

Module: {module.name}
Lessons: {', '.join(module.lessons)}
Hours available: {module.estimated_hours}

For each lesson, create content with:
- Learning objectives
- Introduction
- 3 key concepts (name, explanation, examples)
- Real-world applications
- Misconceptions
- Key takeaways

Return JSON:
{{
    "lessons": [
        {{
            "lesson_id": "lesson_1_1",
            "title": "Lesson Title",
            "learning_objectives": ["Learn X", "Understand Y"],
            "introduction": "Introduction text",
            "main_concepts": [
                {{
                    "name": "Concept Name",
                    "explanation": "Explanation",
                    "bloom_level": "understand",
                    "examples": ["Example 1", "Example 2"]
                }}
            ],
            "real_world_applications": ["Application 1"],
            "common_misconceptions": [{{"misconception": "Wrong idea", "correction": "Right idea"}}],
            "key_takeaways": ["Key point"],
            "estimated_duration_minutes": 45
        }}
    ]
}}"""

    def _extract_json(self, text: str) -> Dict[str, Any]:
        """Extract JSON from response text"""
        import re

        match = re.search(r'\{[\s\S]*\}', text)
        if match:
            try:
                return json.loads(match.group())
            except json.JSONDecodeError as e:
                raise ValueError(f"Failed to parse JSON: {e}")
        raise ValueError("No JSON found in response")

    def _generate_course_id(self) -> str:
        """Generate unique course ID"""
        timestamp = int(time.time() * 1000)
        return f"course-{timestamp}"


class Stage3AssessmentWeaver:
    """Stage 3: Create assessments (quizzes & capstones) based on content"""

    def __init__(self, client: InferenceClient, model: str = "mistralai/Mistral-7B-Instruct-v0.1"):
        """Initialize assessment weaver

        Args:
            client: HuggingFace InferenceClient
            model: Model to use for generation
        """
        self.client = client
        self.model = model

    def generate(
        self,
        request: GenerationRequest,
        outline: OutlineSchema,
        elaborated_content: ElaboratedContent
    ) -> AssessmentSuite:
        """Generate assessment suite based on content

        Args:
            request: Original generation request
            outline: Course outline from Stage 1
            elaborated_content: Elaborated content from Stage 2

        Returns:
            AssessmentSuite: Complete assessment suite with quizzes and capstones
        """
        # Generate lesson quizzes
        lesson_quizzes = []
        for lesson in elaborated_content.lessons:
            quiz = self._generate_lesson_quiz(
                request, outline, lesson, elaborated_content
            )
            lesson_quizzes.append(quiz)

        # Generate capstone projects
        capstone_projects = self._generate_capstones(
            request, outline, elaborated_content
        )

        assessment_suite = AssessmentSuite(
            course_id=elaborated_content.course_id,
            outline=outline,
            elaborated_content=elaborated_content,
            lesson_quizzes=lesson_quizzes,
            capstone_projects=capstone_projects
        )
        return assessment_suite

    def _generate_lesson_quiz(
        self,
        request: GenerationRequest,
        outline: OutlineSchema,
        lesson: LessonContent,
        elaborated_content: ElaboratedContent
    ) -> LessonQuiz:
        """Generate quiz for a single lesson"""
        prompt = self._build_quiz_prompt(request, outline, lesson)

        response = self.client.text_generation(
            prompt,
            max_new_tokens=2000,
            temperature=0.7,
            top_p=0.95,
        )

        response_text = response
        quiz_dict = self._extract_json(response_text)

        # Parse questions
        questions = []
        for q_dict in quiz_dict.get("questions", []):
            question = QuizQuestion(**q_dict)
            questions.append(question)

        lesson_quiz = LessonQuiz(
            lesson_id=lesson.lesson_id,
            quiz_questions=questions,
            estimated_duration_minutes=quiz_dict.get("estimated_duration_minutes", 15)
        )
        return lesson_quiz

    def _generate_capstones(
        self,
        request: GenerationRequest,
        outline: OutlineSchema,
        elaborated_content: ElaboratedContent
    ) -> list[CapstoneProject]:
        """Generate capstone projects for course"""
        prompt = self._build_capstone_prompt(
            request, outline, elaborated_content
        )

        response = self.client.text_generation(
            prompt,
            max_new_tokens=2500,
            temperature=0.7,
            top_p=0.95,
        )

        response_text = response
        capstones_dict = self._extract_json(response_text)

        capstone_projects = []
        for c_dict in capstones_dict.get("capstones", []):
            capstone = CapstoneProject(**c_dict)
            capstone_projects.append(capstone)

        return capstone_projects

    def _build_quiz_prompt(
        self,
        request: GenerationRequest,
        outline: OutlineSchema,
        lesson: LessonContent
    ) -> str:
        """Build Stage 3 prompt for quiz generation"""
        concepts = ', '.join([c.name for c in lesson.main_concepts])
        return f"""Create quiz for lesson: {lesson.title}

Lesson: {lesson.title}
Concepts: {concepts}
Difficulty: {outline.difficulty.value}

Create 4-5 quiz questions (multiple choice, short answer, true/false).
Include clear answers and explanations.

Return JSON:
{{
    "questions": [
        {{
            "id": "q_1",
            "question_text": "What is X?",
            "question_type": "multiple_choice",
            "options": ["Option A", "Option B", "Option C"],
            "correct_answer": "Option A",
            "explanation": "Because...",
            "bloom_level": "understand",
            "difficulty": "{outline.difficulty.value}"
        }}
    ],
    "passing_score_percentage": 70,
    "estimated_duration_minutes": 15
}}"""

    def _build_capstone_prompt(
        self,
        request: GenerationRequest,
        outline: OutlineSchema,
        elaborated_content: ElaboratedContent
    ) -> str:
        """Build prompt for capstone project generation"""
        key_skills = ", ".join([
            c.name for lesson in elaborated_content.lessons
            for c in lesson.main_concepts
        ][:5])

        return f"""Design capstone projects for course: {outline.title}

Course: {outline.title}
Skills: {key_skills}
Duration: {request.duration_weeks} weeks

Create 1-2 capstone projects that integrate course content.
Include requirements, evaluation criteria, learning objectives.

Return JSON:
{{
    "capstones": [
        {{
            "id": "capstone_1",
            "title": "Project Title",
            "description": "Project description",
            "learning_objectives": ["Objective 1"],
            "requirements": ["Requirement 1"],
            "submission_format": "Format description",
            "evaluation_criteria": [{{"criterion": "Quality", "description": "Description"}}],
            "estimated_hours": 40,
            "bloom_levels": ["apply", "analyze", "create"]
        }}
    ]
}}"""

    def _extract_json(self, text: str) -> Dict[str, Any]:
        """Extract JSON from response text"""
        import re

        match = re.search(r'\{[\s\S]*\}', text)
        if match:
            try:
                return json.loads(match.group())
            except json.JSONDecodeError as e:
                raise ValueError(f"Failed to parse JSON: {e}")
        raise ValueError("No JSON found in response")


class AIGenerationLayer:
    """Main orchestrator for 3-stage AI generation pipeline"""

    def __init__(self, model: str = "mistralai/Mistral-7B-Instruct-v0.1"):
        """Initialize generation layer

        Args:
            model: HuggingFace model to use for all stages
        """
        hf_token = os.getenv("HUGGINGFACE_API_KEY")
        if not hf_token:
            raise ValueError("HUGGINGFACE_API_KEY environment variable not set")

        self.client = InferenceClient(api_key=hf_token)
        self.model = model

        self.stage1 = Stage1OutlineGenerator(self.client, model)
        self.stage2 = Stage2ContentElaborator(self.client, model)
        self.stage3 = Stage3AssessmentWeaver(self.client, model)

    def generate(self, request: GenerationRequest) -> GenerationResult:
        """Execute complete 3-stage generation pipeline

        Args:
            request: Generation request with topic, difficulty, duration, etc.

        Returns:
            GenerationResult: Complete result with outline, content, and assessments
        """
        start_time = time.time()

        print(f"[START] Starting 3-stage generation for: {request.topic}")

        # Stage 1: Generate outline
        print("[STAGE1] Generating course outline...")
        outline = self.stage1.generate(request)
        print(f"[OK] Generated outline with {len(outline.modules)} modules")

        # Stage 2: Elaborate content
        print("[STAGE2] Elaborating lesson content...")
        elaborated_content = self.stage2.generate(request, outline)
        print(f"[OK] Generated {elaborated_content.total_lessons} lessons with detailed content")

        # Stage 3: Weave assessments
        print("[STAGE3] Creating assessments...")
        assessments = self.stage3.generate(request, outline, elaborated_content)
        print(f"[OK] Generated {len(assessments.lesson_quizzes)} quizzes and {len(assessments.capstone_projects)} capstones")

        total_duration = time.time() - start_time

        result = GenerationResult(
            request=request,
            stage_1_outline=outline,
            stage_2_content=elaborated_content,
            stage_3_assessments=assessments,
            generation_timestamp=datetime.now().isoformat(),
            total_duration_seconds=total_duration
        )

        print(f"\n[DONE] Generation complete in {total_duration:.1f}s")
        return result
