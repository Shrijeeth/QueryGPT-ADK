from functools import lru_cache
import os
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    ENVIRONMENT: str = "development"
    LLM_MODEL: str = "ollama/aya:8b"
    LLM_API_KEY: str = ""
    QDRANT_URL: str = ""
    QDRANT_API_KEY: str = ""
    QDRANT_COLLECTION_NAME: str = "querygpt"
    EMBEDDING_MODEL: str = ""
    EMBEDDING_API_KEY: str = ""
    EMBEDDING_SIZE: int = 768
    VALIDATE_DB_HOST: str = ""
    VALIDATE_DB_PORT: int = 3306
    VALIDATE_DB_USER: str = ""
    VALIDATE_DB_PASSWORD: str = ""
    VALIDATE_DB_DATABASE: str = ""

    class Config:
        env_file = ".env" if os.getenv("ENVIRONMENT") != "test" else None
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
