# SHIP AI

SHIP AI is a full-stack application for building and iterating brand identity projects with a multi-agent workflow.  
The platform combines a Next.js frontend, a FastAPI backend, WebSocket-based chat, and persistent project data.

## Current Project Scope

- Create and manage branding projects.
- Chat with specialized agents (intake, market, visual, production, manager).
- Store project messages and evolving brand data.
- Visualize outputs on a canvas workspace.
- Run with either a mock LLM provider or a real provider through environment configuration.

## System Overview

### Core Components

- `frontend/`: Next.js application for dashboard, chat, and canvas interaction.
- `backend/`: FastAPI service for APIs, WebSocket events, orchestration, and persistence.
- `backend/storage/`: local SQLite data store used in development.

### Runtime Flow

1. The frontend sends user messages to the backend over WebSocket.
2. The backend validates input, persists the message, and invokes the agent graph.
3. Agent responses are persisted and sent back to the frontend.
4. The frontend updates chat and, when applicable, canvas state.

## Repository Layout

```text
SHIP ai/
├── README.md
├── frontend/
│   └── README.md
└── backend/
    ├── BACKEND.md
    └── app/
```

## Local Development

### 1) Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```

### 2) Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend default URL: `http://localhost:3000`  
Backend default URL: `http://localhost:8000`

## Configuration Notes

- Backend runtime settings are managed through `backend/.env`.
- Frontend environment values are managed through `frontend/.env.local`.
- LLM provider selection is controlled on the backend (`LLM_PROVIDER` and provider-specific keys).

## Documentation Map

- Frontend details: `frontend/README.md`
- Backend details: `backend/BACKEND.md`

## Development Guidelines

- Keep frontend concerns in frontend docs and code modules.
- Keep backend protocol, orchestration, and persistence concerns in backend docs and modules.
- Use checklists below as the source of truth for unfinished cross-cutting work.

## General App Functionality Checklist

- [ ] End-to-end authentication and authorization across frontend and backend.
- [ ] Persistent, server-synced canvas state per project.
- [ ] Streaming agent responses in the chat experience.
- [ ] Consistent error handling and user-facing error states across all routes.
- [ ] Production-ready deployment setup (containerization, environment separation, secrets handling).
- [ ] Automated test coverage for critical frontend and backend flows.
- [ ] Basic observability (structured logs, request tracing, health/metrics visibility).
- [ ] Finalized asset lifecycle (upload, generation, storage, retrieval, download).
- [ ] Stable API and event contract versioning for frontend-backend compatibility.
- [ ] Contributor workflow polish (CI checks, contribution guidelines, release notes process).
