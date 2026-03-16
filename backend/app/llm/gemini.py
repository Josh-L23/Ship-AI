from typing import AsyncIterator

import google.generativeai as genai

from app.llm.base import LLMProvider
from app.config import settings


class GeminiProvider(LLMProvider):
    """Google Gemini implementation via the google-generativeai SDK."""

    def __init__(self, model_name: str = "gemini-2.0-flash"):
        genai.configure(api_key=settings.gemini_api_key)
        self._model = genai.GenerativeModel(model_name)

    async def generate(
        self, system_prompt: str, messages: list[dict]
    ) -> str:
        contents = self._build_contents(system_prompt, messages)
        response = await self._model.generate_content_async(contents)
        return response.text

    async def generate_stream(
        self, system_prompt: str, messages: list[dict]
    ) -> AsyncIterator[str]:
        contents = self._build_contents(system_prompt, messages)
        response = await self._model.generate_content_async(
            contents, stream=True
        )
        async for chunk in response:
            if chunk.text:
                yield chunk.text

    @staticmethod
    def _build_contents(
        system_prompt: str, messages: list[dict]
    ) -> list[dict]:
        contents = [{"role": "user", "parts": [system_prompt]}]
        contents.append({"role": "model", "parts": ["Understood. I will follow these instructions."]})

        for msg in messages:
            role = "user" if msg.get("sender") == "user" else "model"
            contents.append({"role": role, "parts": [msg.get("content", "")]})

        return contents
