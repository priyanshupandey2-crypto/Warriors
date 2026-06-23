"""
Topic Cleaner Service
=====================

Filters out website navigation, marketing, and non-educational content
from extracted topics, subtopics, and concepts.

Removes noise patterns that represent website structure rather than
learning concepts.
"""

import logging
from typing import List, Set

logger = logging.getLogger(__name__)


class TopicCleanerService:
    """Cleans extracted topics by removing website navigation noise."""

    # Website navigation and marketing content to remove
    NOISE_TERMS = {
        # Certification/Reference pages
        "Cert",
        "Certification",
        "Certified",
        "Certificate",
        "Reference",
        "References",

        # Tutorial/Course markers
        "Tutorial",
        "Tutorials",
        "How To",
        "How-To",
        "Guide",
        "Guides",

        # Examples and exercises
        "Examples",
        "Example",
        "Exercises",
        "Exercise",
        "Quiz",
        "Quizzes",
        "Practice",

        # User engagement tracking
        "Track Your Progress",
        "Track Progress",
        "Progress",
        "Learn by Examples",
        "Learn by Example",

        # Top content sections
        "Top Tutorials",
        "Top References",
        "Top Examples",
        "Top Content",
        "Popular",
        "Trending",

        # Error pages
        "404",
        "Page Not Found",
        "Whoops",
        "Error",
        "Not Found",
        "Missing",

        # Authentication
        "Login",
        "Sign In",
        "Sign Up",
        "Register",
        "Logout",
        "Sign Out",

        # Contact/Support
        "Contact",
        "Contact Us",
        "Contact Sales",
        "Support",
        "Help",
        "Feedback",
        "Report Error",
        "Report Issue",

        # Legal/Policy
        "Privacy",
        "Privacy Policy",
        "Terms",
        "Terms of Service",
        "Cookie",
        "Cookie Policy",
        "Disclaimer",
        "About",
        "About Us",

        # Navigation
        "Home",
        "Back",
        "Next",
        "Previous",
        "More",
        "View More",
        "See More",

        # Marketing
        "Get Certified",
        "Start Learning",
        "Continue Learning",
        "Begin Now",
        "Subscribe",
        "Newsletter",
        "Special Offer",
        "Pro",
        "Premium",

        # Social
        "Follow Us",
        "Share",
        "Like",
        "Comment",
        "Social",

        # Search/Explore
        "Search",
        "Explore",
        "Browse",
        "Discover",
        "Find",

        # Generic non-learning
        "Learn",
        "Know",
        "Create",
        "Build",
        "Get Started",
        "Note",
        "Important",
        "Info",
        "Information",

        # MDN/Documentation specific
        "Help improve MDN",
        "Improve this page",
        "Edit on GitHub",
        "Found a problem with this page",

        # Interview/Career
        "Interview Questions",
        "Career Opportunities",
        "Cheat Sheet",

        # Generic programming terms (off-topic for HTML)
        "arrays",
        "strings",
        "rest api",
        "API",
        "Database",
        "Variables",
        "Functions",
        "Classes",
        "Methods",

        # Week/Month markers (course structure, not content)
        "Week 1",
        "Week 2",
        "Week 3",
        "Month 1",
        "Day 1",

        # Formatting placeholders
        "**Basics**",
        "**Advanced**",
        "Basics",

        # SQL keywords (too generic for topics)
        "SELECT",
        "FROM",
        "WHERE",
        "JOIN",
        "LEFT",
        "RIGHT",
        "INNER",
        "OUTER",
        "INSERT",
        "UPDATE",
        "DELETE",
        "CREATE",
        "DROP",
        "ALTER",
        "TABLE",
        "DATABASE",
        "INDEX",
        "VIEW",
        "PROCEDURE",
        "TRIGGER",
        "CONSTRAINT",
        "PRIMARY",
        "FOREIGN",
        "UNIQUE",
        "CHECK",
        "DEFAULT",
        "NULL",
        "NOT",
        "AND",
        "OR",
        "IN",
        "LIKE",
        "BETWEEN",
        "EXISTS",
        "CASE",
        "WHEN",
        "THEN",
        "ELSE",
        "END",
        "AS",
        "ON",
        "USING",
        "GROUP",
        "ORDER",
        "BY",
        "HAVING",
        "LIMIT",
        "OFFSET",
        "UNION",
        "INTERSECT",
        "EXCEPT",
        "DISTINCT",
        "ALL",
        "ANY",
        "SOME",
        "WITH",
        "RECURSIVE",
        "LATERAL",
        "CROSS",
        "NATURAL",
        "FULL",
        "INTO",
        "VALUES",
        "SET",

        # Common demo/example content
        "PRINT",
        "INSIDE",
        "MONITOR",
        "Customers",
        "Products",
        "Orders",
        "Employees",
        "Departments",
    }

    # Patterns that suggest non-educational content
    PATTERN_KEYWORDS = {
        "page",  # Page layouts
        "footer",  # Website footer
        "navigation",  # Navigation elements
        "menu",  # Menu items
        "sidebar",  # Sidebar content
        "header",  # Header sections
        "banner",  # Promotional banners
        "ad",  # Advertisements
        "advertisement",
    }

    MIN_TOPIC_LENGTH = 3  # Filter very short topics
    MAX_TOPIC_LENGTH = 100  # Filter very long topics

    def __init__(self):
        self.logger = logger

    def clean_topics(self, topics: List[str]) -> List[str]:
        """Clean topics by removing noise patterns."""
        cleaned = []
        for topic in topics:
            if self._is_valid_topic(topic):
                cleaned.append(topic)

        self.logger.info(f"Cleaned topics: {len(topics)} → {len(cleaned)}")
        return cleaned

    def clean_subtopics(
        self, subtopics: dict
    ) -> dict:
        """Clean subtopic dictionary by removing noise."""
        cleaned = {}

        for main_topic, subs in subtopics.items():
            # Clean main topic
            if not self._is_valid_topic(main_topic):
                continue

            # Clean subtopics
            clean_subs = [s for s in subs if self._is_valid_topic(s)]

            if clean_subs:
                cleaned[main_topic] = clean_subs

        return cleaned

    def clean_concepts(self, concepts: List[str]) -> List[str]:
        """Clean concepts by removing UI and non-technical terms."""
        ui_noise = {
            "Checkmark",
            "Know",
            "Create",
            "Click",
            "Explore",
            "Discover",
            "Read",
            "View",
            "See",
            "Link",
            "Help",
            "Improve",
            "Edit",
            "GitHub",
            "Problem",
            "Report",
            "Contact",
            "Terms",
            "Privacy",
            "Cookie",
            "arrays",
            "strings",
            "rest api",
            "REST API",
            "API",
            "Database",
            "Variables",
            "Functions",
            "Classes",
            "Methods",
            "Week",
            "Month",
            "Day",
            "Career",
            "Interview",
            "Cheat",
            "Sheet",
        }

        cleaned = []
        for concept in concepts:
            if concept not in ui_noise and self._is_valid_topic(concept):
                cleaned.append(concept)

        return cleaned

    def _is_valid_topic(self, topic: str) -> bool:
        """Check if topic is valid (not noise)."""
        if not topic or len(topic.strip()) == 0:
            self.logger.debug(f"Invalid topic: empty")
            return False

        # Length check
        if len(topic) < self.MIN_TOPIC_LENGTH or len(topic) > self.MAX_TOPIC_LENGTH:
            self.logger.debug(f"Invalid topic: {topic} (length {len(topic)} outside {self.MIN_TOPIC_LENGTH}-{self.MAX_TOPIC_LENGTH})")
            return False

        topic_lower = topic.lower()

        # Exact match check (case-insensitive)
        for noise_term in self.NOISE_TERMS:
            if topic_lower == noise_term.lower():
                self.logger.debug(f"Invalid topic: {topic} (noise term match)")
                return False

        # Pattern keyword check
        for pattern in self.PATTERN_KEYWORDS:
            if pattern in topic_lower:
                self.logger.debug(f"Invalid topic: {topic} (contains pattern: {pattern})")
                return False

        # Check for multiple consecutive spaces
        if "  " in topic:
            self.logger.debug(f"Invalid topic: {topic} (multiple spaces)")
            return False

        return True
