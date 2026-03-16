"use client";

import { memo, useState } from "react";
import { Handle, Position, type NodeProps } from "reactflow";
import { Image as ImageIcon, Clock, Layers, X, Maximize2, Minimize2 } from "lucide-react";

interface ImageData {
  label: string;
  src: string;
  generatedAt: string;
  iteration: number;
  dimensions: string;
  onUpdate?: (patch: { title?: string; data?: Record<string, unknown> }) => void;
  onDelete?: () => void;
}

function ImageCardComponent({ data, selected }: NodeProps<ImageData>) {
  const [expanded, setExpanded] = useState(false);
  const date = new Date(data.generatedAt);
  const timeStr = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  const hasSrc = data.src && data.src.length > 0;

  return (
    <div
      className={`rounded-xl border border-border/60 bg-card/90 backdrop-blur-sm shadow-lg overflow-hidden transition-all ${
        selected ? "ring-2 ring-foreground/20 shadow-xl" : ""
      } ${expanded ? "w-[500px]" : "w-[260px]"}`}
    >
      <Handle type="target" position={Position.Left} className="!bg-border" />
      <Handle type="source" position={Position.Right} className="!bg-border" />

      <div className="px-4 py-3 border-b border-border/40 flex items-center gap-2 group/header">
        <ImageIcon className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="text-xs font-medium truncate flex-1">{data.label}</span>
        <button
          onClick={() => setExpanded(!expanded)}
          className="opacity-0 group-hover/header:opacity-100 p-0.5 rounded hover:bg-accent/50 transition-opacity"
        >
          {expanded ? (
            <Minimize2 className="w-3 h-3 text-muted-foreground" />
          ) : (
            <Maximize2 className="w-3 h-3 text-muted-foreground" />
          )}
        </button>
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

      <div className="aspect-square bg-muted/50 flex items-center justify-center relative overflow-hidden">
        {hasSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={data.src}
            alt={data.label}
            className="w-full h-full object-cover"
            draggable={false}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-muted/80 to-muted flex items-center justify-center">
            <ImageIcon className="w-12 h-12 text-muted-foreground/30" />
          </div>
        )}
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
