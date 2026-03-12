"use client";
import {
  ZoomIn,
  ZoomOut,
  Maximize,
  Plus,
  StickyNote,
  ImageIcon,
  Upload,
  Map,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CanvasToolbarProps {
  zoom: number;
  showMinimap: boolean;
  onToggleMinimap: () => void;
  onZoomOut: () => void;
  onZoomIn: () => void;
  onFitView: () => void;
}

export function CanvasToolbar({
  zoom,
  showMinimap,
  onToggleMinimap,
  onZoomOut,
  onZoomIn,
  onFitView,
}: CanvasToolbarProps) {
  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1 px-2 py-1.5 rounded-xl border border-border/60 bg-card/90 backdrop-blur-xl shadow-lg">
      <Tooltip>
        <TooltipTrigger
          onClick={onZoomOut}
          className="p-2 rounded-lg hover:bg-accent/50 transition-colors text-muted-foreground hover:text-foreground"
        >
          <ZoomOut className="w-4 h-4" />
        </TooltipTrigger>
        <TooltipContent side="top">Zoom out</TooltipContent>
      </Tooltip>

      <span className="text-xs font-mono text-muted-foreground w-12 text-center tabular-nums">
        {Math.round(zoom * 100)}%
      </span>

      <Tooltip>
        <TooltipTrigger
          onClick={onZoomIn}
          className="p-2 rounded-lg hover:bg-accent/50 transition-colors text-muted-foreground hover:text-foreground"
        >
          <ZoomIn className="w-4 h-4" />
        </TooltipTrigger>
        <TooltipContent side="top">Zoom in</TooltipContent>
      </Tooltip>

      <div className="w-px h-5 bg-border/60 mx-1" />

      <Tooltip>
        <TooltipTrigger
          onClick={onFitView}
          className="p-2 rounded-lg hover:bg-accent/50 transition-colors text-muted-foreground hover:text-foreground"
        >
          <Maximize className="w-4 h-4" />
        </TooltipTrigger>
        <TooltipContent side="top">Fit to view</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger
          onClick={onToggleMinimap}
          className={`p-2 rounded-lg transition-colors ${
            showMinimap
              ? "bg-accent text-foreground"
              : "hover:bg-accent/50 text-muted-foreground hover:text-foreground"
          }`}
        >
          <Map className="w-4 h-4" />
        </TooltipTrigger>
        <TooltipContent side="top">Toggle minimap</TooltipContent>
      </Tooltip>

      <div className="w-px h-5 bg-border/60 mx-1" />

      <DropdownMenu>
        <DropdownMenuTrigger className="p-2 rounded-lg hover:bg-accent/50 transition-colors text-muted-foreground hover:text-foreground">
          <Plus className="w-4 h-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent side="top" align="center">
          <DropdownMenuItem>
            <StickyNote className="w-4 h-4 mr-2" />
            Add Note
          </DropdownMenuItem>
          <DropdownMenuItem>
            <ImageIcon className="w-4 h-4 mr-2" />
            Add Image
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Upload className="w-4 h-4 mr-2" />
            Upload Asset
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
