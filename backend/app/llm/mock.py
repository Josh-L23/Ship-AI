import asyncio
from typing import AsyncIterator

from app.llm.base import LLMProvider

_CANNED_RESPONSES = {
    "agent_intake": (
        "Thank you for sharing that. To build a strong Brand DNA, I'd like to explore "
        "a few more dimensions. What three words would you want a customer to use when "
        "describing their first experience with your brand?"
    ),
    "agent_market": (
        "I've started the market validation process. I'm checking trademark databases "
        "and domain availability. I'll have a full report shortly with recommendations "
        "for naming viability."
    ),
    "agent_visual": (
        "Based on the Brand DNA, I'm envisioning a palette that balances warmth with "
        "sophistication. I'll prepare some initial color and typography explorations for "
        "your review."
    ),
    "agent_production": (
        "I'm ready to compile the assets once the visual identity is finalized. I'll "
        "prepare the pitch deck template and mockup lineup so we can move quickly."
    ),
    "agent_manager": (
        "I've reviewed the current project status. All agents are aligned and the pipeline "
        "is moving well. Let me know if you'd like me to reprioritize any workstream."
    ),
}

_DEFAULT = (
    "I've received your message and I'm processing it. Let me get back to you "
    "with a thoughtful response shortly."
)


class MockProvider(LLMProvider):
    """Returns canned responses with a realistic delay. No API key needed."""

    def __init__(self, delay: float = 0.8):
        self._delay = delay

    async def generate(
        self, system_prompt: str, messages: list[dict]
    ) -> str:
        await asyncio.sleep(self._delay)
        agent_id = self._extract_agent_id(system_prompt)
        return _CANNED_RESPONSES.get(agent_id, _DEFAULT)

    async def generate_stream(
        self, system_prompt: str, messages: list[dict]
    ) -> AsyncIterator[str]:
        text = await self.generate(system_prompt, messages)
        words = text.split()
        for i, word in enumerate(words):
            await asyncio.sleep(0.04)
            yield word + (" " if i < len(words) - 1 else "")

    @staticmethod
    def _extract_agent_id(system_prompt: str) -> str:
        for agent_id in _CANNED_RESPONSES:
            if agent_id in system_prompt:
                return agent_id
        return ""
