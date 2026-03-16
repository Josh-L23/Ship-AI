from langgraph.graph import StateGraph, END

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


agent_graph = build_graph().compile()
