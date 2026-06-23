"""RAG (Retrieval-Augmented Generation) Engine"""

import asyncio
from typing import List, Dict, Any, Optional
from .vector_db import VectorDBProvider, Document, get_vector_db_provider
from .web_search import WebSearchProvider, SearchResult, get_web_search_provider
from .types import ResearchSource, SourceType


class RAGEngine:
    """Retrieval-Augmented Generation for grounded research"""

    def __init__(
        self,
        vector_db: Optional[VectorDBProvider] = None,
        web_search: Optional[WebSearchProvider] = None,
    ):
        """Initialize RAG engine

        Args:
            vector_db: Vector database provider (uses default if None)
            web_search: Web search provider (uses default if None)
        """
        self.vector_db = vector_db or get_vector_db_provider()
        self.web_search = web_search or get_web_search_provider()
        self.initialized = False

    async def initialize(self) -> None:
        """Initialize RAG components"""
        if not self.initialized:
            await self.vector_db.initialize()
            self.initialized = True
            print("RAG Engine initialized")

    async def index_documents(self, documents: List[Document]) -> None:
        """Index documents in vector database

        Args:
            documents: List of documents to index
        """
        await self.initialize()
        await self.vector_db.add_documents(documents)
        print(f"Indexed {len(documents)} documents")

    async def retrieve_relevant_documents(
        self, query: str, top_k: int = 5
    ) -> List[Document]:
        """Retrieve relevant documents from vector database

        Args:
            query: Search query
            top_k: Number of top results to retrieve

        Returns:
            List of relevant documents
        """
        await self.initialize()
        documents = await self.vector_db.search(query, top_k=top_k)
        return documents

    async def search_web(self, query: str, num_results: int = 5) -> List[SearchResult]:
        """Search the web for relevant information

        Args:
            query: Search query
            num_results: Number of results to return

        Returns:
            List of search results
        """
        results = await self.web_search.search(query, num_results=num_results)
        return results

    async def retrieve_hybrid(
        self, query: str, use_vector_db: bool = True, use_web_search: bool = True
    ) -> Dict[str, Any]:
        """Retrieve information from both vector DB and web search

        Args:
            query: Search query
            use_vector_db: Include vector database search
            use_web_search: Include web search

        Returns:
            Dictionary with both types of results
        """
        results = {
            "vector_db_results": [],
            "web_search_results": [],
            "combined_context": "",
        }

        # Parallel execution
        tasks = []

        if use_vector_db:
            tasks.append(self.retrieve_relevant_documents(query, top_k=5))
        else:
            tasks.append(asyncio.sleep(0))

        if use_web_search:
            tasks.append(self.search_web(query, num_results=5))
        else:
            tasks.append(asyncio.sleep(0))

        responses = await asyncio.gather(*tasks, return_exceptions=True)

        if use_vector_db and not isinstance(responses[0], Exception):
            results["vector_db_results"] = responses[0]

        if use_web_search and not isinstance(responses[1], Exception):
            results["web_search_results"] = responses[1]

        # Build combined context
        context_parts = []

        # Add vector DB results
        for doc in results["vector_db_results"]:
            context_parts.append(
                f"[{doc.source_type.upper()}] {doc.content[:200]}... "
                f"(Source: {doc.source_url or 'Internal'})"
            )

        # Add web search results
        for result in results["web_search_results"]:
            context_parts.append(
                f"[WEB] {result.title}\n{result.snippet}\n(URL: {result.url})"
            )

        results["combined_context"] = "\n\n".join(context_parts)

        return results

    async def generate_augmented_prompt(
        self, base_prompt: str, query: str
    ) -> str:
        """Generate an augmented prompt with retrieved context

        Args:
            base_prompt: Original prompt template
            query: Search query for context retrieval

        Returns:
            Augmented prompt with context
        """
        # Retrieve hybrid results
        retrieved = await self.retrieve_hybrid(query)

        # Build augmented prompt
        augmented_prompt = f"""{base_prompt}

Use the following retrieved information to ground your response:

{retrieved['combined_context']}

Instructions:
1. Use the retrieved information to support your recommendations
2. Cite sources when referencing specific information
3. Acknowledge if information is not found in retrieved sources
4. Provide real URLs when available from web search results
"""

        return augmented_prompt

    async def get_research_sources_from_retrieval(
        self, query: str, topic: str
    ) -> List[ResearchSource]:
        """Convert retrieved information to ResearchSource objects

        Args:
            query: Search query
            topic: Topic being researched

        Returns:
            List of ResearchSource objects
        """
        retrieved = await self.retrieve_hybrid(query)
        sources = []

        # Convert vector DB results
        for doc in retrieved["vector_db_results"]:
            source = ResearchSource(
                title=f"{doc.source_type.title()}: {topic}",
                type=SourceType(doc.source_type),
                relevance=0.8,  # Documents already filtered for relevance
                url=doc.source_url,
                description=doc.content[:200] + "...",
            )
            sources.append(source)

        # Convert web search results
        for result in retrieved["web_search_results"]:
            source = ResearchSource(
                title=result.title,
                type=SourceType.EDUCATIONAL,  # Default for web results
                relevance=result.relevance_score,
                url=result.url,
                description=result.snippet,
            )
            sources.append(source)

        # Sort by relevance
        sources.sort(key=lambda s: s.relevance, reverse=True)

        return sources[:10]  # Top 10 sources

    def build_context_for_prompt(
        self, retrieved_data: Dict[str, Any], section: str = "general"
    ) -> str:
        """Build context string for specific research sections

        Args:
            retrieved_data: Data from retrieve_hybrid()
            section: Section type (overview, concepts, progression, etc.)

        Returns:
            Context string to include in Claude prompt
        """
        context_lines = []

        if section == "overview":
            context_lines.append("## Industry Context\n")
            for result in retrieved_data["web_search_results"][:3]:
                context_lines.append(
                    f"- {result.title}: {result.snippet[:100]}..."
                )

        elif section == "concepts":
            context_lines.append("## Related Concepts from Knowledge Base\n")
            for doc in retrieved_data["vector_db_results"][:5]:
                context_lines.append(f"- {doc.content[:100]}...")

        elif section == "progression":
            context_lines.append("## Learning Path References\n")
            for result in retrieved_data["web_search_results"][:3]:
                context_lines.append(f"- {result.title} ({result.url})")

        elif section == "sources":
            context_lines.append("## Available Learning Resources\n")
            all_results = (
                retrieved_data["web_search_results"]
                + retrieved_data["vector_db_results"]
            )
            for i, result in enumerate(all_results[:5], 1):
                if isinstance(result, SearchResult):
                    context_lines.append(
                        f"{i}. {result.title}\n   URL: {result.url}"
                    )
                else:
                    context_lines.append(
                        f"{i}. {result.source_type}: {result.source_url}"
                    )

        return "\n".join(context_lines)
