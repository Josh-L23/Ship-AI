# SHIP AI — Backend Documentation

> **Version**: 0.1.0 (communication plumbing)
> **Runtime**: Python 3.12 · FastAPI · LangGraph · SQLite
> **Status**: All entities can talk to each other. No generation logic yet.

---

## Quick Start

```bash
cd backend

# activate the virtual environment
venv\Scripts\activate        # Windows
source venv/bin/activate     # macOS/Linux

# copy env and set your keys (optional — mock mode works without keys)
cp .env.example .env

# run the server
python -m uvicorn app.main:app --reload --port 8000
```

Health check: `GET http://localhost:8000/api/health` → `{"status": "ok"}`

---

## Directory Map

```
backend/
├── app/
│   ├── main.py                 → FastAPI app, CORS, lifespan, routers
│   ├── config.py               → pydantic-settings: env vars → Settings singleton
│   ├── database.py             → async SQLAlchemy engine, session factory, init_db()
│   ├── models.py               → ORM: Project, Message, BrandSpec, AgentStateRecord
│   ├── schemas.py              → Pydantic: WS events, REST request/response bodies
│   │
│   ├── routers/
│   │   ├── websocket.py        → ConnectionManager + /ws/{client_id} endpoint
│   │   ├── projects.py         → REST CRUD: /api/projects
│   │   └── messages.py         → REST read: /api/messages/{project_id}
│   │
│   ├── agents/
│   │   ├── registry.py         → AgentDef dataclass, AGENTS dict, system prompts
│   │   ├── state.py            → GraphState TypedDict (LangGraph shared state)
│   │   ├── nodes.py            → Agent node functions + router/routing logic
│   │   └── graph.py            → StateGraph assembly → compiled agent_graph
│   │
│   ├── llm/
│   │   ├── __init__.py         → get_llm_provider() factory
│   │   ├── base.py             → abstract LLMProvider (generate, generate_stream)
│   │   ├── gemini.py           → GeminiProvider (google-generativeai SDK)
│   │   └── mock.py             → MockProvider (canned responses, no API key)
│   │
│   └── services/
│       ├── message_service.py  → save_message(), get_messages() (DB operations)
│       └── orchestrator.py     → handle_user_message() (full request pipeline)
│
├── storage/                    → SQLite database file (auto-created at startup)
├── venv/                       → Python 3.12 virtual environment
├── requirements.txt
├── .env                        → active config (git-ignored)
└── .env.example                → template config
```

---

## Configuration

All config flows through `app/config.py` via `pydantic-settings`, which reads from `.env`:

| Variable | Default | Purpose |
|---|---|---|
| `GEMINI_API_KEY` | `""` | Google Gemini API key. Only needed when `LLM_PROVIDER=gemini`. |
| `LLM_PROVIDER` | `"mock"` | Which LLM backend to use. Values: `"mock"` or `"gemini"`. |
| `DATABASE_URL` | `sqlite+aiosqlite:///./storage/ship_ai.db` | SQLAlchemy async connection string. |

The `Settings` class resolves the `.env` path relative to `config.py`'s parent directory, so the server must be started from the `backend/` folder.

---

## Database Schema

SQLite via SQLAlchemy 2.0 async. Tables auto-created on startup via `init_db()` in the lifespan handler. All primary keys are 12-character hex UUIDs. All timestamps are UTC.

### `projects`

| Column | Type | Notes |
|---|---|---|
| `id` | `String(32)` PK | `uuid4().hex[:12]` |
| `name` | `String(200)` | |
| `description` | `Text` | Default `""` |
| `status` | `String(20)` | `"draft"` / `"in_progress"` / `"completed"` |
| `created_at` | `DateTime(tz)` | |
| `updated_at` | `DateTime(tz)` | Auto-updates on write |

### `messages`

| Column | Type | Notes |
|---|---|---|
| `id` | `String(32)` PK | |
| `project_id` | `String(32)` FK→projects | |
| `agent_id` | `String(50)` | Which agent context (e.g. `"agent_intake"`) |
| `sender` | `String(10)` | `"user"` or `"agent"` |
| `content` | `Text` | Message body |
| `message_type` | `String(20)` | `"text"`, `"colors"`, `"list"`, `"image"` |
| `metadata_json` | `Text` | JSON string for structured data (colors array, image URLs, etc.) |
| `timestamp` | `DateTime(tz)` | |

### `brand_specs`

| Column | Type | Notes |
|---|---|---|
| `id` | `String(32)` PK | |
| `project_id` | `String(32)` FK→projects, unique | One spec per project |
| `spec_json` | `Text` | Evolving brand DNA as JSON |
| `updated_at` | `DateTime(tz)` | |

