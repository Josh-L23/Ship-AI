from pathlib import Path
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    gemini_api_key: str = ""
    llm_provider: str = "mock"
    database_url: str = "sqlite+aiosqlite:///./storage/ship_ai.db"

    model_config = {
        "env_file": str(Path(__file__).resolve().parent.parent / ".env"),
        "env_file_encoding": "utf-8",
    }


settings = Settings()
