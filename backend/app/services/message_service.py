import json
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import async_session
from app.models import Message


async def save_message(
    project_id: str,
    agent_id: str,
    sender: str,
    content: str,
    message_type: str = "text",
    metadata: dict | None = None,
) -> Message:
    async with async_session() as session:
        msg = Message(
            project_id=project_id,
            agent_id=agent_id,
            sender=sender,
            content=content,
            message_type=message_type,
            metadata_json=json.dumps(metadata or {}),
            timestamp=datetime.now(timezone.utc),
        )
        session.add(msg)
        await session.commit()
        await session.refresh(msg)
        return msg


async def get_messages(
    project_id: str,
    agent_id: str | None = None,
    limit: int = 100,
) -> list[Message]:
    async with async_session() as session:
        stmt = (
            select(Message)
            .where(Message.project_id == project_id)
            .order_by(Message.timestamp.asc())
            .limit(limit)
        )
        if agent_id:
            stmt = stmt.where(Message.agent_id == agent_id)
        result = await session.execute(stmt)
        return list(result.scalars().all())
