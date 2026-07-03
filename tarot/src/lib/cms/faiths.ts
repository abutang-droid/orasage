import {
  TOP_FAITH_COUNT,
  WORLD_FAITHS,
  type FaithOption,
} from '@/lib/faiths/religions';

const CMS_URL = process.env.CMS_URL || process.env.NEXT_PUBLIC_CMS_URL || 'https://cms.orasage.com';

export type CmsFaith = {
  id: number;
  code: string;
  nameZh: string;
  nameEn: string;
  emoji?: string | null;
  rank?: number | null;
  adherentsM?: number | null;
};

type CmsListResponse<T> = {
  docs: T[];
  totalDocs: number;
};

export type FaithListResult = {
  faiths: FaithOption[];
  source: 'cms' | 'fallback';
};

export function mapCmsFaithToOption(f: CmsFaith): FaithOption {
  return {
    id: f.code,
    nameZh: f.nameZh,
    nameEn: f.nameEn,
    emoji: f.emoji?.trim() || '🙏',
    adherentsM: f.adherentsM ?? 0,
    rank: f.rank ?? 50,
  };
}

export function splitFaithsByRank(faiths: FaithOption[]): {
  top: FaithOption[];
  more: FaithOption[];
} {
  const sorted = [...faiths].sort((a, b) => a.rank - b.rank);
  return {
    top: sorted.filter((f) => f.rank <= TOP_FAITH_COUNT),
    more: sorted.filter((f) => f.rank > TOP_FAITH_COUNT && f.rank < 98),
  };
}

export async function fetchFaithsFromCms(): Promise<CmsFaith[]> {
  const params = new URLSearchParams();
  params.set('where[wpStatus][equals]', 'publish');
  params.set('limit', '100');
  params.set('sort', 'rank');

  const res = await fetch(`${CMS_URL}/api/faiths?${params}`, {
    next: { revalidate: 300 },
  });
  if (!res.ok) throw new Error(`CMS faiths fetch failed: ${res.status}`);
  const data: CmsListResponse<CmsFaith> = await res.json();
  return data.docs;
}

export async function fetchFaithsWithFallback(): Promise<FaithListResult> {
  try {
    const docs = await fetchFaithsFromCms();
    if (docs.length > 0) {
      return {
        faiths: docs.map(mapCmsFaithToOption).sort((a, b) => a.rank - b.rank),
        source: 'cms',
      };
    }
  } catch (err) {
    console.warn('[cms/faiths] fallback to local data:', err);
  }

  return { faiths: WORLD_FAITHS, source: 'fallback' };
}
