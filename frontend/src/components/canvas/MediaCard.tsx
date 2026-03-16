"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "reactflow";
import { Play, Music, FileVideo, X } from "lucide-react";

interface MediaData {
  label: string;
  mediaType: "audio" | "video";
  duration: string;
  format: string;
  src?: string;
  onUpdate?: (patch: { title?: string; data?: Record<string, unknown> }) => void;
  onDelete?: () => void;
}

function MediaCardComponent({ data, selected }: NodeProps<MediaData>) {
  const Icon = data.mediaType === "audio" ? Music : FileVideo;

  return (
    <div
      className={`w-[260px] rounded-xl border border-border/60 bg-card/90 backdrop-blur-sm shadow-lg overflow-hidden transition-shadow ${
        selected ? "ring-2 ring-foreground/20 shadow-xl" : ""
      }`}
    >
      <Handle type="target" position={Position.Left} className="!bg-border" />
      <Handle type="source" position={Position.Right} className="!bg-border" />

      <div className="px-4 py-3 border-b border-border/40 flex items-center gap-2 group/header">
        <Icon className="w-3.5 h-3.5 text-muted-foreground" />
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

      {data.src ? (
        <div className="p-4">
          {data.mediaType === "audio" ? (
            <audio controls className="w-full h-10" src={data.src} preload="metadata">
              Your browser does not support the audio element.
            </audio>
          ) : (
            <video controls className="w-full rounded" src={data.src} preload="metadata">
              Your browser does not support the video element.
            </video>
          )}
        </div>
      ) : (
        <div className="p-6 flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
            <Play className="w-6 h-6 text-muted-foreground ml-0.5" />
          </div>

          <div className="w-full bg-muted rounded-full h-1.5">
            <div className="bg-foreground/30 h-1.5 rounded-full w-1/3" />
          </div>

          <div className="flex items-center justify-between w-full text-[10px] text-muted-foreground">
            <span>0:00</span>
            <span>{data.duration}</span>
          </div>
        </div>
      )}

      <div className="px-4 py-2 border-t border-border/40 text-[10px] text-muted-foreground text-center">
        {data.format} &middot; {data.duration}
      </div>
    </div>
  );
}

export const MediaCard = memo(MediaCardComponent);
