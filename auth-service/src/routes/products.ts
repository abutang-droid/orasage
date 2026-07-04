import { Router } from "express";
import { and, asc, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db/index.ts";
import { products } from "../db/schema.ts";
import { ELEMENT_TO_SKU, formatProduct, resolveProductLocale } from "../lib/product-format.ts";
import { resolveHomepageProducts } from "../lib/homepage-products.ts";

export const productsRouter = Router();

function localeFromRequest(req: { query: Record<string, unknown>; headers: Record<string, string | string[] | undefined> }): string {
  const cookieHeader = typeof req.headers.cookie === "string" ? req.headers.cookie : "";
  const cookieLocale = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith("NEXT_LOCALE=") || part.startsWith("orasage_shop_locale="))
    ?.split("=")[1];
  return resolveProductLocale({
    queryLocale: typeof req.query.locale === "string" ? req.query.locale : undefined,
    acceptLanguage: typeof req.headers["accept-language"] === "string" ? req.headers["accept-language"] : undefined,
    cookieLocale: cookieLocale ? decodeURIComponent(cookieLocale) : undefined,
  });
}

productsRouter.get("/", async (req, res) => {
  const locale = localeFromRequest(req);
  const category = typeof req.query.category === "string" ? req.query.category : undefined;
  const activeOnly = req.query.all !== "1";

  const conditions = [];
  if (activeOnly) conditions.push(eq(products.active, true));
  if (category && ["crystal", "report", "service"].includes(category)) {
    conditions.push(eq(products.category, category as "crystal" | "report" | "service"));
  }

  const rows = await db
    .select()
    .from(products)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(asc(products.sortOrder), asc(products.id));

  res.json({ products: rows.map((row) => formatProduct(row, { locale })), locale });
});

productsRouter.get("/homepage", async (_req, res) => {
  try {
    const data = await resolveHomepageProducts();
    res.json(data);
  } catch (err) {
    console.error("[products] homepage:", err);
    res.status(500).json({ error: "服务器内部错误" });
  }
});

productsRouter.get("/recommend/crystal", async (req, res) => {
  const element = typeof req.query.element === "string" ? req.query.element.trim() : "";
  const sku = ELEMENT_TO_SKU[element];
  if (!sku) {
    res.status(400).json({ error: "无效的五行元素", validElements: Object.keys(ELEMENT_TO_SKU) });
    return;
  }

  const [row] = await db.select().from(products).where(eq(products.sku, sku)).limit(1);
  if (!row || !row.active) {
    res.status(404).json({ error: "推荐商品不存在或已下架" });
    return;
  }

  res.json({
    element,
    sku: row.sku,
    product: formatProduct(row, { locale: localeFromRequest(req) }),
  });
});

productsRouter.get("/:sku", async (req, res) => {
  const locale = localeFromRequest(req);
  const sku = String(req.params.sku);
  const [row] = await db.select().from(products).where(eq(products.sku, sku)).limit(1);
  if (!row || (!row.active && req.query.all !== "1")) {
    res.status(404).json({ error: "商品不存在" });
    return;
  }
  res.json({ product: formatProduct(row, { locale }), locale });
});

const productBodySchema = z.object({
  sku: z.string().min(1).max(100),
  name: z.string().min(1).max(200),
  element: z.string().max(10).optional().nullable(),
  description: z.string().min(1).max(2000),
  priceCents: z.number().int().nonnegative(),
  priceCentsUsd: z.number().int().nonnegative().optional().nullable(),
  category: z.enum(["crystal", "report", "service"]),
  active: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

const productPatchSchema = productBodySchema.partial().omit({ sku: true });

export { productBodySchema, productPatchSchema };
