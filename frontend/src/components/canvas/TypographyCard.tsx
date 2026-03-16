"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "reactflow";
import { Type, X } from "lucide-react";

interface TypographyData {
  label: string;
  heading: { family: string; weight: string; sample: string };
  body: { family: string; weight: string; sample: string };
  onUpdate?: (patch: { title?: string; data?: Record<string, unknown> }) => void;
  onDelete?: () => void;
}

function TypographyCardComponent({ data, selected }: NodeProps<TypographyData>) {
  return (
    <div
      className={`w-[280px] rounded-xl border border-border/60 bg-card/90 backdrop-blur-sm shadow-lg overflow-hidden transition-shadow ${
        selected ? "ring-2 ring-foreground/20 shadow-xl" : ""
      }`}
    >
      <Handle type="target" position={Position.Left} className="!bg-border" />
      <Handle type="source" position={Position.Right} className="!bg-border" />

      <div className="px-4 py-3 border-b border-border/40 flex items-center gap-2 group/header">
        <Type className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="text-xs font-medium truncate flex-1">{data.label}</span>
        {data.onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              data.onDelete?.();
            }}
            className="opacity-0 group-hover/header:opacity-100 p-0.5 rounded hover:bg-accent/50 transition-opacity"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      <div className="p-4 space-y-4">
        <div className="space-y-1.5">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Heading — {data.heading.family}
          </p>
          <p className="text-2xl font-bold tracking-tight">
            {data.heading.sample}
          </p>
        </div>

        <div className="h-px bg-border/50" />

        <div className="space-y-1.5">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Body — {data.body.family}
          </p>
          <p className="text-xs leading-relaxed text-foreground/70">
            {data.body.sample}
          </p>
        </div>
      </div>
    </div>
  );
}

export const TypographyCard = memo(TypographyCardComponent);
