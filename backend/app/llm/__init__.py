from app.config import settings
from app.llm.base import LLMProvider


def get_llm_provider(agent_id: str = "agent_manager") -> LLMProvider:
    provider = settings.provider_for_agent(agent_id)
    model = settings.model_for_agent(agent_id)

    if provider == "gemini":
        from app.llm.gemini import GeminiProvider

        return GeminiProvider(model_name=model)
    if provider in {"openai", "groq", "openrouter", "xai"}:
        from app.llm.openai_compat import OpenAICompatProvider

        return OpenAICompatProvider(provider=provider, model_name=model)

    if provider == "mock":
        from app.llm.mock import MockProvider

        return MockProvider()

    from app.llm.mock import MockProvider

    return MockProvider()
