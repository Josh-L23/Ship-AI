"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "reactflow";
import { BookOpen, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface BrandGuidelinesData {
  label: string;
  brandName: string;
  tagline: string;
  industry: string;
  targetAudience: string;
  voiceDescriptors: string[];
  onUpdate?: (patch: { title?: string; data?: Record<string, unknown> }) => void;
  onDelete?: () => void;
}

function BrandGuidelinesCardComponent({
  data,
  selected,
}: NodeProps<BrandGuidelinesData>) {
  return (
    <div
      className={`w-[320px] rounded-xl border border-border/60 bg-card/90 backdrop-blur-sm shadow-lg overflow-hidden transition-shadow ${
        selected ? "ring-2 ring-foreground/20 shadow-xl" : ""
      }`}
    >
      <Handle type="target" position={Position.Left} className="!bg-border" />
      <Handle type="source" position={Position.Right} className="!bg-border" />

      <div className="px-4 py-3 border-b border-border/40 flex items-center gap-2 group/header">
        <BookOpen className="w-3.5 h-3.5 text-muted-foreground" />
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

      <div className="p-4 space-y-3">
        <div>
          <p className="text-lg font-bold tracking-tight">{data.brandName}</p>
          <p className="text-sm text-muted-foreground italic">
            &ldquo;{data.tagline}&rdquo;
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <p className="text-muted-foreground text-[10px] uppercase tracking-wider">
              Industry
            </p>
            <p className="font-medium mt-0.5">{data.industry}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-[10px] uppercase tracking-wider">
              Audience
            </p>
            <p className="font-medium mt-0.5">{data.targetAudience}</p>
          </div>
        </div>

        <div>
          <p className="text-muted-foreground text-[10px] uppercase tracking-wider mb-1.5">
            Brand Voice
          </p>
          <div className="flex flex-wrap gap-1.5">
            {data.voiceDescriptors.map((v: string) => (
              <Badge
                key={v}
                variant="secondary"
                className="text-[10px] px-2 py-0.5"
              >
                {v}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export const BrandGuidelinesCard = memo(BrandGuidelinesCardComponent);
