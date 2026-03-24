"use client";

import { useCallback, useEffect, useMemo, useState, useRef } from "react";
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
import { canvasAssetsFromSpec, fetchBrandSpec, saveBrandSpec } from "@/lib/api";
import type { CanvasAsset } from "@/lib/types";
import { canvasEvents } from "@/lib/canvas-events";
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

interface CanvasBoardInnerProps {
  projectId: string;
}

function CanvasBoardInner({ projectId }: CanvasBoardInnerProps) {
  const [initialAssets, setInitialAssets] = useState<CanvasAsset[]>([]);
  const [assetsReady, setAssetsReady] = useState(false);
  const store = useCanvasStoreProvider(initialAssets);
  const storeRef = useRef(store);
  storeRef.current = store;

  useEffect(() => {
    let active = true;
    setAssetsReady(false);
    fetchBrandSpec(projectId)
      .then(({ spec }) => {
        if (!active) return;
        setInitialAssets(canvasAssetsFromSpec(spec));
      })
      .catch(() => {
        if (!active) return;
        setInitialAssets([]);
      })
      .finally(() => {
        if (!active) return;
        setAssetsReady(true);
      });
    return () => {
      active = false;
    };
  }, [projectId]);

  const initialNodes = useMemo(
    () => store.assets.map((a) => assetToNode(a, store)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState([]);
  const [zoom, setZoom] = useState(1);
  const [showMinimap, setShowMinimap] = useState(true);
  const [flowInstance, setFlowInstance] = useState<ReactFlowInstance | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!assetsReady) return;
    const timer = setTimeout(() => {
      void saveBrandSpec(projectId, { canvasAssets: store.assets });
    }, 350);
    return () => clearTimeout(timer);
  }, [assetsReady, projectId, store.assets]);

  // Keep nodes in sync when store.assets changes (add/delete/update)
  // Uses diff-based approach to preserve React Flow's internal positions
  useEffect(() => {
    const s = storeRef.current;
    setNodes((currentNodes) => {
      const storeIds = new Set(s.assets.map((a) => a.id));
      const currentIds = new Set(currentNodes.map((n) => n.id));

      const kept = currentNodes.filter((n) => storeIds.has(n.id));
      const newAssets = s.assets.filter((a) => !currentIds.has(a.id));
      const newNodes = newAssets.map((a) => assetToNode(a, s));

      const updated = kept.map((n) => {
        const asset = s.assets.find((a) => a.id === n.id);
        if (!asset) return n;
        const fresh = assetToNode(asset, s);
        return { ...fresh, position: n.position };
      });

      return [...updated, ...newNodes];
    });
  }, [store.assets, setNodes]);

  // Subscribe to canvas events from agent conversations
  useEffect(() => {
    return canvasEvents.subscribe((assets) => {
      let offsetY = 0;
      for (const asset of assets) {
        const pos = asset.position ?? {
          x: 100 + Math.random() * 300,
          y: 100 + offsetY,
        };
        storeRef.current.addNode(
          asset.type as CanvasAsset["type"],
          asset.data,
          asset.title,
          pos
        );
        offsetY += 250;
      }
    });
  }, []);

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

interface CanvasBoardProps {
  projectId: string;
}

export function CanvasBoard({ projectId }: CanvasBoardProps) {
  return <CanvasBoardInner projectId={projectId} />;
}
