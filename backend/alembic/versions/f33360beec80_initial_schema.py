"""initial schema

Revision ID: f33360beec80
Revises: 
Create Date: 2026-04-15 03:41:53.460835

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'f33360beec80'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "projects",
        sa.Column("id", sa.String(32), primary_key=True),
        sa.Column("name", sa.String(200), nullable=False),
        sa.Column("description", sa.Text, server_default=""),
        sa.Column("status", sa.String(20), server_default="draft"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )

    op.create_table(
        "messages",
        sa.Column("id", sa.String(32), primary_key=True),
        sa.Column("project_id", sa.String(32), sa.ForeignKey("projects.id"), nullable=False),
        sa.Column("agent_id", sa.String(50), nullable=False),
        sa.Column("sender", sa.String(10), nullable=False),
        sa.Column("content", sa.Text, nullable=False),
        sa.Column("message_type", sa.String(20), server_default="text"),
        sa.Column("metadata_json", sa.Text, server_default="{}"),
        sa.Column("timestamp", sa.DateTime(timezone=True), nullable=False),
    )

    op.create_table(
        "brand_specs",
        sa.Column("id", sa.String(32), primary_key=True),
        sa.Column("project_id", sa.String(32), sa.ForeignKey("projects.id"), unique=True, nullable=False),
        sa.Column("spec_json", sa.Text, server_default="{}"),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )

    op.create_table(
        "agent_states",
        sa.Column("id", sa.String(32), primary_key=True),
        sa.Column("project_id", sa.String(32), sa.ForeignKey("projects.id"), unique=True, nullable=False),
        sa.Column("state_json", sa.Text, server_default="{}"),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )


def downgrade() -> None:
    op.drop_table("agent_states")
    op.drop_table("brand_specs")
    op.drop_table("messages")
    op.drop_table("projects")
