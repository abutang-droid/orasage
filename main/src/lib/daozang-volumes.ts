import type { DaozangCategoryKey } from './daozang-taxonomy';

/** 四部全书（章节化典籍）分类 */
export const DAOZANG_BOOK_CATEGORY_KEYS: DaozangCategoryKey[] = [
  'sanmingtonghui',
  'yuanhaiziping',
  'shenfengtongkao',
  'xingmingzongkuo',
];

const BOOK_SET = new Set<string>(DAOZANG_BOOK_CATEGORY_KEYS);

export function isBookCategory(key: string | null | undefined): key is DaozangCategoryKey {
  return Boolean(key && BOOK_SET.has(key));
}

export type DaozangVolume = {
  /** URL 参数值，如 `12`、`shang` */
  key: string;
  /** 展示名，如「卷12」「卷上」 */
  label: string;
  /** 数值排序权重（卷上=1，卷中=2，卷下=3；数字卷直接用数字） */
  order: number;
};

/** 从标题解析卷（星命总括等：「星命总括 · 星命总括 卷上」） */
export function volumeFromTitle(title: string): DaozangVolume | null {
  const clean = title.trim();
  const named = clean.match(/卷(上|中|下)/);
  if (named) {
    const map = { 上: 1, 中: 2, 下: 3 } as const;
    const part = named[1] as keyof typeof map;
    return { key: part, label: `卷${part}`, order: map[part] };
  }
  const num = clean.match(/第?\s*(\d+)\s*卷/);
  if (num) {
    const n = Number(num[1]);
    return { key: String(n), label: `卷${n}`, order: n };
  }
  return null;
}

export function volumeLabelFromKey(key: string): string {
  if (/^[上中下]$/.test(key)) return `卷${key}`;
  if (/^\d+$/.test(key)) return `卷${key}`;
  return key;
}

type VolumeTranslator = (key: string, values?: Record<string, string | number>) => string;

/** 卷次展示名（i18n） */
export function localizedVolumeLabel(key: string, t: VolumeTranslator): string {
  if (key === '上') return t('volumeUpper');
  if (key === '中') return t('volumeMiddle');
  if (key === '下') return t('volumeLower');
  if (/^\d+$/.test(key)) return t('volumeNumber', { number: key });
  return volumeLabelFromKey(key);
}

/** 按卷排序后的列表（供目录页渲染） */
export function sortedVolumeGroups<T extends VolumeItem>(
  items: T[],
): { volume: DaozangVolume; items: T[] }[] {
  return [...groupArticlesByVolume(items).values()].sort((a, b) => compareVolumes(a.volume, b.volume));
}

export function compareVolumes(a: DaozangVolume, b: DaozangVolume): number {
  return a.order - b.order || a.label.localeCompare(b.label, 'zh-Hans-CN');
}

type VolumeItem = { title: string; daozangVolume?: string | null };

/** 解析单篇所属卷（优先 CMS 字段，其次标题） */
export function resolveVolume(item: VolumeItem): DaozangVolume | null {
  if (item.daozangVolume) {
    const key = item.daozangVolume;
    const order = /^[上中下]$/.test(key)
      ? ({ 上: 1, 中: 2, 下: 3 } as Record<string, number>)[key] ?? 99
      : Number(key) || 99;
    return { key, label: volumeLabelFromKey(key), order };
  }
  return volumeFromTitle(item.title);
}

/** 按卷分组（组内保持原有 sortWeight 顺序） */
export function groupArticlesByVolume<T extends VolumeItem>(
  items: T[],
): Map<string, { volume: DaozangVolume; items: T[] }> {
  const map = new Map<string, { volume: DaozangVolume; items: T[] }>();
  for (const item of items) {
    const vol = resolveVolume(item);
    if (!vol) continue;
    const entry = map.get(vol.key) ?? { volume: vol, items: [] };
    entry.items.push(item);
    map.set(vol.key, entry);
  }
  return map;
}

/** 列表卡片用：去掉「书名 · 」前缀，仅显示章名 */
export function chapterDisplayTitle(fullTitle: string, bookPrefix?: string): string {
  const clean = fullTitle.trim();
  if (bookPrefix && clean.startsWith(`${bookPrefix} · `)) {
    return clean.slice(bookPrefix.length + 3);
  }
  const dot = clean.indexOf(' · ');
  return dot >= 0 ? clean.slice(dot + 3) : clean;
}
