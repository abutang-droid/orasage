import { asc, eq, inArray } from "drizzle-orm";
import { db } from "../db/index.ts";
import { productComboItems, products } from "../db/schema.ts";
import type { ProductRow } from "./product-format.ts";
import { inferRequiresShipping, inferRequiresWristSize } from "../../../shared/shop-fulfillment/index.ts";
import { pickLocalized } from "./product-i18n.ts";
import {
  normalizeComboItemRole,
  type ComboItemRole,
} from "../../../shared/shop-combo/crystal-role.ts";

export type ComboItemInput = {
  componentSku: string;
  quantity?: number;
  role?: ComboItemRole | string;
};

export type ComboItemRow = typeof productComboItems.$inferSelect;

export type ResolvedComboItem = {
  componentSku: string;
  quantity: number;
  sortOrder: number;
  role: ComboItemRole;
  name: string;
  kind: string;
  category: string;
  priceCents: number;
  priceCentsUsd: number | null;
  requiresShipping: boolean;
  requiresWristSize: boolean;
};

export type ComboMeta = {
  items: ResolvedComboItem[];
  componentSumCents: number;
  componentSumUsdCents: number | null;
  useComponentSum: boolean;
  requiresShipping: boolean;
  requiresWristSize: boolean;
  hasElementCrystal: boolean;
};

const COMPONENT_KINDS = new Set(["standard", "digital", "service"]);

type ComboItemLike = {
  componentSku: string;
  quantity: number;
  sortOrder?: number;
  role?: string | null;
};

export async function listComboItems(comboSku: string): Promise<ComboItemRow[]> {
  return db
    .select()
    .from(productComboItems)
    .where(eq(productComboItems.comboSku, comboSku))
    .orderBy(asc(productComboItems.sortOrder), asc(productComboItems.id));
}

export async function listComboItemsForSkus(comboSkus: string[]): Promise<Map<string, ComboItemRow[]>> {
  const map = new Map<string, ComboItemRow[]>();
  if (comboSkus.length === 0) return map;

  const rows = await db
    .select()
    .from(productComboItems)
    .where(inArray(productComboItems.comboSku, comboSkus))
    .orderBy(asc(productComboItems.sortOrder), asc(productComboItems.id));

  for (const row of rows) {
    (map.get(row.comboSku) ?? map.set(row.comboSku, []).get(row.comboSku)!).push(row);
  }
  return map;
}

async function loadComponentProducts(skus: string[]): Promise<Map<string, ProductRow>> {
  if (skus.length === 0) return new Map();
  const rows = await db.select().from(products).where(inArray(products.sku, skus));
  return new Map(rows.map((r) => [r.sku, r]));
}

function resolveItemFulfillment(component: ProductRow) {
  const fulfillment = {
    category: component.category,
    sku: component.sku,
    requiresShipping: component.requiresShipping,
  };
  return {
    requiresShipping: inferRequiresShipping(fulfillment),
    requiresWristSize: inferRequiresWristSize(fulfillment),
  };
}

export function buildComboMeta(
  combo: ProductRow,
  itemRows: ComboItemLike[],
  componentBySku: Map<string, ProductRow>,
  locale = "zh-CN",
): ComboMeta | null {
  if (combo.kind !== "combo" || itemRows.length === 0) return null;

  const items: ResolvedComboItem[] = [];
  let componentSumCents = 0;
  let componentSumUsdCents = 0;
  let hasElementCrystal = false;

  for (const [index, row] of itemRows.entries()) {
    const component = componentBySku.get(row.componentSku);
    if (!component) continue;
    const qty = Math.max(1, row.quantity);
    const role = normalizeComboItemRole(row.role);
    if (role === "element_crystal") hasElementCrystal = true;
    const fulfillment = resolveItemFulfillment(component);
    // 列价统一为 USDT 分（双列同义）
    const usdt = component.priceCentsUsd != null && component.priceCentsUsd > 0
      ? component.priceCentsUsd
      : component.priceCents;
    componentSumCents += usdt * qty;
    componentSumUsdCents += usdt * qty;

    const displayName = role === "element_crystal"
      ? `五行推荐水晶（变量 · 参考 ${pickLocalized(component.nameI18n, locale, component.name)}）`
      : pickLocalized(component.nameI18n, locale, component.name);

    items.push({
      componentSku: row.componentSku,
      quantity: qty,
      sortOrder: row.sortOrder ?? index,
      role,
      name: displayName,
      kind: component.kind,
      category: component.category,
      priceCents: usdt,
      priceCentsUsd: usdt,
      requiresShipping: fulfillment.requiresShipping,
      requiresWristSize: fulfillment.requiresWristSize,
    });
  }

  if (items.length === 0) return null;

  return {
    items,
    componentSumCents,
    componentSumUsdCents,
    useComponentSum: combo.comboUseComponentSum,
    requiresShipping: items.some((i) => i.requiresShipping),
    requiresWristSize: items.some((i) => i.requiresWristSize),
    hasElementCrystal,
  };
}

