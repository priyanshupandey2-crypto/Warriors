"""LangSmith tracing utilities for RAG pipeline."""

from langsmith import traceable
from typing import Any, Dict, List, Optional


@traceable(name="vector_retrieval", run_type="retriever")
def traced_vector_retrieve(
    retriever: Any,
    query: str,
    top_k: int,
    query_filter: Optional[Any] = None,
) -> List[Dict[str, Any]]:
    """Trace vector retrieval from Qdrant."""
    return retriever.retrieve(query=query, top_k=top_k, query_filter=query_filter)


@traceable(name="hybrid_retrieval", run_type="retriever")
def traced_hybrid_retrieve(
    hybrid_retriever: Any,
    query: str,
    top_k: int,
    query_filter: Optional[Any] = None,
) -> List[Dict[str, Any]]:
    """Trace hybrid retrieval (vector + reranking)."""
    return hybrid_retriever.retrieve(query=query, top_k=top_k, query_filter=query_filter)


@traceable(name="groq_llm_generation", run_type="llm")
def traced_generate(
    groq_client: Any,
    system_prompt: str,
    user_prompt: str,
    **kwargs,
) -> Dict[str, Any]:
    """Trace LLM generation using Groq. Returns both text and tokens."""
    response = groq_client.generate(
        system_prompt=system_prompt,
        user_prompt=user_prompt,
        **kwargs,
    )
    return response


@traceable(name="chat_pipeline", run_type="chain")
def traced_chat_pipeline(
    query: str,
    retriever: Any,
    groq_client: Any,
    prompt_builder: Any,
    query_filter: Optional[Any] = None,
    top_k: int = 5,
    **kwargs,
) -> Dict[str, Any]:
    """Trace full chat pipeline: retrieval → generation."""

    # Retrieve documents
    results = traced_hybrid_retrieve(
        hybrid_retriever=retriever,
        query=query,
        top_k=top_k,
        query_filter=query_filter,
    )

    # Build prompts
    system_prompt, user_prompt = prompt_builder.build_prompt(
        query=query,
        retrieval_results=results,
    )

    # Generate response
    response_data = traced_generate(
        groq_client=groq_client,
        system_prompt=system_prompt,
        user_prompt=user_prompt,
    )

    return {
        "answer": response_data.get("text", response_data),
        "retrieval_results": results,
        "tokens": response_data.get("tokens", {}),
        "query": query,
    }
