"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "reactflow";
import { Image as ImageIcon, Clock, Layers } from "lucide-react";

interface ImageData {
  label: string;
  src: string;
  generatedAt: string;
  iteration: number;
  dimensions: string;
}

function ImageCardComponent({ data }: NodeProps<ImageData>) {
  const date = new Date(data.generatedAt);
  const timeStr = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <div className="w-[260px] rounded-xl border border-border/60 bg-card/90 backdrop-blur-sm shadow-lg overflow-hidden">
      <Handle type="target" position={Position.Left} className="!bg-border" />
      <Handle type="source" position={Position.Right} className="!bg-border" />

      <div className="px-4 py-3 border-b border-border/40 flex items-center gap-2">
        <ImageIcon className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="text-xs font-medium truncate">{data.label}</span>
      </div>

      <div className="aspect-square bg-muted/50 flex items-center justify-center relative">
        <div className="w-full h-full bg-gradient-to-br from-muted/80 to-muted flex items-center justify-center">
          <ImageIcon className="w-12 h-12 text-muted-foreground/30" />
        </div>
      </div>

      <div className="px-4 py-2.5 flex items-center justify-between text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {timeStr}
        </span>
        <span className="flex items-center gap-1">
          <Layers className="w-3 h-3" />
          v{data.iteration}
        </span>
        <span>{data.dimensions}</span>
      </div>
    </div>
  );
}

export const ImageCard = memo(ImageCardComponent);
