from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel, Field


# ---------- REST schemas: Projects ----------

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


# ---------- REST schemas: Messages ----------

class SendMessageRequest(BaseModel):
    agent_id: str = "agent_manager"
    content: str
    message_type: str = "text"


class MessageOut(BaseModel):
    id: str
    project_id: str
    agent_id: str
    sender: str
    content: str
    message_type: str
    metadata: dict[str, Any] = Field(default_factory=dict)
    timestamp: datetime

    model_config = {"from_attributes": True}


class CanvasAssetPosition(BaseModel):
    x: float = 0
    y: float = 0


class CanvasAsset(BaseModel):
    type: str
    title: str = ""
    data: dict[str, Any] = Field(default_factory=dict)
    position: Optional[CanvasAssetPosition] = None


class SendMessageResponse(BaseModel):
    replies: list[dict[str, Any]]
    canvas_assets: Optional[list[CanvasAsset]] = None


# ---------- REST schemas: Agents ----------

class AgentOut(BaseModel):
    id: str
    name: str
    role: str
    description: str
