import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    API_V1_STR: str = "/api"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./sem5.db")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "dev-secret-change-me")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))
    ENV: str = os.getenv("ENV", "dev")

    # Auth / RBAC
    AUTH_REQUIRED: bool = os.getenv("AUTH_REQUIRED", "false").lower() in {"1", "true", "yes"}
    AUTH_ADMIN_PASSWORD: str = os.getenv("AUTH_ADMIN_PASSWORD", "admin123")
    AUTH_ANALYST_PASSWORD: str = os.getenv("AUTH_ANALYST_PASSWORD", "analyst123")
    AUTH_VIEWER_PASSWORD: str = os.getenv("AUTH_VIEWER_PASSWORD", "viewer123")

settings = Settings()
