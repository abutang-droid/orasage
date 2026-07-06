'use client';

import type { GeoRegion } from '@/lib/geo/types';

const REGION_COLORS: Record<string, string> = {
  americas: 'rgba(201, 149, 74, 0.35)',
  europe: 'rgba(139, 168, 136, 0.35)',
  africa: 'rgba(180, 140, 90, 0.35)',
  asia: 'rgba(120, 150, 190, 0.35)',
  oceania: 'rgba(100, 170, 160, 0.35)',
};

type WorldMapSvgProps = {
  regions: GeoRegion[];
  selectedCode?: string | null;
  onSelect: (code: string) => void;
};

/** 简化世界地图 + CMS 热点坐标 */
export function WorldMapSvg({ regions, selectedCode, onSelect }: WorldMapSvgProps) {
  return (
    <div className="world-map">
      <svg
        className="world-map-svg"
        viewBox="0 0 360 180"
        role="img"
        aria-label="世界地图，点选大洲"
      >
        <rect width="360" height="180" fill="rgba(201, 149, 74, 0.06)" rx="8" />
        {/* 简化大陆轮廓 */}
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
        {regions.map((region) => {
          const active = selectedCode === region.code;
          return (
            <button
              key={region.code}
              type="button"
              className={`world-map-hotspot${active ? ' is-active' : ''}`}
              style={{
                left: `${region.mapX}%`,
                top: `${region.mapY}%`,
                ['--hotspot-color' as string]: REGION_COLORS[region.code] ?? 'rgba(201,149,74,0.35)',
              }}
              onClick={() => onSelect(region.code)}
              aria-pressed={active}
              aria-label={region.nameZh}
            >
              <span className="world-map-hotspot-pulse" aria-hidden />
              <span className="world-map-hotspot-label">{region.nameZh}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
