from app.agents.state import GraphState, MessageItem
from app.agents.registry import get_agent, AGENTS
from app.llm import get_llm_provider


async def _agent_node(state: GraphState, agent_id: str) -> dict:
    """Generic agent node: calls LLM with agent's system prompt and conversation history."""
    agent_def = get_agent(agent_id)
    llm = get_llm_provider()

    chat_history = [
        {"sender": m["sender"], "content": m["content"]}
        for m in state["messages"]
    ]

    response_text = await llm.generate(agent_def.system_prompt, chat_history)

    new_message: MessageItem = {
        "sender": agent_id,
        "agent_id": agent_id,
        "content": response_text,
        "message_type": "text",
        "metadata": {},
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
