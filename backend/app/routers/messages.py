import json
from typing import Optional

from fastapi import APIRouter, Query

from app.schemas import MessageOut
from app.services.message_service import get_messages

router = APIRouter(prefix="/api/messages", tags=["messages"])


def _parse_metadata(raw: str) -> dict:
    try:
        return json.loads(raw or "{}")
    except json.JSONDecodeError:
        return {}


@router.get("/{project_id}", response_model=list[MessageOut])
async def list_messages(
    project_id: str,
    agent_id: Optional[str] = Query(None),
    limit: int = Query(100, ge=1, le=500),
):
    messages = await get_messages(project_id, agent_id=agent_id, limit=limit)
    return [
        {
            "id": m.id,
            "project_id": m.project_id,
            "agent_id": m.agent_id,
            "sender": m.sender,
            "content": m.content,
            "message_type": m.message_type,
            "metadata": _parse_metadata(m.metadata_json),
            "timestamp": m.timestamp,
        }
        for m in messages
    ]
