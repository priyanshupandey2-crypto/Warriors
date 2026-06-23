"""
Source Ranking Service
======================

Ranks and prioritizes sources for each topic to select
the highest-quality sources for curriculum extraction.
"""

import logging
from typing import List, Dict

logger = logging.getLogger(__name__)


class SourceRankingService:
    """Ranks sources by topic for quality curriculum extraction."""

    # Topic-specific source rankings
    TOPIC_SOURCE_PREFERENCES = {
        # Python
        "python": [
            "docs.python.org",
            "python.org",
            "realpython.com",
            "geeksforgeeks.org",
            "w3schools.com",
            "developer.mozilla.org",
        ],

        # Java
        "java": [
            "docs.oracle.com",
            "oracle.com",
            "geeksforgeeks.org",
            "javatpoint.com",
            "w3schools.com",
            "baeldung.com",
        ],

        # JavaScript
        "javascript": [
            "developer.mozilla.org",
            "mdn.org",
            "javascript.info",
            "w3schools.com",
            "geeksforgeeks.org",
            "ecma-international.org",
        ],

        # React
        "react": [
            "react.dev",
            "react.org",
            "developer.mozilla.org",
            "mdn.org",
            "geeksforgeeks.org",
            "w3schools.com",
        ],

        # General web development
        "web": [
            "developer.mozilla.org",
            "mdn.org",
            "w3schools.com",
            "geeksforgeeks.org",
            "html.spec.whatwg.org",
        ],

        # Data structures
        "data structures": [
            "geeksforgeeks.org",
            "realpython.com",
            "developer.mozilla.org",
            "visualgo.net",
            "coursera.org",
        ],

        # SQL/Databases
        "sql": [
            "docs.oracle.com",
            "postgresql.org",
            "mysql.com",
            "w3schools.com",
            "geeksforgeeks.org",
            "sqlzoo.net",
        ],

        # Default (for unmapped topics)
        "default": [
            "geeksforgeeks.org",
            "w3schools.com",
            "developer.mozilla.org",
            "wikipedia.org",
            "github.com",
        ],
    }

    # Source reputation scores
    SOURCE_REPUTATION = {
        "docs.python.org": 100,
        "docs.oracle.com": 100,
        "react.dev": 100,
        "python.org": 95,
        "oracle.com": 95,
        "postgresql.org": 95,
        "mysql.com": 95,
        "developer.mozilla.org": 90,
        "mdn.org": 90,
        "realpython.com": 85,
        "geeksforgeeks.org": 80,
        "w3schools.com": 75,
        "javatpoint.com": 70,
        "baeldung.com": 75,
        "javascript.info": 80,
        "html.spec.whatwg.org": 90,
        "wikipedia.org": 70,
        "github.com": 70,
    }

    def __init__(self):
        self.logger = logger

    def rank_sources(self, topic: str, available_sources: List[str]) -> List[str]:
        """
        Rank available sources by topic preference.

        Args:
            topic: Learning topic (e.g., "Python", "React")
            available_sources: List of available source domains

        Returns:
            Sorted list of sources by preference
        """
        topic_lower = topic.lower()

        # Get preferred sources for this topic
        preferred = self.TOPIC_SOURCE_PREFERENCES.get(
            topic_lower,
            self.TOPIC_SOURCE_PREFERENCES.get("default", [])
        )

        # Score available sources
        scored = []
        for source in available_sources:
            score = self._score_source(source, preferred)
            scored.append((source, score))

        # Sort by score descending
        scored.sort(key=lambda x: x[1], reverse=True)

        ranked = [source for source, _ in scored]
        self.logger.info(f"Ranked sources for '{topic}': {ranked}")

        return ranked

    def _score_source(self, source: str, preferences: List[str]) -> int:
        """Score a source based on preferences and reputation."""
        score = 0

        # Preference ranking score
        if source in preferences:
            score += (100 - preferences.index(source) * 10)

        # Reputation score
        reputation = self.SOURCE_REPUTATION.get(source, 50)
        score += reputation / 2

        # Domain matching bonus
        source_lower = source.lower()
        for pref in preferences:
            if pref in source_lower:
                score += 10
                break

        return score

    def should_include_source(self, source: str, topic: str, rank: int) -> bool:
        """
        Determine if source should be included for this topic.

        Args:
            source: Source domain
            topic: Learning topic
            rank: Rank position (0-based)

        Returns:
            True if source should be included
        """
        # Always include top 3 sources
        if rank < 3:
            return True

        # Include if reputation is high
        reputation = self.SOURCE_REPUTATION.get(source, 50)
        if reputation >= 75:
            return True

        # Include if in preferred list
        topic_lower = topic.lower()
        preferred = self.TOPIC_SOURCE_PREFERENCES.get(
            topic_lower,
            self.TOPIC_SOURCE_PREFERENCES.get("default", [])
        )

        if source in preferred:
            return True

        return False

    def get_source_type(self, source_url: str) -> str:
        """
        Infer source type from URL.

        Args:
            source_url: Source URL or domain

        Returns:
            Source type (e.g., "Official Documentation", "Tutorial", "Q&A")
        """
        url_lower = source_url.lower()

        if any(x in url_lower for x in ["docs.", ".org", "python.org", "oracle.com", "react.dev"]):
            return "Official Documentation"
        elif any(x in url_lower for x in ["geeksforgeeks", "w3schools", "tutorial"]):
            return "Tutorial Site"
        elif any(x in url_lower for x in ["stackoverflow", "github", "reddit"]):
            return "Community Content"
        elif any(x in url_lower for x in ["medium", "dev.to", "blog"]):
            return "Blog/Article"
        else:
            return "Learning Resource"
