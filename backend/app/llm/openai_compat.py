from typing import AsyncIterator

import httpx

from app.config import settings
from app.llm.base import LLMProvider


class OpenAICompatProvider(LLMProvider):
    """OpenAI-compatible chat completions provider (OpenAI/Groq/OpenRouter/xAI)."""

    _BASE_URLS = {
        "openai": "https://api.openai.com/v1",
        "groq": "https://api.groq.com/openai/v1",
        "openrouter": "https://openrouter.ai/api/v1",
        "xai": "https://api.x.ai/v1",
    }

    def __init__(self, provider: str, model_name: str):
        self.provider = provider
        self.model_name = model_name or "gpt-4o-mini"

    async def generate(self, system_prompt: str, messages: list[dict]) -> str:
        api_key = self._resolve_api_key()
        if not api_key:
            raise RuntimeError(f"Missing API key for provider: {self.provider}")

        payload = {
            "model": self.model_name,
            "messages": self._build_messages(system_prompt, messages),
            "temperature": 0.7,
            "stream": False,
        }

        headers = {"Authorization": f"Bearer {api_key}"}
        if self.provider == "openrouter":
            headers["HTTP-Referer"] = "https://localhost"
            headers["X-Title"] = "SHIP AI Local Dev"

        async with httpx.AsyncClient(timeout=45.0) as client:
            response = await client.post(
                f"{self._BASE_URLS[self.provider]}/chat/completions",
                json=payload,
                headers=headers,
            )
            response.raise_for_status()
            data = response.json()

        return (
            data.get("choices", [{}])[0]
            .get("message", {})
            .get("content", "")
            .strip()
        )

    async def generate_stream(
        self, system_prompt: str, messages: list[dict]
    ) -> AsyncIterator[str]:
        # Keep interface support while shipping a single-shot response path first.
        text = await self.generate(system_prompt, messages)
        yield text

    def _resolve_api_key(self) -> str:
        if self.provider == "openai":
            return settings.openai_api_key
        if self.provider == "groq":
            return settings.groq_api_key
        if self.provider == "openrouter":
            return settings.openrouter_api_key
        if self.provider == "xai":
            return settings.xai_api_key
        return ""

    @staticmethod
    def _build_messages(system_prompt: str, messages: list[dict]) -> list[dict]:
        built = [{"role": "system", "content": system_prompt}]
        for msg in messages:
            role = "user" if msg.get("sender") == "user" else "assistant"
            built.append({"role": role, "content": msg.get("content", "")})
        return built
