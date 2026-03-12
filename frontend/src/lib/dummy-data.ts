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
  };
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: "draft" | "in_progress" | "completed";
  createdAt: string;
  updatedAt: string;
  thumbnail: string;
  agentActivity: number;
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

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  bio: string;
  plan: "free" | "pro" | "enterprise";
  joinedAt: string;
}

export const currentUser: UserProfile = {
  id: "usr_001",
  name: "Alex Morgan",
  email: "alex.morgan@example.com",
  avatar: "AM",
  bio: "Brand strategist & creative director. Building the future of automated identity design.",
  plan: "pro",
  joinedAt: "2025-09-15",
};

export const agents: Agent[] = [
  {
    id: "agent_intake",
    name: "Intake Architect",
    role: "Brand DNA Specialist",
    description:
      "Conducts structured dialogue to extract your Brand DNA and translate intent into a technical BrandSpec.",
    status: "online",
    avatar: "IA",
    unreadCount: 2,
  },
  {
    id: "agent_market",
    name: "Market Intelligence",
    role: "Naming & Validation",
    description:
      "Validates brand names against trademark databases and search APIs for legal and digital viability.",
    status: "busy",
    avatar: "MI",
    unreadCount: 0,
  },
  {
    id: "agent_visual",
    name: "Visual Identity Lead",
    role: "Design Director",
    description:
      "Translates your BrandSpec into visual prompts, manages raster asset generation and vectorization.",
    status: "online",
    avatar: "VI",
    unreadCount: 5,
  },
  {
    id: "agent_production",
    name: "Production Manager",
    role: "Final Assembly",
    description:
      "Compiles the Brand Identity Object into pitch decks and maps logos onto mockups.",
    status: "offline",
    avatar: "PM",
    unreadCount: 0,
  },
  {
    id: "agent_manager",
    name: "SHIP Manager",
    role: "Project Orchestrator",
    description:
      "Oversees the entire branding pipeline, coordinates agents, and ensures deliverable quality.",
    status: "online",
    avatar: "SM",
    unreadCount: 1,
  },
];

