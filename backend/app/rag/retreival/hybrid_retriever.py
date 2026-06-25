"""Hybrid retrieval orchestration combining vector and BM25 search."""

import logging
from typing import Optional

from qdrant_client.models import Filter
from langsmith import traceable
from langsmith.run_helpers import get_current_run_tree

from app.rag.retrieval.rerankers import get_reranker
from app.rag.retrieval.vector_retriever import VectorRetriever
from app.config import get_settings

logger = logging.getLogger(__name__)


class HybridRetriever:
    """Hybrid retrieval combining dense vector search with optional BM25.

    Orchestrates VectorRetriever and Reranker, with extensibility for
    future BM25 integration.
    """

    def __init__(self):
        """Initialize hybrid retriever.

        Uses frozen ingestion contracts:
        - VectorRetriever: reuses Embedder and QdrantClientManager
        - Reranker: singleton cross-encoder model
        """
        self.vector_retriever = VectorRetriever()
        self.reranker = get_reranker()
        logger.info("HybridRetriever initialized with vector retrieval")

    @traceable(name="hybrid_retrieval", run_type="retriever")
    def retrieve(
        self,
        query: str,
        top_k: int = 10,
        rerank: bool = True,
        rerank_top_k: Optional[int] = None,
        query_filter: Optional[Filter] = None,
    ) -> list[dict]:
        """Retrieve documents using hybrid strategy with LangSmith tracking.

        Current implementation: vector retrieval + optional reranking + content quality filtering.
        Designed to accommodate future BM25 fusion.

        Args:
            query: User query string.
            top_k: Number of vector results to retrieve.
            rerank: Whether to apply cross-encoder reranking.
            rerank_top_k: Number of results to return after reranking.
                         If None, defaults to top_k.
            query_filter: Optional Qdrant filter to scope results (e.g., by department).

        Returns:
            List of results with scores and metadata.

        Raises:
            ValueError: If query is invalid.
            Exception: If retrieval fails.
        """
        if not query or not isinstance(query, str) or query.strip() == "":
            logger.error(f"Invalid query: {query}")
            raise ValueError("Query must be a non-empty string")

        settings = get_settings()
        run_tree = get_current_run_tree()
        retrieval_metrics = {}

        try:
            logger.debug(
                f"Hybrid retrieval: query='{query[:100]}...', top_k={top_k}, "
                f"rerank={rerank}" + (f", filter={query_filter}" if query_filter else "")
            )

            # Step 1: Vector Retrieval
            vector_results = self.vector_retriever.retrieve(
                query, top_k=top_k, query_filter=query_filter
            )
            retrieval_metrics["vector_results_count"] = len(vector_results)
            retrieval_metrics["top_vector_score"] = vector_results[0]["score"] if vector_results else 0

            logger.info(
                f"Vector retrieval returned {len(vector_results)} results"
                + (" (with filter)" if query_filter else "")
            )

            if not vector_results:
                logger.debug("No vector results, returning empty list")
                if run_tree:
                    if not run_tree.metadata:
                        run_tree.metadata = {}
                    run_tree.metadata.update(retrieval_metrics)
                return []

            # Step 2: Reranking for semantic relevance
            if not rerank or not vector_results:
                logger.debug("Reranking disabled or no results, using vector results directly")
                final_results = vector_results[:top_k]
                retrieval_metrics["rerank_applied"] = False
            else:
                if rerank_top_k is None:
                    rerank_top_k = min(top_k, len(vector_results))

                final_results = self.reranker.rerank(
                    query=query,
                    results=vector_results,
                    top_k=rerank_top_k,
                )
                retrieval_metrics["rerank_applied"] = True
                retrieval_metrics["after_rerank_count"] = len(final_results)

                # Track rerank scores
                if final_results:
                    retrieval_metrics["top_rerank_score"] = final_results[0].get("rerank_score", 0)
                    retrieval_metrics["avg_rerank_score"] = sum(
                        r.get("rerank_score", 0) for r in final_results
                    ) / len(final_results)

                logger.info(
                    f"Reranking returned {len(final_results)} results "
                    f"(top score: {retrieval_metrics['top_rerank_score']:.3f})"
                )

            # Log metrics to LangSmith
            if run_tree:
                if not run_tree.metadata:
                    run_tree.metadata = {}
                run_tree.metadata.update(retrieval_metrics)

            return final_results

        except ValueError as e:
            logger.error(f"Validation error in hybrid retrieve: {e}")
            raise
        except Exception as e:
            logger.error(f"Hybrid retrieval failed: {e}")
            raise
