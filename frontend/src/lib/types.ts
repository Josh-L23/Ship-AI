export type AgentStatus = "online" | "busy" | "offline";

export interface Agent {
  id: string;
  name: string;
  role: string;
  description: string;
  status: AgentStatus;
  avatar: string;
  unreadCount: number;
}

export interface ChatMessage {
  id: string;
  agentId: string;
  sender: "user" | "agent";
  content: string;
  timestamp: string;
  type: "text" | "image" | "colors" | "list";
  metadata?: {
    imageUrl?: string;
    colors?: { hex: string; name: string }[];
    items?: string[];
    [key: string]: unknown;
  };
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: "draft" | "in_progress" | "completed";
  createdAt: string;
  updatedAt: string;
  thumbnail?: string;
  agentActivity?: number;
}

export interface CanvasAsset {
  id: string;
  type:
    | "color_palette"
    | "image"
    | "note"
    | "typography"
    | "brand_guidelines"
    | "media";
  title: string;
  position: { x: number; y: number };
  data: Record<string, unknown>;
}