### `agent_states`

| Column | Type | Notes |
|---|---|---|
| `id` | `String(32)` PK | |
| `project_id` | `String(32)` FK→projects, unique | One checkpoint per project |
| `state_json` | `Text` | LangGraph state checkpoint as JSON |
| `updated_at` | `DateTime(tz)` | |

---

## REST API

Base URL: `http://localhost:8000`

### Health & Agents

| Method | Path | Response |
|---|---|---|
| `GET` | `/api/health` | `{"status": "ok"}` |
| `GET` | `/api/agents` | Array of `{id, name, role, description}` for all 5 agents |

### Projects — `/api/projects`

| Method | Path | Body | Response | Status |
|---|---|---|---|---|
| `POST` | `/api/projects` | `{name, description?}` | `ProjectOut` | 201 |
| `GET` | `/api/projects` | — | `ProjectOut[]` (newest first) | 200 |
| `GET` | `/api/projects/{id}` | — | `ProjectOut` | 200 / 404 |
| `PATCH` | `/api/projects/{id}` | `{name?, description?, status?}` | `ProjectOut` | 200 / 404 |
| `DELETE` | `/api/projects/{id}` | — | — | 204 / 404 |

### Messages — `/api/messages`

| Method | Path | Query Params | Response |
|---|---|---|---|
| `GET` | `/api/messages/{project_id}` | `agent_id?`, `limit?` (1–500, default 100) | `MessageOut[]` (oldest first) |

---

## WebSocket Protocol

**Endpoint**: `ws://localhost:8000/ws/{client_id}`

A single persistent WebSocket connection per browser session. All communication uses JSON frames with the shape `{"event": "<type>", "data": {…}}`.

### Client → Server Events

#### `user_message`

Send a chat message to a specific agent within a project.

```json
{
  "event": "user_message",
  "data": {
    "project_id": "574d5108a8e6",
    "agent_id": "agent_intake",
    "content": "We're a sustainable fashion brand targeting Gen Z",
    "message_type": "text"
  }
}
```

Required fields: `project_id`, `content`. Defaults: `agent_id` → `"agent_manager"`, `message_type` → `"text"`.

#### `ping`

Keep-alive. Server responds with `pong`.

```json
{"event": "ping", "data": {}}
```

### Server → Client Events

#### `agent_message`

An agent's completed response. One event per agent reply; if the graph triggers a handoff, you may receive multiple `agent_message` events from different agents for a single user input.

```json
{
  "event": "agent_message",
  "data": {
    "project_id": "574d5108a8e6",
    "agent_id": "agent_intake",
    "message_id": "a1b2c3d4e5f6",
    "content": "Thank you for sharing that. What three words...",
    "message_type": "text",
    "metadata": {},
    "timestamp": "2026-03-13T11:07:16.210752+00:00"
  }
}
```

#### `agent_typing`

Typing indicator. Sent `true` before LLM invocation, `false` after the response is delivered or on error.

```json
{
  "event": "agent_typing",
  "data": {"agent_id": "agent_intake", "is_typing": true}
}
```

#### `error`

Something went wrong during processing.

```json
{
  "event": "error",
  "data": {"message": "project_id and content are required", "code": "validation_error"}
}
```

Error codes: `parse_error`, `unknown_event`, `validation_error`, `graph_error`.

#### `pong`

Response to `ping`.

### Defined but Not Yet Emitted

These event types are defined in `schemas.py` and are part of the protocol spec, but the orchestrator does not yet emit them:

- **`agent_status`** — `{agent_id, status: "online"|"busy"|"offline"}` — for real-time agent availability
- **`agent_handoff`** — `{from_agent, to_agent, reason}` — when one agent delegates to another

---

## LLM Abstraction Layer

`app/llm/` provides a provider-agnostic interface so the LLM can be swapped without touching agent logic.

### Interface (`base.py`)

```python
class LLMProvider(ABC):
    async def generate(self, system_prompt: str, messages: list[dict]) -> str
    async def generate_stream(self, system_prompt: str, messages: list[dict]) -> AsyncIterator[str]
```

