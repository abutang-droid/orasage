import { SEED_GEO_COUNTRIES } from '../../../../shared/tarot-geo-seed';

const SEED_COORDS = new Map(
  SEED_GEO_COUNTRIES.map((c) => [c.code, { mapX: c.mapX, mapY: c.mapY }]),
);

export type MapViewport = {
  centerX: number;
  centerY: number;
  scale: number;
};

export const REGION_VIEWPORTS: Record<string, MapViewport> = {
  asia: { centerX: 68, centerY: 42, scale: 1.35 },
  europe: { centerX: 50, centerY: 32, scale: 1.45 },
  africa: { centerX: 52, centerY: 52, scale: 1.35 },
  americas: { centerX: 22, centerY: 48, scale: 1.3 },
  oceania: { centerX: 84, centerY: 66, scale: 1.55 },
};

export const WORLD_VIEWPORT: MapViewport = { centerX: 50, centerY: 50, scale: 1 };

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function countryMapCoords(
  code: string,
  coords?: { mapX?: number | null; mapY?: number | null },
): { mapX: number; mapY: number } {
  if (coords?.mapX != null && coords?.mapY != null) {
    return { mapX: coords.mapX, mapY: coords.mapY };
  }
  const seed = SEED_COORDS.get(code);
  if (seed) return seed;
  return { mapX: 50, mapY: 50 };
}

/** 在同一国家周围均匀分布信仰热点 */
export function spreadMapCoords(
  baseX: number,
  baseY: number,
  index: number,
  total: number,
): { mapX: number; mapY: number } {
  if (total <= 1) return { mapX: baseX, mapY: baseY };
  const radius = Math.min(9, 4 + total * 0.8);
  const angle = (2 * Math.PI * index) / total - Math.PI / 2;
  return {
    mapX: clamp(baseX + radius * Math.cos(angle), 8, 92),
    mapY: clamp(baseY + radius * Math.sin(angle), 12, 88),
  };
}

export function viewportForRegion(regionCode?: string | null): MapViewport {
  if (!regionCode) return WORLD_VIEWPORT;
  return REGION_VIEWPORTS[regionCode] ?? WORLD_VIEWPORT;
}

export function viewportForCountry(
  countryCode: string,
  coords?: { mapX?: number | null; mapY?: number | null },
): MapViewport {
  const { mapX, mapY } = countryMapCoords(countryCode, coords);
  return { centerX: mapX, centerY: mapY, scale: 1.8 };
}

type MapPoint = { mapX: number; mapY: number };

/** 根据热点包围盒自动适配缩放，避免裁切 */
export function fitViewportToHotspots(hotspots: MapPoint[]): MapViewport {
  if (hotspots.length === 0) return WORLD_VIEWPORT;
  if (hotspots.length === 1) {
    return { centerX: hotspots[0].mapX, centerY: hotspots[0].mapY, scale: 1.5 };
  }

  const xs = hotspots.map((h) => h.mapX);
  const ys = hotspots.map((h) => h.mapY);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;
  const spanX = Math.max(maxX - minX, 12);
  const spanY = Math.max(maxY - minY, 10);
  const scale = clamp(88 / Math.max(spanX, spanY * 1.6), 1.1, 2.2);

  return { centerX, centerY, scale };
}
