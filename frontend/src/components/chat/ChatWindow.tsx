"use client";

import { useRef, useEffect } from "react";
import { Send, Paperclip, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { type Agent, chatMessages } from "@/lib/dummy-data";
import { AgentAvatar } from "./AgentAvatar";
import { MessageBubble } from "./MessageBubble";
import { TypingIndicator } from "./TypingIndicator";

interface ChatWindowProps {
  agent: Agent;
}

const quickActions: Record<string, string[]> = {
  agent_intake: ["Refine brand pillars", "Start over", "View BrandSpec"],
  agent_visual: ["Generate logo", "Refine colors", "Create mockup"],
  agent_market: ["Check new name", "Domain search", "Competitor analysis"],
  agent_production: ["Compile pitch deck", "Generate mockups", "Export assets"],
  agent_manager: ["Project status", "Timeline estimate", "Reassign task"],
};

export function ChatWindow({ agent }: ChatWindowProps) {
  const messages = chatMessages[agent.id] || [];
  const scrollRef = useRef<HTMLDivElement>(null);
  const actions = quickActions[agent.id] || [];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [agent.id]);

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 md:px-6 py-3 border-b border-border/50 flex items-center gap-3">
        <AgentAvatar initials={agent.avatar} status={agent.status} size="sm" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">{agent.name}</p>
          <p className="text-xs text-muted-foreground">{agent.role}</p>
        </div>
        <Badge
          variant="secondary"
          className="text-[10px] capitalize"
        >
          {agent.status}
        </Badge>
      </div>

      <ScrollArea className="flex-1 px-4 md:px-6" ref={scrollRef}>
        <div className="py-4 space-y-4">
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}

          {agent.status === "busy" && <TypingIndicator />}
        </div>
      </ScrollArea>

      <div className="px-4 md:px-6 pb-4 pt-2 space-y-3">
        {actions.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <Sparkles className="w-3 h-3 text-muted-foreground shrink-0" />
            {actions.map((action) => (
              <button
                key={action}
                className="shrink-0 px-3 py-1.5 rounded-full border border-border/60 text-xs text-muted-foreground hover:text-foreground hover:border-border transition-colors"
              >
                {action}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-end gap-2">
          <button className="p-2.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors shrink-0 mb-0.5">
            <Paperclip className="w-4 h-4" />
          </button>

          <div className="flex-1 relative">
            <Textarea
              placeholder={`Message ${agent.name}...`}
              className="min-h-[44px] max-h-32 resize-none pr-12 py-3 text-sm bg-muted/50 border-border/40"
              rows={1}
            />
          </div>

          <Button
            size="icon"
            className="shrink-0 w-10 h-10 rounded-lg mb-0.5"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
