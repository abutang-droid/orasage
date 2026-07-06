'use client';

import type { MapViewport } from '@/lib/geo/map-layout';
import { useMapPanZoom } from '@/lib/geo/use-map-pan-zoom';

export type MapHotspot = {
  id: string;
  label: string;
  sublabel?: string;
  emoji?: string;
  mapX: number;
  mapY: number;
  color?: string;
};

const DEFAULT_COLORS = [
  'rgba(201, 149, 74, 0.45)',
  'rgba(139, 168, 136, 0.45)',
  'rgba(120, 150, 190, 0.45)',
  'rgba(180, 140, 90, 0.45)',
  'rgba(100, 170, 160, 0.45)',
];

type WorldMapSvgProps = {
  hotspots: MapHotspot[];
  selectedId?: string | null;
  onSelect: (id: string) => void;
  viewport?: MapViewport;
  viewportKey?: string;
  ariaLabel?: string;
  compactLabels?: boolean;
};

/** 简化世界地图 + 可拖拽缩放热点层 */
export function WorldMapSvg({
  hotspots,
  selectedId,
  onSelect,
  viewport = { centerX: 50, centerY: 50, scale: 1 },
  viewportKey = 'world',
  ariaLabel = '世界地图',
  compactLabels = false,
}: WorldMapSvgProps) {
  const offsetX = 50 - viewport.centerX;
  const offsetY = 50 - viewport.centerY;
  const baseScale = viewport.scale;

  const { transform, reset, zoomIn, zoomOut, handlers } = useMapPanZoom({
    minScale: 0.5,
    maxScale: 5,
    resetKey: viewportKey,
  });

  const combinedScale = baseScale * transform.scale;

  return (
    <div className="world-map world-map--interactive">
      <div
        className="world-map-surface"
        {...handlers}
      >
        <div
          className="world-map-viewport"
          style={{
            transform: `translate(calc(${offsetX}% + ${transform.x}px), calc(${offsetY}% + ${transform.y}px)) scale(${combinedScale})`,
          }}
        >
          <svg className="world-map-svg" viewBox="0 0 360 180" role="img" aria-label={ariaLabel}>
            <rect width="360" height="180" fill="rgba(201, 149, 74, 0.06)" />
            <path
              d="M24 48 C40 32, 72 28, 88 42 C96 58, 84 78, 68 88 C52 96, 36 88, 28 72 Z"
              fill="rgba(201,149,74,0.12)"
              stroke="rgba(201,149,74,0.25)"
              strokeWidth="0.8"
            />
            <path
              d="M148 36 C168 28, 188 32, 196 48 C200 62, 188 72, 172 68 C156 64, 144 52, 148 36 Z"
              fill="rgba(139,168,136,0.12)"
              stroke="rgba(139,168,136,0.25)"
              strokeWidth="0.8"
            />
            <path
              d="M156 72 C176 68, 196 76, 200 96 C198 116, 180 124, 164 118 C150 110, 148 88, 156 72 Z"
              fill="rgba(180,140,90,0.12)"
              stroke="rgba(180,140,90,0.25)"
              strokeWidth="0.8"
            />
            <path
              d="M208 40 C248 32, 296 36, 312 56 C320 72, 300 88, 264 84 C228 80, 204 60, 208 40 Z"
              fill="rgba(120,150,190,0.12)"
              stroke="rgba(120,150,190,0.25)"
              strokeWidth="0.8"
            />
            <path
              d="M276 108 C296 100, 320 108, 328 124 C324 140, 304 148, 284 142 C268 136, 268 118, 276 108 Z"
              fill="rgba(100,170,160,0.12)"
              stroke="rgba(100,170,160,0.25)"
              strokeWidth="0.8"
            />
          </svg>

          <div className="world-map-hotspots">
            {hotspots.map((spot, index) => {
              const active = selectedId === spot.id;
              const color = spot.color ?? DEFAULT_COLORS[index % DEFAULT_COLORS.length];
              return (
                <button
                  key={spot.id}
                  type="button"
                  className={`world-map-hotspot${active ? ' is-active' : ''}${compactLabels ? ' world-map-hotspot--compact' : ''}`}
                  style={{
                    left: `${spot.mapX}%`,
                    top: `${spot.mapY}%`,
                    ['--hotspot-color' as string]: color,
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect(spot.id);
                  }}
                  aria-pressed={active}
                  aria-label={spot.label}
                >
                  <span className="world-map-hotspot-pulse" aria-hidden />
                  {spot.emoji ? (
                    <span className="world-map-hotspot-emoji" aria-hidden>
                      {spot.emoji}
                    </span>
                  ) : null}
                  <span className="world-map-hotspot-label">{spot.label}</span>
                  {spot.sublabel && !compactLabels ? (
                    <span className="world-map-hotspot-sublabel">{spot.sublabel}</span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="world-map-controls" aria-label="地图缩放">
        <button type="button" className="world-map-control-btn" onClick={zoomIn} aria-label="放大">
          +
        </button>
        <button type="button" className="world-map-control-btn" onClick={zoomOut} aria-label="缩小">
          −
        </button>
        <button type="button" className="world-map-control-btn" onClick={reset} aria-label="重置视图">
          ⟲
        </button>
      </div>
      <p className="world-map-gesture-hint">双指缩放 · 拖动平移</p>
    </div>
  );
}
