/**
 * 道藏「山医命相卜」五术分类体系。
 *
 * - `key` 与 CMS `pages.daozangCategory`（enum_pages_daozang_category）一一对应，
 *   同时与 c2.pub WordPress `doc_category` 的 slug 保持一致；
 *   改动需同步 `cms/src/collections/Pages.ts` 的 DAOZANG_CATEGORY_OPTIONS
 *   与 `scripts/migrate-c2pub/classify-daozang.mjs`。
 * - `wpCategoryId` 为源站 doc_category 的 term id（权威归类来源）。
 * - `slugPrefix` 为迁移 slug `docs/zh-cn/A_B_C` 中的 `A_B` 编号段（归类兜底规则）。
 */

export type DaozangTopKey = 'shan' | 'yi' | 'ming' | 'xiang' | 'bu';

export type DaozangCategoryKey =
  | 'quanfa'
  | 'zhongyi'
  | 'bazi'
  | 'ziweidoushu'
  | 'qizhengsheyu'
  | 'sanmingtonghui'
  | 'yuanhaiziping'
  | 'shenfengtongkao'
  | 'xingmingzongkuo'
  | 'dixiang'
  | 'renxiang'
  | 'xingxiang'
  | 'yijing'
  | 'liuyao'
  | 'meihuayishu'
  | 'qimendunjia'
  | 'daliuren';

export type DaozangCategory = {
  key: DaozangCategoryKey;
  top: DaozangTopKey;
  wpCategoryId: number;
  /** 迁移 slug `docs/zh-cn/A_B_C` 的 `A_B` 编号段（归类兜底） */
  slugPrefix?: string;
  /** 章节化全书：标题前缀（如「三命通会 – 第8章」）归类兜底 */
  titlePrefix?: string;
};

/** 五术顶级分类，按传统「山医命相卜」次序（与 slug 编号 1–5 一致） */
export const DAOZANG_TOPS: DaozangTopKey[] = ['shan', 'yi', 'ming', 'xiang', 'bu'];

export const DAOZANG_CATEGORIES: DaozangCategory[] = [
  { key: 'quanfa', top: 'shan', wpCategoryId: 45, slugPrefix: '1_1' },
  { key: 'zhongyi', top: 'yi', wpCategoryId: 59, slugPrefix: '2_1' },
  { key: 'bazi', top: 'ming', wpCategoryId: 60, slugPrefix: '3_1' },
  { key: 'ziweidoushu', top: 'ming', wpCategoryId: 61, slugPrefix: '3_2' },
  { key: 'qizhengsheyu', top: 'ming', wpCategoryId: 62, slugPrefix: '3_3' },
  // 章节化全书（WP 顶级空分类，章节文档 slug 为 item-<id>，按标题前缀归类）
  { key: 'sanmingtonghui', top: 'ming', wpCategoryId: 72, titlePrefix: '三命通会' },
  { key: 'yuanhaiziping', top: 'ming', wpCategoryId: 71, titlePrefix: '渊海子平' },
  { key: 'shenfengtongkao', top: 'ming', wpCategoryId: 73, titlePrefix: '神峰通考' },
  { key: 'xingmingzongkuo', top: 'ming', wpCategoryId: 74, titlePrefix: '星命总括' },
  { key: 'dixiang', top: 'xiang', wpCategoryId: 63, slugPrefix: '4_1' },
  { key: 'renxiang', top: 'xiang', wpCategoryId: 64, slugPrefix: '4_2' },
  { key: 'xingxiang', top: 'xiang', wpCategoryId: 65, slugPrefix: '4_3' },
  { key: 'yijing', top: 'bu', wpCategoryId: 66, slugPrefix: '5_1' },
  { key: 'liuyao', top: 'bu', wpCategoryId: 67, slugPrefix: '5_2' },
  { key: 'meihuayishu', top: 'bu', wpCategoryId: 68, slugPrefix: '5_3' },
  { key: 'qimendunjia', top: 'bu', wpCategoryId: 69, slugPrefix: '5_4' },
  { key: 'daliuren', top: 'bu', wpCategoryId: 70, slugPrefix: '5_5' },
];

