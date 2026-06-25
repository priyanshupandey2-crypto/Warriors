"""JSON document parser."""

import json
import logging
from pathlib import Path
from typing import Any, Dict

logger = logging.getLogger(__name__)


class JsonParser:
    """Parser for JSON documents containing text content."""

    @staticmethod
    def parse(file_path: str) -> Dict[str, Any]:
        """Parse JSON file and extract text content.

        Supports two JSON structures:
        1. Simple: {"text": "...", "metadata": {...}}
        2. Array: [{"content": "...", "title": "..."}, ...]

        Args:
            file_path: Path to JSON file.

        Returns:
            Dictionary containing:
            - text: Extracted or concatenated text content
            - document_type: 'json'
            - metadata: Dict with filename, original json structure info

        Raises:
            FileNotFoundError: If file does not exist.
            ValueError: If file is not valid JSON or has unsupported structure.
        """
        path = Path(file_path)

        if not path.exists():
            raise FileNotFoundError(f"JSON file not found: {file_path}")

        if path.suffix.lower() != ".json":
            raise ValueError(f"File is not a JSON file: {file_path}")

        try:
            logger.info(f"Parsing JSON file: {file_path}")

            with open(file_path, "r", encoding="utf-8") as f:
                data = json.load(f)

            logger.debug(f"Loaded JSON data, type: {type(data)}")

            # Extract text based on JSON structure
            text, json_structure = JsonParser._extract_text(data)

            if not text.strip():
                logger.warning(f"JSON file {file_path} contains no extractable text")

            logger.info(f"Successfully parsed JSON file")

            return {
                "text": text,
                "document_type": "json",
                "metadata": {
                    "filename": path.name,
                    "json_structure": json_structure,
                },
            }

        except json.JSONDecodeError as e:
            logger.error(f"Invalid JSON in {file_path}: {e}")
            raise ValueError(f"File is not valid JSON: {e}")
        except Exception as e:
            logger.error(f"Error parsing JSON file {file_path}: {e}")
            raise ValueError(f"Failed to parse JSON file: {e}")

    @staticmethod
    def _extract_text(data: Any) -> tuple[str, str]:
        """Extract text from various JSON structures.

        Supports:
        - Dict with "text" key: {"text": "...", "metadata": {...}}
        - Dict with "content" key: {"content": "...", ...}
        - List of objects: [{"content": "...", "title": "..."}, ...]
        - Nested structures with text/content fields

        Args:
            data: Parsed JSON data (dict, list, or primitive).

        Returns:
            Tuple of (extracted_text, structure_type).

        Raises:
            ValueError: If structure is not supported.
        """
        if isinstance(data, dict):
            # Check for primary text field
            if "text" in data and isinstance(data["text"], str):
                return data["text"], "dict_with_text"

            # Check for content field
            if "content" in data and isinstance(data["content"], str):
                return data["content"], "dict_with_content"

            # Concatenate all string values
            text_parts = []
            for key, value in data.items():
                if isinstance(value, str) and value.strip():
                    text_parts.append(value)
                elif isinstance(value, (dict, list)):
                    nested_text, _ = JsonParser._extract_text(value)
                    if nested_text.strip():
                        text_parts.append(nested_text)

            if text_parts:
                return "\n".join(text_parts), "dict_concatenated"

            raise ValueError("No text content found in JSON object")

        elif isinstance(data, list):
            if not data:
                raise ValueError("JSON array is empty")

            text_parts = []
            for idx, item in enumerate(data):
                if isinstance(item, str):
                    text_parts.append(item)
                elif isinstance(item, dict):
                    # Try to extract from dict items
                    for key, value in item.items():
                        if isinstance(value, str) and value.strip():
                            text_parts.append(f"[{key}] {value}")

            if text_parts:
                return "\n".join(text_parts), "array_of_objects"

            raise ValueError("No text content found in JSON array")

        elif isinstance(data, str):
            return data, "string"

        else:
            raise ValueError(
                f"Unsupported JSON root type: {type(data).__name__}. "
                "Expected dict, list, or string."
            )
