import os
from functools import lru_cache
from typing import Literal

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    ENVIRONMENT: str = "development"
    LLM_MODEL: str = "ollama/aya:8b"
    LLM_API_KEY: str = ""
    LLM_TEMPERATURE: float = 0.2
    QDRANT_URL: str = ""
    QDRANT_API_KEY: str = ""
    QDRANT_COLLECTION_NAME: str = "querygpt"
    EMBEDDING_MODEL: str = ""
    EMBEDDING_API_KEY: str = ""
    EMBEDDING_SIZE: int = 768
    VALIDATE_DB_TYPE: Literal["mysql", "postgresql"] = "mysql"
    VALIDATE_DB_HOST: str = ""
    VALIDATE_DB_PORT: int = 3306
    VALIDATE_DB_USER: str = ""
    VALIDATE_DB_PASSWORD: str = ""
    VALIDATE_DB_DATABASE: str = ""
    POSTGRES_DB_URL: str = (
        ""  # e.g. postgresql+asyncpg://user:password@localhost/dbname
    )
    JWT_SECRET_KEY: str = "supersecret"
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REDIS_URL: str = "redis://localhost:6379/1"
    VAULT_ADDR: str = ""
    VAULT_TOKEN: str = ""
    SYNTHETIC_DATA_LLM_MODEL: str = ""
    SYNTHETIC_DATA_LLM_API_KEY: str = ""
    SYNTHETIC_DATA_LLM_TEMPERATURE: float = 0.2
    MAX_SYNTHETIC_DATA_POINTS: int = 10
    API_RATE_LIMIT: int = 20
    API_RATE_PERIOD: int = 60

    class Config:
        env_file = ".env" if os.getenv("ENVIRONMENT") != "test" else None
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
