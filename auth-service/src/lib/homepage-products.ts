import { and, asc, eq, inArray } from "drizzle-orm";
import { db } from "../db/index.ts";
import { homepageFeaturedProducts, products } from "../db/schema.ts";
import { CATEGORY_LABELS, formatProduct } from "./product-format.ts";
import { resolveComboMetaMap } from "./product-combos.ts";
import { detectShopLocale } from "../../../shared/shop-locale/index.ts";
import { PLATFORM_PARTNER_SLUG } from "./partner-scope.ts";

const MAX_HOMEPAGE_PRODUCTS = 6;

function categoryLabel(category: string, locale: string): string {
  const labels = CATEGORY_LABELS[category];
  if (!labels) return category;
  const norm = detectShopLocale({ queryLocale: locale });
  return labels[norm] ?? labels["zh-CN"] ?? labels.en ?? category;
}

export async function listHomepageFeaturedSkus(
  partnerId: string = PLATFORM_PARTNER_SLUG,
): Promise<string[]> {
  const rows = await db
    .select({ sku: homepageFeaturedProducts.sku })
    .from(homepageFeaturedProducts)
    .where(eq(homepageFeaturedProducts.partnerId, partnerId))
    .orderBy(asc(homepageFeaturedProducts.sortOrder), asc(homepageFeaturedProducts.id));
  return rows.map((r) => r.sku);
}

export async function resolveHomepageProducts(
  locale = "zh-CN",
  partnerId: string = PLATFORM_PARTNER_SLUG,
) {
  const featuredSkus = await listHomepageFeaturedSkus(partnerId);

  let rows;
  if (featuredSkus.length > 0) {
    const catalog = await db
      .select()
      .from(products)
      .where(and(
        inArray(products.sku, featuredSkus),
        eq(products.active, true),
        eq(products.partnerId, partnerId),
      ));
    const bySku = new Map(catalog.map((p) => [p.sku, p]));
    rows = featuredSkus
      .map((sku) => bySku.get(sku))
      .filter((p): p is NonNullable<typeof p> => Boolean(p));
  } else {
    rows = await db
      .select()
      .from(products)
      .where(and(eq(products.active, true), eq(products.partnerId, partnerId)))
      .orderBy(asc(products.sortOrder), asc(products.id))
      .limit(MAX_HOMEPAGE_PRODUCTS);
  }

  const comboMetaMap = await resolveComboMetaMap(rows.filter((r) => r.kind === "combo"), locale);
  const formatted = rows.map((row) =>
    formatProduct(row, { locale, comboMeta: comboMetaMap.get(row.sku) ?? null }),
  );
  const categorySet = new Set(formatted.map((p) => p.category));
  const categories = (["crystal", "report", "service"] as const)
    .filter((id) => categorySet.has(id))
    .map((id) => ({ id, label: categoryLabel(id, locale) }));

  return { products: formatted, categories };
}

export async function setHomepageFeaturedSkus(
  skus: string[],
  partnerId: string = PLATFORM_PARTNER_SLUG,
) {
  const unique = [...new Set(skus.map((s) => s.trim()).filter(Boolean))].slice(0, MAX_HOMEPAGE_PRODUCTS);
  if (unique.length > 0) {
    const existing = await db
      .select({ sku: products.sku })
      .from(products)
      .where(and(inArray(products.sku, unique), eq(products.partnerId, partnerId)));
    const valid = new Set(existing.map((r) => r.sku));
    const invalid = unique.filter((s) => !valid.has(s));
    if (invalid.length > 0) {
      throw new Error(`未知 SKU: ${invalid.join(", ")}`);
    }
  }

  await db.delete(homepageFeaturedProducts).where(eq(homepageFeaturedProducts.partnerId, partnerId));
  if (unique.length > 0) {
    await db.insert(homepageFeaturedProducts).values(
      unique.map((sku, index) => ({ partnerId, sku, sortOrder: index })),
    );
  }
}
