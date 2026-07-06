import { DEITIES, filterDeitiesByFaith, type Deity } from '@/lib/faiths/deities';
import type { CmsFaith } from '@/lib/cms/faiths';
import { resolveWorshipFacing, facingForFaithCode, type WorshipFacing } from '@/lib/temple/facing';

const CMS_INTERNAL_URL =
  process.env.CMS_URL || process.env.CMS_INTERNAL_URL || 'http://127.0.0.1:3120/cms';

export type CmsSanctuary = {
  id: number;
  code: string;
  nameZh: string;
  nameEn: string;
  tradition?: string | null;
  region?: string | null;
  domains?: { label: string; id?: string }[] | null;
  color?: string | null;
  gradient?: string | null;
  imageUrl?: string | null;
  blessingText?: string | null;
  worshipFacing?: string | null;
  facingLabelZh?: string | null;
  facingLabelEn?: string | null;
  facingBearing?: number | null;
  faiths?: CmsFaith[] | number[] | null;
};

export type Sanctuary = Deity & {
  blessingText?: string | null;
  worshipFacing?: WorshipFacing | null;
  source: 'cms' | 'fallback';
};

type CmsListResponse<T> = {
  docs: T[];
  totalDocs: number;
};

function resolveImageUrl(s: CmsSanctuary): string {
  if (s.imageUrl?.trim()) return s.imageUrl;
  return '/gods/placeholder.webp';
}

function faithCodesFromSanctuary(s: CmsSanctuary): string[] {
  if (!s.faiths || !Array.isArray(s.faiths)) return [];
  return s.faiths
    .map((f) => (typeof f === 'object' && f && 'code' in f ? f.code : null))
    .filter((c): c is string => Boolean(c));
}

export function mapCmsSanctuary(s: CmsSanctuary, faithFacingByCode?: Map<string, CmsFaith>): Sanctuary {
  const faithIds = faithCodesFromSanctuary(s);
  const primaryFaith = faithIds[0];
  const faithFields = primaryFaith ? faithFacingByCode?.get(primaryFaith) : undefined;

  const worshipFacing = resolveWorshipFacing(s, faithFields);

  return {
    id: s.code,
    name: s.nameZh,
    nameEN: s.nameEn,
    tradition: (s.tradition === 'latin' || s.tradition === 'seasia' ? s.tradition : 'seasia') as Deity['tradition'],
    region: s.region ?? '',
    domains: (s.domains ?? []).map((d) => d.label).filter(Boolean),
    color: s.color ?? '#b8943f',
    gradient: s.gradient ?? 'linear-gradient(160deg, #b8943f, #d4b86a)',
    imageUrl: resolveImageUrl(s),
    faithIds,
    blessingText: s.blessingText,
    worshipFacing,
    source: 'cms',
  };
}

export async function fetchSanctuariesFromCms(faithCode?: string | null): Promise<Sanctuary[]> {
  const params = new URLSearchParams();
  params.set('where[wpStatus][equals]', 'publish');
  params.set('limit', '100');
  params.set('depth', '1');
  params.set('sort', 'sortOrder');

  const res = await fetch(`${CMS_INTERNAL_URL}/api/sanctuaries?${params}`, {
    next: { revalidate: 120 },
  });

  if (!res.ok) {
    throw new Error(`CMS sanctuaries fetch failed: ${res.status}`);
  }

  const data: CmsListResponse<CmsSanctuary> = await res.json();
  const faithFacingByCode = new Map<string, CmsFaith>();
  for (const doc of data.docs) {
    for (const f of doc.faiths ?? []) {
      if (f && typeof f === 'object' && 'code' in f) {
        faithFacingByCode.set(f.code, f);
      }
    }
  }
  let list = data.docs.map((doc) => mapCmsSanctuary(doc, faithFacingByCode));

  if (faithCode && faithCode !== 'none' && !faithCode.startsWith('other')) {
    const matched = list.filter((s) => s.faithIds.includes(faithCode));
    if (matched.length > 0) list = matched;
  }

  return list;
}

export async function fetchSanctuariesByFaith(faithCode: string | null): Promise<Sanctuary[]> {
  try {
    const fromCms = await fetchSanctuariesFromCms(faithCode);
    if (fromCms.length > 0) return fromCms;
  } catch (err) {
    console.warn('[cms/sanctuaries] fallback to local data:', err);
  }

  const fallback = filterDeitiesByFaith(faithCode).map((d) => ({
    ...d,
    worshipFacing: facingForFaithCode(d.faithIds[0] ?? faithCode),
    source: 'fallback' as const,
  }));
  return fallback;
}

export type { CmsFaith } from '@/lib/cms/faiths';
export { fetchFaithsFromCms } from '@/lib/cms/faiths';
