"use client";

import { Bell, Search, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { projects } from "@/lib/dummy-data";

interface TopbarProps {
  pageTitle: string;
  breadcrumb?: string;
}

export function Topbar({ pageTitle, breadcrumb }: TopbarProps) {
  const activeProject = projects[0];

  return (
    <header className="h-14 border-b border-border/50 bg-background/80 backdrop-blur-xl flex items-center justify-between px-4 md:px-6 shrink-0 z-20">
      <div className="flex items-center gap-2 min-w-0">
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
            <span className="truncate max-w-[120px]">
              {activeProject.name}
            </span>
            <ChevronDown className="w-3 h-3 shrink-0" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {projects.map((project) => (
              <DropdownMenuItem key={project.id}>
                <span className="mr-2">{project.thumbnail}</span>
                {project.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {breadcrumb && (
          <>
            <span className="text-muted-foreground/50 text-xs">/</span>
            <span className="text-xs text-muted-foreground">{breadcrumb}</span>
          </>
        )}

        <span className="text-muted-foreground/50 text-xs hidden sm:inline">
          /
        </span>
        <h1 className="text-sm font-medium truncate hidden sm:inline">
          {pageTitle}
        </h1>
      </div>

      <div className="flex items-center gap-1">
        <button className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors">
          <Search className="w-4 h-4" />
        </button>

        <button className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors relative">
          <Bell className="w-4 h-4" />
          <Badge className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 text-[10px] flex items-center justify-center bg-foreground text-background border-2 border-background">
            3
          </Badge>
        </button>
      </div>
    </header>
  );
}
