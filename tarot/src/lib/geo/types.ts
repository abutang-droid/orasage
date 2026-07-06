export type GeoRegion = {
  code: string;
  nameZh: string;
  nameEn: string;
  mapX: number;
  mapY: number;
  sortOrder: number;
};

export type GeoCountry = {
  code: string;
  nameZh: string;
  nameEn: string;
  regionCode: string;
  mapX?: number;
  mapY?: number;
  sortOrder: number;
};

export type GeoJourneySelection = {
  continentCode: string;
  countryCode: string;
  faith: string;
};

export const GEO_STORAGE_KEY = 'manto:geo';

export function loadStoredGeo(): Pick<GeoJourneySelection, 'continentCode' | 'countryCode'> | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(GEO_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { continentCode?: string; countryCode?: string };
    if (!parsed.continentCode || !parsed.countryCode) return null;
    return {
      continentCode: parsed.continentCode,
      countryCode: parsed.countryCode,
    };
  } catch {
    return null;
  }
}

export function storeGeo(continentCode: string, countryCode: string) {
  try {
    localStorage.setItem(GEO_STORAGE_KEY, JSON.stringify({ continentCode, countryCode }));
  } catch {
    /* ignore */
  }
}
