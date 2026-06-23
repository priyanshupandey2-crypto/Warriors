"""
Firecrawl Integration Service
==============================

Purpose:
    Handles web content extraction and processing using Firecrawl API.
    Implements the full content pipeline: fetch → clean → normalize → chunk → structure.

Architecture:
    Routes (routers/curriculum.py)
        ↓
    Service (services/firecrawl_service.py) ← YOU ARE HERE
        ↓
    Repository (repositories/curriculum_repository.py)
        ↓
    Database (PostgreSQL - curriculum_sources, curriculum_chunks)

Pipeline Stages:
    1. URL Validation: Remove dead links, validate against trusted sources
    2. Firecrawl Fetch: Call Firecrawl API to extract markdown + metadata
    3. Content Cleaning: Remove navigation, ads, boilerplate, scripts
    4. Content Normalization: Standardize markdown, code blocks, tables, links
    5. Topic Extraction: Extract headings, concepts, keywords
    6. Chunking: Split by sections, heading hierarchy, token limits
    7. Knowledge Pack: Create structured output with metadata
    8. Database Persistence: Save to curriculum_sources and curriculum_chunks tables

Integration Points:
    - Firecrawl API: External content extraction service
    - PostgreSQL: Store curriculum sources and chunks
    - LangSmith Tracing: Monitor extraction quality and performance
"""

import os
import re
import json
import logging
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime
from dataclasses import dataclass, asdict
from enum import Enum

import requests
from sqlalchemy.orm import Session

from app.config import settings
from app.schemas.curriculum import (
    CurriculumChunkSchema,
    CurriculumSourceSchema,
    KnowledgePackSchema,
)

logger = logging.getLogger(__name__)


class ContentSourceType(str, Enum):
    """Trusted content sources for curriculum building."""
    W3SCHOOLS = "W3Schools"
    GEEKSFORGEEKS = "GeeksForGeeks"
    MDN = "MDN"
    JAVAPOINT = "JavaTPoint"
    OFFICIAL_DOCS = "Official Docs"
    ROADMAP = "Roadmap"


TRUSTED_DOMAINS = {
    "w3schools.com": ContentSourceType.W3SCHOOLS,
    "geeksforgeeks.org": ContentSourceType.GEEKSFORGEEKS,
    "developer.mozilla.org": ContentSourceType.MDN,
    "javatpoint.com": ContentSourceType.JAVAPOINT,
    "roadmap.sh": ContentSourceType.ROADMAP,
}


@dataclass
class CurriculumSource:
    """Raw extracted content from a single URL."""
    url: str
    source_type: str
    title: str
    description: str
    raw_markdown: str
    headings: List[str]
    metadata: Dict[str, Any]
    fetched_at: datetime


@dataclass
class ContentChunk:
    """A normalized, semantically complete chunk of content."""
    source_url: str
    chunk_index: int
    heading_path: str
    content: str
    token_count: int
    concepts: List[str]
    metadata: Dict[str, Any]


