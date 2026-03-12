"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { agents, type Agent } from "@/lib/dummy-data";
import { AgentAvatar } from "./AgentAvatar";

interface AgentSelectorProps {
  selectedAgentId: string | null;
  onSelectAgent: (agent: Agent) => void;
}

export function AgentSelector({
  selectedAgentId,
  onSelectAgent,
}: AgentSelectorProps) {
  return (
    <div className="flex flex-col h-full border-r border-border/50">
      <div className="p-3 border-b border-border/50">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder="Search agents..."
            className="pl-9 h-9 text-sm bg-muted/50 border-border/40"
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-0.5">
          {agents.map((agent) => (
            <button
              key={agent.id}
              onClick={() => onSelectAgent(agent)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-colors",
                selectedAgentId === agent.id
                  ? "bg-accent"
                  : "hover:bg-accent/50"
              )}
            >
              <AgentAvatar
                initials={agent.avatar}
                status={agent.status}
                size="sm"
              />

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium truncate">{agent.name}</p>
                  {agent.unreadCount > 0 && (
                    <Badge className="h-5 min-w-5 px-1.5 text-[10px] bg-foreground text-background ml-2">
                      {agent.unreadCount}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {agent.role}
                </p>
              </div>
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
