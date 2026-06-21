import logging
import sys
import json
from datetime import datetime
from typing import Any, Dict

from app.config import settings


class JSONFormatter(logging.Formatter):
    """JSON formatter for structured logging."""

    def format(self, record: logging.LogRecord) -> str:
        log_data = {
            "timestamp": datetime.utcnow().isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno,
        }

        if record.exc_info:
            log_data["exception"] = self.formatException(record.exc_info)

        if hasattr(record, "extra_data"):
            log_data.update(record.extra_data)

        return json.dumps(log_data)


def configure_logging() -> None:
    """Configure structured logging for the application."""
    root_logger = logging.getLogger()
    root_logger.setLevel(logging.INFO if settings.is_production() else logging.DEBUG)

    # Remove existing handlers
    for handler in root_logger.handlers[:]:
        root_logger.removeHandler(handler)

    # Console handler with JSON formatting
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(logging.INFO if settings.is_production() else logging.DEBUG)
    formatter = JSONFormatter()
    console_handler.setFormatter(formatter)
    root_logger.addHandler(console_handler)


def get_logger(name: str) -> logging.LoggerAdapter:
    """Get a logger instance with structured logging support."""
    logger = logging.getLogger(name)
    return logging.LoggerAdapter(logger, {"extra_data": {}})


def log_with_metadata(logger: logging.LoggerAdapter, level: str, message: str, **metadata) -> None:
    """Log a message with additional metadata."""
    log_func = getattr(logger, level.lower(), logger.info)
    # Store metadata in a way the formatter can access it
    logger.extra = metadata
    log_func(message)
