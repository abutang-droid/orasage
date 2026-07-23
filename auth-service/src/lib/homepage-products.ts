import { and, asc, eq, inArray } from "drizzle-orm";
import { db } from "../db/index.ts";
import { homepageFeaturedProducts, products } from "../db/schema.ts";
import { CATEGORY_LABELS, formatProduct } from "./product-format.ts";
import { resolveComboMetaMap } from "./product-combos.ts";
import { detectShopLocale } from "../../../shared/shop-locale/index.ts";

const MAX_HOMEPAGE_PRODUCTS = 6;

function categoryLabel(category: string, locale: string): string {
  const labels = CATEGORY_LABELS[category];
  if (!labels) return category;
  const norm = detectShopLocale({ queryLocale: locale });
  return labels[norm] ?? labels["zh-CN"] ?? labels.en ?? category;
}

export async function listHomepageFeaturedSkus(): Promise<string[]> {
  const rows = await db
    .select({ sku: homepageFeaturedProducts.sku })
    .from(homepageFeaturedProducts)
    .orderBy(asc(homepageFeaturedProducts.sortOrder), asc(homepageFeaturedProducts.id));
  return rows.map((r) => r.sku);
}

export async function resolveHomepageProducts(locale = "zh-CN") {
  const featuredSkus = await listHomepageFeaturedSkus();

  let rows;
  // 首页与目录一致：仅 active + visibility=public（计费 / 直链商品不得上首页）
  const publicActive = and(eq(products.active, true), eq(products.visibility, "public"));

  if (featuredSkus.length > 0) {
    const catalog = await db
      .select()
      .from(products)
      .where(and(inArray(products.sku, featuredSkus), publicActive));
    const bySku = new Map(catalog.map((p) => [p.sku, p]));
    rows = featuredSkus
      .map((sku) => bySku.get(sku))
      .filter((p): p is NonNullable<typeof p> => Boolean(p));
  } else {
    rows = await db
      .select()
      .from(products)
      .where(publicActive)
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

export async function setHomepageFeaturedSkus(skus: string[]) {
  const unique = [...new Set(skus.map((s) => s.trim()).filter(Boolean))].slice(0, MAX_HOMEPAGE_PRODUCTS);
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

  await db.delete(homepageFeaturedProducts);
  if (unique.length > 0) {
    await db.insert(homepageFeaturedProducts).values(
      unique.map((sku, index) => ({ sku, sortOrder: index })),
    );
  }
}
