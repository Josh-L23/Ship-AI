# SHIP AI Backend

This backend provides the API, WebSocket protocol, agent orchestration, and persistence layer for SHIP AI.

## Purpose and Scope

The backend is responsible for:

- Exposing REST endpoints for projects and messages.
- Managing real-time communication over WebSocket.
- Orchestrating agent execution through a LangGraph workflow.
- Persisting projects, messages, and evolving brand data.
- Abstracting LLM providers behind a common interface.

The backend is not responsible for:

- Frontend rendering and client-side UX logic.
- Static UI state management.

## Runtime and Dependencies

- Python 3.12
- FastAPI + Uvicorn
- SQLAlchemy async + SQLite (default local setup)
- LangGraph for orchestration
- Provider abstraction for mock and external LLM integrations

## Quick Start

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
python -m uvicorn app.main:app --reload --port 8000
```

Health check:

- `GET http://localhost:8000/api/health`

## Configuration

Core configuration is defined in `app/config.py` and sourced from `.env`.

Typical variables include:

- `DATABASE_URL`: async database connection string.
- `LLM_PROVIDER`: active provider key (for example `mock`, `gemini`, or compatible providers supported by code).
- Provider-specific API keys and model settings.
- CORS and environment-mode settings where applicable.

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
│   │   ├── websocket.py
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
│       └── brand_spec_service.py
├── storage/
├── requirements.txt
└── BACKEND.md
```

## API Surface

Base URL: `http://localhost:8000`

### Core REST Endpoints

- `GET /api/health`: service health.
- `GET /api/agents`: available agent metadata.
- `POST /api/projects`: create project.
- `GET /api/projects`: list projects.
- `GET /api/projects/{id}`: get project details.
- `PATCH /api/projects/{id}`: update project metadata/status.
- `DELETE /api/projects/{id}`: remove project.
- `GET /api/messages/{project_id}`: retrieve message history, with optional filtering.

## WebSocket Contract

Endpoint pattern: `ws://localhost:8000/ws/{client_id}`

Payload format:

```json
{"event": "event_name", "data": {}}
```

Common client-to-server events:

- `user_message`
- `ping`

Common server-to-client events:

- `agent_typing`
- `agent_message`
- `canvas_update` (when produced by orchestration/services)
- `error`
- `pong`

## Agent Orchestration

Agent execution is assembled in `app/agents/graph.py` with node logic in `app/agents/nodes.py`.

High-level sequence:

1. Validate incoming message payload.
2. Persist user message.
3. Load relevant history/state.
4. Invoke graph using selected/current agent context.
5. Persist returned agent outputs.
6. Emit response events over WebSocket.

The orchestrator layer coordinates this pipeline from transport to persistence.

## Persistence Model

The backend persists core records such as:

- Projects
- Messages
- Brand specification state
- Agent state/checkpoint-related data

For local development, SQLite in `storage/` is the default persistence target.

## LLM Provider Layer

Provider implementations live under `app/llm/` and are selected via configuration.

Design goals:

- Keep provider-specific logic isolated.
- Keep agent nodes provider-agnostic.
- Allow adding providers without rewriting orchestration flow.

## Operational Notes

- Start backend from the `backend/` directory so relative env/database paths resolve as expected.
- Keep REST schema and WebSocket event payloads synchronized with frontend types.
- Treat service modules as orchestration boundaries; avoid leaking transport concerns into domain logic.

## Backend Outstanding Tasks Checklist

- [ ] Add robust authentication and project-level authorization.
- [ ] Finalize supervisor routing strategy for automatic agent selection/handoff.
- [ ] Implement full streaming response pipeline and chunk event protocol.
- [ ] Harden schema validation and standardized API/WebSocket error responses.
- [ ] Expand BrandSpec merge/version strategy with conflict-safe updates.
- [ ] Add automated unit and integration tests for routers, services, and graph logic.
- [ ] Add rate limiting and abuse protection for REST and WebSocket traffic.
- [ ] Introduce structured logging, request correlation IDs, and core metrics.
- [ ] Prepare production deployment stack (containerization, env profiles, persistent DB).
- [ ] Document and enforce backward-compatible API/event contract changes.
