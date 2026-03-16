from app.config import settings
from app.llm.base import LLMProvider


def get_llm_provider() -> LLMProvider:
    if settings.llm_provider == "gemini":
        from app.llm.gemini import GeminiProvider
        return GeminiProvider()
    else:
        from app.llm.mock import MockProvider
        return MockProvider()
