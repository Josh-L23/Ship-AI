# SHIP AI Backend

This backend provides the REST API, agent orchestration, and persistence layer for SHIP AI.

## Purpose and Scope

The backend is responsible for:

- Exposing REST endpoints for projects, messages, and agent interaction.
- Orchestrating agent execution through a LangGraph workflow.
- Persisting projects, messages, and evolving brand data.
- Abstracting LLM providers behind a common interface.
- Generating Brand Guidelines PDFs from accumulated brand assets.

The backend is not responsible for:

- Frontend rendering and client-side UX logic.
- Static UI state management.

## Runtime and Dependencies

- Python 3.12
- FastAPI + Uvicorn
- SQLAlchemy async + SQLite (default local, MVP)
- LangGraph for orchestration
- Provider abstraction for mock and external LLM integrations (OpenRouter recommended)
- reportlab for PDF generation

## Quick Start

Windows
```bash
cd backend
python -m venv .venv-win
.venv-win\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
python -m uvicorn app.main:app --reload --port 8000
```

Linux
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python -m uvicorn app.main:app --reload --port 8000
```

For real LLM responses, set in `.env`:
```
LLM_PROVIDER=openrouter
OPENROUTER_API_KEY=<your-key>
LLM_MODEL=google/gemini-2.0-flash-001
```

Health check:

- `GET http://localhost:8000/api/health`
- `GET http://localhost:8000/api/health/llm` (verifies LLM provider connectivity)

## Configuration

Core configuration is defined in `app/config.py` and sourced from `.env`.

Typical variables include:

- `DATABASE_URL`: async database connection string. Default: `sqlite+aiosqlite:///./storage/ship_ai.db`.
- `LLM_PROVIDER`: active provider key (`openrouter`, `gemini`, `mock`, `openai`, `groq`, `xai`).
- `LLM_MODEL`: model identifier for the selected provider.
- Provider-specific API keys (`OPENROUTER_API_KEY`, `GEMINI_API_KEY`, etc.).
- Per-agent overrides: `AGENT_<ROLE>_PROVIDER` / `AGENT_<ROLE>_MODEL`.

Use `.env.example` as the baseline template for local setup.

## Backend Structure

```text
backend/
├── app/
│   ├── main.py
│   ├── config.py
│   ├── database.py
│   ├── models.py
│   ├── schemas.py
│   ├── routers/
│   │   ├── projects.py
│   │   └── messages.py
│   ├── agents/
│   │   ├── registry.py
│   │   ├── state.py
│   │   ├── nodes.py
│   │   └── graph.py
│   ├── llm/
│   │   ├── __init__.py
│   │   ├── base.py
│   │   ├── mock.py
│   │   ├── gemini.py
│   │   └── openai_compat.py
│   └── services/
│       ├── message_service.py
│       ├── orchestrator.py
│       ├── brand_spec_service.py
│       └── pdf_service.py
├── alembic/
├── alembic.ini
├── storage/
├── requirements.txt
└── BACKEND.md
```

## API Surface

Base URL: `http://localhost:8000`

### Core REST Endpoints

- `GET /api/health`: service health.
- `GET /api/health/llm`: LLM provider connectivity check.
- `GET /api/health/deps`: dependency and graph status.
- `GET /api/agents`: available agent metadata.
- `POST /api/projects`: create project.
- `GET /api/projects`: list projects.
- `GET /api/projects/{id}`: get project details.
- `PATCH /api/projects/{id}`: update project metadata/status.
- `DELETE /api/projects/{id}`: remove project.
- `GET /api/projects/{id}/brand-spec`: get brand specification.
- `PUT /api/projects/{id}/brand-spec`: upsert brand specification.
- `GET /api/projects/{id}/brand-guidelines.pdf`: download Brand Guidelines PDF.
- `GET /api/messages/{project_id}`: retrieve message history, with optional filtering.
- `POST /api/messages/{project_id}`: send a user message, receive agent replies.

### Send Message Contract

Request:
```json
{
  "agent_id": "agent_manager",
  "content": "Hello",
  "message_type": "text"
}
```

Response:
```json
{
  "replies": [
    {
      "id": "abc123",
      "project_id": "proj_001",
      "agent_id": "agent_manager",
      "sender": "agent",
      "content": "Hi there!",
      "message_type": "text",
      "metadata": {},
      "timestamp": "2026-04-15T12:00:00Z"
    }
  ],
  "canvas_assets": [
    {
      "type": "color_palette",
      "title": "Primary Palette",
      "data": { "colors": [{"name": "Ocean Blue", "hex": "#1E90FF"}] }
    }
  ]
}
```

## Agent Orchestration

Agent execution is assembled in `app/agents/graph.py` with node logic in `app/agents/nodes.py`.

High-level sequence:

1. Validate incoming message payload.
2. Persist user message.
3. Load relevant history and brand spec.
4. Invoke graph using selected/current agent context.
5. Extract canvas assets from agent responses (```canvas or ```json blocks).
6. Persist returned agent outputs and canvas assets.
7. Return replies and canvas assets in the HTTP response.

The orchestrator layer coordinates this pipeline from transport to persistence.

## Persistence Model

The backend persists core records such as:

- Projects
- Messages
- Brand specification state (including canvas assets as JSON)
- Agent state/checkpoint-related data

For MVP, SQLite in `storage/` is the persistence target.

## Database Setup

### Local (SQLite) — MVP

Default: no extra setup. Tables are created automatically on startup.

### Production (Supabase/PostgreSQL) — Deferred

1. Set `DATABASE_URL` in `.env` to the Supabase connection string (pooler URI on port 6543 is recommended).
2. `asyncpg` is listed in `requirements.txt` and used when the URL is `postgresql://...`.
3. Run `alembic upgrade head` for schema setup or `alembic stamp f33360beec80` if schema already exists.

## LLM Provider Layer

Provider implementations live under `app/llm/` and are selected via configuration.

Supported providers:
- `openrouter` (recommended) — OpenAI-compatible via OpenRouter
- `gemini` — Google Generative AI
- `openai` / `groq` / `xai` — OpenAI-compatible endpoints
- `mock` — canned responses for testing without API keys

## Backend Outstanding Tasks Checklist

- [x] REST-based agent chat with real LLM integration.
- [x] Canvas asset extraction and persistence.
- [x] Brand Guidelines PDF generation.
- [x] LLM health check endpoint.
- [ ] Add robust authentication and project-level authorization.
- [ ] Finalize supervisor routing strategy for automatic agent selection/handoff.
- [ ] Implement streaming response pipeline via SSE.
- [ ] Harden schema validation and standardized API error responses.
- [ ] Expand BrandSpec merge/version strategy with conflict-safe updates.
- [ ] Add automated unit and integration tests for routers, services, and graph logic.
- [ ] Add rate limiting and abuse protection for REST traffic.
- [ ] Introduce structured logging, request correlation IDs, and core metrics.
- [ ] Prepare production deployment stack (containerization, env profiles, persistent DB).
- [ ] Document and enforce backward-compatible API contract changes.
