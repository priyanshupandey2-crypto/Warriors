"""
Curriculum API Routes
======================

Endpoints for curriculum discovery, building, validation, and retrieval.

Endpoints:
    POST   /api/curriculum/discover         - Discover/build curriculum
    POST   /api/curriculum/validate-urls    - Validate URLs before extraction
    GET    /api/curriculum/{curriculum_id}  - Retrieve curriculum
    GET    /api/curriculum/                 - List curricula with filters
    GET    /api/curriculum/stats            - Get curriculum statistics
"""

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.services.curriculum_service import CurriculumService
from app.schemas.curriculum import (
    CurriculumDiscoveryRequest,
    CurriculumResponse,
    URLValidationRequest,
    URLValidationResponse,
)

router = APIRouter(prefix="/api/curriculum", tags=["curriculum"])


@router.post(
    "/discover",
    response_model=CurriculumResponse,
    summary="Discover or build curriculum",
    description="Discover an existing curriculum from cache or build new one by extracting content from trusted sources."
)
def discover_curriculum(
    request: CurriculumDiscoveryRequest,
    db: Session = Depends(get_db)
) -> CurriculumResponse:
    """
    Discover or build curriculum for a learning topic.

    The service first checks if a curriculum exists in the registry for the
    given topic + difficulty + duration combination. If found and not expired,
    returns the cached curriculum. Otherwise, generates search queries for
    trusted sources, extracts content with Firecrawl, chunks it, and saves
    to the database.

    **Request Body:**
    ```json
    {
        "topic": "Python Async/Await",
        "difficulty": "Intermediate",
        "duration": "2 hours",
        "tags": ["python", "concurrency", "async"]
    }
    ```

    **Response:**
    ```json
    {
        "success": true,
        "curriculum_id": "123",
        "topic": "Python Async/Await",
        "difficulty": "Intermediate",
        "duration": "2 hours",
        "sources_count": 4,
        "chunks_count": 24,
        "message": "Curriculum built successfully"
    }
    ```

    **Raises:**
    - 400: Invalid request (missing required fields, invalid difficulty/duration)
    - 500: Curriculum building failed
    """
    try:
        service = CurriculumService(db)
        result = service.discover_curriculum(request)

        if not result.success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=result.message
            )

        return result

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Curriculum discovery failed: {str(e)}"
        )


@router.post(
    "/validate-urls",
    response_model=URLValidationResponse,
    summary="Validate URLs before extraction",
    description="Check URLs are from trusted sources and accessible before extraction."
)
def validate_urls(
    request: URLValidationRequest,
    db: Session = Depends(get_db)
) -> URLValidationResponse:
    """
    Validate URLs before extraction.

    Checks each URL is:
    - From a trusted domain (MDN, W3Schools, GeeksForGeeks, etc.)
    - Accessible (HTTP 200)

    **Request Body:**
    ```json
    {
        "urls": [
            "https://developer.mozilla.org/...",
            "https://www.w3schools.com/..."
        ]
    }
    ```

    **Response:**
    ```json
    {
        "total": 2,
        "valid": 2,
        "invalid": 0,
        "results": [
            {
                "url": "https://developer.mozilla.org/...",
                "valid": true,
                "source_type": "MDN",
                "status_code": 200
            }
        ]
    }
    ```

    **Raises:**
    - 400: Invalid request (missing URLs)
    - 500: Validation failed
    """
    try:
        service = CurriculumService(db)
        return service.validate_urls(request.urls)

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"URL validation failed: {str(e)}"
        )


@router.get(
    "/{curriculum_id}",
    summary="Retrieve curriculum",
    description="Get complete curriculum with all sources and chunks."
)
def get_curriculum(
    curriculum_id: int,
    db: Session = Depends(get_db)
):
    """
    Retrieve complete curriculum by ID.

    Returns:
        - Curriculum metadata
        - All sources (URLs, titles, descriptions)
        - All chunks (content, concepts, metadata)
        - Learning paths (lesson sequence)

    **Response:**
    ```json
    {
        "curriculum": {
            "id": 1,
            "topic": "Python Async/Await",
            "difficulty": "Intermediate",
            "duration": "2 hours",
            "sources_count": 4,
            "chunks_count": 24
        },
        "sources": [...],
        "chunks": [...],
        "learning_paths": [...]
    }
    ```

    **Raises:**
    - 404: Curriculum not found
    - 500: Retrieval failed
    """
    try:
        service = CurriculumService(db)
        curriculum = service.get_curriculum(curriculum_id)

        if not curriculum:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Curriculum {curriculum_id} not found"
            )

        return curriculum

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve curriculum: {str(e)}"
        )


