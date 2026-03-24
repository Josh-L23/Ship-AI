type CanvasAssetPayload = {
  type: string;
  title?: string;
  data?: Record<string, unknown>;
  position?: { x: number; y: number };
};

type CanvasUpdateHandler = (assets: CanvasAssetPayload[]) => void;

const listeners = new Set<CanvasUpdateHandler>();

export const canvasEvents = {
  emit(assets: CanvasAssetPayload[]) {
    listeners.forEach((fn) => fn(assets));
  },

  subscribe(handler: CanvasUpdateHandler) {
    listeners.add(handler);
    return () => {
      listeners.delete(handler);
    };
  },
};

export type { CanvasAssetPayload };
