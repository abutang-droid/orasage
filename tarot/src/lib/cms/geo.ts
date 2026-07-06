import { SEED_GEO_COUNTRIES, SEED_GEO_REGIONS } from '../../../../shared/tarot-geo-seed';
import { countryMapCoords } from '@/lib/geo/map-layout';
import {
  fetchFaithsWithFallback,
  mapCmsFaithToOption,
  type CmsFaith,
} from '@/lib/cms/faiths';

const CMS_INTERNAL_URL =
  process.env.CMS_URL || process.env.CMS_INTERNAL_URL || 'http://127.0.0.1:3120/cms';

type CmsListResponse<T> = {
  docs: T[];
  totalDocs: number;
};

export type GeoRegionDto = {
  code: string;
  nameZh: string;
  nameEn: string;
  mapX: number;
  mapY: number;
  sortOrder: number;
};

export type GeoCountryDto = {
  code: string;
  nameZh: string;
  nameEn: string;
  regionCode: string;
  mapX?: number;
  mapY?: number;
  sortOrder: number;
};

export type CountryFaithLink = {
  faithCode: string;
  prevalence: number;
  isPrimary: boolean;
};

type CmsGeoRegion = {
  code: string;
  nameZh: string;
  nameEn: string;
  mapX: number;
  mapY: number;
  sortOrder?: number | null;
};

type CmsGeoCountry = {
  code: string;
  nameZh: string;
  nameEn: string;
  mapX?: number | null;
  mapY?: number | null;
  sortOrder?: number | null;
  region?: { code: string } | number | null;
};

type CmsCountryFaith = {
  prevalence: number;
  isPrimary?: boolean | null;
  country?: { code: string } | number | null;
  faith?: CmsFaith | number | null;
};

function mapRegion(r: CmsGeoRegion): GeoRegionDto {
  return {
    code: r.code,
    nameZh: r.nameZh,
    nameEn: r.nameEn,
    mapX: Number(r.mapX),
    mapY: Number(r.mapY),
    sortOrder: r.sortOrder ?? 0,
  };
}

function mapCountry(c: CmsGeoCountry, regionCode: string): GeoCountryDto {
  const coords = countryMapCoords(c.code, { mapX: c.mapX, mapY: c.mapY });
  return {
    code: c.code,
    nameZh: c.nameZh,
    nameEn: c.nameEn,
    regionCode,
    mapX: coords.mapX,
    mapY: coords.mapY,
    sortOrder: c.sortOrder ?? 0,
  };
}

export function fallbackGeoRegions(): GeoRegionDto[] {
  return SEED_GEO_REGIONS.map((r) => ({
    code: r.code,
    nameZh: r.nameZh,
    nameEn: r.nameEn,
    mapX: r.mapX,
    mapY: r.mapY,
    sortOrder: r.sortOrder,
  }));
}

export function fallbackGeoCountries(regionCode?: string): GeoCountryDto[] {
  const list = SEED_GEO_COUNTRIES.map((c) => ({
    code: c.code,
    nameZh: c.nameZh,
    nameEn: c.nameEn,
    regionCode: c.regionCode,
    mapX: c.mapX,
    mapY: c.mapY,
    sortOrder: c.sortOrder,
  }));
  if (!regionCode) return list;
  return list.filter((c) => c.regionCode === regionCode);
}

export async function fetchGeoRegionsFromCms(): Promise<GeoRegionDto[]> {
  const params = new URLSearchParams();
  params.set('where[wpStatus][equals]', 'publish');
  params.set('limit', '20');
  params.set('sort', 'sortOrder');

  const res = await fetch(`${CMS_INTERNAL_URL}/api/geo-regions?${params}`, {
    next: { revalidate: 300 },
  });
  if (!res.ok) throw new Error(`CMS geo-regions failed: ${res.status}`);
  const data: CmsListResponse<CmsGeoRegion> = await res.json();
  return data.docs.map(mapRegion);
}

