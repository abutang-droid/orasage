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
  asia: { centerX: 68, centerY: 42, scale: 1.7 },
  europe: { centerX: 50, centerY: 32, scale: 1.85 },
  africa: { centerX: 52, centerY: 52, scale: 1.7 },
  americas: { centerX: 22, centerY: 48, scale: 1.6 },
  oceania: { centerX: 84, centerY: 66, scale: 2.1 },
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
  return { centerX: mapX, centerY: mapY, scale: 2.4 };
}
