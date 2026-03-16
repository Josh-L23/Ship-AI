from abc import ABC, abstractmethod
from typing import AsyncIterator


class LLMProvider(ABC):
    """Abstract interface for LLM providers. Swap implementations via config."""

    @abstractmethod
    async def generate(
        self, system_prompt: str, messages: list[dict]
    ) -> str:
        """Generate a complete response."""
        ...

    @abstractmethod
    async def generate_stream(
        self, system_prompt: str, messages: list[dict]
    ) -> AsyncIterator[str]:
        """Yield response tokens one at a time."""
        ...
