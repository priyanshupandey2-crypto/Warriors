from pydantic_settings import BaseSettings
from typing import Optional as OptionalType
from pathlib import Path

# Ensure we find .env relative to this file (backend/app/)
# Working directory might vary, so use absolute path
_backend_dir = Path(__file__).parent.parent
_env_file = _backend_dir / ".env"


class Settings(BaseSettings):
    """Central configuration module for the application."""

    # Application environment (required from .env)
    APP_ENV: str

    # Server configuration (required from .env)
    HOST: str
    PORT: int

    # PostgreSQL database configuration (required from .env)
    DATABASE_URL: str
    DATABASE_ECHO: bool = False
    DATABASE_POOL_SIZE: int = 20
    DATABASE_MAX_OVERFLOW: int = 0

    # LangSmith observability (optional, for .env)
    LANGSMITH_API_KEY: str = ""
    LANGSMITH_ENDPOINT: str = "https://api.smith.langchain.com"
    LANGSMITH_PROJECT: str = ""
    LANGSMITH_TRACING: bool = False

    # Hugging Face API configuration (required for topic generation via OpenAI-compatible endpoint)
    HUGGINGFACE_API_KEY: str
    HUGGINGFACE_API_URL: str = "https://api-inference.huggingface.co/v1"

    # Firecrawl API configuration (required for curriculum extraction)
    FIRECRAWL_API_KEY: str

    # JWT configuration (required from .env)
    JWT_SECRET: str
    JWT_EXPIRATION_HOURS: int
    JWT_ALGORITHM: str = "HS256"

    # Debug flag (optional, defaults to False)
    DEBUG: bool = False

    # Individual database credentials (for flexibility, optional)
    DB_HOST: str = "localhost"
    DB_PORT: int = 5432
    DB_USER: str = "postgres"
    DB_PASSWORD: str = "password"
    DB_NAME: str = "auralearn_db"

    class Config:
        env_file = str(_env_file)
        env_file_encoding = "utf-8"
        extra = "ignore"

    def is_production(self) -> bool:
        """Check if running in production environment."""
        return self.APP_ENV.lower() == "production"

    def is_tracing_enabled(self) -> bool:
        """Check if LangSmith tracing is enabled."""
        return self.LANGSMITH_TRACING and self.LANGSMITH_API_KEY is not None

    @property
    def sync_database_url(self) -> str:
        """Get synchronous database URL for migrations."""
        return self.DATABASE_URL.replace("postgresql+psycopg://", "postgresql://")


settings = Settings()
