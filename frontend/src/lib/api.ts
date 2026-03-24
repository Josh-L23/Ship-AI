import type { Agent, CanvasAsset, ChatMessage, Project } from "@/lib/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type BackendProject = {
  id: string;
  name: string;
  description: string;
  status: "draft" | "in_progress" | "completed";
  created_at: string;
  updated_at: string;
};

type BackendMessage = {
  id: string;
  project_id: string;
  agent_id: string;
  sender: "user" | "agent";
  content: string;
  message_type: "text" | "image" | "colors" | "list";
  metadata?: Record<string, unknown>;
  timestamp: string;
};

function initialsFromName(name: string): string {
  const words = name.split(" ").filter(Boolean);
  return words
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export async function fetchAgents(): Promise<Agent[]> {
  const res = await fetch(`${API_BASE}/api/agents`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load agents");
  const data = (await res.json()) as Array<{
    id: string;
    name: string;
    role: string;
    description: string;
  }>;

  return data.map((agent) => ({
    ...agent,
    status: "online",
    avatar: initialsFromName(agent.name) || "AG",
    unreadCount: 0,
  }));
}

export async function fetchProjects(): Promise<Project[]> {
  const res = await fetch(`${API_BASE}/api/projects`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load projects");
  const data = (await res.json()) as BackendProject[];
  return data.map((project) => ({
    id: project.id,
    name: project.name,
    description: project.description,
    status: project.status,
    createdAt: project.created_at,
    updatedAt: project.updated_at,
    thumbnail: "🎨",
    agentActivity: 0,
  }));
}

export async function createProject(payload: {
  name: string;
  description?: string;
}): Promise<Project> {
  const res = await fetch(`${API_BASE}/api/projects`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to create project");
  const project = (await res.json()) as BackendProject;
  return {
    id: project.id,
    name: project.name,
    description: project.description,
    status: project.status,
    createdAt: project.created_at,
    updatedAt: project.updated_at,
    thumbnail: "🎨",
    agentActivity: 0,
  };
}

export async function fetchMessages(projectId: string): Promise<ChatMessage[]> {
  const res = await fetch(`${API_BASE}/api/messages/${projectId}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to load messages");
  const data = (await res.json()) as BackendMessage[];

  return data.map((msg) => ({
    id: msg.id,
    agentId: msg.agent_id,
    sender: msg.sender,
    content: msg.content,
    timestamp: msg.timestamp,
    type: msg.message_type || "text",
    metadata: msg.metadata as ChatMessage["metadata"],
  }));
}

export async function fetchBrandSpec(
  projectId: string
): Promise<{ spec: Record<string, unknown> }> {
  const res = await fetch(`${API_BASE}/api/projects/${projectId}/brand-spec`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to load brand spec");
  const data = (await res.json()) as { spec?: Record<string, unknown> };
  return { spec: data.spec ?? {} };
}

export async function saveBrandSpec(
  projectId: string,
  spec: Record<string, unknown>
): Promise<void> {
  const res = await fetch(`${API_BASE}/api/projects/${projectId}/brand-spec`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ spec }),
  });
  if (!res.ok) throw new Error("Failed to save brand spec");
}

export function canvasAssetsFromSpec(spec: Record<string, unknown>): CanvasAsset[] {
  const raw = spec.canvasAssets;
  if (!Array.isArray(raw)) return [];
  return raw.filter((item): item is CanvasAsset => {
    if (!item || typeof item !== "object") return false;
    const candidate = item as Partial<CanvasAsset>;
    return Boolean(candidate.id && candidate.type && candidate.title && candidate.position && candidate.data);
  });
}
