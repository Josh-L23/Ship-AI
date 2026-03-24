# SHIP AI Frontend

This frontend is the user-facing workspace for SHIP AI.  
It provides project navigation, agent chat, and canvas-based visualization of brand outputs.

## Purpose and Scope

The frontend is responsible for:

- Rendering dashboard routes and UI components.
- Managing user interactions with chat and project views.
- Maintaining client-side state for canvas and local preferences.
- Connecting to backend REST and WebSocket interfaces.
- Translating backend events into clear UI updates.

The frontend is not responsible for:

- Agent orchestration logic.
- Long-term source-of-truth persistence for domain data.
- LLM provider execution.

## Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- React Flow (canvas)
- Framer Motion (UI transitions)

## Quick Start

```bash
cd frontend
npm install
npm run dev
```

Default local URL: `http://localhost:3000`

## Environment

Create `frontend/.env.local` and define at least:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000
```

If not set, code may fall back to local defaults depending on implementation.

## Directory Overview

```text
frontend/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   ├── (dashboard)/
│   │   │   ├── agents/
│   │   │   ├── canvas/
│   │   │   ├── projects/
│   │   │   └── settings/
│   │   ├── globals.css
│   │   └── layout.tsx
│   ├── components/
│   │   ├── chat/
│   │   ├── canvas/
│   │   ├── layout/
│   │   ├── settings/
│   │   └── ui/
│   ├── hooks/
│   │   ├── useWebSocket.ts
│   │   ├── useCanvasStore.ts
│   │   └── useLocalStorage.ts
│   └── lib/
│       ├── api.ts
│       ├── canvas-events.ts
│       ├── types.ts
│       └── utils.ts
└── README.md
```

## Key Frontend Flows

### Project and Navigation Flow

- User selects or creates a project from dashboard views.
- Current project context is used by chat and canvas routes.
- Route-level UI composes shared layout components (sidebar, topbar, mobile nav).

### Chat Flow

- `ChatWindow` sends `user_message` events over WebSocket.
- Incoming `agent_message` and `agent_typing` events update visible conversation state.
- Agent-specific selectors control which conversation context is active.

### Canvas Flow

- Canvas nodes are managed through `useCanvasStore`.
- Canvas updates can come from user actions or backend-driven events.
- `canvas-events.ts` enables cross-route communication for incoming asset updates.

### Local Persistence

- Lightweight UI state persists through local storage hooks.
- This persistence improves local continuity but is not the final source of truth.

## API and WebSocket Integration

### REST Usage

The frontend consumes backend project and message endpoints for:

- Project listing and lifecycle operations.
- Message history retrieval per project/agent context.

### WebSocket Usage

Endpoint pattern: `ws://localhost:8000/ws/{clientId}`

Common event types:

- Outbound: `user_message`, `ping`
- Inbound: `agent_message`, `agent_typing`, `canvas_update`, `error`, `pong`

The frontend should treat backend event payloads as authoritative for real-time agent output.

## Development Scripts

- `npm run dev`: start the development server.
- `npm run build`: create production build output.
- `npm run lint`: run lint checks.

## Frontend Quality Guidelines

- Keep route files thin and push reusable logic into hooks or component modules.
- Keep state boundaries explicit (local UI state vs server-derived state).
- Avoid duplicating backend contract types; centralize shared frontend typing in `src/lib/types.ts`.
- Prefer incremental, testable changes to chat and canvas behavior.

## Frontend Outstanding Tasks Checklist

- [ ] Replace remaining mock/dummy data paths with API-backed data loading.
- [ ] Add token-by-token chat rendering support for streaming responses.
- [ ] Implement authenticated session handling and protected routes.
- [ ] Persist canvas node edits to backend and restore from backend on load.
- [ ] Improve WebSocket reconnection UX with clear user status indicators.
- [ ] Add robust empty/error/loading states across dashboard routes.
- [ ] Introduce integration tests for chat, projects, and canvas flows.
- [ ] Add accessibility pass for keyboard flow, focus management, and semantic roles.
- [ ] Add upload and asset management UI aligned with backend storage endpoints.
- [ ] Finalize frontend build/runtime config for production environments.
