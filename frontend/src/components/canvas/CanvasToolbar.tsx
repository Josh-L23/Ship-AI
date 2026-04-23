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
  FileDown,
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
import { downloadBrandGuidelines } from "@/lib/api";

interface CanvasToolbarProps {
  zoom: number;
  showMinimap: boolean;
  projectId: string;
  onToggleMinimap: () => void;
  onZoomOut: () => void;
  onZoomIn: () => void;
  onFitView: () => void;
  onAddNote: () => void;
  onAddImage: () => void;
  onUploadAsset: () => void;
}

export function CanvasToolbar({
  zoom,
  showMinimap,
  projectId,
  onToggleMinimap,
  onZoomOut,
  onZoomIn,
  onFitView,
  onAddNote,
  onAddImage,
  onUploadAsset,
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
          <DropdownMenuItem onClick={onAddNote}>
            <StickyNote className="w-4 h-4 mr-2" />
            Add Note
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onAddImage}>
            <ImageIcon className="w-4 h-4 mr-2" />
            Add Image
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onUploadAsset}>
            <Upload className="w-4 h-4 mr-2" />
            Upload Asset
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="w-px h-5 bg-border/60 mx-1" />

      <Tooltip>
        <TooltipTrigger
          onClick={() => downloadBrandGuidelines(projectId)}
          className="p-2 rounded-lg hover:bg-accent/50 transition-colors text-muted-foreground hover:text-foreground"
        >
          <FileDown className="w-4 h-4" />
        </TooltipTrigger>
        <TooltipContent side="top">Download Brand Guidelines PDF</TooltipContent>
      </Tooltip>
    </div>
  );
}