const CATEGORY_BY_KEY = new Map(DAOZANG_CATEGORIES.map((c) => [c.key, c]));

export function isDaozangCategoryKey(value: string | null | undefined): value is DaozangCategoryKey {
  return Boolean(value && CATEGORY_BY_KEY.has(value as DaozangCategoryKey));
}

export function getDaozangCategory(key: DaozangCategoryKey): DaozangCategory {
  const category = CATEGORY_BY_KEY.get(key);
  if (!category) throw new Error(`Unknown daozang category: ${key}`);
  return category;
}

export function categoriesOfTop(top: DaozangTopKey): DaozangCategory[] {
  return DAOZANG_CATEGORIES.filter((c) => c.top === top);
}

/**
 * 兜底归类：迁移 slug `docs/zh-cn/3_1_7` 的 `3_1` 编号段 → 分类。
 * 权威归类以 CMS `daozangCategory` 字段（源自 WP doc_category）为准。
 */
export function categoryFromArticleSlug(slug: string): DaozangCategory | null {
  const match = slug.match(/(?:^|\/)(\d+_\d+)_[^/]*$/);
  if (!match) return null;
  return DAOZANG_CATEGORIES.find((c) => c.slugPrefix === match[1]) ?? null;
}

/** 章节化全书：从标题「第 N 章」提取章号（类内排序兜底） */
export function chapterWeightFromTitle(title: string): number | null {
  const match = title.match(/第\s*(\d+)\s*[章回卷节]/);
  return match ? Number(match[1]) : null;
}

/** 章节化全书：标题前缀归类兜底（如「三命通会 – 第8章」） */
export function categoryFromArticleTitle(title: string): DaozangCategory | null {
  const clean = title.trim();
  return DAOZANG_CATEGORIES.find((c) => c.titlePrefix && clean.startsWith(c.titlePrefix)) ?? null;
}

type Classifiable = { slug: string; title?: string; daozangCategory?: string | null };

/** 单篇内容的归属分类：CMS 字段优先，slug 编号段、标题前缀依次兜底 */
export function resolveArticleCategory(item: Classifiable): DaozangCategory | null {
  if (isDaozangCategoryKey(item.daozangCategory)) return getDaozangCategory(item.daozangCategory);
  const bySlug = categoryFromArticleSlug(item.slug);
  if (bySlug) return bySlug;
  return item.title ? categoryFromArticleTitle(item.title) : null;
}

type Sortable = { title: string; sortWeight?: number | null };

/** 类内排序：sortWeight（缺省用标题章号）升序，均缺省排后，同权重按标题 */
export function compareArticles(a: Sortable, b: Sortable): number {
  const wa = a.sortWeight ?? chapterWeightFromTitle(a.title) ?? Number.MAX_SAFE_INTEGER;
  const wb = b.sortWeight ?? chapterWeightFromTitle(b.title) ?? Number.MAX_SAFE_INTEGER;
  if (wa !== wb) return wa - wb;
  return a.title.localeCompare(b.title, 'zh-Hans-CN');
}

/** 按分类分组（组内已排序），未能归类的内容归入 null 组 */
export function groupArticlesByCategory<T extends Classifiable & Sortable>(
  items: T[],
): { byCategory: Map<DaozangCategoryKey, T[]>; uncategorized: T[] } {
  const byCategory = new Map<DaozangCategoryKey, T[]>();
  const uncategorized: T[] = [];
  for (const item of items) {
    const category = resolveArticleCategory(item);
    if (!category) {
      uncategorized.push(item);
      continue;
    }
    const list = byCategory.get(category.key) ?? [];
    list.push(item);
    byCategory.set(category.key, list);
  }
  for (const list of byCategory.values()) list.sort(compareArticles);
  uncategorized.sort(compareArticles);
  return { byCategory, uncategorized };
}
