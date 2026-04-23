# SHIP AI

SHIP AI is a full-stack application for building and iterating brand identity projects with a multi-agent workflow.  
The platform combines a Next.js frontend, a FastAPI backend, REST-based chat, and persistent project data.

## Current Project Scope (MVP)

- Create and manage branding projects.
- Chat with specialized agents (intake, market, visual, production, manager) powered by OpenRouter or Gemini.
- Agents emit structured canvas assets (color palettes, typography, notes, brand guidelines) that appear on the design canvas.
- Download a Brand Guidelines PDF compiled from canvas assets.
- Local SQLite database for persistence (no external services required for MVP).

## System Overview

### Core Components

- `frontend/`: Next.js application for dashboard, chat, and canvas interaction.
- `backend/`: FastAPI service for REST APIs, orchestration, and persistence.
- `backend/storage/`: local SQLite data store used in development.

### Runtime Flow

1. The frontend sends user messages to the backend via `POST /api/messages/{projectId}`.
2. The backend validates input, persists the message, and invokes the agent graph.
3. Agent responses are persisted and returned in the HTTP response (with optional `canvas_assets`).
4. The frontend updates chat and, when applicable, canvas state.
5. Brand Guidelines PDF is available via `GET /api/projects/{projectId}/brand-guidelines.pdf`.

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
python -m venv .venv-win        # Windows
# python -m venv venv           # Linux/macOS
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```

Set `LLM_PROVIDER=openrouter` and `OPENROUTER_API_KEY=<your-key>` in `backend/.env` for real LLM responses.  
Set `LLM_PROVIDER=mock` (the default) to run without any API keys.

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
- Database defaults to local SQLite. Supabase/PostgreSQL support is deferred for post-MVP.

## Documentation Map

- Frontend details: `frontend/README.md`
- Backend details: `backend/BACKEND.md`

## Development Guidelines

- Keep frontend concerns in frontend docs and code modules.
- Keep backend protocol, orchestration, and persistence concerns in backend docs and modules.
- Use checklists below as the source of truth for unfinished cross-cutting work.

## General App Functionality Checklist

- [x] REST-based agent chat with real LLM integration.
- [x] Canvas asset generation from agent responses.
- [x] Brand Guidelines PDF download.
- [ ] End-to-end authentication and authorization across frontend and backend.
- [ ] Persistent, server-synced canvas state per project.
- [ ] Streaming agent responses in the chat experience (SSE).
- [ ] Consistent error handling and user-facing error states across all routes.
- [ ] Production-ready deployment setup (containerization, environment separation, secrets handling).
- [ ] Automated test coverage for critical frontend and backend flows.
- [ ] Basic observability (structured logs, request tracing, health/metrics visibility).
- [ ] Finalized asset lifecycle (upload, generation, storage, retrieval, download).
- [ ] Stable API contract versioning for frontend-backend compatibility.
- [ ] Contributor workflow polish (CI checks, contribution guidelines, release notes process).
