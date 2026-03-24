try:
    from langgraph.graph import StateGraph, END

    _LANGGRAPH_AVAILABLE = True
    _LANGGRAPH_IMPORT_ERROR = ""
except Exception as exc:  # pragma: no cover - environment-dependent fallback
    StateGraph = None  # type: ignore[assignment]
    END = None  # type: ignore[assignment]
    _LANGGRAPH_AVAILABLE = False
    _LANGGRAPH_IMPORT_ERROR = str(exc)

from app.agents.state import GraphState
from app.agents.nodes import (
    router_node,
    intake_node,
    market_node,
    visual_node,
    production_node,
    manager_node,
    route_after_router,
    route_after_agent,
)


def build_graph() -> StateGraph:
    graph = StateGraph(GraphState)

    graph.add_node("router", router_node)
    graph.add_node("agent_intake", intake_node)
    graph.add_node("agent_market", market_node)
    graph.add_node("agent_visual", visual_node)
    graph.add_node("agent_production", production_node)
    graph.add_node("agent_manager", manager_node)

    graph.set_entry_point("router")

    graph.add_conditional_edges(
        "router",
        route_after_router,
        {
            "agent_intake": "agent_intake",
            "agent_market": "agent_market",
            "agent_visual": "agent_visual",
            "agent_production": "agent_production",
            "agent_manager": "agent_manager",
        },
    )

    for agent_id in [
        "agent_intake",
        "agent_market",
        "agent_visual",
        "agent_production",
        "agent_manager",
    ]:
        graph.add_conditional_edges(
            agent_id,
            route_after_agent,
            {
                "agent_intake": "agent_intake",
                "agent_market": "agent_market",
                "agent_visual": "agent_visual",
                "agent_production": "agent_production",
                "agent_manager": "agent_manager",
                "__end__": END,
            },
        )

    return graph


class _FallbackAgentGraph:
    """Simple runtime fallback when LangGraph native deps are unavailable."""
    graph_mode = "fallback"

    async def ainvoke(self, state: GraphState) -> dict:
        routed = await router_node(state)
        agent_id = routed.get("current_agent", "agent_manager")
        handlers = {
            "agent_intake": intake_node,
            "agent_market": market_node,
            "agent_visual": visual_node,
            "agent_production": production_node,
            "agent_manager": manager_node,
        }
        handler = handlers.get(agent_id, manager_node)
        merged_state = {**state, **routed}
        result = await handler(merged_state)
        return {
            **merged_state,
            **result,
            "messages": [*state.get("messages", []), *result.get("messages", [])],
            "graph_mode": self.graph_mode,
            "graph_import_error": _LANGGRAPH_IMPORT_ERROR,
        }


if _LANGGRAPH_AVAILABLE:
    agent_graph = build_graph().compile()
else:
    agent_graph = _FallbackAgentGraph()
