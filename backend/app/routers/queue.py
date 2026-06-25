"""
Queue Management Router
========================

API endpoints for managing course generation queues.
Handles pending requests, AI pipeline integration, and status tracking.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from app.database import get_db
from app.utils.dependencies import get_admin_user
from app.logger import get_logger
import json
import httpx

logger = get_logger(__name__)
router = APIRouter(prefix="/api/queue", tags=["queue"])

# Configuration - can be moved to config.py
AI_PIPELINE_URL = "http://localhost:3001"  # AI pipeline server URL
QUEUE_POLL_INTERVAL = 30  # seconds
MAX_RETRIES = 3
RETRY_DELAYS = [60, 120, 240]  # exponential backoff: 1min, 2min, 4min


@router.get("/pending")
def get_pending_courses(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 10
):
    """
    Get all pending courses waiting to be sent to AI pipeline.
    """
    from app.models.course_generation import CourseGeneration

    try:
        pending = db.query(CourseGeneration).filter(
            CourseGeneration.status == "pending"
        ).order_by(CourseGeneration.created_at).offset(skip).limit(limit).all()

        return {
            "status": True,
            "courses": [
                {
                    "id": p.id,
                    "topic": p.topic,
                    "difficulty": p.difficulty_level,
                    "duration": p.learning_duration,
                    "domain": p.expertise_domain,
                    "tags": p.relevant_tags,
                    "status": p.status,
                    "created_at": p.created_at.isoformat(),
                    "user_id": p.user_id
                } for p in pending
            ],
            "total": db.query(CourseGeneration).filter(
                CourseGeneration.status == "pending"
            ).count()
        }
    except Exception as e:
        logger.error(f"Error getting pending courses: {str(e)}")
        return {
            "status": False,
            "error": str(e),
            "courses": [],
            "total": 0
        }


@router.post("/send-to-ai/{generation_id}")
def send_to_ai_pipeline(
    generation_id: int,
    db: Session = Depends(get_db)
):
    """
    Send a course from generation queue to AI pipeline for generation.
    Updates status to "generating" and records generation_started_at.
    """
    from app.models.course_generation import CourseGeneration

    try:
        generation = db.query(CourseGeneration).filter(
            CourseGeneration.id == generation_id
        ).first()

        if not generation:
            raise HTTPException(status_code=404, detail="Course not found")

        if generation.status != "pending":
            raise HTTPException(
                status_code=400,
                detail=f"Cannot send course with status '{generation.status}'"
            )

        # Update status to generating
        generation.status = "generating"
        generation.generation_started_at = datetime.utcnow()
        generation.attempt_number = 1

        db.commit()
        db.refresh(generation)

        logger.info(f"Sent course generation {generation_id} to AI pipeline")

        return {
            "status": True,
            "message": "Course sent to AI pipeline for processing",
            "generation_id": generation_id
        }

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error sending to AI pipeline: {str(e)}", exc_info=True)
        return {
            "status": False,
            "error": str(e)
        }


@router.post("/process-generated/{generation_id}")
def process_generated_course(
    generation_id: int,
    generated_data: dict,
    db: Session = Depends(get_db)
):
    """
    Receive generated course from AI pipeline.
    Stores generated data and marks as "generated" (ready for admin approval).
    This is called by the AI pipeline after course generation completes.
    """
    from app.models.course_generation import CourseGeneration

    try:
        generation = db.query(CourseGeneration).filter(
            CourseGeneration.id == generation_id
        ).first()

        if not generation:
            raise HTTPException(status_code=404, detail="Course generation not found")

        if generation.status != "generating":
            raise HTTPException(
                status_code=400,
                detail=f"Cannot process generation with status '{generation.status}'"
            )

        # Store generated course data
        generation.generated_course_data = json.dumps(generated_data)
        generation.status = "generated"
        generation.generation_completed_at = datetime.utcnow()

        db.commit()
        db.refresh(generation)

        logger.info(f"Course generation {generation_id} completed, ready for admin approval")

        return {
            "status": True,
            "message": "Generated course stored successfully",
            "generation_id": generation_id
        }

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error processing generated course: {str(e)}", exc_info=True)
        return {
            "status": False,
            "error": str(e)
        }


@router.post("/process-failed/{generation_id}")
def process_generation_failure(
    generation_id: int,
    error_data: dict = None,
    db: Session = Depends(get_db)
):
    """
    Handle failed generation from AI pipeline.
    Retries with exponential backoff or marks as failed.
    """
    from app.models.course_generation import CourseGeneration

    try:
        generation = db.query(CourseGeneration).filter(
            CourseGeneration.id == generation_id
        ).first()

        if not generation:
            raise HTTPException(status_code=404, detail="Course generation not found")

        error_msg = error_data.get("error", "Unknown error") if error_data else "Unknown error"
        generation.last_error = error_msg
        generation.retry_count = (generation.retry_count or 0) + 1
        generation.attempt_number = (generation.attempt_number or 1) + 1

        # Check if we should retry
        if generation.attempt_number <= MAX_RETRIES:
            # Schedule retry with exponential backoff
            delay = RETRY_DELAYS[min(generation.attempt_number - 2, len(RETRY_DELAYS) - 1)]
            generation.next_retry_at = datetime.utcnow() + timedelta(seconds=delay)
            logger.info(f"Scheduled retry for generation {generation_id} in {delay}s")
        else:
            # Max retries exceeded
            generation.status = "failed"
            generation.reviewed_feedback = f"AI generation failed after {MAX_RETRIES} attempts: {error_msg}"
            logger.error(f"Max retries exceeded for generation {generation_id}")

        db.commit()
        db.refresh(generation)

        return {
            "status": True,
            "message": "Failure recorded",
            "retry_scheduled": generation.attempt_number <= MAX_RETRIES,
            "generation_id": generation_id
        }

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error processing generation failure: {str(e)}", exc_info=True)
        return {
            "status": False,
            "error": str(e)
        }


@router.get("/status/{generation_id}")
def get_queue_status(
    generation_id: int,
    db: Session = Depends(get_db)
):
    """
    Get the current status of a course in the generation pipeline.
    """
    from app.models.course_generation import CourseGeneration

    try:
        generation = db.query(CourseGeneration).filter(
            CourseGeneration.id == generation_id
        ).first()

        if not generation:
            raise HTTPException(status_code=404, detail="Course not found")

        return {
            "status": True,
            "data": {
                "id": generation.id,
                "topic": generation.topic,
                "queue_status": generation.status,
                "generation_started_at": generation.generation_started_at.isoformat() if generation.generation_started_at else None,
                "generation_completed_at": generation.generation_completed_at.isoformat() if generation.generation_completed_at else None,
                "error": generation.last_error,
                "retry_count": generation.retry_count,
                "created_course_id": generation.created_course_id
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting queue status: {str(e)}")
        return {
            "status": False,
            "error": str(e)
        }
