"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "reactflow";
import { Palette } from "lucide-react";

interface ColorItem {
  hex: string;
  name: string;
}

interface ColorPaletteData {
  label: string;
  colors: ColorItem[];
}

function ColorPaletteCardComponent({ data }: NodeProps<ColorPaletteData>) {
  return (
    <div className="w-[300px] rounded-xl border border-border/60 bg-card/90 backdrop-blur-sm shadow-lg overflow-hidden">
      <Handle type="target" position={Position.Left} className="!bg-border" />
      <Handle type="source" position={Position.Right} className="!bg-border" />

      <div className="px-4 py-3 border-b border-border/40 flex items-center gap-2">
        <Palette className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="text-xs font-medium truncate">{data.label}</span>
      </div>

      <div className="p-4 space-y-2.5">
        {data.colors.map((color: ColorItem, i: number) => (
          <div key={i} className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg border border-white/10 shrink-0"
              style={{ backgroundColor: color.hex }}
            />
            <div className="min-w-0">
              <p className="text-xs font-medium truncate">{color.name}</p>
              <p className="text-[10px] text-muted-foreground font-mono">
                {color.hex}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export const ColorPaletteCard = memo(ColorPaletteCardComponent);