Both methods accept a `system_prompt` (the agent's persona/instructions) and a `messages` list where each dict has `{"sender": "user"|<agent_id>, "content": "..."}`.

### Implementations

| Provider | Class | When Used | Notes |
|---|---|---|---|
| `mock` | `MockProvider` | `LLM_PROVIDER=mock` (default) | Returns canned per-agent responses after 0.8s delay. Streaming simulates word-by-word output at 40ms intervals. No API key needed. |
| `gemini` | `GeminiProvider` | `LLM_PROVIDER=gemini` | Uses `google-generativeai` SDK with `gemini-2.0-flash` model. System prompt injected as a user→model turn pair at the start of the content list. |

### Factory

`get_llm_provider()` in `app/llm/__init__.py` reads `settings.llm_provider` and returns the matching instance. Called per-request (stateless providers).

---

## Agent System

### Registry (`agents/registry.py`)

Five agents stored in a module-level `AGENTS: dict[str, AgentDef]` dictionary. Each `AgentDef` is a frozen dataclass with `id`, `name`, `role`, `description`, and `system_prompt`.

| ID | Name | Role | Responsibility |
|---|---|---|---|
| `agent_intake` | Intake Architect | Brand DNA Specialist | Structured interview to extract brand DNA — industry, audience, personality, values. Asks one question at a time, synthesizes into pillars. |
| `agent_market` | Market Intelligence | Naming & Validation | Evaluates brand names for trademark conflicts, domain availability, social handles, SEO competition, cultural fit. |
| `agent_visual` | Visual Identity Lead | Design Director | Translates brand DNA into color palettes (with hex values), typography pairings, logo direction, mood references. |
| `agent_production` | Production Manager | Final Assembly | Compiles finalized assets into deliverables: pitch decks, logo files, brand guidelines, mockups. |
| `agent_manager` | SHIP Manager | Project Orchestrator | Supervisor agent. Routes ambiguous messages, monitors cross-agent progress, manages handoffs. |

### LangGraph Orchestration (`agents/graph.py`)

The graph uses a **supervisor pattern** compiled into a single `agent_graph` instance at module load.

**Nodes**:

- `router` — reads `current_agent` from state, validates it, passes through.
- `agent_intake`, `agent_market`, `agent_visual`, `agent_production`, `agent_manager` — each calls `_agent_node()` which: loads the agent's system prompt → sends full conversation history to the LLM → appends the response as a new message.

**Edges**:

1. **Entry** → `router`
2. `router` → **conditional** → one of the 5 agent nodes (based on `current_agent`)
3. Each agent node → **conditional** → if `pending_handoff` is set and valid, route to that agent; otherwise `END`

**State** (`agents/state.py`):

```python
class GraphState(TypedDict):
    project_id:      Annotated[str, _replace]          # overwrite semantics
    messages:        Annotated[list[MessageItem], add]  # append semantics
    current_agent:   Annotated[str, _replace]
    brand_spec:      Annotated[dict, _replace_dict]     # shallow merge semantics
    pending_handoff: Annotated[str, _replace]
```

`messages` uses `operator.add` so each node's returned messages are appended to the existing list. All other fields use last-write-wins.

### Current Routing Logic

The `router_node` is a passthrough: whatever `current_agent` the orchestrator sets (from the user's target `agent_id`) is where the message goes. The SHIP Manager does not yet use the LLM to dynamically route — this is a planned enhancement.

---

## Request Pipeline

The full lifecycle of a user message through the system:

```
Frontend                          Backend
   │                                 │
   │─── WS: user_message ──────────▶│
   │                                 ├─ 1. Validate payload (project_id, content)
   │                                 ├─ 2. Persist user message → messages table
   │◀── WS: agent_typing(true) ─────┤
   │                                 ├─ 3. Load full message history from DB
   │                                 ├─ 4. Build GraphState, set current_agent
   │                                 ├─ 5. Invoke agent_graph.ainvoke()
   │                                 │     ├─ router_node → pick agent
   │                                 │     ├─ agent node → call LLM
   │                                 │     └─ check pending_handoff → END or loop
   │                                 ├─ 6. Extract new agent messages from result
   │                                 ├─ 7. Persist each agent reply → messages table
   │◀── WS: agent_message ──────────┤  8. Push each reply to client
   │◀── WS: agent_typing(false) ────┤
   │                                 │
```

On error at step 5, the server sends `agent_typing(false)` + `error` event and aborts.

---

## Frontend Integration

The frontend connects via a single `useWebSocket` hook (`frontend/src/hooks/useWebSocket.ts`):

- **Auto-connects** on mount to `ws://localhost:8000/ws/{clientId}` (configurable via `NEXT_PUBLIC_WS_URL`)
- **Auto-reconnects** after 3 seconds on disconnect
- **Event bus pattern**: `on(event, handler)` returns an unsubscribe function; handlers stored in a ref-based Map to survive re-renders
- **`send(event, data)`**: serializes and sends if connected, silently drops if not
- **`connected`**: boolean state exposed to components for UI indicators

`ChatWindow` consumes the hook and:
- Listens for `agent_message` and `agent_typing` filtered by the active `agent.id`
- Sends `user_message` events with the current `projectId` and `agent.id`
- Falls back to dummy data from `lib/dummy-data.ts` when no WebSocket events have been received

---

## Dependencies

```
fastapi>=0.115         # ASGI framework
uvicorn[standard]>=0.34 # ASGI server (with watchfiles for --reload)
websockets>=14.0       # WebSocket protocol implementation
sqlalchemy>=2.0        # async ORM
aiosqlite>=0.20        # async SQLite driver
langgraph>=0.4         # agent graph orchestration
langchain-core>=0.3    # base abstractions for LangGraph
google-generativeai>=0.8 # Gemini SDK
pydantic>=2.0          # data validation (also used by FastAPI)
pydantic-settings      # .env → Settings class
python-dotenv>=1.0     # .env file loading
```

---

## Future Work

### 1. Authentication & User Sessions

**What**: JWT-based auth, user accounts, session management.
**Why**: Currently there's no concept of a logged-in user. The `client_id` for WebSocket is a random string generated per page load.
**How**:
- Add a `users` table (`id`, `email`, `hashed_password`, `created_at`)
- Add `user_id` foreign key to `projects` and `messages`
- Implement `/api/auth/register`, `/api/auth/login` returning JWTs
- Add a FastAPI dependency that validates the JWT on REST routes
- For WebSocket, validate the JWT via a query param or first-message handshake before accepting the connection
- Frontend: store token in httpOnly cookie or localStorage, attach to all requests

### 2. LLM-Based Supervisor Routing

**What**: Make the SHIP Manager use the LLM to decide which agent handles each message, instead of the current passthrough.
**Why**: Right now, routing is explicit — the frontend picks the agent. The supervisor should be able to triage ambiguous messages and auto-route.
**How**:
- Modify `router_node` in `nodes.py` to call the LLM with the SHIP Manager's system prompt + the user message + a structured instruction to output a JSON routing decision
- Parse the LLM response to extract `target_agent_id` and `reason`
- Emit an `agent_handoff` WebSocket event so the frontend can show "SHIP Manager routed your message to Intake Architect"
- Add a fallback: if LLM parsing fails, default to `agent_manager` handling it directly

### 3. Streaming Responses

**What**: Stream agent responses token-by-token to the frontend instead of waiting for the full response.
**Why**: Perceived latency drops significantly. Users see text appearing in real-time.
**How**:
- Add a new server→client event `agent_message_chunk` with fields `{agent_id, chunk, is_final}`
- In `orchestrator.py`, use `generate_stream()` instead of `generate()` — iterate over tokens, push each as a chunk event, then send the final `agent_message` with the complete text
- Frontend `ChatWindow`: accumulate chunks into a growing message bubble, finalize on `is_final: true`
- `GeminiProvider.generate_stream()` already yields chunks; `MockProvider.generate_stream()` already simulates word-by-word output

### 4. BrandSpec Persistence & Evolution

**What**: Agents should read from and write to a shared `BrandSpec` object that evolves as the project progresses.
**Why**: Currently `brand_spec` in `GraphState` is always `{}`. Agents have no shared memory of decisions made.
**How**:
- Define a structured `BrandSpec` Pydantic model (name, tagline, industry, audience, pillars, colors, typography, logo_direction, etc.)
- After each agent node, if the agent produced structured brand data, merge it into `brand_spec` in the graph state
- After graph execution, serialize the updated `brand_spec` to the `brand_specs` table
- On the next invocation, load the latest `brand_spec` from DB and inject it into the initial graph state
- The Intake Architect populates identity/audience/values; Visual Identity Lead populates colors/typography; etc.

### 5. LangGraph Checkpointing

**What**: Persist the LangGraph state between invocations using the `agent_states` table.
**Why**: Currently, each user message rebuilds the full state from the messages table. Checkpointing preserves the exact graph state (including `brand_spec`, `pending_handoff`, etc.) for resumption.
**How**:
- Use LangGraph's built-in `SqliteSaver` or implement a custom `BaseCheckpointSaver` backed by the `agent_states` table
- Pass a `thread_id` (= `project_id`) to `agent_graph.ainvoke()` config
- On each invocation, the graph loads the last checkpoint automatically and appends new events
- This also enables replaying or branching conversation history

### 6. Agent-to-Agent Handoff with Notification

**What**: When an agent sets `pending_handoff`, the handoff should be visible to the user and trigger the target agent automatically.
**Why**: Currently `pending_handoff` is always `""`. Agents never initiate handoffs on their own.
**How**:
- Modify agent node functions to parse the LLM response for handoff signals (e.g., agent says "I'll pass this to the Visual Identity Lead")
- Use structured output or a regex to detect handoff intent, then set `pending_handoff` to the target agent ID
- The conditional edge after the agent already handles this — it will route to the target agent
- In `orchestrator.py`, when a handoff occurs, emit an `agent_handoff` event: `{from_agent, to_agent, reason}`
- Frontend: show a system message like "Intake Architect handed off to Visual Identity Lead"

### 7. Rate Limiting & Error Handling

**What**: Protect the API from abuse and handle LLM failures gracefully.
**Why**: No rate limiting exists. LLM errors currently surface as raw exception strings.
**How**:
- Add `slowapi` or a custom middleware for per-client rate limiting on both REST and WebSocket events
- Implement retry logic in `LLMProvider` subclasses (exponential backoff, 3 attempts)
- Map LLM exceptions to user-friendly error messages in the orchestrator
- Add a circuit breaker: if the LLM fails N times in a row, temporarily switch to MockProvider and notify the user

### 8. File & Asset Storage

**What**: Support uploading and serving generated assets (logos, mockups, PDFs).
**Why**: The Production Manager agent will eventually compile real files.
**How**:
- Add a `storage/assets/{project_id}/` directory structure
- Create an `assets` table (`id`, `project_id`, `agent_id`, `filename`, `mime_type`, `path`, `created_at`)
- Add REST endpoints: `POST /api/projects/{id}/assets` (upload), `GET /api/assets/{id}` (download)
- Mount a `StaticFiles` directory in FastAPI for direct asset serving
- Integrate with the canvas board: generated assets appear as canvas nodes

### 9. Multi-Provider LLM Support

**What**: Add OpenAI, Anthropic, and local model providers alongside Gemini.
**Why**: Users should be able to pick the best model for their needs. Some may need to run locally for privacy.
**How**:
- Create `OpenAIProvider` in `app/llm/openai.py` using the `openai` Python SDK
- Create `AnthropicProvider` in `app/llm/anthropic.py` using the `anthropic` SDK
- Create `OllamaProvider` in `app/llm/ollama.py` for local models via the Ollama HTTP API
- Extend `Settings` with `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `OLLAMA_BASE_URL`
- Extend `get_llm_provider()` factory to handle new provider strings
- Optionally allow per-agent provider overrides (e.g., use a cheaper model for the router, a better model for the visual agent)

### 10. Testing

**What**: Unit and integration tests for all backend layers.
**Why**: No tests exist yet.
**How**:
- Add `pytest`, `pytest-asyncio`, `httpx` to dev dependencies
- **Unit tests**: test each LLM provider, agent nodes with mocked LLM, message service with an in-memory SQLite
- **Integration tests**: use FastAPI's `TestClient` (or `httpx.AsyncClient`) to test REST endpoints end-to-end
- **WebSocket tests**: use `httpx` or Starlette's `WebSocketTestSession` to test the full WS flow
- **Graph tests**: invoke `agent_graph` with mock state and verify routing decisions and output shape
- Target: every file in `app/` has a corresponding test file in `tests/`

### 11. Observability

**What**: Structured logging, request tracing, and LLM call metrics.
**Why**: Debugging multi-agent conversations requires visibility into which agent was called, what it received, and what it produced.
**How**:
- Replace `logging.basicConfig` with structured JSON logging (e.g., `structlog`)
- Add a correlation ID middleware that assigns a `request_id` to each HTTP/WS interaction
- Log every LLM call with: agent_id, token count (est.), latency, provider, truncated prompt/response
- Optionally integrate LangSmith (already a dependency via `langsmith`) for tracing LangGraph executions
- Add a `/api/metrics` endpoint or Prometheus instrumentation for: active WS connections, messages/min, LLM latency p50/p95

### 12. Deployment

**What**: Containerized deployment with persistent storage.
**How**:
- Add a `Dockerfile` (Python 3.12-slim, copy app + requirements, uvicorn entrypoint)
- Add `docker-compose.yml` with backend service + volume mount for `storage/`
- For production: switch from SQLite to PostgreSQL (change `DATABASE_URL`, add `asyncpg` driver, no ORM changes needed)
- Add `Procfile` or `railway.json` for PaaS deployment
- Set CORS origins from an env var instead of hardcoding `localhost:3000`
