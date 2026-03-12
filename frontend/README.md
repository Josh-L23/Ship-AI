# SHIP ai - Frontend (Web Interface) 🎨

The visual interface for **SHIP ai**, an autonomous branding engine. This frontend acts as the user's bridge to the multi-agent system, allowing them to collaborate with agents, visualize brand DNA, and manage generated assets.

---

## 🛠 Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **State Management**: [React Context / Hooks] (To be determined)
- **Visuals**:
  - [Framer Motion](https://www.framer.com/motion/) (Smooth transitions & animations)
  - [Lucide React](https://lucide.dev/) (Iconography)
  - [React Flow](https://reactflow.dev/) (Interactive agentic workflow visualization)
- **Language**: [TypeScript](https://www.typescriptlang.org/)

---

## 🚀 Current State (March 2026)

The frontend is currently in the **scaffolding phase**.

- [x] Initial Next.js project setup.
- [x] Tailwind CSS and PostCSS configuration.
- [x] Essential UI libraries integrated (Lucide, Framer Motion, React Flow).
- [ ] Brand DNA Intake Interface.
- [ ] Agent Workflow Visualizer (React Flow integration).
- [ ] Asset Preview & Download Gallery.
- [ ] API Connection to Backend (FastAPI).

---

## 🏗 Directory Structure

```text
frontend/
├── src/
│   ├── app/                # App Router (Pages, Layouts)
│   │   ├── layout.tsx      # Root Layout
│   │   └── page.tsx        # Homepage (Current: Placeholder)
│   ├── components/         # Shared UI components (To be created)
│   ├── hooks/              # Custom React hooks (To be created)
│   └── lib/                # Utility functions & shared logic (To be created)
├── public/                 # Static assets
└── package.json            # Project dependencies & scripts
```

---

## ⚙️ Development

### Setup

1. **Navigate to frontend**: `cd frontend`
2. **Install dependencies**:
   ```bash
   npm install
   ```

### Running Locally

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

### Build & Lint

```bash
# Build for production
npm run build

# Run ESLint
npm run lint
```

---

*Part of the SHIP ai ecosystem. Empowering autonomous branding.*