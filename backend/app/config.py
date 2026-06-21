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

    # PostgreSQL database configuration
    DATABASE_URL: str = "postgresql+asyncpg://user:password@localhost:5432/warriors_db"
    DATABASE_ECHO: bool = False
    DATABASE_POOL_SIZE: int = 20
    DATABASE_MAX_OVERFLOW: int = 0

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

    @property
    def sync_database_url(self) -> str:
        """Get synchronous database URL for migrations."""
        return self.DATABASE_URL.replace("postgresql+asyncpg://", "postgresql://")


settings = Settings()
