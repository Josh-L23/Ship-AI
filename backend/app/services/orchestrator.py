import logging
from datetime import datetime, timezone

from app.agents.graph import agent_graph
from app.agents.state import MessageItem
from app.services.message_service import save_message, get_messages
from app.services.brand_spec_service import append_canvas_assets

logger = logging.getLogger(__name__)


async def handle_user_message(client_id: str, payload: dict):
    """
    Full pipeline: persist user message -> invoke LangGraph -> persist agent
    response -> push back through WebSocket.
    """
    from app.routers.websocket import manager

    project_id = payload.get("project_id", "")
    agent_id = payload.get("agent_id", "agent_manager")
    content = payload.get("content", "")
    message_type = payload.get("message_type", "text")

    if not project_id or not content:
        await manager.send_event(client_id, "error", {
            "message": "project_id and content are required",
            "code": "validation_error",
        })
        return

    await save_message(
        project_id=project_id,
        agent_id=agent_id,
        sender="user",
        content=content,
        message_type=message_type,
    )

    await manager.send_event(client_id, "agent_typing", {
        "agent_id": agent_id,
        "is_typing": True,
    })

    history = await get_messages(project_id)
    message_items: list[MessageItem] = [
        {
            "sender": m.sender if m.sender == "user" else m.agent_id,
            "agent_id": m.agent_id,
            "content": m.content,
            "message_type": m.message_type,
            "metadata": {},
        }
        for m in history
    ]

    graph_input = {
        "project_id": project_id,
        "messages": message_items,
        "current_agent": agent_id,
        "brand_spec": {},
        "pending_handoff": "",
    }

    try:
        result = await agent_graph.ainvoke(graph_input)
    except Exception as e:
        logger.exception("LangGraph invocation failed")
        await manager.send_event(client_id, "agent_typing", {
            "agent_id": agent_id,
            "is_typing": False,
        })
        await manager.send_event(client_id, "error", {
            "message": str(e),
            "code": "graph_error",
        })
        return

    new_messages = result.get("messages", [])
    agent_replies = [m for m in new_messages if m["sender"] != "user" and m not in message_items]

    for reply in agent_replies:
        saved = await save_message(
            project_id=project_id,
            agent_id=reply["agent_id"],
            sender="agent",
            content=reply["content"],
            message_type=reply.get("message_type", "text"),
            metadata=reply.get("metadata", {}),
        )

        await manager.send_event(client_id, "agent_message", {
            "project_id": project_id,
            "agent_id": reply["agent_id"],
            "message_id": saved.id,
            "content": reply["content"],
            "message_type": reply.get("message_type", "text"),
            "metadata": reply.get("metadata", {}),
            "timestamp": saved.timestamp.isoformat(),
        })

        canvas_assets = reply.get("metadata", {}).get("canvas_assets")
        if canvas_assets:
            await append_canvas_assets(project_id, canvas_assets)
            await manager.send_event(client_id, "canvas_update", {
                "project_id": project_id,
                "agent_id": reply["agent_id"],
                "assets": canvas_assets,
            })

    await manager.send_event(client_id, "agent_typing", {
        "agent_id": agent_id,
        "is_typing": False,
    })
