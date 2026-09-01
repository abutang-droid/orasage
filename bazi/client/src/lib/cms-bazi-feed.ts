const CMS_INTERNAL_URL =
  import.meta.env.VITE_CMS_URL || import.meta.env.VITE_CMS_INTERNAL_URL || 'http://127.0.0.1:3120/cms';

function feedApiUrl(query: string): string {
  if (typeof window !== 'undefined') {
    return `/api/cms/bazi-feed?${query}`;
  }
  return `${CMS_INTERNAL_URL}/api/bazi-feed?${query}`;
}

export type BaziFeedKind = 'order' | 'review';

export type BaziFeedItem = {
  id: number | string;
  kind: BaziFeedKind;
  message: string;
};

type CmsBaziFeedDoc = {
  id: number | string;
  kind?: BaziFeedKind | null;
  message?: string | null;
  enabled?: boolean | null;
  locale?: string | null;
  sort?: number | null;
};

type CmsListResponse = {
  docs?: CmsBaziFeedDoc[];
};

const FALLBACK_ZH: BaziFeedItem[] = [
  { id: 'fb-1', kind: 'order', message: '张** 刚刚完成了八字排盘' },
  { id: 'fb-2', kind: 'order', message: '李** 解锁了完整命盘报告' },
  { id: 'fb-3', kind: 'review', message: '「界面清爽，排盘速度快」— 来自上海的用户' },
  { id: 'fb-4', kind: 'order', message: '王** 刚刚完成了双人合盘' },
  { id: 'fb-5', kind: 'review', message: '「喜欢这种东方式的呈现方式」— 来自广州的用户' },
];

function sanitizeFeed(items: BaziFeedItem[]): BaziFeedItem[] {
  const bad = /很准|选对|命中|财运|功效|磁场|\u62db\u8d22|谈成|客户|事业|灵/i;
  return items.filter((item) => item.message.trim() && !bad.test(item.message));
}

function mapDoc(doc: CmsBaziFeedDoc): BaziFeedItem | null {
  const message = doc.message?.trim();
  if (!message) return null;
  const kind = doc.kind === 'review' ? 'review' : 'order';
  return { id: doc.id, kind, message };
}

export async function fetchBaziFeed(locale: string): Promise<BaziFeedItem[]> {
  const params = new URLSearchParams({
    'where[enabled][equals]': 'true',
    'where[locale][equals]': locale,
    sort: 'sort',
    limit: '50',
  });

  try {
    const res = await fetch(feedApiUrl(params.toString()), {
      cache: 'no-store',
    });
    if (!res.ok) {
      return locale === 'zh-CN' ? FALLBACK_ZH : [];
    }
    const data = (await res.json()) as CmsListResponse;
    const items = sanitizeFeed(
      (data.docs ?? [])
        .map(mapDoc)
        .filter((item): item is BaziFeedItem => item !== null),
    );
    if (items.length > 0) return items;
    return locale === 'zh-CN' ? sanitizeFeed(FALLBACK_ZH) : [];
  } catch {
    return locale === 'zh-CN' ? sanitizeFeed(FALLBACK_ZH) : [];
  }
}
