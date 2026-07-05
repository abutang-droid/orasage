import { inArray } from "drizzle-orm";
import { db } from "../db/index.ts";
import { baziElementRecommendations, products } from "../db/schema.ts";
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

export async function listBaziElementRecommendationSkus(): Promise<Record<BaziElement, string>> {
  const rows = await db.select().from(baziElementRecommendations);
  const map = { ...DEFAULT_ELEMENT_SKU };
  for (const row of rows) {
    if (BAZI_ELEMENTS.includes(row.element as BaziElement)) {
      map[row.element as BaziElement] = row.sku;
    }
  }
  return map;
}

export async function resolveBaziElementRecommendations(locale = "zh-CN") {
  const skuMap = await listBaziElementRecommendationSkus();
  const skus = [...new Set(Object.values(skuMap))];
  const catalog = skus.length > 0
    ? await db
      .select()
      .from(products)
      .where(inArray(products.sku, skus))
    : [];
  const bySku = new Map(catalog.map((p) => [p.sku, p]));

  const recommendations: Record<string, ReturnType<typeof formatProduct> | null> = {};
  for (const element of BAZI_ELEMENTS) {
    const sku = skuMap[element] ?? ELEMENT_TO_SKU[element];
    const row = sku ? bySku.get(sku) : undefined;
    recommendations[element] = row && row.active ? formatProduct(row, { locale }) : null;
  }

  return { elements: BAZI_ELEMENTS, skuMap, recommendations };
}

export async function setBaziElementRecommendationSkus(
  input: Partial<Record<BaziElement, string>>,
) {
  const entries = BAZI_ELEMENTS
    .map((element) => ({ element, sku: input[element]?.trim() }))
    .filter((e): e is { element: BaziElement; sku: string } => Boolean(e.sku));

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

  for (const { element, sku } of entries) {
    await db
      .insert(baziElementRecommendations)
      .values({ element, sku })
      .onConflictDoUpdate({
        target: baziElementRecommendations.element,
        set: { sku, updatedAt: new Date() },
      });
  }

  return resolveBaziElementRecommendations();
}
