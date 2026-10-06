import os

from dotenv import load_dotenv
from pydantic_settings import BaseSettings

load_dotenv()

class Settings(BaseSettings):
    API_V1_STR: str = "/api"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./sem5.db")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "dev-secret-change-me")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))
    REFRESH_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("REFRESH_TOKEN_EXPIRE_MINUTES", "10080"))
    ENV: str = os.getenv("ENV", "dev")

    # Auth / RBAC. Two roles only: admin and analyst.
    # Defaults to true: every protected router rejects anonymous callers with 401.
    AUTH_REQUIRED: bool = os.getenv("AUTH_REQUIRED", "true").lower() in {"1", "true", "yes"}
    AUTH_ADMIN_PASSWORD: str = os.getenv("AUTH_ADMIN_PASSWORD", "admin123")
    AUTH_ANALYST_PASSWORD: str = os.getenv("AUTH_ANALYST_PASSWORD", "analyst123")

    # AI assistant (provider-agnostic; Ollama preferred)
    ENABLE_LLM_ASSISTANT: bool = os.getenv("ENABLE_LLM_ASSISTANT", "false").lower() in {"1", "true", "yes"}
    OLLAMA_BASE_URL: str = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
    OLLAMA_MODEL: str = os.getenv("OLLAMA_MODEL", "llama3.2")
    LLM_PROVIDER: str = os.getenv("LLM_PROVIDER", "ollama")
    LLM_TIMEOUT_SECONDS: int = int(os.getenv("LLM_TIMEOUT_SECONDS", "20"))

settings = Settings()
