'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export type MapTransform = {
  x: number;
  y: number;
  scale: number;
};

type UseMapPanZoomOptions = {
  minScale?: number;
  maxScale?: number;
  resetKey?: string;
};

export function useMapPanZoom({
  minScale = 0.6,
  maxScale = 4,
  resetKey = '',
}: UseMapPanZoomOptions = {}) {
  const [transform, setTransform] = useState<MapTransform>({ x: 0, y: 0, scale: 1 });
  const dragging = useRef(false);
  const lastPoint = useRef({ x: 0, y: 0 });
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinchStart = useRef<{ distance: number; scale: number } | null>(null);

  useEffect(() => {
    setTransform({ x: 0, y: 0, scale: 1 });
  }, [resetKey]);

  const clampScale = useCallback(
    (scale: number) => Math.min(maxScale, Math.max(minScale, scale)),
    [maxScale, minScale],
  );

  const zoomBy = useCallback(
    (delta: number, origin?: { x: number; y: number }) => {
      setTransform((prev) => {
        const nextScale = clampScale(prev.scale * delta);
        if (!origin) return { ...prev, scale: nextScale };
        const ratio = nextScale / prev.scale;
        return {
          scale: nextScale,
          x: origin.x - (origin.x - prev.x) * ratio,
          y: origin.y - (origin.y - prev.y) * ratio,
        };
      });
    },
    [clampScale],
  );

  const reset = useCallback(() => {
    setTransform({ x: 0, y: 0, scale: 1 });
  }, []);

  const onPointerDown = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0 && event.pointerType === 'mouse') return;
    const target = event.currentTarget;
    target.setPointerCapture(event.pointerId);
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });

    if (pointers.current.size === 1) {
      dragging.current = true;
      lastPoint.current = { x: event.clientX, y: event.clientY };
    } else if (pointers.current.size === 2) {
      const pts = [...pointers.current.values()];
      const dx = pts[1].x - pts[0].x;
      const dy = pts[1].y - pts[0].y;
      pinchStart.current = { distance: Math.hypot(dx, dy), scale: transform.scale };
      dragging.current = false;
    }
  }, [transform.scale]);

  const onPointerMove = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (!pointers.current.has(event.pointerId)) return;
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });

    if (pointers.current.size >= 2 && pinchStart.current) {
      const pts = [...pointers.current.values()];
      const dx = pts[1].x - pts[0].x;
      const dy = pts[1].y - pts[0].y;
      const distance = Math.hypot(dx, dy);
      const ratio = distance / pinchStart.current.distance;
      setTransform((prev) => ({
        ...prev,
        scale: clampScale(pinchStart.current!.scale * ratio),
      }));
      return;
    }

    if (!dragging.current) return;
    const dx = event.clientX - lastPoint.current.x;
    const dy = event.clientY - lastPoint.current.y;
    lastPoint.current = { x: event.clientX, y: event.clientY };
    setTransform((prev) => ({ ...prev, x: prev.x + dx, y: prev.y + dy }));
  }, [clampScale]);

  const endPointer = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    pointers.current.delete(event.pointerId);
    if (pointers.current.size < 2) pinchStart.current = null;
    if (pointers.current.size === 0) dragging.current = false;
    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      /* ignore */
    }
  }, []);

  const onWheel = useCallback(
    (event: React.WheelEvent<HTMLDivElement>) => {
      event.preventDefault();
      const rect = event.currentTarget.getBoundingClientRect();
      const origin = {
        x: event.clientX - rect.left - rect.width / 2,
        y: event.clientY - rect.top - rect.height / 2,
      };
      const delta = event.deltaY < 0 ? 1.08 : 0.92;
      zoomBy(delta, origin);
    },
    [zoomBy],
  );

  return {
    transform,
    reset,
    zoomIn: () => zoomBy(1.2),
    zoomOut: () => zoomBy(0.84),
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp: endPointer,
      onPointerCancel: endPointer,
      onWheel,
    },
  };
}