export const chatMessages: Record<string, ChatMessage[]> = {
  agent_intake: [
    {
      id: "msg_001",
      agentId: "agent_intake",
      sender: "agent",
      content:
        "Welcome! I'm the Intake Architect. I'll help extract your Brand DNA. Let's start — what industry or market does your brand operate in?",
      timestamp: "2026-03-12T09:00:00Z",
      type: "text",
    },
    {
      id: "msg_002",
      agentId: "agent_intake",
      sender: "user",
      content:
        "We're building a premium sustainable fashion brand targeting Gen Z and millennials.",
      timestamp: "2026-03-12T09:01:30Z",
      type: "text",
    },
    {
      id: "msg_003",
      agentId: "agent_intake",
      sender: "agent",
      content:
        "Excellent. Sustainable fashion for a younger demographic — that gives us a lot to work with. What emotions or feelings should your brand evoke?",
      timestamp: "2026-03-12T09:02:15Z",
      type: "text",
    },
    {
      id: "msg_004",
      agentId: "agent_intake",
      sender: "user",
      content:
        "Authentic, earth-connected, modern minimalism. Think clean lines but with warmth.",
      timestamp: "2026-03-12T09:03:45Z",
      type: "text",
    },
    {
      id: "msg_005",
      agentId: "agent_intake",
      sender: "agent",
      content:
        "I've synthesized your Brand DNA keywords into these core pillars:",
      timestamp: "2026-03-12T09:04:30Z",
      type: "list",
      metadata: {
        items: [
          "Authenticity — raw, unfiltered, genuine",
          "Earth Connection — natural materials, organic textures",
          "Modern Minimalism — clean geometry, purposeful whitespace",
          "Warmth — human touch, approachable luxury",
        ],
      },
    },
    {
      id: "msg_006",
      agentId: "agent_intake",
      sender: "agent",
      content:
        "Based on this, I'm ready to generate your initial BrandSpec. Shall I proceed, or would you like to refine any of these pillars?",
      timestamp: "2026-03-12T09:05:00Z",
      type: "text",
    },
  ],

  agent_visual: [
    {
      id: "msg_101",
      agentId: "agent_visual",
      sender: "agent",
      content:
        "I've analyzed the BrandSpec from the Intake Architect. Here's the initial color palette I've developed for your brand:",
      timestamp: "2026-03-12T10:00:00Z",
      type: "colors",
      metadata: {
        colors: [
          { hex: "#2D3436", name: "Charcoal Earth" },
          { hex: "#D4A574", name: "Warm Sand" },
          { hex: "#F5F0EB", name: "Raw Cotton" },
          { hex: "#8B7355", name: "Aged Leather" },
          { hex: "#A8B5A2", name: "Sage Mist" },
        ],
      },
    },
    {
      id: "msg_102",
      agentId: "agent_visual",
      sender: "user",
      content:
        "Love the earthy tones! Can we make the accent color slightly more vibrant? Maybe a terracotta instead of aged leather?",
      timestamp: "2026-03-12T10:02:00Z",
      type: "text",
    },
    {
      id: "msg_103",
      agentId: "agent_visual",
      sender: "agent",
      content: "Absolutely. Here's the refined palette with a terracotta accent:",
      timestamp: "2026-03-12T10:03:00Z",
      type: "colors",
      metadata: {
        colors: [
          { hex: "#2D3436", name: "Charcoal Earth" },
          { hex: "#D4A574", name: "Warm Sand" },
          { hex: "#F5F0EB", name: "Raw Cotton" },
          { hex: "#C1694F", name: "Terracotta" },
          { hex: "#A8B5A2", name: "Sage Mist" },
        ],
      },
    },
    {
      id: "msg_104",
      agentId: "agent_visual",
      sender: "agent",
      content:
        "I've also generated an initial logo concept based on your Brand DNA. The mark combines organic flowing forms with geometric structure:",
      timestamp: "2026-03-12T10:05:00Z",
      type: "image",
      metadata: {
        imageUrl: "/placeholder-logo.svg",
      },
    },
    {
      id: "msg_105",
      agentId: "agent_visual",
      sender: "user",
      content:
        "This is a great starting point. Can you explore a version with a leaf motif integrated into the lettermark?",
      timestamp: "2026-03-12T10:07:00Z",
      type: "text",
    },
  ],

  agent_market: [
    {
      id: "msg_201",
      agentId: "agent_market",
      sender: "agent",
      content:
        "I've completed the trademark and domain analysis for your proposed brand name 'TERRA'. Here are the findings:",
      timestamp: "2026-03-12T11:00:00Z",
      type: "list",
      metadata: {
        items: [
          "USPTO Trademark: 3 potential conflicts in fashion/apparel class",
          "Domain: terra.com is taken, terra.co available ($2,400)",
          "Social handles: @terra taken on Instagram, @weareterra available",
          "SEO Competition: High — recommend a modifier like 'TERRA Studios'",
        ],
      },
    },
    {
      id: "msg_202",
      agentId: "agent_market",
      sender: "user",
      content:
        "What about 'TERRENE' instead? It means 'of the earth' and feels more unique.",
      timestamp: "2026-03-12T11:02:00Z",
      type: "text",
    },
    {
      id: "msg_203",
      agentId: "agent_market",
      sender: "agent",
      content:
        "Excellent suggestion. Running validation on 'TERRENE' now...",
      timestamp: "2026-03-12T11:02:30Z",
      type: "text",
    },
  ],

  agent_production: [
    {
      id: "msg_301",
      agentId: "agent_production",
      sender: "agent",
      content:
        "Standing by for finalized assets. Once the Visual Identity Lead confirms the logo and color palette, I'll begin compiling the Brand Identity Package including pitch deck, mockups, and guidelines document.",
      timestamp: "2026-03-12T08:00:00Z",
      type: "text",
    },
  ],

  agent_manager: [
    {
      id: "msg_401",
      agentId: "agent_manager",
      sender: "agent",
      content:
        "Project 'TERRENE' is progressing well. Here's the current status across all agents:",
      timestamp: "2026-03-12T12:00:00Z",
      type: "list",
      metadata: {
        items: [
          "Intake Architect — BrandSpec complete ✓",
          "Market Intelligence — Name validation in progress",
          "Visual Identity Lead — Palette finalized, logo iteration 2 pending",
          "Production Manager — Awaiting final assets",
        ],
      },
    },
    {
      id: "msg_402",
      agentId: "agent_manager",
      sender: "user",
      content: "Thanks for the update. What's the estimated timeline to completion?",
      timestamp: "2026-03-12T12:01:00Z",
      type: "text",
    },
    {
      id: "msg_403",
      agentId: "agent_manager",
      sender: "agent",
      content:
        "Based on current progress, I estimate the full Brand Identity Package will be ready within 2-3 hours. The main bottleneck is the logo iteration cycle — once the Visual Identity Lead finalizes, Production can compile quickly.",
      timestamp: "2026-03-12T12:01:45Z",
      type: "text",
    },
  ],
};

