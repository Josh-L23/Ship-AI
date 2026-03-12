"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "reactflow";
import { BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface BrandGuidelinesData {
  label: string;
  brandName: string;
  tagline: string;
  industry: string;
  targetAudience: string;
  voiceDescriptors: string[];
}

function BrandGuidelinesCardComponent({
  data,
}: NodeProps<BrandGuidelinesData>) {
  return (
    <div className="w-[320px] rounded-xl border border-border/60 bg-card/90 backdrop-blur-sm shadow-lg overflow-hidden">
      <Handle type="target" position={Position.Left} className="!bg-border" />
      <Handle type="source" position={Position.Right} className="!bg-border" />

      <div className="px-4 py-3 border-b border-border/40 flex items-center gap-2">
        <BookOpen className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="text-xs font-medium truncate">{data.label}</span>
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
