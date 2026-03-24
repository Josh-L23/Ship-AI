import json
import re
import logging

from app.agents.state import GraphState, MessageItem
from app.agents.registry import get_agent, AGENTS
from app.llm import get_llm_provider

logger = logging.getLogger(__name__)

_CANVAS_BLOCK_RE = re.compile(r"```canvas\s*\n(.*?)```", re.DOTALL)


def _extract_canvas_assets(text: str) -> tuple[str, list[dict]]:
    """Extract ```canvas JSON blocks from the response.

    Returns the cleaned text (blocks removed) and a list of parsed asset dicts.
    """
    assets: list[dict] = []
    for match in _CANVAS_BLOCK_RE.finditer(text):
        try:
            parsed = json.loads(match.group(1))
            if isinstance(parsed, list):
                assets.extend(parsed)
            elif isinstance(parsed, dict):
                assets.append(parsed)
        except json.JSONDecodeError:
            logger.warning("Failed to parse canvas block: %s", match.group(1)[:120])

    cleaned = _CANVAS_BLOCK_RE.sub("", text).strip()
    return cleaned, assets


async def _agent_node(state: GraphState, agent_id: str) -> dict:
    """Generic agent node: calls LLM with agent's system prompt and conversation history."""
    agent_def = get_agent(agent_id)
    llm = get_llm_provider(agent_id)

    chat_history = [
        {"sender": m["sender"], "content": m["content"]}
        for m in state["messages"]
    ]

    try:
        response_text = await llm.generate(agent_def.system_prompt, chat_history)
    except Exception:
        logger.exception("Primary provider failed for %s, falling back to mock", agent_id)
        from app.llm.mock import MockProvider

        fallback = MockProvider()
        response_text = await fallback.generate(agent_def.system_prompt, chat_history)

    cleaned_text, canvas_assets = _extract_canvas_assets(response_text)

    metadata: dict = {}
    if canvas_assets:
        metadata["canvas_assets"] = canvas_assets

    new_message: MessageItem = {
        "sender": agent_id,
        "agent_id": agent_id,
        "content": cleaned_text or response_text,
        "message_type": "text",
        "metadata": metadata,
    }

    return {
        "messages": [new_message],
        "current_agent": agent_id,
        "pending_handoff": "",
    }


async def intake_node(state: GraphState) -> dict:
    return await _agent_node(state, "agent_intake")


async def market_node(state: GraphState) -> dict:
    return await _agent_node(state, "agent_market")


async def visual_node(state: GraphState) -> dict:
    return await _agent_node(state, "agent_visual")


async def production_node(state: GraphState) -> dict:
    return await _agent_node(state, "agent_production")


async def manager_node(state: GraphState) -> dict:
    return await _agent_node(state, "agent_manager")


async def router_node(state: GraphState) -> dict:
    """Decides which agent should handle the current message based on the target agent_id."""
    current = state.get("current_agent", "agent_manager")

    if current in AGENTS:
        return {"current_agent": current, "pending_handoff": ""}

    return {"current_agent": "agent_manager", "pending_handoff": ""}


def route_after_router(state: GraphState) -> str:
    """Conditional edge: route to the chosen agent node."""
    agent = state.get("current_agent", "agent_manager")
    if agent in AGENTS:
        return agent
    return "agent_manager"


def route_after_agent(state: GraphState) -> str:
    """Conditional edge: if handoff requested, route there; otherwise end."""
    handoff = state.get("pending_handoff", "")
    if handoff and handoff in AGENTS:
        return handoff
    return "__end__"
