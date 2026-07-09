import { asc, eq, inArray } from "drizzle-orm";
import { db } from "../db/index.ts";
import {
  productCategories,
  productLinks,
  productTagGroups,
  productTagLinks,
  productTags,
} from "../db/schema.ts";
import { pickLocalized } from "./product-i18n.ts";

/* ── 分类（Q3：可配置 + 多语言）───────────────────────────── */

export type CategoryRow = typeof productCategories.$inferSelect;

let categoryCache: { rows: CategoryRow[]; expiry: number } | null = null;
const CACHE_MS = 60_000;

export async function listCategories(): Promise<CategoryRow[]> {
  return db
    .select()
    .from(productCategories)
    .orderBy(asc(productCategories.sortOrder), asc(productCategories.id));
}

export async function getCategoryLabelMap(): Promise<Map<string, Record<string, string>>> {
  if (!categoryCache || Date.now() >= categoryCache.expiry) {
    categoryCache = { rows: await listCategories(), expiry: Date.now() + CACHE_MS };
  }
  return new Map(categoryCache.rows.map((r) => [r.code, r.labelI18n]));
}

export function invalidateCategoryCache(): void {
  categoryCache = null;
}

export async function upsertCategory(input: {
  code: string;
  labelI18n: Record<string, string>;
  sortOrder?: number;
  active?: boolean;
}): Promise<CategoryRow> {
  const [row] = await db
    .insert(productCategories)
    .values({
      code: input.code,
      labelI18n: input.labelI18n,
      sortOrder: input.sortOrder ?? 0,
      active: input.active ?? true,
    })
    .onConflictDoUpdate({
      target: productCategories.code,
      set: {
        labelI18n: input.labelI18n,
        sortOrder: input.sortOrder ?? 0,
        active: input.active ?? true,
        updatedAt: new Date(),
      },
    })
    .returning();
  invalidateCategoryCache();
  return row;
}

/* ── 标签（R2）─────────────────────────────────────────────── */

export type TagGroupRow = typeof productTagGroups.$inferSelect;
export type TagRow = typeof productTags.$inferSelect;

export async function listTagGroups(): Promise<TagGroupRow[]> {
  return db
    .select()
    .from(productTagGroups)
    .orderBy(asc(productTagGroups.sortOrder), asc(productTagGroups.id));
}

export async function listTags(): Promise<TagRow[]> {
  return db
    .select()
    .from(productTags)
    .orderBy(asc(productTags.sortOrder), asc(productTags.id));
}

export async function upsertTagGroup(input: {
  code: string;
  labelI18n: Record<string, string>;
  sortOrder?: number;
}): Promise<TagGroupRow> {
  const [row] = await db
    .insert(productTagGroups)
    .values({ code: input.code, labelI18n: input.labelI18n, sortOrder: input.sortOrder ?? 0 })
    .onConflictDoUpdate({
      target: productTagGroups.code,
      set: { labelI18n: input.labelI18n, sortOrder: input.sortOrder ?? 0, updatedAt: new Date() },
    })
    .returning();
  return row;
}

export async function upsertTag(input: {
  groupId: number;
  code: string;
  labelI18n: Record<string, string>;
  sortOrder?: number;
  active?: boolean;
}): Promise<TagRow> {
  const [row] = await db
    .insert(productTags)
    .values({
      groupId: input.groupId,
      code: input.code,
      labelI18n: input.labelI18n,
      sortOrder: input.sortOrder ?? 0,
      active: input.active ?? true,
    })
    .onConflictDoUpdate({
      target: productTags.code,
      set: {
        groupId: input.groupId,
        labelI18n: input.labelI18n,
        sortOrder: input.sortOrder ?? 0,
        active: input.active ?? true,
        updatedAt: new Date(),
      },
    })
    .returning();
  return row;
}

export type ProductTagInfo = { id: number; code: string; label: string; groupCode: string };

