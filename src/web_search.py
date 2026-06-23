"""Web Search Integration for Real-time Information"""

import os
from typing import List, Dict, Any, Optional
from dataclasses import dataclass
import aiohttp


@dataclass
class SearchResult:
    """Web search result"""
    title: str
    url: str
    snippet: str
    source: str  # google, brave, duckduckgo
    relevance_score: float = 0.5


class WebSearchProvider:
    """Abstract base for web search providers"""

    async def search(self, query: str, num_results: int = 5) -> List[SearchResult]:
        """Search the web for information

        Args:
            query: Search query
            num_results: Number of results to return

        Returns:
            List of search results
        """
        return []


class SerpAPIWebSearch(WebSearchProvider):
    """SerpAPI web search integration (Google, Bing, etc.)"""

    def __init__(self, api_key: Optional[str] = None):
        """Initialize SerpAPI provider

        Args:
            api_key: SerpAPI API key
        """
        self.api_key = api_key or os.getenv("SERPAPI_API_KEY")
        self.base_url = "https://serpapi.com/search"

    async def search(self, query: str, num_results: int = 5) -> List[SearchResult]:
        """Search using SerpAPI"""
        if not self.api_key:
            print("Warning: SerpAPI key not set. Using mock results.")
            return self._get_mock_results(query, num_results)

        try:
            params = {
                "q": query,
                "api_key": self.api_key,
                "num": num_results,
                "gl": "us",
                "hl": "en",
            }

            async with aiohttp.ClientSession() as session:
                async with session.get(self.base_url, params=params) as resp:
                    data = await resp.json()

            results = []
            for result in data.get("organic_results", [])[:num_results]:
                search_result = SearchResult(
                    title=result.get("title", ""),
                    url=result.get("link", ""),
                    snippet=result.get("snippet", ""),
                    source="google",
                    relevance_score=0.8,
                )
                results.append(search_result)

            return results

        except Exception as e:
            print(f"Error searching with SerpAPI: {e}")
            return self._get_mock_results(query, num_results)

    def _get_mock_results(self, query: str, num_results: int) -> List[SearchResult]:
        """Return mock results for development"""
        mock_results = [
            SearchResult(
                title=f"Result {i+1}: {query}",
                url=f"https://example.com/{query.lower()}/{i+1}",
                snippet=f"This is a mock search result about {query}. "
                       f"It contains relevant information for learning and reference.",
                source="mock",
                relevance_score=0.8 - (i * 0.1),
            )
            for i in range(min(num_results, 5))
        ]
        return mock_results


class BraveSearchWebSearch(WebSearchProvider):
    """Brave Search API integration"""

    def __init__(self, api_key: Optional[str] = None):
        """Initialize Brave Search provider

        Args:
            api_key: Brave Search API key
        """
        self.api_key = api_key or os.getenv("BRAVE_SEARCH_API_KEY")
        self.base_url = "https://api.search.brave.com/res/v1/web/search"

    async def search(self, query: str, num_results: int = 5) -> List[SearchResult]:
        """Search using Brave Search"""
        if not self.api_key:
            print("Warning: Brave Search key not set. Using mock results.")
            return self._get_mock_results(query, num_results)

        try:
            headers = {
                "Authorization": f"Token {self.api_key}",
                "X-Subscription-Token": self.api_key,
            }
            params = {
                "q": query,
                "count": num_results,
            }

            async with aiohttp.ClientSession() as session:
                async with session.get(
                    self.base_url, headers=headers, params=params
                ) as resp:
                    data = await resp.json()

            results = []
            for result in data.get("web", {}).get("results", [])[:num_results]:
                search_result = SearchResult(
                    title=result.get("title", ""),
                    url=result.get("url", ""),
                    snippet=result.get("description", ""),
                    source="brave",
                    relevance_score=0.8,
                )
                results.append(search_result)

            return results

        except Exception as e:
            print(f"Error searching with Brave Search: {e}")
            return self._get_mock_results(query, num_results)

    def _get_mock_results(self, query: str, num_results: int) -> List[SearchResult]:
        """Return mock results for development"""
        return [
            SearchResult(
                title=f"Brave Result {i+1}: {query}",
                url=f"https://brave.example.com/{query.lower()}/{i+1}",
                snippet=f"Information from Brave Search about {query}.",
                source="brave",
                relevance_score=0.75 - (i * 0.1),
            )
            for i in range(min(num_results, 5))
        ]


class DuckDuckGoWebSearch(WebSearchProvider):
    """DuckDuckGo search (privacy-focused)"""

    async def search(self, query: str, num_results: int = 5) -> List[SearchResult]:
        """Search using DuckDuckGo"""
        try:
            from duckduckgo_search import DDGS

            with DDGS() as ddgs:
                results_gen = ddgs.text(query, max_results=num_results)
                results = []

                for result in results_gen:
                    search_result = SearchResult(
                        title=result.get("title", ""),
                        url=result.get("href", ""),
                        snippet=result.get("body", ""),
                        source="duckduckgo",
                        relevance_score=0.7,
                    )
                    results.append(search_result)

                return results

        except ImportError:
            print("DuckDuckGo search library not installed. Using mock results.")
            return self._get_mock_results(query, num_results)
        except Exception as e:
            print(f"Error searching with DuckDuckGo: {e}")
            return self._get_mock_results(query, num_results)

    def _get_mock_results(self, query: str, num_results: int) -> List[SearchResult]:
        """Return mock results for development"""
        return [
            SearchResult(
                title=f"DuckDuckGo Result {i+1}: {query}",
                url=f"https://duckduckgo.example.com/{query.lower()}/{i+1}",
                snippet=f"Privacy-focused search result about {query}.",
                source="duckduckgo",
                relevance_score=0.7 - (i * 0.1),
            )
            for i in range(min(num_results, 5))
        ]


def get_web_search_provider() -> WebSearchProvider:
    """Get web search provider based on configuration

    Priority:
    1. SerpAPI (most comprehensive)
    2. Brave Search (privacy-focused)
    3. DuckDuckGo (free alternative)

    Returns:
        WebSearchProvider instance
    """
    if os.getenv("SERPAPI_API_KEY"):
        print("Using SerpAPI for web search")
        return SerpAPIWebSearch()
    elif os.getenv("BRAVE_SEARCH_API_KEY"):
        print("Using Brave Search for web search")
        return BraveSearchWebSearch()
    else:
        print("Using DuckDuckGo for web search (no API key needed)")
        return DuckDuckGoWebSearch()
