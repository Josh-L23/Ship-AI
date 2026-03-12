"use client";

import { useCallback, useMemo, useState } from "react";
import ReactFlow, {
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
  type ReactFlowInstance,
  type Node,
  type NodeTypes,
} from "reactflow";
import "reactflow/dist/style.css";

import { canvasAssets, type CanvasAsset } from "@/lib/dummy-data";
import { ColorPaletteCard } from "./ColorPaletteCard";
import { ImageCard } from "./ImageCard";
import { NoteCard } from "./NoteCard";
import { TypographyCard } from "./TypographyCard";
import { BrandGuidelinesCard } from "./BrandGuidelinesCard";
import { MediaCard } from "./MediaCard";
import { CanvasToolbar } from "./CanvasToolbar";

const nodeTypes: NodeTypes = {
  color_palette: ColorPaletteCard,
  image: ImageCard,
  note: NoteCard,
  typography: TypographyCard,
  brand_guidelines: BrandGuidelinesCard,
  media: MediaCard,
};

function assetToNode(asset: CanvasAsset): Node {
  const baseData = { label: asset.title };

  switch (asset.type) {
    case "color_palette":
      return {
        id: asset.id,
        type: "color_palette",
        position: asset.position,
        data: {
          ...baseData,
          colors: asset.data.colors,
        },
      };
    case "image":
      return {
        id: asset.id,
        type: "image",
        position: asset.position,
        data: {
          ...baseData,
          src: asset.data.src,
          generatedAt: asset.data.generatedAt,
          iteration: asset.data.iteration,
          dimensions: asset.data.dimensions,
        },
      };
    case "note":
      return {
        id: asset.id,
        type: "note",
        position: asset.position,
        data: {
          ...baseData,
          content: asset.data.content,
          color: asset.data.color,
        },
      };
    case "typography":
      return {
        id: asset.id,
        type: "typography",
        position: asset.position,
        data: {
          ...baseData,
          heading: asset.data.heading,
          body: asset.data.body,
        },
      };
    case "brand_guidelines":
      return {
        id: asset.id,
        type: "brand_guidelines",
        position: asset.position,
        data: {
          ...baseData,
          brandName: asset.data.brandName,
          tagline: asset.data.tagline,
          industry: asset.data.industry,
          targetAudience: asset.data.targetAudience,
          voiceDescriptors: asset.data.voiceDescriptors,
        },
      };
    case "media":
      return {
        id: asset.id,
        type: "media",
        position: asset.position,
        data: {
          ...baseData,
          mediaType: asset.data.mediaType,
          duration: asset.data.duration,
          format: asset.data.format,
        },
      };
    default:
      return {
        id: asset.id,
        type: "default",
        position: asset.position,
        data: baseData,
      };
  }
}

export function CanvasBoard() {
  const initialNodes = useMemo(
    () => canvasAssets.map(assetToNode),
    []
  );

  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState([]);
  const [zoom, setZoom] = useState(1);
  const [showMinimap, setShowMinimap] = useState(true);
  const [flowInstance, setFlowInstance] = useState<ReactFlowInstance | null>(
    null
  );

  const onMoveEnd = useCallback(
    (_: unknown, viewport: { zoom: number }) => {
      setZoom(viewport.zoom);
    },
    []
  );

  return (
    <div className="relative w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        onMoveEnd={onMoveEnd}
        onInit={setFlowInstance}
        fitView
        fitViewOptions={{ padding: 0.15 }}
        minZoom={0.1}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
        className="bg-background"
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="hsl(var(--muted-foreground) / 0.15)"
        />
        {showMinimap && (
          <MiniMap
            nodeColor="hsl(var(--muted-foreground) / 0.3)"
            maskColor="hsl(var(--background) / 0.8)"
            className="!bg-card/80 !border-border/50 rounded-lg"
          />
        )}
      </ReactFlow>

      <CanvasToolbar
        zoom={zoom}
        showMinimap={showMinimap}
        onToggleMinimap={() => setShowMinimap(!showMinimap)}
        onZoomOut={() => flowInstance?.zoomOut({ duration: 200 })}
        onZoomIn={() => flowInstance?.zoomIn({ duration: 200 })}
        onFitView={() => flowInstance?.fitView({ duration: 300, padding: 0.2 })}
      />
    </div>
  );
}
