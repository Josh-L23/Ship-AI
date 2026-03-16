from typing import Optional

from fastapi import APIRouter, Query

from app.schemas import MessageOut
from app.services.message_service import get_messages

router = APIRouter(prefix="/api/messages", tags=["messages"])


@router.get("/{project_id}", response_model=list[MessageOut])
async def list_messages(
    project_id: str,
    agent_id: Optional[str] = Query(None),
    limit: int = Query(100, ge=1, le=500),
):
    messages = await get_messages(project_id, agent_id=agent_id, limit=limit)
    return messages
