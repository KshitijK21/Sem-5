import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    API_V1_STR: str = "/api"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./sem5.db")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "dev-secret-change-me")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))
    ENV: str = os.getenv("ENV", "dev")

settings = Settings()
