"""
Course Generation Router
========================

API endpoints for user course generation requests.
Handles submission, retrieval, and admin review of generated courses.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from datetime import datetime
import json
from app.database import get_db
from app.utils.dependencies import get_current_user, get_admin_user
from app.utils.audit import log_audit
from app.logger import get_logger

logger = get_logger(__name__)
router = APIRouter(prefix="/api/course-generation", tags=["course-generation"])


class CourseGenerationRequest(BaseModel):
    topic: str
    difficulty_level: str
    learning_duration: str
    expertise_domain: str
    relevant_tags: str


class GeneratedCoursePublish(BaseModel):
    status: str
    feedback: str = ""


def generate_mock_course_data(topic: str, difficulty: str, duration: str, tags: str):
    """
    Mock course data generation.
    In production, this would call the AI layer.
    """
    return {
        "title": topic,
        "description": f"A {difficulty} level course on {topic}",
        "difficulty": difficulty,
        "duration_hours": 10,
        "category": "Computer Science",
        "modules": [
            {
                "title": f"Module 1: Introduction to {topic}",
                "description": f"Getting started with {topic}",
                "lessons": [
                    {
                        "title": f"Lesson 1: {topic} Basics",
                        "content_markdown": f"# {topic} Basics\n\nThis is an introduction to {topic}.",
                        "duration_minutes": 30,
                        "learning_objectives": f"Understand the fundamentals of {topic}",
                        "key_concepts": "basics, introduction, fundamentals"
                    },
                    {
                        "title": f"Lesson 2: Core Concepts",
                        "content_markdown": f"# Core Concepts of {topic}\n\nLet's explore the core concepts.",
                        "duration_minutes": 45,
                        "learning_objectives": f"Learn key concepts in {topic}",
                        "key_concepts": "concepts, theory, principles"
                    }
                ],
                "quizzes": [
                    {
                        "title": f"{topic} Basics Quiz",
                        "description": f"Test your knowledge of {topic} basics",
                        "passing_score": 70,
                        "total_points": 100,
                        "duration_minutes": 15,
                        "questions": [
                            {
                                "question": f"What is the primary purpose of {topic}?",
                                "options": [
                                    "To enhance learning and understanding",
                                    "To provide a structured approach",
                                    "Both of the above",
                                    "Neither of the above"
                                ],
                                "correctIndex": 2,
                                "explanation": f"{topic} serves both to enhance learning and provide a structured approach to the subject matter."
                            },
                            {
                                "question": f"Which of these is a key principle of {topic}?",
                                "options": [
                                    "Consistency",
                                    "Clarity",
                                    "Practical application",
                                    "All of the above"
                                ],
                                "correctIndex": 3,
                                "explanation": f"All of these are fundamental principles of {topic}."
                            },
                            {
                                "question": f"How would you apply {topic} in a real-world scenario?",
                                "options": [
                                    "By following best practices",
                                    "By adapting to your specific context",
                                    "By continuous learning and improvement",
                                    "All of the above"
                                ],
                                "correctIndex": 3,
                                "explanation": f"Effective application of {topic} requires all three approaches combined."
                            },
                            {
                                "question": f"What is the main challenge when learning {topic}?",
                                "options": [
                                    "Understanding the theory",
                                    "Practical implementation",
                                    "Finding real-world examples",
                                    "Bridging the gap between theory and practice"
                                ],
                                "correctIndex": 3,
                                "explanation": f"The main challenge is often bridging the gap between understanding the theory and successfully implementing it in practice."
                            },
                            {
                                "question": f"Which statement best describes {topic}?",
                                "options": [
                                    "It is only theoretical",
                                    "It is a practical skill that can be learned and improved",
                                    "It is not relevant in modern times",
                                    "It requires no prior knowledge"
                                ],
                                "correctIndex": 1,
                                "explanation": f"{topic} is a practical skill that can be learned, practiced, and continuously improved over time."
                            }
                        ]
                    }
                ]
            }
        ]
    }


@router.post("/create")
def create_course_generation(
    request_data: CourseGenerationRequest,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Submit a course generation request.
    User provides topic, difficulty, duration, domain, and tags.
    Request is sent directly to AI pipeline.

    Args:
        request_data: Course generation parameters
        current_user: Authenticated user
    """
    from app.models.course_generation import CourseGeneration
    import requests

    try:
        # Create course generation entry (initial status: pending)
        generation = CourseGeneration(
            user_id=int(current_user.get("sub")),
            topic=request_data.topic,
            difficulty_level=request_data.difficulty_level,
            learning_duration=request_data.learning_duration,
            expertise_domain=request_data.expertise_domain,
            relevant_tags=request_data.relevant_tags,
            status="pending"
        )
        db.add(generation)
        db.commit()
        db.refresh(generation)

        # Send directly to AI pipeline
        ai_pipeline_url = "http://localhost:3001"
        # Parse tags from comma-separated string to array
        tags = [tag.strip() for tag in (request_data.relevant_tags or "").split(",") if tag.strip()]

        payload = {
            "id": str(generation.id),
            "topic": request_data.topic,
            "difficulty": request_data.difficulty_level,
            "learningDuration": request_data.learning_duration,
            "expertiseDomain": request_data.expertise_domain or "General",
            "tags": tags,
            "callback_url": f"http://localhost:8000/api/course-generation/callback/process-generated/{generation.id}"
        }

        try:
            response = requests.post(
                f"{ai_pipeline_url}/generate",
                json=payload,
                timeout=120
            )

            if response.status_code == 200:
                logger.info(f"Course generation {generation.id} sent to AI pipeline")
            else:
                logger.error(f"AI pipeline error {response.status_code}: {response.text}")
                return {
                    "status": True,
                    "message": "Course generation request submitted. Processing in background.",
                    "generation_id": generation.id,
                    "queue_status": "pending"
                }
        except Exception as api_error:
            logger.warning(f"Could not reach AI pipeline: {str(api_error)}. Request queued for later.")
            return {
                "status": True,
                "message": "Course generation request submitted. Processing in background.",
                "generation_id": generation.id,
                "queue_status": "pending"
            }

        logger.info(f"User {current_user.get('email')} created course generation request {generation.id}: {request_data.topic}")

        return {
            "status": True,
            "message": "Course generation request submitted successfully",
            "generation_id": generation.id,
            "queue_status": "pending"
        }

    except Exception as e:
        db.rollback()
        logger.error(f"Error creating course generation: {str(e)}", exc_info=True)
        return {
            "error": f"Failed to submit course generation: {str(e)}",
            "status": False
        }


