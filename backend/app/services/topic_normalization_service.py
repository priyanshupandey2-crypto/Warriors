"""
Topic Normalization Service
============================

Normalizes extracted topics by removing redundant language prefixes
and consolidating similar concepts into standard learning terminology.
"""

import logging
import re
from typing import List, Dict

logger = logging.getLogger(__name__)


class TopicNormalizationService:
    """Normalizes topics to standard learning terminology."""

    # Language/framework prefixes to remove when repeated
    COMMON_PREFIXES = {
        "Python",
        "Java",
        "JavaScript",
        "React",
        "Node",
        "Node.js",
        "Angular",
        "Vue",
        "Vue.js",
        "C#",
        "C++",
        "Go",
        "Rust",
        "Ruby",
        "PHP",
        "SQL",
        "MongoDB",
        "PostgreSQL",
    }

    # Topic aliases - map variations to canonical forms
    TOPIC_ALIASES = {
        # Basic concepts
        "variables": ["variables", "var", "variable declaration"],
        "data types": ["data types", "datatypes", "types", "primitives", "primitive types"],
        "operators": ["operators", "operations", "arithmetic", "logical operators"],
        "control flow": ["control flow", "conditionals", "loops", "if-else", "for loops", "while loops"],
        "functions": ["functions", "methods", "procedures", "subroutines", "function calls"],
        "arrays": ["arrays", "lists", "collections", "sequences"],
        "dictionaries": ["dictionaries", "maps", "hash maps", "objects", "key-value pairs"],
        "strings": ["strings", "text", "string manipulation", "string methods"],

        # OOP
        "classes": ["classes", "objects", "object-oriented", "oop"],
        "inheritance": ["inheritance", "extends", "super", "parent classes"],
        "polymorphism": ["polymorphism", "method overriding", "method overloading"],
        "encapsulation": ["encapsulation", "access modifiers", "private", "public", "protected"],
        "abstraction": ["abstraction", "abstract classes", "interfaces"],

        # Advanced topics
        "file handling": ["file handling", "file io", "file operations", "reading files", "writing files"],
        "exception handling": ["exception handling", "try-catch", "error handling", "exceptions", "error management"],
        "modules": ["modules", "packages", "imports", "libraries", "namespaces"],
        "decorators": ["decorators", "annotations", "wrappers"],
        "generators": ["generators", "iterators", "yield"],
        "async": ["async", "asynchronous", "promises", "callbacks", "async-await"],

        # Data structures
        "linked lists": ["linked lists", "linked list", "nodes"],
        "stacks": ["stacks", "stack data structure"],
        "queues": ["queues", "queue data structure"],
        "trees": ["trees", "binary trees", "tree structures"],
        "graphs": ["graphs", "graph algorithms", "nodes and edges"],
        "hash tables": ["hash tables", "hashing", "hash maps"],

        # Algorithms
        "sorting": ["sorting", "sort algorithms", "bubble sort", "merge sort", "quick sort"],
        "searching": ["searching", "search algorithms", "binary search", "linear search"],
        "recursion": ["recursion", "recursive functions", "call stack"],
        "dynamic programming": ["dynamic programming", "memoization", "optimization"],

        # Web/Database
        "rest api": ["rest api", "rest", "http", "api endpoints", "web services"],
        "databases": ["databases", "database design", "sql", "relational databases"],
        "sql": ["sql", "sql queries", "database queries", "select", "join"],
        "nosql": ["nosql", "mongodb", "document databases", "non-relational"],
        "transactions": ["transactions", "acid", "consistency"],

        # Paradigms
        "functional programming": ["functional programming", "pure functions", "lambdas"],
        "object-oriented": ["object-oriented", "oop", "object oriented programming"],
        "imperative": ["imperative", "procedural"],
        "declarative": ["declarative", "functional"],

        # MySQL/Database specific
        "database design": ["database design", "schema design", "normalization", "relational design"],
        "select statements": ["select", "select statements", "querying data", "data retrieval"],
        "insert statements": ["insert", "insert statements", "adding data", "data insertion"],
        "update statements": ["update", "update statements", "modifying data", "data modification"],
        "delete statements": ["delete", "delete statements", "removing data", "data deletion"],
        "joins": ["join", "joins", "inner join", "left join", "right join", "cross join"],
        "indexes": ["indexes", "indexing", "index creation", "query optimization"],
        "views": ["views", "database views", "virtual tables"],
        "stored procedures": ["stored procedures", "procedures", "triggers", "automation"],
        "transactions": ["transactions", "commit", "rollback", "consistency"],
        "constraints": ["constraints", "primary key", "foreign key", "unique constraints"],
        "data types": ["data types", "varchar", "int", "datetime", "blob", "type selection"],
        "normalization": ["normalization", "database normalization", "first normal form", "second normal form"],
        "backup and recovery": ["backup", "recovery", "data backup", "data recovery", "replication"],
        "permissions": ["permissions", "users", "access control", "privileges", "authentication"],
        "performance tuning": ["performance tuning", "optimization", "query optimization", "indexing strategies"],
    }

    def __init__(self):
        self.logger = logger
        # Build reverse mapping for quick lookup
        self.canonical_map = {}
        for canonical, aliases in self.TOPIC_ALIASES.items():
            for alias in aliases:
                self.canonical_map[alias.lower()] = canonical

    def normalize_topics(self, topics: List[str]) -> List[str]:
        """Normalize topics to canonical forms and remove duplicates."""
        normalized = set()

        for topic in topics:
            # Remove language prefix
            cleaned = self._remove_prefix(topic)

            # Map to canonical form
            canonical = self._get_canonical_form(cleaned)

            if canonical:
                normalized.add(canonical)

        # Sort for consistency
        return sorted(list(normalized))

    def normalize_subtopics(self, subtopics: Dict[str, List[str]]) -> Dict[str, List[str]]:
        """Normalize subtopic dictionary."""
        normalized = {}

        for main_topic, subs in subtopics.items():
            # Normalize main topic
            main_normalized = self._get_canonical_form(
                self._remove_prefix(main_topic)
            )

            if not main_normalized:
                main_normalized = self._remove_prefix(main_topic)

            if not main_normalized:
                continue

            # Normalize subtopics
            normalized_subs = set()
            for sub in subs:
                normalized_sub = self._get_canonical_form(
                    self._remove_prefix(sub)
                )
                if normalized_sub:
                    normalized_subs.add(normalized_sub)

            if normalized_subs:
                normalized[main_normalized] = sorted(list(normalized_subs))

        return normalized

    def _remove_prefix(self, topic: str) -> str:
        """Remove common language/framework prefix."""
        words = topic.split()

        if not words:
            return topic

        # Check if first word is a common prefix
        first_word = words[0]
        if first_word in self.COMMON_PREFIXES and len(words) > 1:
            # Only remove if remainder is still meaningful
            remainder = " ".join(words[1:])
            if len(remainder.split()) >= 1:
                return remainder

        return topic

    def _get_canonical_form(self, topic: str) -> str:
        """Get canonical form of topic."""
        topic_lower = topic.lower().strip()

        # Direct match
        if topic_lower in self.canonical_map:
            return self.canonical_map[topic_lower]

        # Partial match (check if topic contains an alias)
        for alias, canonical in self.canonical_map.items():
            if alias in topic_lower and len(alias) > 3:  # Avoid short word matches
                return canonical

        # Return original if no mapping found
        return topic if len(topic) > 0 else None
