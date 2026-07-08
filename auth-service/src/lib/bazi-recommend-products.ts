import { inArray } from "drizzle-orm";
import { db } from "../db/index.ts";
import { baziElementRecommendations, products } from "../db/schema.ts";
import {
  currencyForLocale,
  formatShopPrice,
  resolvePriceCents,
  type ShopCurrency,
} from "../../../shared/shop-locale/index.ts";
import { ELEMENT_TO_SKU, formatProduct } from "./product-format.ts";

export const BAZI_ELEMENTS = ["木", "火", "土", "金", "水"] as const;
export type BaziElement = (typeof BAZI_ELEMENTS)[number];

const DEFAULT_ELEMENT_SKU: Record<BaziElement, string> = {
  木: "crystal-wood",
  火: "crystal-fire",
  土: "crystal-earth",
  金: "crystal-metal",
  水: "crystal-water",
};

export type BaziElementRecommendationRow = {
  element: BaziElement;
  sku: string;
  priceCents: number | null;
  priceCentsUsd: number | null;
};

export async function listBaziElementRecommendationRows(): Promise<BaziElementRecommendationRow[]> {
  const rows = await db.select().from(baziElementRecommendations);
  const byElement = new Map(rows.map((row) => [row.element, row]));
  return BAZI_ELEMENTS.map((element) => {
    const row = byElement.get(element);
    return {
      element,
      sku: row?.sku ?? DEFAULT_ELEMENT_SKU[element],
      priceCents: row?.priceCents ?? null,
      priceCentsUsd: row?.priceCentsUsd ?? null,
    };
  });
}

export async function listBaziElementRecommendationSkus(): Promise<Record<BaziElement, string>> {
  const rows = await listBaziElementRecommendationRows();
  return Object.fromEntries(rows.map((r) => [r.element, r.sku])) as Record<BaziElement, string>;
}

function applyRecommendPrice<T extends ReturnType<typeof formatProduct>>(
  product: T,
  override: { priceCents: number | null; priceCentsUsd: number | null },
  locale: string,
) {
  if (override.priceCents == null && override.priceCentsUsd == null) {
    return product;
  }
  const currency: ShopCurrency = currencyForLocale(locale);
  const priceCents = override.priceCents ?? product.priceCents;
  const priceCentsUsd = override.priceCentsUsd ?? product.priceCentsUsd;
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

export async function resolveBaziElementRecommendations(locale = "zh-CN") {
  const configRows = await listBaziElementRecommendationRows();
  const skuMap = Object.fromEntries(configRows.map((r) => [r.element, r.sku])) as Record<BaziElement, string>;
  const skus = [...new Set(Object.values(skuMap))];
  const catalog = skus.length > 0
    ? await db
      .select()
      .from(products)
      .where(inArray(products.sku, skus))
    : [];
  const bySku = new Map(catalog.map((p) => [p.sku, p]));

  const recommendations: Record<string, ReturnType<typeof formatProduct> | null> = {};
  const priceOverrides: Record<string, { priceCents: number | null; priceCentsUsd: number | null }> = {};
  for (const { element, sku, priceCents, priceCentsUsd } of configRows) {
    const row = sku ? bySku.get(sku) : undefined;
    const base = row && row.active ? formatProduct(row, { locale }) : null;
    recommendations[element] = base
      ? applyRecommendPrice(base, { priceCents, priceCentsUsd }, locale)
      : null;
    priceOverrides[element] = { priceCents, priceCentsUsd };
  }

  return { elements: BAZI_ELEMENTS, skuMap, priceOverrides, recommendations };
}

export async function resolveBaziRecommendForElement(element: string, locale = "zh-CN") {
  const data = await resolveBaziElementRecommendations(locale);
  const rec = data.recommendations[element] ?? null;
  return { element, product: rec, skuMap: data.skuMap };
}

export type BaziElementRecommendationInput = {
  sku: string;
  priceCents?: number | null;
  priceCentsUsd?: number | null;
};

export async function setBaziElementRecommendations(
  input: Partial<Record<BaziElement, BaziElementRecommendationInput>>,
) {
  const entries = BAZI_ELEMENTS
    .map((element) => {
      const raw = input[element];
      const sku = raw?.sku?.trim();
      if (!raw || !sku) return null;
      const priceCents = raw.priceCents ?? null;
      const priceCentsUsd = raw.priceCentsUsd ?? null;
      return { element, sku, priceCents, priceCentsUsd };
    })
    .filter((e): e is {
      element: BaziElement;
      sku: string;
      priceCents: number | null;
      priceCentsUsd: number | null;
    } => Boolean(e));

  if (entries.length > 0) {
    const skus = entries.map((e) => e.sku);
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

  for (const { element, sku, priceCents, priceCentsUsd } of entries) {
    await db
      .insert(baziElementRecommendations)
      .values({ element, sku, priceCents, priceCentsUsd })
      .onConflictDoUpdate({
        target: baziElementRecommendations.element,
        set: { sku, priceCents, priceCentsUsd, updatedAt: new Date() },
      });
  }

  return resolveBaziElementRecommendations();
}

/** @deprecated use setBaziElementRecommendations */
export async function setBaziElementRecommendationSkus(
  input: Partial<Record<BaziElement, string>>,
) {
  const mapped: Partial<Record<BaziElement, BaziElementRecommendationInput>> = {};
  for (const element of BAZI_ELEMENTS) {
    const sku = input[element];
    if (sku) mapped[element] = { sku };
  }
  return setBaziElementRecommendations(mapped);
}

/** 从五行分布取最弱元素（与 bazi recommendBracelet 一致） */
export function deficientWuXingElement(wuXing: Record<string, number>): BaziElement | null {
  const entries = Object.entries(wuXing).filter(([, v]) => Number.isFinite(v));
  if (entries.length === 0) return null;
  let minWx = entries[0][0];
  let minCount = entries[0][1];
  for (const [wx, count] of entries) {
    if (count < minCount) {
      minWx = wx;
      minCount = count;
    }
  }
  return BAZI_ELEMENTS.includes(minWx as BaziElement) ? (minWx as BaziElement) : null;
}
