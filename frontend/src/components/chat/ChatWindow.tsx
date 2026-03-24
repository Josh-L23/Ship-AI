"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { Send, Paperclip, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { fetchMessages } from "@/lib/api";
import { type Agent, type ChatMessage } from "@/lib/types";
import { AgentAvatar } from "./AgentAvatar";
import { MessageBubble } from "./MessageBubble";
import { TypingIndicator } from "./TypingIndicator";

interface ChatWindowProps {
  agent: Agent;
  projectId?: string;
  wsSend?: (event: string, data: Record<string, unknown>) => void;
  wsOn?: (
    event: string,
    handler: (data: Record<string, unknown>) => void
  ) => () => void;
  wsConnected?: boolean;
}

const quickActions: Record<string, string[]> = {
  agent_intake: ["Refine brand pillars", "Start over", "View BrandSpec"],
  agent_visual: ["Generate logo", "Refine colors", "Create mockup"],
  agent_market: ["Check new name", "Domain search", "Competitor analysis"],
  agent_production: ["Compile pitch deck", "Generate mockups", "Export assets"],
  agent_manager: ["Project status", "Timeline estimate", "Reassign task"],
};

export function ChatWindow({
  agent,
  projectId,
  wsSend,
  wsOn,
  wsConnected,
}: ChatWindowProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const actions = quickActions[agent.id] || [];
  const msgCounter = useRef(0);

  useEffect(() => {
    let active = true;
    if (!projectId) {
      setMessages([]);
      return;
    }

    fetchMessages(projectId)
      .then((history) => {
        if (!active) return;
        setMessages(history.filter((msg) => msg.agentId === agent.id));
      })
      .catch(() => {
        if (!active) return;
        setMessages([]);
      });

    setIsTyping(false);
    setInput("");
    return () => {
      active = false;
    };
  }, [agent.id, projectId]);

  useEffect(() => {
    if (!wsOn) return;

    const unsubs = [
      wsOn("agent_message", (data) => {
        if (data.agent_id !== agent.id) return;
        const msg: ChatMessage = {
          id: (data.message_id as string) || `live_${Date.now()}`,
          agentId: data.agent_id as string,
          sender: "agent",
          content: data.content as string,
          timestamp: (data.timestamp as string) || new Date().toISOString(),
          type: (data.message_type as ChatMessage["type"]) || "text",
          metadata: (data.metadata as ChatMessage["metadata"]) || undefined,
        };
        setMessages((prev) => [...prev, msg]);
      }),
      wsOn("agent_typing", (data) => {
        if (data.agent_id !== agent.id) return;
        setIsTyping(data.is_typing as boolean);
      }),
      wsOn("error", (data) => {
        setIsTyping(false);
        const errorMsg: ChatMessage = {
          id: `error_${Date.now()}`,
          agentId: agent.id,
          sender: "agent",
          content: `Something went wrong: ${data.message ?? "Unknown error"}`,
          timestamp: new Date().toISOString(),
          type: "text",
        };
        setMessages((prev) => [...prev, errorMsg]);
      }),
    ];

    return () => unsubs.forEach((u) => u());
  }, [agent.id, wsOn]);

  useEffect(() => {
    const viewport = scrollRef.current?.querySelector<HTMLElement>(
      '[data-slot="scroll-area-viewport"]'
    );
    if (viewport) {
      viewport.scrollTop = viewport.scrollHeight;
    }
  }, [messages, isTyping]);

  const sendMessage = useCallback(
    (text: string) => {
      if (!text.trim()) return;

      msgCounter.current += 1;
      const userMsg: ChatMessage = {
        id: `user_${Date.now()}_${msgCounter.current}`,
        agentId: agent.id,
        sender: "user",
        content: text.trim(),
        timestamp: new Date().toISOString(),
        type: "text",
      };

      setMessages((prev) => [...prev, userMsg]);
      setInput("");

      if (projectId && wsSend && wsConnected) {
        wsSend("user_message", {
          project_id: projectId,
          agent_id: agent.id,
          content: text.trim(),
          message_type: "text",
        });
      }
    },
    [agent.id, projectId, wsSend, wsConnected]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const handleFileUpload = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileSelected = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const objectUrl = URL.createObjectURL(file);
      msgCounter.current += 1;

      if (file.type.startsWith("image/")) {
        const userMsg: ChatMessage = {
          id: `user_${Date.now()}_${msgCounter.current}`,
          agentId: agent.id,
          sender: "user",
          content: `Shared an image: ${file.name}`,
          timestamp: new Date().toISOString(),
          type: "image",
          metadata: {
            imageUrl: objectUrl,
          },
        };
        setMessages((prev) => [...prev, userMsg]);
      } else {
        const userMsg: ChatMessage = {
          id: `user_${Date.now()}_${msgCounter.current}`,
          agentId: agent.id,
          sender: "user",
          content: `Shared a file: ${file.name}`,
          timestamp: new Date().toISOString(),
          type: "text",
        };
        setMessages((prev) => [...prev, userMsg]);
      }

      // Reset input
      e.target.value = "";
    },
    [agent.id]
  );

  return (
    <div className="flex flex-col h-full">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*,audio/*"
        className="hidden"
        onChange={handleFileSelected}
      />

      <div className="px-4 md:px-6 py-3 border-b border-border/50 flex items-center gap-3">
        <AgentAvatar initials={agent.avatar} status={agent.status} size="sm" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">{agent.name}</p>
          <p className="text-xs text-muted-foreground">{agent.role}</p>
        </div>
        <div className="flex items-center gap-2">
          {wsConnected !== undefined && (
            <span
              className={`w-2 h-2 rounded-full ${
                wsConnected ? "bg-emerald-500" : "bg-gray-400"
              }`}
              title={wsConnected ? "Connected" : "Disconnected"}
            />
          )}
          <Badge variant="secondary" className="text-[10px] capitalize">
            {agent.status}
          </Badge>
        </div>
      </div>

      <ScrollArea className="flex-1 min-h-0 px-4 md:px-6" ref={scrollRef}>
        <div className="py-4 space-y-4">
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
          {isTyping && <TypingIndicator />}
        </div>
      </ScrollArea>

      <div className="px-4 md:px-6 pb-4 pt-2 space-y-3">
        {actions.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <Sparkles className="w-3 h-3 text-muted-foreground shrink-0" />
            {actions.map((action) => (
              <button
                key={action}
                onClick={() => sendMessage(action)}
                className="shrink-0 px-3 py-1.5 rounded-full border border-border/60 text-xs text-muted-foreground hover:text-foreground hover:border-border transition-colors"
              >
                {action}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-end gap-2">
          <button
            onClick={handleFileUpload}
            className="p-2.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors shrink-0 mb-0.5"
          >
            <Paperclip className="w-4 h-4" />
          </button>

          <div className="flex-1 relative">
            <Textarea
              placeholder={`Message ${agent.name}...`}
              className="min-h-[44px] max-h-32 resize-none pr-12 py-3 text-sm bg-muted/50 border-border/40"
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>

          <Button
            size="icon"
            className="shrink-0 w-10 h-10 rounded-lg mb-0.5"
            onClick={() => sendMessage(input)}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
