const CMS_URL =
  process.env.NEXT_PUBLIC_CMS_URL || 'https://cms.orasage.com';

export type ZiweiFeedKind = 'order' | 'review';

export type ZiweiFeedItem = {
  id: number | string;
  kind: ZiweiFeedKind;
  message: string;
};

type CmsZiweiFeedDoc = {
  id: number | string;
  kind?: ZiweiFeedKind | null;
  message?: string | null;
  enabled?: boolean | null;
  locale?: string | null;
  sort?: number | null;
};

type CmsListResponse = {
  docs?: CmsZiweiFeedDoc[];
};

const FALLBACK_ZH: ZiweiFeedItem[] = [
  { id: 'fb-1', kind: 'order', message: '张** 刚刚完成了紫微排盘' },
  { id: 'fb-2', kind: 'order', message: '李** 解锁了十二宫 AI 解读' },
  { id: 'fb-3', kind: 'review', message: '「命宫解读很准，合盘分析也很细致」— 来自上海的用户' },
  { id: 'fb-4', kind: 'order', message: '王** 刚刚完成了双人合盘' },
  { id: 'fb-5', kind: 'review', message: '「界面简洁，排盘速度快」— 来自广州的用户' },
];

function mapDoc(doc: CmsZiweiFeedDoc): ZiweiFeedItem | null {
  const message = doc.message?.trim();
  if (!message) return null;
  const kind = doc.kind === 'review' ? 'review' : 'order';
  return { id: doc.id, kind, message };
}

export async function fetchZiweiFeed(locale: string): Promise<ZiweiFeedItem[]> {
  const params = new URLSearchParams({
    'where[enabled][equals]': 'true',
    'where[locale][equals]': locale,
    sort: 'sort',
    limit: '50',
  });

  try {
    const res = await fetch(`${CMS_URL}/api/ziwei-feed?${params.toString()}`, {
      cache: 'no-store',
    });
    if (!res.ok) {
      return locale === 'zh-CN' ? FALLBACK_ZH : [];
    }
    const data = (await res.json()) as CmsListResponse;
    const items = (data.docs ?? [])
      .map(mapDoc)
      .filter((item): item is ZiweiFeedItem => item !== null);
    if (items.length > 0) return items;
    return locale === 'zh-CN' ? FALLBACK_ZH : [];
  } catch {
    return locale === 'zh-CN' ? FALLBACK_ZH : [];
  }
}
