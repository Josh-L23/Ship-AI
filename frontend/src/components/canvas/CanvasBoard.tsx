"use client";

import { useCallback, useMemo, useState, useRef } from "react";
import ReactFlow, {
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
  type ReactFlowInstance,
  type Node,
  type NodeTypes,
  type NodeChange,
} from "reactflow";
import "reactflow/dist/style.css";

import {
  useCanvasStoreProvider,
  CanvasStoreProvider,
  type CanvasStore,
} from "@/hooks/useCanvasStore";
import type { CanvasAsset } from "@/lib/dummy-data";
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

function assetToNode(asset: CanvasAsset, store: CanvasStore): Node {
  const baseData = {
    label: asset.title,
    assetId: asset.id,
    onUpdate: (patch: Partial<Pick<CanvasAsset, "title" | "data">>) =>
      store.updateNode(asset.id, patch),
    onDelete: () => store.deleteNode(asset.id),
  };

  switch (asset.type) {
    case "color_palette":
      return {
        id: asset.id,
        type: "color_palette",
        position: asset.position,
        data: { ...baseData, colors: asset.data.colors },
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
        data: { ...baseData, content: asset.data.content, color: asset.data.color },
      };
    case "typography":
      return {
        id: asset.id,
        type: "typography",
        position: asset.position,
        data: { ...baseData, heading: asset.data.heading, body: asset.data.body },
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

function CanvasBoardInner() {
  const store = useCanvasStoreProvider();

  const initialNodes = useMemo(
    () => store.assets.map((a) => assetToNode(a, store)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [store.assets]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState([]);
  const [zoom, setZoom] = useState(1);
  const [showMinimap, setShowMinimap] = useState(true);
  const [flowInstance, setFlowInstance] = useState<ReactFlowInstance | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Keep nodes in sync when store.assets changes (add/delete/update)
  useMemo(() => {
    setNodes(store.assets.map((a) => assetToNode(a, store)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.assets]);

  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      onNodesChange(changes);

      // Persist position changes on drag end
      for (const change of changes) {
        if (change.type === "position" && change.dragging === false && change.position) {
          store.updateNodePosition(change.id, change.position);
        }
      }
    },
    [onNodesChange, store]
  );

  const onMoveEnd = useCallback(
    (_: unknown, viewport: { zoom: number }) => {
      setZoom(viewport.zoom);
    },
    []
  );

  const handleAddNote = useCallback(() => {
    const center = flowInstance
      ? flowInstance.project({
          x: window.innerWidth / 2,
          y: window.innerHeight / 2,
        })
      : undefined;
    store.addNode("note", undefined, undefined, center);
  }, [store, flowInstance]);

  const handleAddImage = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = "image/*";
      fileInputRef.current.click();
    }
  }, []);

  const handleUploadAsset = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = "image/*,video/*,audio/*";
      fileInputRef.current.click();
    }
  }, []);

  const handleFileSelected = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const objectUrl = URL.createObjectURL(file);
      const center = flowInstance
        ? flowInstance.project({
            x: window.innerWidth / 2,
            y: window.innerHeight / 2,
          })
        : undefined;

      if (file.type.startsWith("image/")) {
        const img = new window.Image();
        img.onload = () => {
          store.addNode(
            "image",
            {
              src: objectUrl,
              generatedAt: new Date().toISOString(),
              iteration: 1,
              dimensions: `${img.naturalWidth} × ${img.naturalHeight}`,
            },
            file.name,
            center
          );
        };
        img.src = objectUrl;
      } else if (file.type.startsWith("audio/")) {
        store.addNode(
          "media",
          { mediaType: "audio", duration: "—", format: file.type.split("/")[1]?.toUpperCase() || "Audio", src: objectUrl },
          file.name,
          center
        );
      } else if (file.type.startsWith("video/")) {
        store.addNode(
          "media",
          { mediaType: "video", duration: "—", format: file.type.split("/")[1]?.toUpperCase() || "Video", src: objectUrl },
          file.name,
          center
        );
      }

      // Reset input
      e.target.value = "";
    },
    [store, flowInstance]
  );

  return (
    <CanvasStoreProvider value={store}>
      <div className="relative w-full h-full">
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileSelected}
        />

        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={handleNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          onMoveEnd={onMoveEnd}
          onInit={setFlowInstance}
          fitView
          fitViewOptions={{ padding: 0.15 }}
          minZoom={0.1}
          maxZoom={2}
          deleteKeyCode={["Backspace", "Delete"]}
          onNodesDelete={(deleted) => {
            deleted.forEach((n) => store.deleteNode(n.id));
          }}
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
          onAddNote={handleAddNote}
          onAddImage={handleAddImage}
          onUploadAsset={handleUploadAsset}
        />
      </div>
    </CanvasStoreProvider>
  );
}

export function CanvasBoard() {
  return <CanvasBoardInner />;
}
