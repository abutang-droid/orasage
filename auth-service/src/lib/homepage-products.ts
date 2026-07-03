import { and, asc, eq, inArray } from "drizzle-orm";
import { db } from "../db/index.ts";
import { homepageFeaturedProducts, products } from "../db/schema.ts";
import { CATEGORY_LABELS, formatProduct } from "./product-format.ts";

const MAX_HOMEPAGE_PRODUCTS = 6;

export async function listHomepageFeaturedSkus(): Promise<string[]> {
  const rows = await db
    .select({ sku: homepageFeaturedProducts.sku })
    .from(homepageFeaturedProducts)
    .orderBy(asc(homepageFeaturedProducts.sortOrder), asc(homepageFeaturedProducts.id));
  return rows.map((r) => r.sku);
}

export async function resolveHomepageProducts() {
  const featuredSkus = await listHomepageFeaturedSkus();

  let rows;
  if (featuredSkus.length > 0) {
    const catalog = await db
      .select()
      .from(products)
      .where(and(inArray(products.sku, featuredSkus), eq(products.active, true)));
    const bySku = new Map(catalog.map((p) => [p.sku, p]));
    rows = featuredSkus
      .map((sku) => bySku.get(sku))
      .filter((p): p is NonNullable<typeof p> => Boolean(p));
  } else {
    rows = await db
      .select()
      .from(products)
      .where(eq(products.active, true))
      .orderBy(asc(products.sortOrder), asc(products.id))
      .limit(MAX_HOMEPAGE_PRODUCTS);
  }

  const formatted = rows.map(formatProduct);
  const categorySet = new Set(formatted.map((p) => p.category));
  const categories = (["crystal", "report", "service"] as const)
    .filter((id) => categorySet.has(id))
    .map((id) => ({ id, label: CATEGORY_LABELS[id] ?? id }));

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
