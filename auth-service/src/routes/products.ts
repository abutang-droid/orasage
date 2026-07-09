import { Router } from "express";
import { and, asc, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db/index.ts";
import { products } from "../db/schema.ts";
import { formatProduct, resolveProductLocale } from "../lib/product-format.ts";
import { resolveHomepageProducts } from "../lib/homepage-products.ts";
import { getCrystalContent, getShopPublicConfig } from "../lib/shop-settings.ts";
import {
  formatProductLink,
  getCategoryLabelMap,
  listCategories,
  listProductLinks,
  productIdsForTag,
  tagsForProducts,
} from "../lib/catalog.ts";
import { pickLocalized } from "../lib/product-i18n.ts";
import { resolveComboMetaMap } from "../lib/product-combos.ts";
import type { ProductRow } from "../lib/product-format.ts";

export const productsRouter = Router();

async function formatProductsWithCombos(
  rows: ProductRow[],
  options: { locale: string; categoryLabels?: Awaited<ReturnType<typeof getCategoryLabelMap>>; tagMap?: Map<number, Array<{ id: number; code: string; label: string; groupCode: string }>> },
) {
  const comboRows = rows.filter((r) => r.kind === "combo");
  const comboMetaMap = await resolveComboMetaMap(comboRows, options.locale);
  return rows.map((row) =>
    formatProduct(row, {
      locale: options.locale,
      categoryLabels: options.categoryLabels,
      tags: options.tagMap?.get(row.id) ?? [],
      comboMeta: comboMetaMap.get(row.sku) ?? null,
    }),
  );
}

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

/**
 * 商品目录。默认仅返回 active + visibility=public（R6：计费商品不入目录）。
 * ?all=1 返回全部（admin 页面数据经 /api/admin/products，此参数仅内部调试）。
 */
productsRouter.get("/", async (req, res) => {
  const locale = localeFromRequest(req);
  const category = typeof req.query.category === "string" ? req.query.category : undefined;
  const tag = typeof req.query.tag === "string" ? req.query.tag.trim() : undefined;
  const includeAll = req.query.all === "1";

  const conditions = [];
  if (!includeAll) {
    conditions.push(eq(products.active, true));
    conditions.push(eq(products.visibility, "public"));
  }
  if (category) {
    conditions.push(eq(products.category, category));
  }

  let rows = await db
    .select()
    .from(products)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(asc(products.sortOrder), asc(products.id));

  if (tag) {
    const ids = await productIdsForTag(tag);
    rows = rows.filter((row) => ids.has(row.id));
  }

  const [categoryLabels, tagMap] = await Promise.all([
    getCategoryLabelMap(),
    tagsForProducts(rows.map((r) => r.id), locale),
  ]);

  res.json({
    products: await formatProductsWithCombos(rows, { locale, categoryLabels, tagMap }),
    locale,
  });
});

/** 前台分类清单（Q3：可配置 + 多语言） */
productsRouter.get("/categories", async (req, res) => {
  const locale = localeFromRequest(req);
  try {
    const rows = await listCategories();
    res.json({
      categories: rows
        .filter((r) => r.active)
        .map((r) => ({
          code: r.code,
          label: pickLocalized(r.labelI18n, locale, r.code),
        })),
      locale,
    });
  } catch (err) {
    console.error("[products] categories:", err);
    res.status(500).json({ error: "服务器内部错误" });
  }
});

productsRouter.get("/homepage", async (req, res) => {
  try {
    const locale = localeFromRequest(req);
    const data = await resolveHomepageProducts(locale);
    res.json(data);
  } catch (err) {
    console.error("[products] homepage:", err);
    res.status(500).json({ error: "服务器内部错误" });
  }
});

productsRouter.get("/shop-config", async (_req, res) => {
  try {
    const config = await getShopPublicConfig();
    res.json(config);
  } catch (err) {
    console.error("[products] shop-config:", err);
    res.status(500).json({ error: "服务器内部错误" });
  }
});

productsRouter.get("/crystal-content", async (_req, res) => {
  try {
    const content = await getCrystalContent();
    res.json({ content });
  } catch (err) {
    console.error("[products] crystal-content:", err);
    res.status(500).json({ error: "服务器内部错误" });
  }
});

/**
 * 单商品详情。app_only/unlisted 商品仍可按 SKU 取（结账深链、App 计费需要），
 * 仅目录列表隐藏（R6）。
 */
productsRouter.get("/:sku", async (req, res) => {
  const locale = localeFromRequest(req);
  const sku = String(req.params.sku);
  const [row] = await db.select().from(products).where(eq(products.sku, sku)).limit(1);
  if (!row || (!row.active && req.query.all !== "1")) {
    res.status(404).json({ error: "商品不存在" });
    return;
  }
  const [categoryLabels, tagMap, links, comboMetaMap] = await Promise.all([
    getCategoryLabelMap(),
    tagsForProducts([row.id], locale),
    listProductLinks(sku),
    resolveComboMetaMap(row.kind === "combo" ? [row] : [], locale),
  ]);
  res.json({
    product: formatProduct(row, {
      locale,
      categoryLabels,
      tags: tagMap.get(row.id) ?? [],
      comboMeta: comboMetaMap.get(row.sku) ?? null,
    }),
    links: links
      .filter((l) => l.active && (!l.locale || l.locale === locale))
      .map((l) => formatProductLink(l, locale)),
    locale,
  });
});

const i18nMapSchema = z.record(z.string().min(1).max(2000)).optional().nullable();

const attachmentSchema = z.object({
  name: z.string().min(1).max(200),
  url: z.string().url().max(2000),
});

const productAttributesSchema = {
  material: z.string().max(200).optional().nullable(),
  materialI18n: i18nMapSchema,
  color: z.string().max(100).optional().nullable(),
  colorI18n: i18nMapSchema,
  weightGrams: z.number().int().nonnegative().optional().nullable(),
  beadDiameterMm: z.number().positive().optional().nullable(),
  wristCmMin: z.number().positive().optional().nullable(),
  wristCmMax: z.number().positive().optional().nullable(),
  lengthMm: z.number().positive().optional().nullable(),
  packaging: z.string().max(2000).optional().nullable(),
  packagingI18n: i18nMapSchema,
  attachments: z.array(attachmentSchema).max(10).optional().nullable(),
};

const productBodySchema = z.object({
  sku: z.string().min(1).max(100),
  name: z.string().min(1).max(200),
  nameI18n: i18nMapSchema,
  element: z.string().max(10).optional().nullable(),
  ...productAttributesSchema,
  description: z.string().min(1).max(2000),
  descriptionI18n: i18nMapSchema,
  priceCents: z.number().int().nonnegative(),
  priceCentsUsd: z.number().int().nonnegative().optional().nullable(),
  category: z.string().min(1).max(50),
  kind: z.enum(["standard", "digital", "service", "diy", "combo"]).optional(),
  comboUseComponentSum: z.boolean().optional(),
  comboItems: z.array(z.object({
    componentSku: z.string().min(1).max(100),
    quantity: z.number().int().min(1).max(99).optional(),
  })).max(20).optional(),
  visibility: z.enum(["public", "unlisted", "app_only"]).optional(),
  stock: z.number().int().nonnegative().optional().nullable(),
  lowStockAt: z.number().int().nonnegative().optional().nullable(),
  slug: z.string().max(200).optional().nullable(),
  seoTitleI18n: i18nMapSchema,
  seoDescI18n: i18nMapSchema,
  tagIds: z.array(z.number().int().positive()).max(50).optional(),
  requiresShipping: z.boolean().optional(),
  salePriceCents: z.number().int().nonnegative().optional().nullable(),
  salePriceCentsUsd: z.number().int().nonnegative().optional().nullable(),
  saleStartsAt: z.coerce.date().optional().nullable(),
  saleEndsAt: z.coerce.date().optional().nullable(),
  active: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

const productPatchSchema = productBodySchema.partial().omit({ sku: true });

export { productBodySchema, productPatchSchema };