export async function resolveComboMeta(combo: ProductRow, locale = "zh-CN"): Promise<ComboMeta | null> {
  if (combo.kind !== "combo") return null;
  const itemRows = await listComboItems(combo.sku);
  const componentSkus = [...new Set(itemRows.map((r) => r.componentSku))];
  const componentBySku = await loadComponentProducts(componentSkus);
  return buildComboMeta(combo, itemRows, componentBySku, locale);
}

export async function resolveComboMetaMap(
  comboProducts: ProductRow[],
  locale = "zh-CN",
): Promise<Map<string, ComboMeta>> {
  const map = new Map<string, ComboMeta>();
  if (comboProducts.length === 0) return map;

  const comboSkus = comboProducts.map((p) => p.sku);
  const itemsByCombo = await listComboItemsForSkus(comboSkus);
  const allComponentSkus = [
    ...new Set([...itemsByCombo.values()].flat().map((r) => r.componentSku)),
  ];
  const componentBySku = await loadComponentProducts(allComponentSkus);

  for (const combo of comboProducts) {
    const meta = buildComboMeta(combo, itemsByCombo.get(combo.sku) ?? [], componentBySku, locale);
    if (meta) map.set(combo.sku, meta);
  }
  return map;
}

export async function validateComboItems(comboSku: string, items: ComboItemInput[]): Promise<string | null> {
  if (items.length === 0) return "组合商品至少包含一个子商品";
  if (items.length > 20) return "组合子商品不能超过 20 个";

  const seen = new Set<string>();
  let elementCrystalCount = 0;
  for (const item of items) {
    const sku = item.componentSku.trim();
    const role = normalizeComboItemRole(item.role);
    if (!sku) return "子商品 SKU 不能为空";
    if (sku === comboSku) return "组合不能包含自身";
    if (seen.has(sku)) return `子商品 SKU 重复：${sku}`;
    seen.add(sku);
    const qty = item.quantity ?? 1;
    if (!Number.isInteger(qty) || qty < 1 || qty > 99) return `子商品 ${sku} 数量无效`;
    if (role === "element_crystal") elementCrystalCount += 1;
  }
  if (elementCrystalCount > 1) return "五行推荐水晶变量子项最多一个";

  const componentSkus = [...seen];
  const rows = await db.select().from(products).where(inArray(products.sku, componentSkus));
  const bySku = new Map(rows.map((r) => [r.sku, r]));

  for (const item of items) {
    const sku = item.componentSku.trim();
    const role = normalizeComboItemRole(item.role);
    const row = bySku.get(sku);
    if (!row) return `未知子商品 SKU：${sku}`;
    if (!row.active) return `子商品已下架：${sku}`;
    if (row.kind === "combo") return `不能嵌套组合商品：${sku}`;
    if (!COMPONENT_KINDS.has(row.kind)) return `子商品形态不支持：${sku}`;
    if (role === "element_crystal") {
      if (row.category !== "crystal" && !sku.startsWith("crystal-")) {
        return `五行推荐变量须选择水晶类 SKU 作为参考/回退：${sku}`;
      }
    }
  }

  return null;
}

export async function setComboItems(comboSku: string, items: ComboItemInput[]) {
  const err = await validateComboItems(comboSku, items);
  if (err) throw new Error(err);

  await db.delete(productComboItems).where(eq(productComboItems.comboSku, comboSku));

  const values = items.map((item, index) => ({
    comboSku,
    componentSku: item.componentSku.trim(),
    quantity: Math.max(1, item.quantity ?? 1),
    sortOrder: index,
    role: normalizeComboItemRole(item.role),
  }));

  if (values.length > 0) {
    await db.insert(productComboItems).values(values);
  }

  const [combo] = await db.select().from(products).where(eq(products.sku, comboSku)).limit(1);
  if (!combo) return [];

  const componentBySku = await loadComponentProducts(values.map((v) => v.componentSku));
  const meta = buildComboMeta(combo, values, componentBySku);
  if (meta) {
    await db
      .update(products)
      .set({
        requiresShipping: meta.requiresShipping,
        updatedAt: new Date(),
      })
      .where(eq(products.sku, comboSku));
  }

  return listComboItems(comboSku);
}

export async function syncComboDerivedFields(comboSku: string) {
  const [combo] = await db.select().from(products).where(eq(products.sku, comboSku)).limit(1);
  if (!combo || combo.kind !== "combo") return;

  const meta = await resolveComboMeta(combo);
  if (!meta) return;

  const updates: Record<string, unknown> = {
    requiresShipping: meta.requiresShipping,
    updatedAt: new Date(),
  };

  if (combo.comboUseComponentSum) {
    const usdtSum = meta.componentSumUsdCents ?? meta.componentSumCents;
    updates.priceCents = usdtSum;
    updates.priceCentsUsd = usdtSum;
  }

  await db.update(products).set(updates).where(eq(products.sku, comboSku));
}
