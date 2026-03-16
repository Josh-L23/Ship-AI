from typing import Annotated, TypedDict
from operator import add


class MessageItem(TypedDict):
    sender: str          # "user" | agent_id
    agent_id: str        # which agent context this belongs to
    content: str
    message_type: str    # "text", "colors", "list", "image"
    metadata: dict


def _replace(existing: str, new: str) -> str:
    return new


def _replace_dict(existing: dict, new: dict) -> dict:
    return {**existing, **new}


class GraphState(TypedDict):
    project_id: Annotated[str, _replace]
    messages: Annotated[list[MessageItem], add]
    current_agent: Annotated[str, _replace]
    brand_spec: Annotated[dict, _replace_dict]
    pending_handoff: Annotated[str, _replace]
