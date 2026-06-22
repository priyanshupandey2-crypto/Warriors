from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Central configuration module for the application."""

    # Application environment
    APP_ENV: str = "development"
    DEBUG: bool = True

    # LangSmith observability
    LANGSMITH_API_KEY: Optional[str] = None
    LANGSMITH_PROJECT: Optional[str] = None
    LANGSMITH_TRACING: bool = False
    LANGSMITH_ENDPOINT: str = "https://api.smith.langchain.com"

    # Server configuration
    HOST: str = "127.0.0.1"
    PORT: int = 8000

    # DATABASE INTEGRATION - Phase 4: PostgreSQL Configuration
    # Connection string for PostgreSQL database
    DATABASE_URL: str = "postgresql://postgres:password@localhost:5432/auralearn_db"

    # Individual database credentials (for flexibility)
    DB_HOST: str = "localhost"
    DB_PORT: int = 5432
    DB_USER: str = "postgres"
    DB_PASSWORD: str = "password"
    DB_NAME: str = "auralearn_db"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"

    def is_production(self) -> bool:
        """Check if running in production environment."""
        return self.APP_ENV.lower() == "production"

    def is_tracing_enabled(self) -> bool:
        """Check if LangSmith tracing is enabled."""
        return self.LANGSMITH_TRACING and self.LANGSMITH_API_KEY is not None


settings = Settings()
