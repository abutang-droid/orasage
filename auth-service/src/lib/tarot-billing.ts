import { and, asc, eq, inArray } from "drizzle-orm";
import { db } from "../db/index.ts";
import { products, tarotBillingConfig, tarotDailyRecommendProducts } from "../db/schema.ts";
import { formatProduct } from "./product-format.ts";

export const TAROT_BILLING_DEFAULTS = {
  dailyOverageSku: "tarot-daily-draw",
  threeCardReportSku: "report-tarot",
  threeCardBundleSku: "report-tarot-bundle",
} as const;

export type TarotBillingSkus = {
  dailyOverageSku: string;
  threeCardReportSku: string;
  threeCardBundleSku: string;
};

export async function getTarotBillingSkus(): Promise<TarotBillingSkus> {
  const rows = await db.select().from(tarotBillingConfig).where(eq(tarotBillingConfig.id, 1)).limit(1);
  const row = rows[0];
  return {
    dailyOverageSku: row?.dailyOverageSku ?? TAROT_BILLING_DEFAULTS.dailyOverageSku,
    threeCardReportSku: row?.threeCardReportSku ?? TAROT_BILLING_DEFAULTS.threeCardReportSku,
    threeCardBundleSku: row?.threeCardBundleSku ?? TAROT_BILLING_DEFAULTS.threeCardBundleSku,
  };
}

export async function setTarotBillingSkus(input: TarotBillingSkus): Promise<TarotBillingSkus> {
  const skus = [input.dailyOverageSku, input.threeCardReportSku, input.threeCardBundleSku];
  const existing = await db
    .select({ sku: products.sku })
    .from(products)
    .where(inArray(products.sku, skus));
  const valid = new Set(existing.map((r) => r.sku));
  const invalid = skus.filter((s) => !valid.has(s));
  if (invalid.length > 0) {
    throw new Error(`未知 SKU: ${invalid.join(", ")}`);
  }

  await db
    .insert(tarotBillingConfig)
    .values({
      id: 1,
      dailyOverageSku: input.dailyOverageSku,
      threeCardReportSku: input.threeCardReportSku,
      threeCardBundleSku: input.threeCardBundleSku,
    })
    .onConflictDoUpdate({
      target: tarotBillingConfig.id,
      set: {
        dailyOverageSku: input.dailyOverageSku,
        threeCardReportSku: input.threeCardReportSku,
        threeCardBundleSku: input.threeCardBundleSku,
        updatedAt: new Date(),
      },
    });

  return getTarotBillingSkus();
}

export async function listTarotDailyRecommendRows() {
  return db
    .select()
    .from(tarotDailyRecommendProducts)
    .orderBy(asc(tarotDailyRecommendProducts.sortOrder), asc(tarotDailyRecommendProducts.id));
}

export async function setTarotDailyRecommendSkus(skus: string[]) {
  const unique = [...new Set(skus.map((s) => s.trim()).filter(Boolean))];
  if (unique.length > 0) {
    const existing = await db
      .select({ sku: products.sku })
      .from(products)
      .where(inArray(products.sku, unique));
    const valid = new Set(existing.map((r) => r.sku));
    const invalid = unique.filter((s) => !valid.has(s));
    if (invalid.length > 0) {
      throw new Error(`未知 SKU: ${invalid.join(", ")}`);
    }
  }

  await db.delete(tarotDailyRecommendProducts);
  if (unique.length > 0) {
    await db.insert(tarotDailyRecommendProducts).values(
      unique.map((sku, index) => ({
        sku,
        sortOrder: index,
        active: true,
      })),
    );
  }
  return listTarotDailyRecommendRows();
}

export async function resolveTarotDailyRecommendProduct(seed: string, locale = "zh-CN") {
  const rows = await db
    .select()
    .from(tarotDailyRecommendProducts)
    .where(eq(tarotDailyRecommendProducts.active, true))
    .orderBy(asc(tarotDailyRecommendProducts.sortOrder), asc(tarotDailyRecommendProducts.id));

  if (rows.length === 0) return null;

  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  const pick = rows[hash % rows.length];
  const catalog = await db
    .select()
    .from(products)
    .where(and(eq(products.sku, pick.sku), eq(products.active, true)))
    .limit(1);
  if (!catalog[0]) return null;
  return formatProduct(catalog[0], { locale });
}

export async function getTarotBillingProducts(locale = "zh-CN") {
  const skus = await getTarotBillingSkus();
  const rows = await db
    .select()
    .from(products)
    .where(
      inArray(products.sku, [
        skus.dailyOverageSku,
        skus.threeCardReportSku,
        skus.threeCardBundleSku,
      ]),
    );
  const bySku = new Map(rows.map((r) => [r.sku, r]));
  const fmt = (sku: string) => {
    const row = bySku.get(sku);
    return row ? formatProduct(row, { locale }) : null;
  };
  return {
    skus,
    dailyOverage: fmt(skus.dailyOverageSku),
    threeCardReport: fmt(skus.threeCardReportSku),
    threeCardBundle: fmt(skus.threeCardBundleSku),
  };
}
