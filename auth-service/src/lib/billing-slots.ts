import { and, asc, eq, inArray } from "drizzle-orm";
import { db } from "../db/index.ts";
import { appBillingSlots, products } from "../db/schema.ts";
import {
  currencyForLocale,
  formatShopPrice,
  resolvePriceCents,
  type ShopCurrency,
} from "../../../shared/shop-locale/index.ts";
import { formatProduct } from "./product-format.ts";

export const BILLING_APPS = ["bazi", "ziwei", "tarot", "main", "shop"] as const;
export type BillingApp = (typeof BILLING_APPS)[number];

export type BillingSlotRow = typeof appBillingSlots.$inferSelect;

export type BillingSlotEntry = {
  sku: string;
  priceOverrideCents?: number | null;
  priceOverrideUsdCents?: number | null;
  active?: boolean;
};

function applyOverride<T extends ReturnType<typeof formatProduct>>(
  product: T,
  slot: Pick<BillingSlotRow, "priceOverrideCents" | "priceOverrideUsdCents">,
  locale: string,
) {
  if (slot.priceOverrideCents == null && slot.priceOverrideUsdCents == null) {
    return product;
  }
  const currency: ShopCurrency = currencyForLocale(locale);
  const priceCents = slot.priceOverrideCents ?? product.priceCents;
  const priceCentsUsd = slot.priceOverrideUsdCents ?? product.priceCentsUsd;
  const resolvedCents = resolvePriceCents({ priceCents, priceCentsUsd }, currency);
  return {
    ...product,
    priceCents,
    priceCentsUsd,
    priceCentsResolved: resolvedCents,
    priceDisplay: formatShopPrice(resolvedCents, currency),
    priceDisplayCny: formatShopPrice(priceCents, "cny"),
    priceDisplayUsd: formatShopPrice(
      resolvePriceCents({ priceCents, priceCentsUsd }, "usd"),
      "usd",
    ),
    recommendPriceOverride: true,
  };
}

function seedHash(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return hash;
}

async function activeSlotRows(app: string, key: string): Promise<BillingSlotRow[]> {
  return db
    .select()
    .from(appBillingSlots)
    .where(
      and(
        eq(appBillingSlots.appSource, app),
        eq(appBillingSlots.slotKey, key),
        eq(appBillingSlots.active, true),
      ),
    )
    .orderBy(asc(appBillingSlots.sortOrder), asc(appBillingSlots.id));
}

/**
 * 解析计费槽位 → 商品。
 * 同一 slotKey 配置多行时：有 seed 按 hash 轮换，无 seed 取第一行。
 */
export async function resolveBillingSlot(
  app: string,
  key: string,
  options?: { locale?: string; seed?: string },
) {
  const locale = options?.locale ?? "zh-CN";
  const rows = await activeSlotRows(app, key);
  if (rows.length === 0) return null;

  const pick = options?.seed
    ? rows[seedHash(options.seed) % rows.length]
    : rows[0];

  const catalog = await db
    .select()
    .from(products)
    .where(and(eq(products.sku, pick.sku), eq(products.active, true)))
    .limit(1);
  if (!catalog[0]) return null;

  const product = applyOverride(formatProduct(catalog[0], { locale }), pick, locale);
  return {
    app,
    key,
    sku: pick.sku,
    product,
  };
}

/** 一个 App 的全部槽位（含商品解析），供付费墙一次拉取 */
export async function resolveBillingSlotsForApp(app: string, locale = "zh-CN") {
  const rows = await db
    .select()
    .from(appBillingSlots)
    .where(and(eq(appBillingSlots.appSource, app), eq(appBillingSlots.active, true)))
    .orderBy(asc(appBillingSlots.slotKey), asc(appBillingSlots.sortOrder), asc(appBillingSlots.id));

  const skus = [...new Set(rows.map((r) => r.sku))];
  const catalog = skus.length > 0
    ? await db.select().from(products).where(inArray(products.sku, skus))
    : [];
  const bySku = new Map(catalog.map((p) => [p.sku, p]));

  const slots: Record<string, Array<{
    sku: string;
    priceOverrideCents: number | null;
    priceOverrideUsdCents: number | null;
    product: ReturnType<typeof formatProduct> | null;
  }>> = {};

  for (const row of rows) {
    const raw = bySku.get(row.sku);
    const product = raw && raw.active
      ? applyOverride(formatProduct(raw, { locale }), row, locale)
      : null;
    (slots[row.slotKey] ??= []).push({
      sku: row.sku,
      priceOverrideCents: row.priceOverrideCents,
      priceOverrideUsdCents: row.priceOverrideUsdCents,
      product,
    });
  }

  return { app, locale, slots };
}

/** admin：全部槽位原始行 */
export async function listAllBillingSlots() {
  return db
    .select()
    .from(appBillingSlots)
    .orderBy(
      asc(appBillingSlots.appSource),
      asc(appBillingSlots.slotKey),
      asc(appBillingSlots.sortOrder),
      asc(appBillingSlots.id),
    );
}

/** admin：整体替换某 (app, slotKey) 的槽位行 */
export async function setBillingSlotEntries(
  app: string,
  key: string,
  entries: BillingSlotEntry[],
) {
  const skus = [...new Set(entries.map((e) => e.sku.trim()).filter(Boolean))];
  if (skus.length > 0) {
    const existing = await db
      .select({ sku: products.sku })
      .from(products)
      .where(inArray(products.sku, skus));
    const valid = new Set(existing.map((r) => r.sku));
    const invalid = skus.filter((s) => !valid.has(s));
    if (invalid.length > 0) {
      throw new Error(`未知 SKU: ${invalid.join(", ")}`);
    }
  }

  await db
    .delete(appBillingSlots)
    .where(and(eq(appBillingSlots.appSource, app), eq(appBillingSlots.slotKey, key)));

  const values = entries
    .filter((e) => e.sku.trim())
    .map((e, index) => ({
      appSource: app,
      slotKey: key,
      sku: e.sku.trim(),
      priceOverrideCents: e.priceOverrideCents ?? null,
      priceOverrideUsdCents: e.priceOverrideUsdCents ?? null,
      sortOrder: index,
      active: e.active ?? true,
    }));
  if (values.length > 0) {
    await db.insert(appBillingSlots).values(values);
  }

  return activeSlotRows(app, key);
}

/** admin：删除整个 (app, slotKey) */
export async function deleteBillingSlotKey(app: string, key: string) {
  await db
    .delete(appBillingSlots)
    .where(and(eq(appBillingSlots.appSource, app), eq(appBillingSlots.slotKey, key)));
}
