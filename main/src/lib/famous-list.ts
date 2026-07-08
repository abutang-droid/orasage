import { decodeHtmlEntities, type FamousDoc } from '@/lib/cms';
import { FAMOUS_INDEX, type FamousCategory } from '@/lib/famous-index';
import { extractFamousCardMeta, nameFromTitle } from '@/lib/famous-meta';
import type { FamousCardData } from '@/components/famous/FamousPersonCard';

export type FamousListItem = FamousCardData & { category: FamousCategory };

export type FamousNeighborLink = Pick<FamousListItem, 'slug' | 'name'>;

export type FamousNeighbors = {
  prev: FamousNeighborLink | null;
  next: FamousNeighborLink | null;
  related: FamousNeighborLink[];
};

/** 跨语言 / 跨版本去重 + 元数据解析 + 拼音排序（列表页与详情页导航共用） */
export function buildFamousListItems(docs: FamousDoc[]): FamousListItem[] {
  const seen = new Set<string>();
  const items: FamousListItem[] = [];

  for (const doc of docs) {
    const indexed = FAMOUS_INDEX[doc.slug];
    if (indexed?.canonical === false) continue;
    const person = indexed?.person ?? doc.slug;
    if (seen.has(person)) continue;
    seen.add(person);

    const meta = doc.legacyHtml
      ? extractFamousCardMeta(doc.legacyHtml)
      : { name: null, birth: null, pillars: null, pattern: null };

    items.push({
      slug: doc.slug,
      name: meta.name ?? nameFromTitle(decodeHtmlEntities(doc.title)),
      description: indexed?.description,
      category: indexed?.category ?? 'other',
      birth: meta.birth,
      pillars: meta.pillars,
      pattern: meta.pattern,
      fallback: doc.fallback,
    });
  }

  const collator = new Intl.Collator('zh');
  return items.sort((a, b) => collator.compare(a.name, b.name));
}

function findListIndex(items: FamousListItem[], slug: string): number {
  let idx = items.findIndex((item) => item.slug === slug);
  if (idx >= 0) return idx;

  const person = FAMOUS_INDEX[slug]?.person;
  if (!person) return -1;
  return items.findIndex((item) => FAMOUS_INDEX[item.slug]?.person === person);
}

/** 同分类内上一位 / 下一位 + 最多 3 位相关人物（拼音序相邻） */
export function resolveFamousNeighbors(items: FamousListItem[], slug: string): FamousNeighbors | null {
  const idx = findListIndex(items, slug);
  if (idx < 0) return null;

  const current = items[idx]!;
  const categoryItems = items.filter((item) => item.category === current.category);
  const catIdx = categoryItems.findIndex((item) => item.slug === current.slug);
  if (catIdx < 0) return null;

  const prev = catIdx > 0 ? categoryItems[catIdx - 1]! : null;
  const next = catIdx < categoryItems.length - 1 ? categoryItems[catIdx + 1]! : null;

  const excluded = new Set([catIdx]);
  if (catIdx > 0) excluded.add(catIdx - 1);
  if (catIdx < categoryItems.length - 1) excluded.add(catIdx + 1);

  const related: FamousNeighborLink[] = [];
  for (let offset = 2; related.length < 3 && offset < categoryItems.length; offset++) {
    const after = catIdx + offset;
    if (after < categoryItems.length && !excluded.has(after)) {
      related.push(categoryItems[after]!);
      excluded.add(after);
    }
    if (related.length >= 3) break;
    const before = catIdx - offset;
    if (before >= 0 && !excluded.has(before)) {
      related.push(categoryItems[before]!);
      excluded.add(before);
    }
  }

  return {
    prev: prev ? { slug: prev.slug, name: prev.name } : null,
    next: next ? { slug: next.slug, name: next.name } : null,
    related: related.map(({ slug: s, name }) => ({ slug: s, name })),
  };
}
