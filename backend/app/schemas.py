from datetime import datetime
from typing import Any, Literal, Optional

from pydantic import BaseModel, Field


# ---------- WebSocket event wrappers ----------

class WSEvent(BaseModel):
    event: str
    data: dict[str, Any] = {}


# ---------- Client -> Server ----------

class UserMessageData(BaseModel):
    project_id: str
    agent_id: str
    content: str
    message_type: str = "text"


# ---------- Server -> Client ----------

class AgentMessageData(BaseModel):
    project_id: str
    agent_id: str
    message_id: str
    content: str
    message_type: str = "text"
    metadata: dict[str, Any] = {}
    timestamp: str


class AgentTypingData(BaseModel):
    agent_id: str
    is_typing: bool


class AgentStatusData(BaseModel):
    agent_id: str
    status: Literal["online", "busy", "offline"]


class AgentHandoffData(BaseModel):
    from_agent: str
    to_agent: str
    reason: str = ""


class ErrorData(BaseModel):
    message: str
    code: str = "unknown"


# ---------- REST schemas ----------

class ProjectCreate(BaseModel):
    name: str
    description: str = ""


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None


class ProjectOut(BaseModel):
    id: str
    name: str
    description: str
    status: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class MessageOut(BaseModel):
    id: str
    project_id: str
    agent_id: str
    sender: str
    content: str
    message_type: str
    metadata_json: str
    timestamp: datetime

    model_config = {"from_attributes": True}
