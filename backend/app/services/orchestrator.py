import logging

from fastapi import HTTPException

from app.agents.graph import agent_graph
from app.agents.state import MessageItem
from app.schemas import CanvasAsset
from app.services.message_service import save_message, get_messages
from app.services.brand_spec_service import get_brand_spec, append_canvas_assets

logger = logging.getLogger(__name__)


async def handle_user_message(
    project_id: str,
    agent_id: str = "agent_manager",
    content: str = "",
    message_type: str = "text",
) -> dict:
    """
    Full pipeline: persist user message -> invoke LangGraph -> persist agent
    responses -> return replies and canvas assets.
    """
    if not project_id or not content:
        raise HTTPException(status_code=422, detail="project_id and content are required")

    await save_message(
        project_id=project_id,
        agent_id=agent_id,
        sender="user",
        content=content,
        message_type=message_type,
    )

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

    brand_spec = await get_brand_spec(project_id)

    graph_input = {
        "project_id": project_id,
        "messages": message_items,
        "current_agent": agent_id,
        "brand_spec": brand_spec,
        "pending_handoff": "",
    }

    try:
        result = await agent_graph.ainvoke(graph_input)
    except Exception as e:
        logger.exception("LangGraph invocation failed")
        raise HTTPException(status_code=502, detail=str(e))

    new_messages = result.get("messages", [])
    agent_replies = [m for m in new_messages if m["sender"] != "user" and m not in message_items]

    replies = []
    all_canvas_assets = []

    for reply in agent_replies:
        saved = await save_message(
            project_id=project_id,
            agent_id=reply["agent_id"],
            sender="agent",
            content=reply["content"],
            message_type=reply.get("message_type", "text"),
            metadata=reply.get("metadata", {}),
        )

        replies.append({
            "id": saved.id,
            "project_id": project_id,
            "agent_id": reply["agent_id"],
            "sender": "agent",
            "content": reply["content"],
            "message_type": reply.get("message_type", "text"),
            "metadata": reply.get("metadata", {}),
            "timestamp": saved.timestamp.isoformat(),
        })

        raw_assets = reply.get("metadata", {}).get("canvas_assets")
        if raw_assets:
            validated = []
            for raw in raw_assets:
                try:
                    validated.append(CanvasAsset(**raw))
                except Exception:
                    logger.warning("Dropped invalid canvas asset: %s", str(raw)[:120])
            if validated:
                await append_canvas_assets(project_id, [a.model_dump() for a in validated])
                all_canvas_assets.extend(validated)

    return {
        "replies": replies,
        "canvas_assets": all_canvas_assets if all_canvas_assets else None,
    }