export const projects: Project[] = [
  {
    id: "proj_001",
    name: "TERRENE",
    description:
      "Premium sustainable fashion brand targeting Gen Z and millennials with earth-connected minimalism.",
    status: "in_progress",
    createdAt: "2026-03-12T08:00:00Z",
    updatedAt: "2026-03-12T12:01:45Z",
    thumbnail: "🌿",
    agentActivity: 4,
  },
  {
    id: "proj_002",
    name: "Luminary Labs",
    description:
      "Tech startup branding for an AI-powered education platform. Modern, trustworthy, innovative.",
    status: "completed",
    createdAt: "2026-02-20T10:00:00Z",
    updatedAt: "2026-03-01T16:30:00Z",
    thumbnail: "💡",
    agentActivity: 0,
  },
  {
    id: "proj_003",
    name: "Coastal Brew",
    description:
      "Artisan coffee roastery with Pacific Northwest roots. Rugged yet refined brand identity.",
    status: "completed",
    createdAt: "2026-01-15T09:00:00Z",
    updatedAt: "2026-02-10T14:00:00Z",
    thumbnail: "☕",
    agentActivity: 0,
  },
  {
    id: "proj_004",
    name: "Veil & Virtue",
    description:
      "Luxury skincare line focused on transparency and clean ingredients. Elegant and scientific.",
    status: "draft",
    createdAt: "2026-03-10T11:00:00Z",
    updatedAt: "2026-03-10T11:00:00Z",
    thumbnail: "✨",
    agentActivity: 0,
  },
];

export const canvasAssets: CanvasAsset[] = [
  {
    id: "asset_palette_1",
    type: "color_palette",
    title: "Primary Palette",
    position: { x: 50, y: 50 },
    data: {
      colors: [
        { hex: "#2D3436", name: "Charcoal Earth" },
        { hex: "#D4A574", name: "Warm Sand" },
        { hex: "#F5F0EB", name: "Raw Cotton" },
        { hex: "#C1694F", name: "Terracotta" },
        { hex: "#A8B5A2", name: "Sage Mist" },
      ],
    },
  },
  {
    id: "asset_palette_2",
    type: "color_palette",
    title: "Extended Neutrals",
    position: { x: 50, y: 320 },
    data: {
      colors: [
        { hex: "#1A1A1A", name: "Deep Black" },
        { hex: "#4A4A4A", name: "Stone Gray" },
        { hex: "#B8B0A8", name: "Warm Gray" },
        { hex: "#E8E2DC", name: "Cream" },
        { hex: "#FFFFFF", name: "Pure White" },
      ],
    },
  },
  {
    id: "asset_image_1",
    type: "image",
    title: "Logo — Primary Mark",
    position: { x: 420, y: 50 },
    data: {
      src: "/placeholder-logo.svg",
      generatedAt: "2026-03-12T10:05:00Z",
      iteration: 2,
      dimensions: "1024 × 1024",
    },
  },
  {
    id: "asset_image_2",
    type: "image",
    title: "Logo — Wordmark",
    position: { x: 420, y: 320 },
    data: {
      src: "/placeholder-wordmark.svg",
      generatedAt: "2026-03-12T10:15:00Z",
      iteration: 1,
      dimensions: "2048 × 512",
    },
  },
  {
    id: "asset_image_3",
    type: "image",
    title: "Pattern — Organic Texture",
    position: { x: 720, y: 50 },
    data: {
      src: "/placeholder-pattern.svg",
      generatedAt: "2026-03-12T10:30:00Z",
      iteration: 1,
      dimensions: "2048 × 2048",
    },
  },
  {
    id: "asset_note_1",
    type: "note",
    title: "Brand Voice Notes",
    position: { x: 720, y: 320 },
    data: {
      content:
        "Voice should feel like a knowledgeable friend — never preachy about sustainability. Conversational, warm, with occasional poetic flourishes. Avoid corporate jargon.",
      color: "#FEF3C7",
    },
  },
  {
    id: "asset_note_2",
    type: "note",
    title: "Tagline Options",
    position: { x: 1020, y: 50 },
    data: {
      content:
        '1. "Rooted in tomorrow"\n2. "Wear the earth forward"\n3. "Fashion from the ground up"\n4. "Naturally next"',
      color: "#DBEAFE",
    },
  },
  {
    id: "asset_typography",
    type: "typography",
    title: "Typography System",
    position: { x: 1020, y: 320 },
    data: {
      heading: {
        family: "Playfair Display",
        weight: "700",
        sample: "TERRENE",
      },
      body: {
        family: "Inter",
        weight: "400",
        sample:
          "Crafted with intention, worn with purpose. Every thread tells a story of the earth it came from.",
      },
    },
  },
  {
    id: "asset_brand_guidelines",
    type: "brand_guidelines",
    title: "Brand Identity Summary",
    position: { x: 50, y: 570 },
    data: {
      brandName: "TERRENE",
      tagline: "Rooted in tomorrow",
      industry: "Sustainable Fashion",
      targetAudience: "Gen Z & Millennials",
      voiceDescriptors: [
        "Authentic",
        "Warm",
        "Grounded",
        "Forward-looking",
      ],
    },
  },
  {
    id: "asset_media_1",
    type: "media",
    title: "Brand Anthem — Audio Mood",
    position: { x: 420, y: 570 },
    data: {
      mediaType: "audio",
      duration: "2:34",
      format: "MP3",
    },
  },
];
