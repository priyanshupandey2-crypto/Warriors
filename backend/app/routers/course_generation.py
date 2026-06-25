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
                        "duration_minutes": 15
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
    Request is stored with 'pending' status.

    Args:
        request_data: Course generation parameters
        current_user: Authenticated user
    """
    from app.models.course_generation import CourseGeneration

    try:
        # Create course generation request
        generation = CourseGeneration(
            user_id=current_user.get("sub"),
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

        logger.info(f"User {current_user.get('email')} created course generation request {generation.id}: {request_data.topic}")

        return {
            "status": True,
            "message": "Course generation request submitted successfully",
            "generation_id": generation.id
        }

    except Exception as e:
        db.rollback()
        logger.error(f"Error creating course generation: {str(e)}", exc_info=True)
        return {
            "error": f"Failed to submit course generation: {str(e)}",
            "status": False
        }


@router.post("/process/{generation_id}")
def process_course_generation(
    generation_id: int,
    admin: dict = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """
    Process (simulate AI generation) a pending course generation request.
    This would call the AI layer in production.
    Admin only endpoint.

    Args:
        generation_id: ID of the generation request to process
    """
    from app.models.course_generation import CourseGeneration

    try:
        generation = db.query(CourseGeneration).filter(CourseGeneration.id == generation_id).first()

        if not generation:
            return {
                "error": "Course generation request not found",
                "status": False
            }

        if generation.status != "pending":
            return {
                "error": f"Cannot process generation with status '{generation.status}'",
                "status": False
            }

        # Update status to generating
        generation.status = "generating"
        generation.generation_started_at = datetime.utcnow()
        db.commit()

        # Simulate AI generation (call actual AI layer in production)
        course_data = generate_mock_course_data(
            generation.topic,
            generation.difficulty_level,
            generation.learning_duration,
            generation.relevant_tags
        )

        # Store generated course data
        generation.generated_course_data = json.dumps(course_data)
        generation.status = "generated"
        generation.generation_completed_at = datetime.utcnow()

        db.commit()
        db.refresh(generation)

        logger.info(f"Admin {admin.get('email')} processed course generation {generation_id}")

        return {
            "status": True,
            "message": "Course generation processed successfully",
            "generation_id": generation.id,
            "course_data": json.loads(generation.generated_course_data)
        }

    except Exception as e:
        db.rollback()
        logger.error(f"Error processing course generation {generation_id}: {str(e)}", exc_info=True)
        return {
            "error": f"Failed to process course generation: {str(e)}",
            "status": False
        }


@router.get("/pending")
def get_pending_generations(
    skip: int = 0,
    limit: int = 10,
    admin: dict = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """
    Get all pending or generated course generation requests for admin review.
    Admin only endpoint.

    Args:
        skip: Number of records to skip
        limit: Number of records to return per page
    """
    from app.models.course_generation import CourseGeneration
    from sqlalchemy import desc, or_

    try:
        # Get pending and generated requests
        base_query = db.query(CourseGeneration).filter(
            or_(
                CourseGeneration.status == "pending",
                CourseGeneration.status == "generating",
                CourseGeneration.status == "generated"
            )
        )

        total_count = base_query.count()

        generations = base_query.order_by(desc(CourseGeneration.created_at)).offset(skip).limit(limit).all()

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

        logger.info(f"Admin {admin.get('email')} accessed pending course generations")

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
    from app.models.quiz import Quiz

    try:
        generation = db.query(CourseGeneration).filter(CourseGeneration.id == generation_id).first()

        if not generation:
            return {
                "error": "Course generation request not found",
                "status": False
            }

        if generation.status != "generated":
            return {
                "error": f"Cannot publish generation with status '{generation.status}'",
                "status": False
            }

        created_course_id = None

        if publish_data.status == "published":
            try:
                # Parse generated course data
                course_data = json.loads(generation.generated_course_data)

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

                generation.status = "published"
                generation.created_course_id = created_course_id

                logger.info(f"Admin {admin.get('email')} published course generation {generation_id} -> Course {created_course_id}")

            except Exception as e:
                db.rollback()
                logger.error(f"Error publishing course generation: {str(e)}", exc_info=True)
                return {
                    "error": f"Failed to publish course: {str(e)}",
                    "status": False
                }

        else:
            generation.status = "rejected"
            logger.info(f"Admin {admin.get('email')} rejected course generation {generation_id}")

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
            f"Course generation {'published as course ID ' + str(created_course_id) if publish_data.status == 'published' else 'rejected: ' + publish_data.feedback}"
        )

        return {
            "status": True,
            "message": f"Course generation {publish_data.status} successfully",
            "generation_id": generation_id,
            "created_course_id": created_course_id
        }

    except Exception as e:
        db.rollback()
        logger.error(f"Error publishing course generation {generation_id}: {str(e)}", exc_info=True)
        return {
            "error": f"Failed to publish course generation: {str(e)}",
            "status": False
        }
