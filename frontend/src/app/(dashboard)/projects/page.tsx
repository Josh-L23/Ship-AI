"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Topbar } from "@/components/layout/Topbar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createProject, fetchProjects } from "@/lib/api";
import type { Project } from "@/lib/types";
import { Plus, Clock, Users } from "lucide-react";

const statusVariant: Record<string, "default" | "secondary" | "outline"> = {
  in_progress: "default",
  completed: "secondary",
  draft: "outline",
};

const statusLabel: Record<string, string> = {
  in_progress: "In Progress",
  completed: "Completed",
  draft: "Draft",
};

const EMOJIS = ["🎨", "🚀", "💎", "🌿", "⚡", "🏔️", "🌊", "🔥", "✨", "💡"];

export default function ProjectsPage() {
  const [projectsList, setProjectsList] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");

  useEffect(() => {
    let active = true;
    fetchProjects()
      .then((rows) => {
        if (!active) return;
        setProjectsList(rows);
      })
      .catch(() => {
        if (!active) return;
        setProjectsList([]);
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const handleCreateProject = async () => {
    if (!newName.trim()) return;

    try {
      const created = await createProject({
        name: newName.trim(),
        description: newDesc.trim() || "A new brand identity project",
      });
      created.thumbnail = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
      setProjectsList((prev) => [created, ...prev]);
      setNewName("");
      setNewDesc("");
      setDialogOpen(false);
    } catch {
      // no-op for now; page keeps existing state
    }
  };

  return (
    <>
      <Topbar pageTitle="Projects" />
      <ScrollArea className="flex-1">
        <div className="p-4 md:p-8 max-w-6xl">
          <div className="mb-6">
            <h2 className="text-xl font-semibold tracking-tight">Projects</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Your brand identity projects
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* New project card */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger
                className="group flex flex-col items-center justify-center min-h-[220px] rounded-xl border-2 border-dashed border-border/50 hover:border-border transition-colors bg-card/30 hover:bg-card/50"
              >
                  <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center group-hover:bg-accent transition-colors">
                    <Plus className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium mt-3">New Project</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Start a brand identity
                  </p>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create new project</DialogTitle>
                  <DialogDescription>
                    Start a new brand identity project. You can always update
                    these details later.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label className="text-sm">Project name</Label>
                    <Input
                      placeholder="e.g. TERRENE, Luminary Labs..."
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleCreateProject();
                      }}
                      autoFocus
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Description (optional)</Label>
                    <Textarea
                      placeholder="Brief description of the brand..."
                      value={newDesc}
                      onChange={(e) => setNewDesc(e.target.value)}
                      className="min-h-[80px] resize-none"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateProject}
                    disabled={!newName.trim()}
                  >
                    Create project
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Project cards */}
            {projectsList.map((project) => {
              const updated = new Date(project.updatedAt);
              const timeAgo = getTimeAgo(updated);

              return (
                <Link
                  key={project.id}
                  href={`/canvas?projectId=${project.id}`}
                  className="group rounded-xl border border-border/50 bg-card/50 hover:bg-card/80 hover:border-border/80 transition-all duration-200 overflow-hidden"
                >
                  <div className="h-28 bg-gradient-to-br from-muted/80 to-muted flex items-center justify-center text-4xl">
                    {project.thumbnail}
                  </div>

                  <div className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="text-sm font-medium truncate group-hover:text-foreground transition-colors">
                          {project.name}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
                          {project.description}
                        </p>
                      </div>
                      <Badge
                        variant={statusVariant[project.status]}
                        className="text-[10px] shrink-0"
                      >
                        {statusLabel[project.status]}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {timeAgo}
                      </span>
                      {project.agentActivity > 0 && (
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {project.agentActivity} agents active
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
            {!loading && projectsList.length === 0 && (
              <div className="col-span-full rounded-xl border border-border/50 bg-card/30 p-6 text-sm text-muted-foreground">
                No projects yet. Create your first project to start generating assets.
              </div>
            )}
          </div>
        </div>
      </ScrollArea>
    </>
  );
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 30) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}
