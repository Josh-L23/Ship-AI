import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import init_db
from app.routers import projects, messages
from app.schemas import AgentOut

logging.basicConfig(level=logging.INFO)


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    logging.info("Database initialized")
    try:
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

# Fixed origins for common default; regex covers any port (Next dev, alternate ports) so
# non-simple requests (e.g. PUT + JSON) do not fail CORS with TypeError: Failed to fetch.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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


@app.get("/api/health/llm")
async def health_llm():
    from app.config import settings
    from app.llm import get_llm_provider

    provider_name = settings.llm_provider.strip().lower()
    if provider_name == "mock":
        return {"status": "ok", "provider": "mock", "detail": "Using mock provider (no API key needed)"}
    try:
        llm = get_llm_provider("agent_manager")
        await llm.generate("Reply with the single word OK.", [])
        return {"status": "ok", "provider": provider_name, "model": settings.llm_model}
    except Exception as exc:
        return {"status": "error", "provider": provider_name, "detail": str(exc)}


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
