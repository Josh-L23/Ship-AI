"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { AgentStatus } from "@/lib/dummy-data";

const statusColors: Record<AgentStatus, string> = {
  online: "bg-emerald-500",
  busy: "bg-amber-500",
  offline: "bg-gray-400",
};

interface AgentAvatarProps {
  initials: string;
  status: AgentStatus;
  size?: "sm" | "md" | "lg";
}

export function AgentAvatar({
  initials,
  status,
  size = "md",
}: AgentAvatarProps) {
  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
  };

  const dotSizes = {
    sm: "w-2.5 h-2.5 -bottom-0 -right-0",
    md: "w-3 h-3 -bottom-0.5 -right-0.5",
    lg: "w-3.5 h-3.5 -bottom-0.5 -right-0.5",
  };

  return (
    <div className="relative">
      <Avatar className={cn(sizeClasses[size])}>
        <AvatarFallback className="bg-foreground/10 font-medium">
          {initials}
        </AvatarFallback>
      </Avatar>
      <span
        className={cn(
          "absolute rounded-full border-2 border-card",
          statusColors[status],
          dotSizes[size]
        )}
      />
    </div>
  );
}
