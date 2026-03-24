import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import init_db
from app.routers import websocket, projects, messages
from app.schemas import AgentOut

logging.basicConfig(level=logging.INFO)


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    logging.info("Database initialized")
    try:
        # Fail fast on broken agent stack imports instead of crashing on first WS message.
        from app.agents.graph import agent_graph as _graph  # noqa: F401
        logging.info("Agent graph import check passed")
    except Exception:
        logging.exception("Agent graph import check failed")
    yield


app = FastAPI(
    title="SHIP AI Backend",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(websocket.router)
app.include_router(projects.router)
app.include_router(messages.router)


@app.get("/api/health")
async def health():
    return {"status": "ok"}


@app.get("/api/health/deps")
async def health_deps():
    try:
        from app.agents.graph import agent_graph as _graph  # noqa: F401
        mode = getattr(_graph, "graph_mode", "langgraph")
        return {
            "status": "ok",
            "deps": "ready",
            "graph_mode": mode,
            "graph_impl": type(_graph).__name__,
        }
    except Exception as exc:
        return {"status": "error", "deps": "failed", "error": str(exc)}


@app.get("/api/agents", response_model=list[AgentOut])
async def list_agents():
    from app.agents.registry import list_agents as _list
    return [
        {
            "id": a.id,
            "name": a.name,
            "role": a.role,
            "description": a.description,
        }
        for a in _list()
    ]
