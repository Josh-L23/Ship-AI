import json
import logging
from typing import Any

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.schemas import WSEvent

logger = logging.getLogger(__name__)
router = APIRouter()


class ConnectionManager:
    """Manages active WebSocket connections keyed by a client id."""

    def __init__(self):
        self._connections: dict[str, WebSocket] = {}

    async def connect(self, client_id: str, ws: WebSocket):
        await ws.accept()
        self._connections[client_id] = ws
        logger.info("WS connected: %s (total: %d)", client_id, len(self._connections))

    def disconnect(self, client_id: str):
        self._connections.pop(client_id, None)
        logger.info("WS disconnected: %s (total: %d)", client_id, len(self._connections))

    async def send_event(self, client_id: str, event: str, data: dict[str, Any]):
        ws = self._connections.get(client_id)
        if ws:
            payload = WSEvent(event=event, data=data).model_dump()
            await ws.send_json(payload)

    async def broadcast(self, event: str, data: dict[str, Any]):
        payload = WSEvent(event=event, data=data).model_dump()
        dead = []
        for cid, ws in self._connections.items():
            try:
                await ws.send_json(payload)
            except Exception:
                dead.append(cid)
        for cid in dead:
            self.disconnect(cid)


manager = ConnectionManager()


@router.websocket("/ws/{client_id}")
async def websocket_endpoint(ws: WebSocket, client_id: str):
    await manager.connect(client_id, ws)
    try:
        while True:
            raw = await ws.receive_text()
            try:
                data = json.loads(raw)
                event = data.get("event", "")
                payload = data.get("data", {})
            except json.JSONDecodeError:
                await manager.send_event(client_id, "error", {"message": "Invalid JSON", "code": "parse_error"})
                continue

            if event == "ping":
                await manager.send_event(client_id, "pong", {})
            elif event == "user_message":
                from app.services.orchestrator import handle_user_message
                await handle_user_message(client_id, payload)
            else:
                await manager.send_event(client_id, "error", {"message": f"Unknown event: {event}", "code": "unknown_event"})

    except WebSocketDisconnect:
        manager.disconnect(client_id)
