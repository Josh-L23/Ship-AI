"use client";

import { memo, useState, useCallback } from "react";
import { Handle, Position, type NodeProps } from "reactflow";
import { StickyNote, X } from "lucide-react";

interface NoteData {
  label: string;
  content: string;
  color: string;
  onUpdate?: (patch: { title?: string; data?: Record<string, unknown> }) => void;
  onDelete?: () => void;
}

function NoteCardComponent({ data, selected }: NodeProps<NoteData>) {
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingContent, setEditingContent] = useState(false);
  const [title, setTitle] = useState(data.label);
  const [content, setContent] = useState(data.content);

  const commitTitle = useCallback(() => {
    setEditingTitle(false);
    if (title !== data.label && data.onUpdate) {
      data.onUpdate({ title });
    }
  }, [title, data]);

  const commitContent = useCallback(() => {
    setEditingContent(false);
    if (content !== data.content && data.onUpdate) {
      data.onUpdate({ data: { content } });
    }
  }, [content, data]);

  return (
    <div
      className={`w-[240px] rounded-xl border shadow-lg overflow-hidden transition-shadow ${
        selected ? "ring-2 ring-foreground/20 shadow-xl" : ""
      }`}
      style={{ borderColor: data.color + "40" }}
    >
      <Handle type="target" position={Position.Left} className="!bg-border" />
      <Handle type="source" position={Position.Right} className="!bg-border" />

      <div
        className="px-4 py-3 border-b flex items-center gap-2 group/header"
        style={{
          backgroundColor: data.color + "20",
          borderColor: data.color + "30",
        }}
      >
        <StickyNote className="w-3.5 h-3.5 shrink-0" style={{ color: data.color }} />
        {editingTitle ? (
          <input
            className="text-xs font-medium bg-transparent outline-none border-b border-current flex-1 min-w-0"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={commitTitle}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitTitle();
              if (e.key === "Escape") {
                setTitle(data.label);
                setEditingTitle(false);
              }
            }}
            autoFocus
          />
        ) : (
          <span
            className="text-xs font-medium truncate cursor-text flex-1"
            onDoubleClick={() => setEditingTitle(true)}
          >
            {data.label}
          </span>
        )}
        {data.onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              data.onDelete?.();
            }}
            className="opacity-0 group-hover/header:opacity-100 p-0.5 rounded hover:bg-black/10 transition-opacity"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      <div
        className="p-4 group/content"
        style={{ backgroundColor: data.color + "08" }}
      >
        {editingContent ? (
          <textarea
            className="text-xs leading-relaxed text-foreground/80 bg-transparent outline-none border border-border/40 rounded p-1 w-full min-h-[60px] resize-y"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onBlur={commitContent}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setContent(data.content);
                setEditingContent(false);
              }
            }}
            autoFocus
          />
        ) : (
          <p
            className="text-xs leading-relaxed text-foreground/80 whitespace-pre-line cursor-text"
            onDoubleClick={() => setEditingContent(true)}
          >
            {data.content}
          </p>
        )}
      </div>
    </div>
  );
}

export const NoteCard = memo(NoteCardComponent);
