"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "reactflow";
import { Play, Music, FileVideo } from "lucide-react";

interface MediaData {
  label: string;
  mediaType: "audio" | "video";
  duration: string;
  format: string;
}

function MediaCardComponent({ data }: NodeProps<MediaData>) {
  const Icon = data.mediaType === "audio" ? Music : FileVideo;

  return (
    <div className="w-[260px] rounded-xl border border-border/60 bg-card/90 backdrop-blur-sm shadow-lg overflow-hidden">
      <Handle type="target" position={Position.Left} className="!bg-border" />
      <Handle type="source" position={Position.Right} className="!bg-border" />

      <div className="px-4 py-3 border-b border-border/40 flex items-center gap-2">
        <Icon className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="text-xs font-medium truncate">{data.label}</span>
      </div>

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

      <div className="px-4 py-2 border-t border-border/40 text-[10px] text-muted-foreground text-center">
        {data.format} &middot; {data.duration}
      </div>
    </div>
  );
}

export const MediaCard = memo(MediaCardComponent);
