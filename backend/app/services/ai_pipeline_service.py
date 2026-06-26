"""
AI Pipeline Integration Service
================================

Handles communication with the AI pipeline service.
Sends course generation requests and processes responses.
"""

import httpx
import json
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.logger import get_logger

logger = get_logger(__name__)

# Configuration
AI_PIPELINE_URL = "http://localhost:3001"
TIMEOUT = 120  # 2 minute timeout for AI generation
MAX_RETRIES = 3
RETRY_DELAYS = [60, 120, 240]  # exponential backoff: 1min, 2min, 4min


async def send_to_ai_pipeline(
    generation_id: int,
    user_input: dict,
    db: Session
):
    """
    Send a course generation request to the AI pipeline.

    Args:
        generation_id: ID in course_generation table
        user_input: User input dict {topic, difficulty, learningDuration, expertiseDomain, tags}
        db: Database session

    Returns:
        Tuple of (success: bool, response_data: dict or error_msg: str)
    """
    from app.models.course_generation import CourseGeneration

    try:
        generation = db.query(CourseGeneration).filter(
            CourseGeneration.id == generation_id
        ).first()

        if not generation:
            return False, "Course generation not found"

        # Include generation_id in the request
        payload = {**user_input, "reviewQueueId": generation_id}

        # Send to AI pipeline
        async with httpx.AsyncClient(timeout=TIMEOUT) as client:
            try:
                response = await client.post(
                    f"{AI_PIPELINE_URL}/generate",
                    json=payload
                )

                if response.status_code != 200:
                    error_msg = f"AI pipeline error {response.status_code}: {response.text}"
                    logger.error(error_msg)
                    return False, error_msg

                result = response.json()

                # Update generation status
                generation.generation_started_at = datetime.utcnow()
                db.commit()

                logger.info(f"Sent course {generation_id} to AI pipeline")
                return True, result

            except httpx.TimeoutException:
                error_msg = f"AI pipeline timeout for course {generation_id}"
                logger.error(error_msg)
                return False, error_msg
            except httpx.RequestError as e:
                error_msg = f"AI pipeline connection error: {str(e)}"
                logger.error(error_msg)
                return False, error_msg

    except Exception as e:
        logger.error(f"Error sending to AI pipeline: {str(e)}", exc_info=True)
        return False, str(e)


def notify_generation_complete(
    generation_id: int,
    generated_course_data: dict,
    db: Session
):
    """
    Notify backend that AI generation is complete.
    Updates course_generation with generated data.

    Args:
        generation_id: ID in course_generation table
        generated_course_data: Generated course JSON
        db: Database session

    Returns:
        Tuple of (success: bool, message: str)
    """
    from app.models.course_generation import CourseGeneration

    try:
        generation = db.query(CourseGeneration).filter(
            CourseGeneration.id == generation_id
        ).first()

        if not generation:
            return False, "Course generation not found"

        # Update with generated data
        generation.generated_course_data = json.dumps(generated_course_data)
        generation.status = "generated"
        generation.generation_completed_at = datetime.utcnow()

        db.commit()

        logger.info(f"Course {generation_id} generation complete, awaiting admin approval")
        return True, "Generation complete"

    except Exception as e:
        logger.error(f"Error notifying generation complete: {str(e)}", exc_info=True)
        db.rollback()
        return False, str(e)


def notify_generation_failed(
    generation_id: int,
    error_message: str,
    db: Session,
    max_retries: int = MAX_RETRIES,
    retry_delays: list = None
):
    """
    Notify backend that AI generation failed.
    Schedules retry with exponential backoff or marks as failed.

    Args:
        generation_id: ID in course_generation table
        error_message: Error details
        db: Database session
        max_retries: Maximum retry attempts
        retry_delays: List of retry delays in seconds

    Returns:
        Tuple of (success: bool, should_retry: bool, message: str)
    """
    from app.models.course_generation import CourseGeneration

    if retry_delays is None:
        retry_delays = RETRY_DELAYS

    try:
        generation = db.query(CourseGeneration).filter(
            CourseGeneration.id == generation_id
        ).first()

        if not generation:
            return False, False, "Course generation not found"

        # Update retry info
        generation.retry_count = (generation.retry_count or 0) + 1
        generation.last_error = error_message
        generation.attempt_number = (generation.attempt_number or 1) + 1

        # Check if we should retry
        should_retry = generation.attempt_number <= max_retries

        if should_retry:
            # Schedule retry with exponential backoff
            delay_idx = min(generation.attempt_number - 2, len(retry_delays) - 1)
            delay = retry_delays[delay_idx]
            generation.next_retry_at = datetime.utcnow() + timedelta(seconds=delay)
            logger.info(
                f"Scheduled retry for course {generation_id} "
                f"(attempt {generation.attempt_number}/{max_retries}) in {delay}s"
            )
        else:
            # Max retries exceeded
            generation.status = "failed"
            generation.reviewed_feedback = f"AI generation failed after {max_retries} attempts: {error_message}"
            logger.error(f"Max retries exceeded for course {generation_id}: {error_message}")

        db.commit()
        return True, should_retry, "Failure recorded"

    except Exception as e:
        logger.error(f"Error notifying generation failure: {str(e)}", exc_info=True)
        db.rollback()
        return False, False, str(e)