export async function fetchGeoCountriesFromCms(regionCode?: string): Promise<GeoCountryDto[]> {
  const params = new URLSearchParams();
  params.set('where[wpStatus][equals]', 'publish');
  params.set('limit', '200');
  params.set('depth', '1');
  params.set('sort', 'sortOrder');
  if (regionCode) {
    params.set('where[region.code][equals]', regionCode);
  }

  const res = await fetch(`${CMS_INTERNAL_URL}/api/geo-countries?${params}`, {
    next: { revalidate: 300 },
  });
  if (!res.ok) throw new Error(`CMS geo-countries failed: ${res.status}`);
  const data: CmsListResponse<CmsGeoCountry> = await res.json();
  return data.docs
    .map((c) => {
      const region =
        c.region && typeof c.region === 'object' && 'code' in c.region ? c.region.code : '';
      return mapCountry(c, region);
    })
    .filter((c) => !regionCode || c.regionCode === regionCode);
}

export async function fetchCountryFaithLinksFromCms(
  countryCode: string,
): Promise<CountryFaithLink[]> {
  const countryRes = await fetch(
    `${CMS_INTERNAL_URL}/api/geo-countries?where[code][equals]=${encodeURIComponent(countryCode)}&limit=1`,
    { next: { revalidate: 300 } },
  );
  if (!countryRes.ok) throw new Error(`CMS country lookup failed: ${countryRes.status}`);
  const countryData: CmsListResponse<{ id: number }> = await countryRes.json();
  const countryId = countryData.docs[0]?.id;
  if (!countryId) return [];

  const params = new URLSearchParams();
  params.set('where[wpStatus][equals]', 'publish');
  params.set('where[country][equals]', String(countryId));
  params.set('limit', '50');
  params.set('depth', '1');
  params.set('sort', '-prevalence');

  const res = await fetch(`${CMS_INTERNAL_URL}/api/country-faiths?${params}`, {
    next: { revalidate: 300 },
  });
  if (!res.ok) throw new Error(`CMS country-faiths failed: ${res.status}`);
  const data: CmsListResponse<CmsCountryFaith> = await res.json();

  return data.docs
    .map((row) => {
      const faith = row.faith;
      if (!faith || typeof faith !== 'object' || !('code' in faith)) return null;
      return {
        faithCode: faith.code,
        prevalence: Number(row.prevalence),
        isPrimary: Boolean(row.isPrimary),
      };
    })
    .filter((x): x is CountryFaithLink => x != null);
}

export async function fetchFaithsForCountry(countryCode: string) {
  const { faiths: allFaiths, source } = await fetchFaithsWithFallback();

  try {
    const links = await fetchCountryFaithLinksFromCms(countryCode);
    if (links.length === 0) {
      return { faiths: allFaiths, source, countryCode, regional: false };
    }

    const byCode = new Map(allFaiths.map((f) => [f.id, f]));
    const ranked = links
      .map((link) => {
        const faith = byCode.get(link.faithCode);
        if (!faith) return null;
        return {
          ...faith,
          rank: 100 - link.prevalence,
          isPrimary: link.isPrimary,
          prevalence: link.prevalence,
        };
      })
      .filter((x): x is NonNullable<typeof x> => x != null)
      .sort((a, b) => a.rank - b.rank);

    const linkedCodes = new Set(ranked.map((f) => f.id));
    const rest = allFaiths
      .filter((f) => !linkedCodes.has(f.id) && f.rank < 98)
      .map((f) => ({ ...f, isPrimary: false, prevalence: 0 }));

    return {
      faiths: [...ranked, ...rest],
      primary: ranked.filter((f) => f.isPrimary),
      source,
      countryCode,
      regional: true,
    };
  } catch (err) {
    console.warn('[cms/geo] country faith fallback:', err);
    return { faiths: allFaiths, source, countryCode, regional: false };
  }
}

export async function fetchGeoRegionsWithFallback() {
  try {
    const regions = await fetchGeoRegionsFromCms();
    if (regions.length > 0) return { regions, source: 'cms' as const };
  } catch (err) {
    console.warn('[cms/geo] regions fallback:', err);
  }
  return { regions: fallbackGeoRegions(), source: 'fallback' as const };
}

export async function fetchGeoCountriesWithFallback(regionCode?: string) {
  try {
    const countries = await fetchGeoCountriesFromCms(regionCode);
    if (countries.length > 0) return { countries, source: 'cms' as const };
  } catch (err) {
    console.warn('[cms/geo] countries fallback:', err);
  }
  return { countries: fallbackGeoCountries(regionCode), source: 'fallback' as const };
}