/** 一批商品的标签映射（单查询避免 N+1；≤300 SKU 规模） */
export async function tagsForProducts(
  productIds: number[],
  locale = "zh-CN",
): Promise<Map<number, ProductTagInfo[]>> {
  const map = new Map<number, ProductTagInfo[]>();
  if (productIds.length === 0) return map;

  const links = await db
    .select()
    .from(productTagLinks)
    .where(inArray(productTagLinks.productId, productIds));
  if (links.length === 0) return map;

  const tagIds = [...new Set(links.map((l) => l.tagId))];
  const [tags, groups] = await Promise.all([
    db.select().from(productTags).where(inArray(productTags.id, tagIds)),
    listTagGroups(),
  ]);
  const groupById = new Map(groups.map((g) => [g.id, g]));
  const tagById = new Map(tags.map((t) => [t.id, t]));

  for (const link of links) {
    const tag = tagById.get(link.tagId);
    if (!tag || !tag.active) continue;
    const group = groupById.get(tag.groupId);
    let list = map.get(link.productId);
    if (!list) {
      list = [];
      map.set(link.productId, list);
    }
    list.push({
      id: tag.id,
      code: tag.code,
      label: pickLocalized(tag.labelI18n, locale, tag.code),
      groupCode: group?.code ?? "",
    });
  }
  return map;
}

/** 整体替换某商品的标签 */
export async function setProductTags(productId: number, tagIds: number[]): Promise<void> {
  await db.delete(productTagLinks).where(eq(productTagLinks.productId, productId));
  const unique = [...new Set(tagIds)].filter((id) => Number.isInteger(id) && id > 0);
  if (unique.length > 0) {
    await db.insert(productTagLinks).values(unique.map((tagId) => ({ productId, tagId })));
  }
}

export async function productIdsForTag(tagCode: string): Promise<Set<number>> {
  const tag = await db
    .select()
    .from(productTags)
    .where(eq(productTags.code, tagCode))
    .limit(1);
  if (!tag[0]) return new Set();
  const links = await db
    .select()
    .from(productTagLinks)
    .where(eq(productTagLinks.tagId, tag[0].id));
  return new Set(links.map((l) => l.productId));
}

/* ── 关联页面（R5）─────────────────────────────────────────── */

export type ProductLinkRow = typeof productLinks.$inferSelect;

export async function listProductLinks(sku: string): Promise<ProductLinkRow[]> {
  return db
    .select()
    .from(productLinks)
    .where(eq(productLinks.sku, sku))
    .orderBy(asc(productLinks.sortOrder), asc(productLinks.id));
}

export type ProductLinkInput = {
  kind: string;
  title: string;
  titleI18n?: Record<string, string> | null;
  url: string;
  sourceName?: string | null;
  locale?: string | null;
  active?: boolean;
};

/** 整体替换某 SKU 的关联页面 */
export async function setProductLinks(sku: string, links: ProductLinkInput[]): Promise<ProductLinkRow[]> {
  await db.delete(productLinks).where(eq(productLinks.sku, sku));
  const values = links
    .filter((l) => l.title.trim() && l.url.trim())
    .map((l, index) => ({
      sku,
      kind: l.kind || "media",
      title: l.title.trim(),
      titleI18n: l.titleI18n ?? null,
      url: l.url.trim(),
      sourceName: l.sourceName?.trim() || null,
      locale: l.locale?.trim() || null,
      sortOrder: index,
      active: l.active ?? true,
    }));
  if (values.length > 0) {
    await db.insert(productLinks).values(values);
  }
  return listProductLinks(sku);
}

export function formatProductLink(row: ProductLinkRow, locale = "zh-CN") {
  return {
    id: row.id,
    kind: row.kind,
    title: pickLocalized(row.titleI18n, locale, row.title),
    url: row.url,
    sourceName: row.sourceName,
    locale: row.locale,
    active: row.active,
  };
}
