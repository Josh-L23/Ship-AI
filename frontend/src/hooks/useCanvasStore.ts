"use client";

import { createContext, useContext, useCallback, useEffect, useMemo, useState } from "react";
import type { CanvasAsset } from "@/lib/types";

export interface CanvasStore {
  assets: CanvasAsset[];
  setAssets: (assets: CanvasAsset[]) => void;
  addNode: (
    type: CanvasAsset["type"],
    data?: Partial<CanvasAsset["data"]>,
    title?: string,
    position?: { x: number; y: number }
  ) => string;
  updateNode: (id: string, patch: Partial<Pick<CanvasAsset, "title" | "data">>) => void;
  deleteNode: (id: string) => void;
  updateNodePosition: (id: string, position: { x: number; y: number }) => void;
}

function generateId(): string {
  return `asset_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

const NOTE_COLORS = ["#FEF3C7", "#DBEAFE", "#D1FAE5", "#FCE7F3", "#EDE9FE", "#FED7AA"];

function getDefaultData(type: CanvasAsset["type"]): Record<string, unknown> {
  switch (type) {
    case "note":
      return {
        content: "Double-click to edit this note...",
        color: NOTE_COLORS[Math.floor(Math.random() * NOTE_COLORS.length)],
      };
    case "color_palette":
      return {
        colors: [
          { hex: "#6366F1", name: "Indigo" },
          { hex: "#EC4899", name: "Pink" },
          { hex: "#14B8A6", name: "Teal" },
        ],
      };
    case "image":
      return {
        src: "",
        generatedAt: new Date().toISOString(),
        iteration: 1,
        dimensions: "—",
      };
    case "typography":
      return {
        heading: { family: "Inter", weight: "700", sample: "Heading" },
        body: { family: "Inter", weight: "400", sample: "Body text goes here." },
      };
    case "brand_guidelines":
      return {
        brandName: "Brand Name",
        tagline: "Your tagline here",
        industry: "Industry",
        targetAudience: "Audience",
        voiceDescriptors: ["Bold", "Modern"],
      };
    case "media":
      return {
        mediaType: "audio",
        duration: "0:00",
        format: "—",
      };
    default:
      return {};
  }
}

function getDefaultTitle(type: CanvasAsset["type"]): string {
  switch (type) {
    case "note": return "New Note";
    case "color_palette": return "New Palette";
    case "image": return "Uploaded Image";
    case "typography": return "Typography";
    case "brand_guidelines": return "Brand Guidelines";
    case "media": return "Media";
    default: return "New Item";
  }
}

export function useCanvasStoreProvider(initialAssets: CanvasAsset[] = []): CanvasStore {
  const [assets, setAssetsState] = useState<CanvasAsset[]>(initialAssets);

  useEffect(() => {
    setAssetsState(initialAssets);
  }, [initialAssets]);

  const setAssets = useCallback((nextAssets: CanvasAsset[]) => {
    setAssetsState(nextAssets);
  }, []);

  const addNode = useCallback(
    (
      type: CanvasAsset["type"],
      data?: Partial<CanvasAsset["data"]>,
      title?: string,
      position?: { x: number; y: number }
    ): string => {
      const id = generateId();
      const newAsset: CanvasAsset = {
        id,
        type,
        title: title ?? getDefaultTitle(type),
        position: position ?? {
          x: 100 + Math.random() * 200,
          y: 100 + Math.random() * 200,
        },
        data: { ...getDefaultData(type), ...data },
      };
      setAssetsState((prev) => [...prev, newAsset]);
      return id;
    },
    []
  );

  const updateNode = useCallback(
    (id: string, patch: Partial<Pick<CanvasAsset, "title" | "data">>) => {
      setAssetsState((prev) =>
        prev.map((a) =>
          a.id === id
            ? {
                ...a,
                ...(patch.title !== undefined ? { title: patch.title } : {}),
                ...(patch.data !== undefined ? { data: { ...a.data, ...patch.data } } : {}),
              }
            : a
        )
      );
    },
    []
  );

  const deleteNode = useCallback(
    (id: string) => {
      setAssetsState((prev) => prev.filter((a) => a.id !== id));
    },
    []
  );

  const updateNodePosition = useCallback(
    (id: string, position: { x: number; y: number }) => {
      setAssetsState((prev) =>
        prev.map((a) => (a.id === id ? { ...a, position } : a))
      );
    },
    []
  );

  return useMemo(
    () => ({ assets, setAssets, addNode, updateNode, deleteNode, updateNodePosition }),
    [assets, setAssets, addNode, updateNode, deleteNode, updateNodePosition]
  );
}

const CanvasStoreContext = createContext<CanvasStore | null>(null);

export const CanvasStoreProvider = CanvasStoreContext.Provider;

export function useCanvasStore(): CanvasStore {
  const ctx = useContext(CanvasStoreContext);
  if (!ctx) {
    throw new Error("useCanvasStore must be used inside CanvasStoreProvider");
  }
  return ctx;
}
