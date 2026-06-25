"""
Queue Processor Service
======================

Background service that processes courses in the queue.
Sends pending courses to AI pipeline and checks on in-progress ones.

Run with: python -m app.services.queue_processor
"""

import asyncio
import json
from datetime import datetime
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.logger import get_logger
from app.services.ai_pipeline_service import send_to_ai_pipeline

logger = get_logger(__name__)

POLL_INTERVAL = 10  # seconds


async def process_pending_courses(db: Session):
    """
    Process courses waiting in the queue.
    Sends pending courses to AI pipeline.
    """
    from app.models.course_generation import CourseGeneration

    try:
        # Find pending courses (not yet sent to AI)
        pending_courses = db.query(CourseGeneration).filter(
            CourseGeneration.status == "pending"
        ).order_by(CourseGeneration.created_at).limit(5).all()

        for generation in pending_courses:
            try:
                # Prepare user input for AI pipeline
                user_input = {
                    "topic": generation.topic,
                    "difficulty": generation.difficulty_level,
                    "learningDuration": generation.learning_duration,
                    "expertiseDomain": generation.expertise_domain or "",
                    "tags": generation.relevant_tags.split(",") if generation.relevant_tags else []
                }

                success, response = await send_to_ai_pipeline(generation.id, user_input, db)

                if success:
                    # Status already updated to "generating" by send_to_ai_pipeline
                    logger.info(f"Sent course {generation.id} to AI pipeline")
                else:
                    logger.warning(f"Failed to send course {generation.id} to AI pipeline: {response}")

            except Exception as e:
                logger.error(f"Error processing course {generation.id}: {str(e)}", exc_info=True)
                db.rollback()

    except Exception as e:
        logger.error(f"Error in process_pending_courses: {str(e)}", exc_info=True)
        db.rollback()


async def process_retries(db: Session):
    """
    Check for courses that need to be retried.
    Retries failed courses with exponential backoff.
    """
    from app.models.course_generation import CourseGeneration

    try:
        # Find courses ready for retry (next_retry_at is in past, status needs retry logic)
        # Note: We check for courses with next_retry_at set and in the past
        retryable = db.query(CourseGeneration).filter(
            CourseGeneration.next_retry_at <= datetime.utcnow(),
            CourseGeneration.next_retry_at != None,
            CourseGeneration.attempt_number < CourseGeneration.max_attempts
        ).limit(5).all()

        for generation in retryable:
            try:
                # Prepare user input
                user_input = {
                    "topic": generation.topic,
                    "difficulty": generation.difficulty_level,
                    "learningDuration": generation.learning_duration,
                    "expertiseDomain": generation.expertise_domain or "",
                    "tags": generation.relevant_tags.split(",") if generation.relevant_tags else []
                }

                # Attempt to send again
                success, response = await send_to_ai_pipeline(
                    generation.id,
                    user_input,
                    db
                )

                if success:
                    logger.info(
                        f"Retried course {generation.id} "
                        f"(attempt {generation.attempt_number})"
                    )
                else:
                    logger.warning(
                        f"Retry failed for course {generation.id}: {response}"
                    )

            except Exception as e:
                logger.error(f"Error retrying course: {str(e)}", exc_info=True)
                db.rollback()

    except Exception as e:
        logger.error(f"Error in process_retries: {str(e)}", exc_info=True)
        db.rollback()


async def run_queue_processor():
    """
    Main queue processor loop.
    Continuously processes pending courses and retries.
    """
    logger.info("Queue processor started")

    while True:
        try:
            db = SessionLocal()

            # Process pending courses
            await process_pending_courses(db)

            # Process retries
            await process_retries(db)

            db.close()

            # Wait before next poll
            await asyncio.sleep(POLL_INTERVAL)

        except Exception as e:
            logger.error(f"Unexpected error in queue processor: {str(e)}", exc_info=True)
            await asyncio.sleep(POLL_INTERVAL)


if __name__ == "__main__":
    asyncio.run(run_queue_processor())
