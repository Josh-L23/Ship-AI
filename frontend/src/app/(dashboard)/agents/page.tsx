"use client";

import { useState } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { AgentSelector } from "@/components/chat/AgentSelector";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { agents, type Agent } from "@/lib/dummy-data";
import { MessageSquare } from "lucide-react";

export default function AgentsPage() {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(agents[0]);

  return (
    <>
      <Topbar pageTitle="Agents" breadcrumb="TERRENE" />
      <div className="flex-1 flex overflow-hidden">
        {/* Agent list — hidden on mobile when a chat is selected */}
        <div className="hidden md:block w-[280px] shrink-0">
          <AgentSelector
            selectedAgentId={selectedAgent?.id ?? null}
            onSelectAgent={setSelectedAgent}
          />
        </div>

        {/* Mobile agent list */}
        <div className={`md:hidden w-full ${selectedAgent ? "hidden" : ""}`}>
          <AgentSelector
            selectedAgentId={null}
            onSelectAgent={setSelectedAgent}
          />
        </div>

        {/* Chat window */}
        {selectedAgent ? (
          <div className="flex-1 flex flex-col">
            {/* Mobile back button */}
            <button
              onClick={() => setSelectedAgent(null)}
              className="md:hidden px-4 py-2 text-xs text-muted-foreground hover:text-foreground border-b border-border/50"
            >
              &larr; Back to agents
            </button>
            <div className="flex-1 overflow-hidden">
              <ChatWindow agent={selectedAgent} />
            </div>
          </div>
        ) : (
          <div className="hidden md:flex flex-1 items-center justify-center">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto">
                <MessageSquare className="w-7 h-7 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium">Select an agent</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Choose an agent from the sidebar to start a conversation
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