@router.get(
    "/",
    summary="List curricula",
    description="List curricula with optional filters."
)
def list_curricula(
    topic: Optional[str] = Query(None, description="Filter by topic"),
    difficulty: Optional[str] = Query(None, description="Filter by difficulty"),
    skip: int = Query(0, description="Number to skip for pagination"),
    limit: int = Query(50, description="Number to return (max 100)"),
    db: Session = Depends(get_db)
):
    """
    List curricula with optional filters.

    **Query Parameters:**
    - `topic`: Filter by topic (substring match)
    - `difficulty`: Filter by difficulty (Beginner, Intermediate, Advanced)
    - `skip`: Pagination offset
    - `limit`: Pagination limit (max 100)

    **Response:**
    ```json
    [
        {
            "id": 1,
            "topic": "Python Async/Await",
            "difficulty": "Intermediate",
            "duration": "2 hours",
            "sources_count": 4,
            "chunks_count": 24,
            "created_at": "2024-01-15T10:30:00"
        }
    ]
    ```

    **Raises:**
    - 400: Invalid query parameters
    - 500: List failed
    """
    try:
        if limit > 100:
            limit = 100

        service = CurriculumService(db)
        curricula = service.list_curricula(
            topic=topic,
            difficulty=difficulty,
            skip=skip,
            limit=limit
        )

        return curricula

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to list curricula: {str(e)}"
        )


@router.get(
    "/{curriculum_id}/template",
    summary="Get curriculum template",
    description="Get the curriculum template with extracted structure."
)
def get_curriculum_template(
    curriculum_id: int,
    db: Session = Depends(get_db)
):
    """
    Get curriculum template by ID.

    Returns only the curriculum template structure with topics, subtopics,
    and concepts.

    **Response:**
    ```json
    {
        "topic": "Java",
        "difficulty": "Intermediate",
        "extracted_topics": [...],
        "extracted_subtopics": {...},
        "concept_summary": [...],
        "source_breakdown": [...],
        "knowledge_pack_summary": {...}
    }
    ```

    **Raises:**
    - 404: Curriculum not found
    - 500: Template retrieval failed
    """
    try:
        service = CurriculumService(db)
        curriculum_data = service.repo.get_curriculum_with_chunks(curriculum_id)

        if not curriculum_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Curriculum {curriculum_id} not found"
            )

        curriculum = curriculum_data["curriculum"]
        chunks = curriculum_data["chunks"]
        sources = curriculum_data["sources"]

        # Build template
        template = service.template_builder.build_template(
            chunks=[{
                "id": c.id,
                "heading_path": c.heading_path,
                "concepts": c.concepts,
                "token_count": c.token_count,
                "source_id": c.source_id,
            } for c in chunks],
            sources=[{
                "id": s.id,
                "source_type": s.source_type,
            } for s in sources],
            topic=curriculum.topic,
            difficulty=curriculum.difficulty,
        )

        return template

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get curriculum template: {str(e)}"
        )


@router.get(
    "/stats/",
    summary="Get curriculum statistics",
    description="Get aggregate statistics about curricula and chunks."
)
def get_statistics(
    db: Session = Depends(get_db)
):
    """
    Get curriculum statistics.

    Returns:
        - Total curricula count
        - Total chunks count
        - Total tokens count
        - Average chunk size

    **Response:**
    ```json
    {
        "total_curricula": 42,
        "total_chunks": 1024,
        "total_tokens": 512000,
        "average_chunk_size": 500
    }
    ```

    **Raises:**
    - 500: Statistics retrieval failed
    """
    try:
        service = CurriculumService(db)
        return service.get_statistics()

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get statistics: {str(e)}"
        )