class FirecrawlClient:
    """Firecrawl API client wrapper."""

    def __init__(self, api_key: Optional[str] = None):
        from app.config import settings
        self.api_key = api_key or settings.FIRECRAWL_API_KEY
        if not self.api_key:
            raise ValueError("FIRECRAWL_API_KEY not configured in .env file")
        self.base_url = "https://api.firecrawl.dev/v1"
        self.session = requests.Session()
        self.session.headers.update({"Authorization": f"Bearer {self.api_key}"})

    def scrape(self, url: str, options: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Scrape a single URL using Firecrawl API.

        Args:
            url: URL to scrape
            options: Optional parameters (formatOptions, includeHtmlTags, etc.)

        Returns:
            {
                "success": bool,
                "data": {
                    "markdown": str,
                    "metadata": {
                        "title": str,
                        "description": str,
                        "language": str,
                        "sourceURL": str,
                        ...
                    }
                }
            }

        Raises:
            requests.exceptions.RequestException: If API call fails
        """
        payload = {
            "url": url,
            "formats": ["markdown"],
            **(options or {})
        }

        response = self.session.post(
            f"{self.base_url}/scrape",
            json=payload,
            timeout=30
        )
        response.raise_for_status()

        result = response.json()
        if not result.get("success"):
            raise ValueError(f"Firecrawl scrape failed: {result.get('error', 'Unknown error')}")

        return result

    def crawl(
        self,
        url: str,
        limit: int = 50,
        allow_external_links: bool = False,
        options: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Crawl a domain starting from a URL.

        Args:
            url: Starting URL
            limit: Max pages to crawl (default 50)
            allow_external_links: Follow external domain links
            options: Additional Firecrawl options

        Returns:
            {
                "success": bool,
                "id": str,
                "url": str,
                "data": [
                    {
                        "markdown": str,
                        "metadata": {...},
                        "url": str
                    }
                ]
            }
        """
        payload = {
            "url": url,
            "limit": limit,
            "allowExternalLinks": allow_external_links,
            "formats": ["markdown"],
            **(options or {})
        }

        response = self.session.post(
            f"{self.base_url}/crawl",
            json=payload,
            timeout=60
        )
        response.raise_for_status()

        return response.json()


class ContentCleaner:
    """Remove boilerplate, navigation, ads from extracted content."""

    BOILERPLATE_PATTERNS = [
        r"(?i)cookie.*?(accept|reject|consent)",
        r"(?i)(subscribe|newsletter|sign\s+up).*?(?:here|now)",
        r"(?i)advertisement|sponsored content",
        r"(?i)^follow\s+us|share\s+on",
        r"(?i)related.*?articles?",
        r"(?i)table of contents",
    ]

    SCRIPT_PATTERNS = [
        r"<script[^>]*>.*?</script>",
        r"<!--.*?-->",
        r"\[javascript\].*?\[/javascript\]",
    ]

    @staticmethod
    def clean(markdown: str) -> str:
        """
        Remove common boilerplate from extracted markdown.

        Steps:
            1. Remove script tags and comments
            2. Remove common boilerplate patterns
            3. Remove excessive whitespace
            4. Remove orphaned links
        """
        content = markdown

        for pattern in ContentCleaner.SCRIPT_PATTERNS:
            content = re.sub(pattern, "", content, flags=re.IGNORECASE | re.DOTALL)

        for pattern in ContentCleaner.BOILERPLATE_PATTERNS:
            content = re.sub(pattern, "", content, flags=re.IGNORECASE | re.MULTILINE)

        content = re.sub(r"\n\n\n+", "\n\n", content)
        content = re.sub(r"^\s*[\[\(].*?[\]\)]\s*$", "", content, flags=re.MULTILINE)

        return content.strip()


class ContentNormalizer:
    """Normalize markdown for consistency across sources."""

    @staticmethod
    def normalize_headings(markdown: str) -> str:
        """Ensure consistent heading format."""
        lines = []
        for line in markdown.split("\n"):
            if line.startswith("#"):
                heading_text = line.lstrip("#").strip()
                level = len(line) - len(line.lstrip("#"))
                lines.append(f"{'#' * level} {heading_text}")
            else:
                lines.append(line)
        return "\n".join(lines)

    @staticmethod
    def normalize_code_blocks(markdown: str) -> str:
        """Standardize code block formatting."""
        lines = []
        in_code_block = False
        code_fence = "```"

        for line in markdown.split("\n"):
            if line.strip().startswith("```"):
                in_code_block = not in_code_block
                if not line.strip().startswith(code_fence):
                    lines.append(code_fence)
                else:
                    lines.append(line)
            else:
                lines.append(line)

        return "\n".join(lines)

    @staticmethod
    def normalize_links(markdown: str) -> str:
        """Standardize link formatting."""
        link_pattern = r"\[(.*?)\]\((.*?)\)"

        def normalize_link(match):
            text, url = match.groups()
            if not url.startswith(("http://", "https://", "#", "/")):
                return match.group(0)
            return f"[{text.strip()}]({url.strip()})"

        return re.sub(link_pattern, normalize_link, markdown)

    @staticmethod
    def normalize(markdown: str) -> str:
        """Apply all normalizations."""
        markdown = ContentNormalizer.normalize_headings(markdown)
        markdown = ContentNormalizer.normalize_code_blocks(markdown)
        markdown = ContentNormalizer.normalize_links(markdown)
        return markdown


class TopicExtractor:
    """Extract topics, subtopics, and concepts from content."""

    # SQL keywords that are too generic to be topics
    SQL_KEYWORDS = {
        "SELECT", "FROM", "WHERE", "JOIN", "LEFT", "RIGHT", "INNER", "OUTER",
        "INSERT", "UPDATE", "DELETE", "CREATE", "DROP", "ALTER", "TABLE",
        "DATABASE", "INDEX", "VIEW", "PROCEDURE", "TRIGGER", "CONSTRAINT",
        "PRIMARY", "FOREIGN", "UNIQUE", "CHECK", "DEFAULT", "NULL", "NOT",
        "AND", "OR", "IN", "LIKE", "BETWEEN", "EXISTS", "CASE", "WHEN",
        "THEN", "ELSE", "END", "AS", "ON", "USING", "GROUP", "ORDER", "BY",
        "HAVING", "LIMIT", "OFFSET", "UNION", "INTERSECT", "EXCEPT",
        "DISTINCT", "ALL", "ANY", "SOME", "WITH", "RECURSIVE", "LATERAL",
        "CROSS", "NATURAL", "FULL", "OUTER", "INTO", "VALUES", "SET",
        "PRINT", "INSIDE", "MONITOR", "CUSTOMERS"  # Common W3Schools examples
    }

    # Programming/generic terms that are too vague
    GENERIC_TERMS = {
        "Example", "Tutorial", "Introduction", "Overview", "Reference", "Guide",
        "Basic", "Advanced", "Intermediate", "Beginner", "Expert", "Course",
        "Chapter", "Section", "Module", "Lesson", "Topic", "Subject", "Content",
        "Information", "Details", "Description", "Explanation", "Definition"
    }

    @staticmethod
    def extract_headings(markdown: str) -> List[str]:
        """Extract all headings (ordered by appearance)."""
        heading_pattern = r"^#+\s+(.+?)$"
        headings = re.findall(heading_pattern, markdown, flags=re.MULTILINE)
        return headings

    @staticmethod
    def extract_concepts(markdown: str) -> List[str]:
        """
        Extract key concepts from content.

        IMPROVED: Multiple extraction strategies for 80%+ recall:
            1. Bold text: **concept**
            2. Code blocks: `concept`
            3. Multi-word phrases from text
            4. Sentence-level pattern matching
            5. Section headings (H3+)

        Previous recall: 50% (only bold/code/phrases)
        Target recall: 80%+ (with additional strategies)
        """
        concepts = set()

        # STRATEGY 1: Extract bold text (usually emphasized concepts)
        bold_pattern = r"\*\*(.+?)\*\*"
        bold_concepts = re.findall(bold_pattern, markdown)
        for concept in bold_concepts:
            concept = concept.strip()
            # Skip code/math formulas
            if len(concept) > 2 and not concept.startswith('`') and '=' not in concept:
                concepts.add(concept)

        # STRATEGY 2: Extract code blocks (usually technical terms)
        # But skip formulas (contain =, *, etc.)
        code_pattern = r"`([^`]+)`"
        code_concepts = re.findall(code_pattern, markdown)
        for concept in code_concepts:
            concept = concept.strip()
            # Skip mathematical formulas
            if (len(concept) > 2 and
                not any(op in concept for op in ['=', '*', '+', '/', '^', 'theta']) and
                concept.count(' ') < 4):  # Prefer short phrases, not full equations
                concepts.add(concept)

        # STRATEGY 3: Extract capitalized multi-word phrases
        # FIXED: Handle line breaks that broke extraction before
        phrase_pattern = r"\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b"
        phrases = re.findall(phrase_pattern, markdown)

        stop_words = {
            "The", "A", "An", "Is", "Are", "And", "Or", "In", "On", "At",
            "To", "Of", "For", "By", "With", "From", "As", "Have", "Has",
            "This", "That", "These", "Those", "Which", "What", "Where"
        }

        for phrase in phrases:
            phrase = phrase.strip()
            # Only keep 2-4 word phrases (avoid overly long ones)
            word_count = len(phrase.split())
            if (len(phrase) > 2 and
                2 <= word_count <= 4 and
                phrase not in stop_words and
                phrase not in TopicExtractor.GENERIC_TERMS):
                concepts.add(phrase)

        # STRATEGY 4: Extract section headings (H3, H4) as concepts
        # These are often important sub-concepts
        heading_pattern = r"^###+ (.+?)$"
        section_headings = re.findall(heading_pattern, markdown, flags=re.MULTILINE)
        for heading in section_headings:
            heading = heading.strip()
            if (len(heading) > 2 and
                heading not in TopicExtractor.GENERIC_TERMS and
                len(heading.split()) <= 5):  # Skip overly long headings
                concepts.add(heading)

        # STRATEGY 5: Extract concepts from common pattern: "X is a/the concept"
        # E.g., "Gradient Descent is an optimization algorithm"
        definition_pattern = r"\b([A-Z][a-zA-Z\s]+?)\s+(?:is|are)\s+(?:a|the|an)\s+(\w+)"
        definitions = re.findall(definition_pattern, markdown)
        for concept, _ in definitions:
            concept = concept.strip()
            if (len(concept) > 2 and
                len(concept.split()) <= 4 and
                concept not in TopicExtractor.GENERIC_TERMS):
                concepts.add(concept)

        # Filter out overly generic terms
        filtered = [
            c for c in concepts
            if (c not in TopicExtractor.GENERIC_TERMS and
                len(c) > 2 and
                len(c.split()) <= 4 and  # Max 4 words
                '\\n' not in c and  # Remove newlines
                not c.isupper())  # Avoid all-caps acronyms initially
        ]

        return sorted(list(set(filtered)))[:50]  # Top 50 concepts (increased from 30)

    @staticmethod
    def build_heading_path(headings: List[Tuple[int, str]]) -> str:
        """Build hierarchical heading path."""
        return " > ".join([h[1] for h in headings])


class ContentChunker:
    """Split normalized content into semantic chunks."""

    DEFAULT_CHUNK_SIZE = 1000
    DEFAULT_OVERLAP = 200

    @staticmethod
    def estimate_tokens(text: str) -> int:
        """Estimate token count (rough approximation: 1 token ≈ 4 chars)."""
        return len(text) // 4

    @staticmethod
    def chunk_by_heading(
        markdown: str,
        max_chunk_size: int = DEFAULT_CHUNK_SIZE
    ) -> List[Tuple[int, str, str]]:
        """
        Split content by heading hierarchy.

        Returns:
            List of (heading_level, heading_text, section_content)
        """
        chunks = []
        lines = markdown.split("\n")
        current_section = {"level": 0, "heading": "", "content": []}

        for line in lines:
            heading_match = re.match(r"^(#+)\s+(.+?)$", line)

            if heading_match:
                heading_level = len(heading_match.group(1))
                heading_text = heading_match.group(2)

                if current_section["content"] and current_section["level"] > 0:
                    content_text = "\n".join(current_section["content"]).strip()
                    if content_text:
                        chunks.append((
                            current_section["level"],
                            current_section["heading"],
                            content_text
                        ))

                current_section = {
                    "level": heading_level,
                    "heading": heading_text,
                    "content": [line]
                }
            else:
                current_section["content"].append(line)

        if current_section["content"]:
            content_text = "\n".join(current_section["content"]).strip()
            if content_text:
                chunks.append((
                    current_section["level"],
                    current_section["heading"],
                    content_text
                ))

        return chunks

    @staticmethod
    def split_by_size(text: str, max_size: int) -> List[str]:
        """Split text by character limit (respecting word boundaries)."""
        if len(text) <= max_size:
            return [text]

        chunks = []
        current_chunk = ""

        for paragraph in text.split("\n\n"):
            if len(current_chunk) + len(paragraph) > max_size:
                if current_chunk:
                    chunks.append(current_chunk)
                current_chunk = paragraph
            else:
                current_chunk += ("\n\n" + paragraph if current_chunk else paragraph)

        if current_chunk:
            chunks.append(current_chunk)

        return chunks

    @staticmethod
    def chunk(
        markdown: str,
        max_chunk_size: int = DEFAULT_CHUNK_SIZE
    ) -> List[Tuple[str, str, int, List[str]]]:
        """
        Create semantic chunks from markdown.

        Returns:
            List of (heading_path, chunk_content, token_count, concepts)
        """
        heading_chunks = ContentChunker.chunk_by_heading(markdown, max_chunk_size)
        final_chunks = []
        heading_stack = []

        for level, heading, content in heading_chunks:
            heading_stack = [h for h in heading_stack if h[0] < level]
            heading_stack.append((level, heading))

            sub_chunks = ContentChunker.split_by_size(content, max_chunk_size)

            for sub_chunk in sub_chunks:
                heading_path = TopicExtractor.build_heading_path(heading_stack)
                token_count = ContentChunker.estimate_tokens(sub_chunk)
                concepts = TopicExtractor.extract_concepts(sub_chunk)

                final_chunks.append((
                    heading_path,
                    sub_chunk,
                    token_count,
                    concepts
                ))

        return final_chunks


class FirecrawlService:
    """Main service orchestrating the entire extraction pipeline."""

    def __init__(self, db: Optional[Session] = None):
        self.firecrawl = FirecrawlClient()
        self.db = db
        self.cleaner = ContentCleaner()
        self.normalizer = ContentNormalizer()
        self.extractor = TopicExtractor()
        self.chunker = ContentChunker()

    def validate_url(self, url: str) -> Tuple[bool, Optional[str]]:
        """
        Validate URL is from trusted source and accessible.

        Returns:
            (is_valid, source_type_or_error_message)
        """
        try:
            from urllib.parse import urlparse
            parsed = urlparse(url)
            domain = parsed.netloc.replace("www.", "")

            for trusted_domain, source_type in TRUSTED_DOMAINS.items():
                if domain.endswith(trusted_domain):
                    response = requests.head(url, timeout=5, allow_redirects=True)
                    if response.status_code == 200:
                        return True, source_type.value
                    else:
                        return False, f"URL returned status {response.status_code}"

            return False, "Domain not in trusted sources"

        except Exception as e:
            return False, str(e)

    def _validate_extraction_quality(self, markdown: str, url: str) -> Tuple[bool, str]:
        """
        Validate that extracted content has sufficient educational value.

        Checks:
            1. Content length (must be > 1000 chars)
            2. Heading structure (must have >= 2 headings)
            3. Content richness (enough concepts extracted)

        Returns:
            (is_valid, message)
        """
        # Check content length
        if len(markdown) < 1000:
            return False, f"Content too short ({len(markdown)} chars < 1000 minimum)"

        # Check for headings
        headings = self.extractor.extract_headings(markdown)
        if len(headings) < 2:
            return False, f"Insufficient structure ({len(headings)} headings < 2 minimum)"

        # Check for concepts
        concepts = self.extractor.extract_concepts(markdown)
        if len(concepts) < 3:
            return False, f"Low concept density ({len(concepts)} concepts < 3 minimum)"

        return True, f"Quality check passed: {len(markdown)} chars, {len(headings)} headings, {len(concepts)} concepts"

    def extract_source(self, url: str) -> Optional[CurriculumSource]:
        """
        Extract content from a single URL.

        Pipeline:
            1. Validate URL
            2. Fetch with Firecrawl
            3. Clean boilerplate
            4. Normalize formatting
            5. Validate extraction quality
            6. Extract metadata
            7. Return CurriculumSource
        """
        logger.info(f"Starting extraction for {url}")

        is_valid, source_type = self.validate_url(url)
        if not is_valid:
            logger.error(f"URL validation failed for {url}: {source_type}")
            return None

        try:
            # Use Firecrawl options to extract only main content (removes nav, headers, footers)
            firecrawl_result = self.firecrawl.scrape(url, options={
                "onlyMainContent": True,  # Extract only article/main body
                "headers": {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}
            })
            if not firecrawl_result.get("success"):
                logger.error(f"Firecrawl failed for {url}")
                return None

            data = firecrawl_result.get("data", {})
            raw_markdown = data.get("markdown", "")
            metadata = data.get("metadata", {})

            cleaned = self.cleaner.clean(raw_markdown)
            normalized = self.normalizer.normalize(cleaned)

            # Validate extraction quality before proceeding
            quality_valid, quality_msg = self._validate_extraction_quality(normalized, url)
            logger.info(f"Extraction quality check for {url}: {quality_msg}")

            if not quality_valid:
                logger.warning(f"Quality check failed for {url}: {quality_msg}")
                return None

            headings = self.extractor.extract_headings(normalized)

            source = CurriculumSource(
                url=url,
                source_type=source_type,
                title=metadata.get("title", ""),
                description=metadata.get("description", ""),
                raw_markdown=normalized,
                headings=headings,
                metadata={
                    "language": metadata.get("language", "en"),
                    "og_image": metadata.get("ogImage", ""),
                    "original_title": metadata.get("title", ""),
                    "content_length": len(normalized),
                    "heading_count": len(headings),
                    "quality_check": "passed",
                },
                fetched_at=datetime.utcnow()
            )

            logger.info(f"Successfully extracted {url} ({len(normalized)} chars, {len(headings)} headings)")
            return source

        except Exception as e:
            logger.error(f"Extraction failed for {url}: {str(e)}")
            return None

    def process_source_to_chunks(self, source: CurriculumSource) -> List[ContentChunk]:
        """Convert CurriculumSource into ContentChunks."""
        chunks_data = self.chunker.chunk(source.raw_markdown)
        chunks = []

        for idx, (heading_path, content, token_count, concepts) in enumerate(chunks_data):
            chunk = ContentChunk(
                source_url=source.url,
                chunk_index=idx,
                heading_path=heading_path,
                content=content,
                token_count=token_count,
                concepts=concepts,
                metadata={
                    "source_type": source.source_type,
                    "source_title": source.title,
                    "extracted_at": source.fetched_at.isoformat(),
                }
            )
            chunks.append(chunk)

        return chunks

    def extract_and_chunk_urls(self, urls: List[str]) -> Dict[str, Any]:
        """
        Extract and process multiple URLs with comprehensive logging.

        Pipeline:
            1. Try each URL in order
            2. Skip URLs that fail validation or quality checks
            3. Collect successful extractions
            4. Convert sources to chunks
            5. Return aggregated results

        Returns:
            {
                "total": int,
                "successful": int,
                "failed": int,
                "sources": [CurriculumSource],
                "chunks": [ContentChunk],
                "errors": [{"url": str, "error": str}]
            }
        """
        results = {
            "total": len(urls),
            "successful": 0,
            "failed": 0,
            "sources": [],
            "chunks": [],
            "errors": []
        }

        logger.info(f"Starting extraction for {len(urls)} URLs")

        for idx, url in enumerate(urls, 1):
            logger.info(f"[{idx}/{len(urls)}] Extracting {url}")
            source = self.extract_source(url)

            if source:
                results["sources"].append(source)
                chunks = self.process_source_to_chunks(source)
                results["chunks"].extend(chunks)
                results["successful"] += 1
                logger.info(f"✓ Successfully extracted {url} → {len(chunks)} chunks")
            else:
                results["failed"] += 1
                results["errors"].append({"url": url, "error": "Extraction failed (quality check or API error)"})
                logger.warning(f"✗ Failed to extract {url}")

        # Log final summary
        logger.info(
            f"Extraction complete: {results['successful']}/{results['total']} successful, "
            f"{results['failed']} failed, {len(results['chunks'])} total chunks created"
        )

        if results["chunks"]:
            avg_chunk_tokens = sum(c.token_count for c in results["chunks"]) / len(results["chunks"])
            logger.info(f"Chunk statistics: avg {avg_chunk_tokens:.1f} tokens/chunk")

        return results

    def build_knowledge_pack(
        self,
        urls: List[str],
        topic: str,
        difficulty: str,
        duration: str
    ) -> Optional[Dict[str, Any]]:
        """
        Build complete knowledge pack from URLs.

        Returns Knowledge Pack structure ready for database storage.
        """
        extraction_result = self.extract_and_chunk_urls(urls)

        if extraction_result["successful"] == 0:
            logger.error("No URLs extracted successfully")
            return None

        return {
            "topic": topic,
            "difficulty": difficulty,
            "duration": duration,
            "extraction_metadata": {
                "total_sources": extraction_result["total"],
                "successful_sources": extraction_result["successful"],
                "total_chunks": len(extraction_result["chunks"]),
                "extracted_at": datetime.utcnow().isoformat(),
            },
            "sources": [asdict(s) for s in extraction_result["sources"]],
            "chunks": [asdict(c) for c in extraction_result["chunks"]],
            "errors": extraction_result["errors"]
        }
