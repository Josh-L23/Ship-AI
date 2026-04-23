"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Topbar } from "@/components/layout/Topbar";
import { AgentSelector } from "@/components/chat/AgentSelector";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { fetchAgents, fetchProjects } from "@/lib/api";
import type { Agent } from "@/lib/types";
import { MessageSquare } from "lucide-react";

export default function AgentsPage() {
  const searchParams = useSearchParams();
  const projectIdParam = searchParams.get("projectId");
  const [projectId, setProjectId] = useState<string | null>(projectIdParam);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  useEffect(() => {
    if (projectIdParam) {
      setProjectId(projectIdParam);
      return;
    }
    let active = true;
    fetchProjects()
      .then((projects) => {
        if (!active) return;
        if (projects.length > 0) {
          setProjectId(projects[0].id);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [projectIdParam]);

  useEffect(() => {
    let active = true;
    fetchAgents()
      .then((rows) => {
        if (!active) return;
        setAgents(rows);
        setSelectedAgent((current) =>
          current && rows.some((agent) => agent.id === current.id)
            ? current
            : rows[0] ?? null
        );
      })
      .catch(() => {
        if (!active) return;
        setAgents([]);
        setSelectedAgent(null);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <>
      <Topbar pageTitle="Agents" breadcrumb={projectId ?? ""} />
      <div className="flex-1 flex overflow-hidden">
        <div className="hidden md:block w-[280px] shrink-0">
          <AgentSelector
            agents={agents}
            selectedAgentId={selectedAgent?.id ?? null}
            onSelectAgent={setSelectedAgent}
          />
        </div>

        <div className={`md:hidden w-full ${selectedAgent ? "hidden" : ""}`}>
          <AgentSelector
            agents={agents}
            selectedAgentId={null}
            onSelectAgent={setSelectedAgent}
          />
        </div>

        {selectedAgent && projectId ? (
          <div className="flex-1 flex flex-col">
            <button
              onClick={() => setSelectedAgent(null)}
              className="md:hidden px-4 py-2 text-xs text-muted-foreground hover:text-foreground border-b border-border/50"
            >
              &larr; Back to agents
            </button>
            <div className="flex-1 overflow-hidden">
              <ChatWindow
                agent={selectedAgent}
                projectId={projectId}
              />
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