@router.get("/status/{generation_id}")
def get_course_status(
    generation_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get the status of a course generation request.
    Users can check their own courses, admins can check any.

    Args:
        generation_id: ID of the generation to check
    """
    from app.models.course_generation import CourseGeneration

    try:
        generation = db.query(CourseGeneration).filter(CourseGeneration.id == generation_id).first()

        if not generation:
            return {
                "status": False,
                "error": "Course not found"
            }

        # Check authorization: user can only see their own courses
        if generation.user_id != current_user.get("sub") and current_user.get("role") != "admin":
            return {
                "status": False,
                "error": "Unauthorized"
            }

        return {
            "status": True,
            "data": {
                "id": generation.id,
                "topic": generation.topic,
                "queue_status": generation.status,
                "created_at": generation.created_at.isoformat(),
                "generation_started_at": generation.generation_started_at.isoformat() if generation.generation_started_at else None,
                "generation_completed_at": generation.generation_completed_at.isoformat() if generation.generation_completed_at else None,
                "approved_at": generation.approved_at.isoformat() if generation.approved_at else None,
                "error": generation.last_error,
                "retry_count": generation.retry_count,
                "created_course_id": generation.created_course_id,
                "feedback": generation.reviewed_feedback
            }
        }

    except Exception as e:
        logger.error(f"Error getting course status: {str(e)}")
        return {
            "status": False,
            "error": str(e)
        }


@router.get("/pending")
def get_pending_generations(
    skip: int = 0,
    limit: int = 10,
    admin: dict = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """
    Get all courses awaiting admin approval (status='generated').
    Admin only endpoint.

    Args:
        skip: Number of records to skip
        limit: Number of records to return per page
    """
    from app.models.course_generation import CourseGeneration
    from sqlalchemy import desc

    try:
        # Get courses ready for admin approval (both generating and generated)
        base_query = db.query(CourseGeneration).filter(
            CourseGeneration.status.in_(["generating", "generated"])
        )

        total_count = base_query.count()

        generations = base_query.order_by(desc(CourseGeneration.generation_completed_at)).offset(skip).limit(limit).all()

        generation_list = []
        for gen in generations:
            gen_data = {
                "id": gen.id,
                "user_id": gen.user_id,
                "user_email": gen.user.email if gen.user else "Unknown",
                "user_name": gen.user.name if gen.user else "Unknown",
                "topic": gen.topic,
                "difficulty_level": gen.difficulty_level,
                "learning_duration": gen.learning_duration,
                "expertise_domain": gen.expertise_domain,
                "relevant_tags": gen.relevant_tags,
                "status": gen.status,
                "created_at": gen.created_at.isoformat() if gen.created_at else None,
                "generation_completed_at": gen.generation_completed_at.isoformat() if gen.generation_completed_at else None,
            }
            if gen.generated_course_data:
                gen_data["course_data"] = json.loads(gen.generated_course_data)
            generation_list.append(gen_data)

        logger.info(f"Admin {admin.get('email')} accessed pending course approvals")

        return {
            "generations": generation_list,
            "total": total_count,
            "skip": skip,
            "limit": limit
        }

    except Exception as e:
        logger.error(f"Error getting pending generations: {str(e)}", exc_info=True)
        return {
            "error": "Failed to get pending generations",
            "generations": [],
            "total": 0,
            "skip": skip,
            "limit": limit
        }


@router.put("/publish/{generation_id}")
def publish_generated_course(
    generation_id: int,
    publish_data: GeneratedCoursePublish,
    admin: dict = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """
    Publish (approve) or reject a generated course.
    Creates actual course in courses table if approved.
    Admin only endpoint.

    Args:
        generation_id: ID of the generation to publish
        publish_data: Status (published/rejected) and feedback
    """
    from app.models.course_generation import CourseGeneration
    from app.models.course import Course
    from app.models.module import Module
    from app.models.lesson import Lesson
    from app.models.quiz import Quiz, QuizQuestion, QuestionOption

    try:
        generation = db.query(CourseGeneration).filter(CourseGeneration.id == generation_id).first()

        if not generation:
            return {
                "error": "Course not found",
                "status": False
            }

        if generation.status != "generated":
            return {
                "error": f"Cannot publish course with status '{generation.status}'",
                "status": False
            }

        created_course_id = None

        if publish_data.status == "published":
            try:
                # Parse generated course data
                course_data = json.loads(generation.generated_course_data)
                logger.info(f"DEBUG: Parsed course data has {len(course_data.get('modules', []))} modules")
                if course_data.get('modules'):
                    first_module = course_data['modules'][0]
                    logger.info(f"DEBUG: First module has {len(first_module.get('quizzes', []))} quizzes")
                    if first_module.get('quizzes'):
                        logger.info(f"DEBUG: First quiz has {len(first_module['quizzes'][0].get('questions', []))} questions")

                # Create the course
                new_course = Course(
                    title=course_data.get("title", generation.topic),
                    description=course_data.get("description", ""),
                    category=course_data.get("category", "Computer Science"),
                    difficulty=course_data.get("difficulty", generation.difficulty_level),
                    duration_hours=course_data.get("duration_hours", 10),
                    thumbnail_url="https://via.placeholder.com/400x300?text=" + generation.topic.replace(" ", "+")
                )
                db.add(new_course)
                db.flush()
                created_course_id = new_course.id

                # Create modules, lessons, and quizzes from generated data
                for module_data in course_data.get("modules", []):
                    module = Module(
                        course_id=new_course.id,
                        title=module_data.get("title", ""),
                        description=module_data.get("description", ""),
                        order=1
                    )
                    db.add(module)
                    db.flush()

                    # Add lessons to module
                    for lesson_data in module_data.get("lessons", []):
                        lesson = Lesson(
                            course_id=new_course.id,
                            module_id=module.id,
                            title=lesson_data.get("title", ""),
                            content_markdown=lesson_data.get("content_markdown", ""),
                            duration_minutes=lesson_data.get("duration_minutes", 30),
                            learning_objectives=lesson_data.get("learning_objectives", ""),
                            key_concepts=lesson_data.get("key_concepts", ""),
                            order=1
                        )
                        db.add(lesson)

                    # Add quizzes to module
                    for quiz_data in module_data.get("quizzes", []):
                        q_count = len(quiz_data.get('questions', []))
                        logger.info(f"DEBUG publish: Quiz '{quiz_data.get('title', 'N/A')}' from module '{module_data.get('title')}' has {q_count} questions")
                        quiz = Quiz(
                            course_id=new_course.id,
                            module_id=module.id,
                            title=quiz_data.get("title", ""),
                            description=quiz_data.get("description", ""),
                            passing_score=quiz_data.get("passing_score", 70),
                            total_points=quiz_data.get("total_points", 100),
                            duration_minutes=quiz_data.get("duration_minutes", 15),
                            order=1
                        )
                        db.add(quiz)
                        db.flush()

                        # Add questions to quiz
                        questions_added = 0
                        for q_idx, question_data in enumerate(quiz_data.get("questions", [])):
                            question = QuizQuestion(
                                quiz_id=quiz.id,
                                question_text=question_data.get("question", ""),
                                explanation=question_data.get("explanation", ""),
                                question_type="multiple_choice",
                                difficulty="medium"
                            )
                            db.add(question)
                            db.flush()
                            questions_added += 1

                            # Add options for this question
                            for opt_idx, option_text in enumerate(question_data.get("options", [])):
                                is_correct = (opt_idx == question_data.get("correctIndex", -1))
                                option = QuestionOption(
                                    question_id=question.id,
                                    text=option_text,
                                    is_correct=is_correct
                                )
                                db.add(option)
                        logger.info(f"DEBUG: Added {questions_added} questions to quiz '{quiz.title}' (Quiz ID: {quiz.id})")

                generation.status = "published"
                generation.created_course_id = created_course_id
                generation.approved_at = datetime.utcnow()
                generation.approved_by = admin.get("sub")
                generation.reviewed_feedback = publish_data.feedback

                logger.info(f"Admin {admin.get('email')} published course {generation_id} -> Course {created_course_id}")

            except Exception as e:
                db.rollback()
                logger.error(f"Error publishing course: {str(e)}", exc_info=True)
                return {
                    "error": f"Failed to publish course: {str(e)}",
                    "status": False
                }

        else:
            generation.status = "failed"
            generation.reviewed_feedback = publish_data.feedback
            generation.approved_at = datetime.utcnow()
            generation.approved_by = admin.get("sub")
            logger.info(f"Admin {admin.get('email')} rejected course {generation_id}")

        db.commit()
        db.refresh(generation)

        # Log audit action
        log_audit(
            db,
            admin.get("sub"),
            admin.get("email"),
            "PUBLISH" if publish_data.status == "published" else "REJECT",
            "CourseGeneration",
            generation_id,
            generation.topic,
            "Success",
            f"Course {'published as course ID ' + str(created_course_id) if publish_data.status == 'published' else 'rejected: ' + publish_data.feedback}"
        )

        return {
            "status": True,
            "message": f"Course {publish_data.status} successfully",
            "generation_id": generation_id,
            "created_course_id": created_course_id
        }

    except Exception as e:
        db.rollback()
        logger.error(f"Error publishing course {generation_id}: {str(e)}", exc_info=True)
        return {
            "error": f"Failed to publish course: {str(e)}",
            "status": False
        }


@router.post("/callback/process-generated/{generation_id}")
def process_generated_callback(
    generation_id: int,
    course_data: dict,
    db: Session = Depends(get_db)
):
    """
    Callback from AI pipeline when course generation completes successfully.
    Updates generation status to 'generated' and stores the course data.
    """
    from app.models.course_generation import CourseGeneration

    try:
        generation = db.query(CourseGeneration).filter(CourseGeneration.id == generation_id).first()

        if not generation:
            logger.error(f"Generation {generation_id} not found")
            return {"status": False, "error": "Generation not found"}

        generation.status = "generated"
        generation.generation_completed_at = datetime.utcnow()
        generation.generated_course_data = json.dumps(course_data)

        # Debug: Log the course data structure
        for mod_idx, mod in enumerate(course_data.get('modules', [])):
            quizzes = mod.get('quizzes', [])
            logger.info(f"DEBUG callback: Module {mod_idx} '{mod.get('title')}' has {len(quizzes)} quizzes")
            for quiz_idx, quiz in enumerate(quizzes):
                questions = quiz.get('questions', [])
                logger.info(f"  DEBUG: Quiz {quiz_idx} '{quiz.get('title')}' has {len(questions)} questions")

        db.commit()

        logger.info(f"Course generation {generation_id} completed successfully")

        return {
            "status": True,
            "message": "Course generation completed",
            "generation_id": generation_id
        }

    except Exception as e:
        db.rollback()
        logger.error(f"Error processing generated callback {generation_id}: {str(e)}", exc_info=True)
        return {
            "status": False,
            "error": str(e)
        }


@router.post("/callback/process-failed/{generation_id}")
def process_failed_callback(
    generation_id: int,
    error_data: dict,
    db: Session = Depends(get_db)
):
    """
    Callback from AI pipeline when course generation fails.
    Updates generation status to 'failed' and stores error message.
    """
    from app.models.course_generation import CourseGeneration

    try:
        generation = db.query(CourseGeneration).filter(CourseGeneration.id == generation_id).first()

        if not generation:
            logger.error(f"Generation {generation_id} not found")
            return {"status": False, "error": "Generation not found"}

        generation.status = "failed"
        generation.generation_completed_at = datetime.utcnow()
        generation.error_message = error_data.get("error", "Unknown error")
        db.commit()

        logger.error(f"Course generation {generation_id} failed: {error_data.get('error')}")

        return {
            "status": True,
            "message": "Course generation failed",
            "generation_id": generation_id
        }

    except Exception as e:
        db.rollback()
        logger.error(f"Error processing failed callback {generation_id}: {str(e)}", exc_info=True)
        return {
            "status": False,
            "error": str(e)
        }
