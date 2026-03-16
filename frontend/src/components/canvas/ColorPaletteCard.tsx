"use client";

import { memo, useState, useCallback } from "react";
import { Handle, Position, type NodeProps } from "reactflow";
import { Palette, X, Plus } from "lucide-react";

interface ColorItem {
  hex: string;
  name: string;
}

interface ColorPaletteData {
  label: string;
  colors: ColorItem[];
  onUpdate?: (patch: { title?: string; data?: Record<string, unknown> }) => void;
  onDelete?: () => void;
}

function ColorPaletteCardComponent({ data, selected }: NodeProps<ColorPaletteData>) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editHex, setEditHex] = useState("");
  const [editName, setEditName] = useState("");

  const commitColorEdit = useCallback(
    (index: number) => {
      if (!data.onUpdate) return;
      const newColors = [...data.colors];
      newColors[index] = { hex: editHex, name: editName };
      data.onUpdate({ data: { colors: newColors } });
      setEditingIndex(null);
    },
    [data, editHex, editName]
  );

  const addColor = useCallback(() => {
    if (!data.onUpdate) return;
    const newColors = [...data.colors, { hex: "#888888", name: "New Color" }];
    data.onUpdate({ data: { colors: newColors } });
  }, [data]);

  const removeColor = useCallback(
    (index: number) => {
      if (!data.onUpdate) return;
      const newColors = data.colors.filter((_, i) => i !== index);
      data.onUpdate({ data: { colors: newColors } });
    },
    [data]
  );

  return (
    <div
      className={`w-[300px] rounded-xl border border-border/60 bg-card/90 backdrop-blur-sm shadow-lg overflow-hidden transition-shadow ${
        selected ? "ring-2 ring-foreground/20 shadow-xl" : ""
      }`}
    >
      <Handle type="target" position={Position.Left} className="!bg-border" />
      <Handle type="source" position={Position.Right} className="!bg-border" />

      <div className="px-4 py-3 border-b border-border/40 flex items-center gap-2 group/header">
        <Palette className="w-3.5 h-3.5 text-muted-foreground" />
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

      <div className="p-4 space-y-2.5">
        {data.colors.map((color: ColorItem, i: number) => (
          <div key={i} className="flex items-center gap-3 group/swatch">
            {editingIndex === i ? (
              <>
                <input
                  type="color"
                  value={editHex}
                  onChange={(e) => setEditHex(e.target.value)}
                  className="w-8 h-8 rounded-lg border border-white/10 shrink-0 cursor-pointer p-0"
                />
                <div className="min-w-0 flex-1 space-y-1">
                  <input
                    className="text-xs font-medium bg-transparent outline-none border-b border-border/60 w-full"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") commitColorEdit(i);
                      if (e.key === "Escape") setEditingIndex(null);
                    }}
                    placeholder="Color name"
                    autoFocus
                  />
                  <input
                    className="text-[10px] text-muted-foreground font-mono bg-transparent outline-none border-b border-border/40 w-full"
                    value={editHex}
                    onChange={(e) => setEditHex(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") commitColorEdit(i);
                    }}
                  />
                </div>
                <button
                  onClick={() => commitColorEdit(i)}
                  className="text-[10px] text-foreground/60 hover:text-foreground px-1"
                >
                  ✓
                </button>
              </>
            ) : (
              <>
                <div
                  className="w-8 h-8 rounded-lg border border-white/10 shrink-0 cursor-pointer hover:ring-2 hover:ring-foreground/20 transition-shadow"
                  style={{ backgroundColor: color.hex }}
                  onDoubleClick={() => {
                    setEditingIndex(i);
                    setEditHex(color.hex);
                    setEditName(color.name);
                  }}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium truncate">{color.name}</p>
                  <p className="text-[10px] text-muted-foreground font-mono">
                    {color.hex}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeColor(i);
                  }}
                  className="opacity-0 group-hover/swatch:opacity-100 p-0.5 rounded hover:bg-accent/50 transition-opacity"
                >
                  <X className="w-3 h-3 text-muted-foreground" />
                </button>
              </>
            )}
          </div>
        ))}

        <button
          onClick={addColor}
          className="flex items-center gap-1.5 text-[10px] text-muted-foreground hover:text-foreground pt-1 transition-colors"
        >
          <Plus className="w-3 h-3" />
          Add color
        </button>
      </div>
    </div>
  );
}

export const ColorPaletteCard = memo(ColorPaletteCardComponent);
