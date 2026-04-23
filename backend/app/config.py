from pathlib import Path

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    gemini_api_key: str = ""
    openai_api_key: str = ""
    groq_api_key: str = ""
    openrouter_api_key: str = ""
    xai_api_key: str = ""

    llm_provider: str = "mock"
    llm_model: str = "gemini-2.0-flash"

    agent_intake_provider: str = ""
    agent_market_provider: str = ""
    agent_visual_provider: str = ""
    agent_production_provider: str = ""
    agent_manager_provider: str = ""

    agent_intake_model: str = ""
    agent_market_model: str = ""
    agent_visual_model: str = ""
    agent_production_model: str = ""
    agent_manager_model: str = ""

    database_url: str = "sqlite+aiosqlite:///./storage/ship_ai.db"
    supabase_url: str = ""

    model_config = {
        "env_file": str(Path(__file__).resolve().parent.parent / ".env"),
        "env_file_encoding": "utf-8",
        "extra": "ignore",
    }

    def provider_for_agent(self, agent_id: str) -> str:
        provider_map = {
            "agent_intake": self.agent_intake_provider,
            "agent_market": self.agent_market_provider,
            "agent_visual": self.agent_visual_provider,
            "agent_production": self.agent_production_provider,
            "agent_manager": self.agent_manager_provider,
        }
        selected = provider_map.get(agent_id, "")
        return (selected or self.llm_provider).strip().lower()

    def model_for_agent(self, agent_id: str) -> str:
        model_map = {
            "agent_intake": self.agent_intake_model,
            "agent_market": self.agent_market_model,
            "agent_visual": self.agent_visual_model,
            "agent_production": self.agent_production_model,
            "agent_manager": self.agent_manager_model,
        }
        selected = model_map.get(agent_id, "")
        return (selected or self.llm_model).strip()


settings = Settings()
