import uuid
from datetime import datetime, timezone

from sqlalchemy import String, Text, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


def _new_id() -> str:
    return uuid.uuid4().hex[:12]


class Project(Base):
    __tablename__ = "projects"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=_new_id)
    name: Mapped[str] = mapped_column(String(200))
    description: Mapped[str] = mapped_column(Text, default="")
    status: Mapped[str] = mapped_column(String(20), default="draft")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow, onupdate=_utcnow)


class Message(Base):
    __tablename__ = "messages"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=_new_id)
    project_id: Mapped[str] = mapped_column(String(32), ForeignKey("projects.id"))
    agent_id: Mapped[str] = mapped_column(String(50))
    sender: Mapped[str] = mapped_column(String(10))  # "user" | "agent"
    content: Mapped[str] = mapped_column(Text)
    message_type: Mapped[str] = mapped_column(String(20), default="text")
    metadata_json: Mapped[str] = mapped_column(Text, default="{}")
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)


class BrandSpec(Base):
    __tablename__ = "brand_specs"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=_new_id)
    project_id: Mapped[str] = mapped_column(String(32), ForeignKey("projects.id"), unique=True)
    spec_json: Mapped[str] = mapped_column(Text, default="{}")
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow, onupdate=_utcnow)


class AgentStateRecord(Base):
    __tablename__ = "agent_states"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=_new_id)
    project_id: Mapped[str] = mapped_column(String(32), ForeignKey("projects.id"), unique=True)
    state_json: Mapped[str] = mapped_column(Text, default="{}")
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow, onupdate=_utcnow)
