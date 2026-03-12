"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "reactflow";
import { Type } from "lucide-react";

interface TypographyData {
  label: string;
  heading: { family: string; weight: string; sample: string };
  body: { family: string; weight: string; sample: string };
}

function TypographyCardComponent({ data }: NodeProps<TypographyData>) {
  return (
    <div className="w-[280px] rounded-xl border border-border/60 bg-card/90 backdrop-blur-sm shadow-lg overflow-hidden">
      <Handle type="target" position={Position.Left} className="!bg-border" />
      <Handle type="source" position={Position.Right} className="!bg-border" />

      <div className="px-4 py-3 border-b border-border/40 flex items-center gap-2">
        <Type className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="text-xs font-medium truncate">{data.label}</span>
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
