"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "reactflow";
import { StickyNote } from "lucide-react";

interface NoteData {
  label: string;
  content: string;
  color: string;
}

function NoteCardComponent({ data }: NodeProps<NoteData>) {
  return (
    <div className="w-[240px] rounded-xl border border-border/60 shadow-lg overflow-hidden">
      <Handle type="target" position={Position.Left} className="!bg-border" />
      <Handle type="source" position={Position.Right} className="!bg-border" />

      <div
        className="px-4 py-3 border-b flex items-center gap-2"
        style={{
          backgroundColor: data.color + "20",
          borderColor: data.color + "30",
        }}
      >
        <StickyNote className="w-3.5 h-3.5" style={{ color: data.color }} />
        <span className="text-xs font-medium truncate">{data.label}</span>
      </div>

      <div
        className="p-4"
        style={{ backgroundColor: data.color + "08" }}
      >
        <p className="text-xs leading-relaxed text-foreground/80 whitespace-pre-line">
          {data.content}
        </p>
      </div>
    </div>
  );
}

export const NoteCard = memo(NoteCardComponent);
