import { Router } from "express";
import { count, desc, eq, gt } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db/index.ts";
import { contactMessages, products, userOrders, userReadings, users } from "../db/schema.ts";
import { requireAdmin } from "../lib/admin-auth.ts";
import { formatAdminProduct } from "../lib/product-format.ts";
import { listHomepageFeaturedSkus, resolveHomepageProducts, setHomepageFeaturedSkus } from "../lib/homepage-products.ts";
import {
  listComboItems,
  resolveComboMeta,
  resolveComboMetaMap,
  setComboItems,
  syncComboDerivedFields,
} from "../lib/product-combos.ts";
import {
  deleteBillingSlotKey,
  listAllBillingSlots,
  setBillingSlotEntries,
} from "../lib/billing-slots.ts";
import {
  getCategoryLabelMap,
  listCategories,
  listProductLinks,
  listTagGroups,
  listTags,
  setProductLinks,
  setProductTags,
  tagsForProducts,
  upsertCategory,
  upsertTag,
  upsertTagGroup,
} from "../lib/catalog.ts";
import { productBodySchema, productPatchSchema } from "./products.ts";
import { createShipment, formatShipment, listShipmentsForOrder } from "../lib/shop-shipments.ts";
import { diyBeads, diyConfig } from "../db/schema.ts";
import { formatBead, formatDiyConfig, getDiyConfigRow } from "./diy.ts";
import { asc } from "drizzle-orm";

export const adminApiRouter = Router();
adminApiRouter.use(requireAdmin);

const APP_LABELS: Record<string, string> = {
  bazi: "八字排盘",
  ziwei: "紫微斗数",
  tarot: "塔罗占卜",
  shop: "能量商城",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "待支付",
  paid: "已支付",
  shipped: "已发货",
  completed: "已完成",
  cancelled: "已取消",
};

adminApiRouter.get("/stats", async (_req, res) => {
  const [[userCount], [orderCount], [readingCount], [productCount]] = await Promise.all([
    db.select({ value: count() }).from(users),
    db.select({ value: count() }).from(userOrders),
    db.select({ value: count() }).from(userReadings),
    db.select({ value: count() }).from(products).where(eq(products.active, true)),
  ]);

  res.json({
    users: userCount.value,
    orders: orderCount.value,
    readings: readingCount.value,
    products: productCount.value,
  });
});

adminApiRouter.get("/products", async (_req, res) => {
  const rows = await db.select().from(products).orderBy(products.sortOrder, products.id);
  const [categoryLabels, tagMap, comboMetaMap] = await Promise.all([
    getCategoryLabelMap(),
    tagsForProducts(rows.map((r) => r.id)),
    resolveComboMetaMap(rows.filter((r) => r.kind === "combo")),
  ]);
  res.json({
    products: rows.map((row) =>
      formatAdminProduct(row, {
        categoryLabels,
        tags: tagMap.get(row.id) ?? [],
        comboMeta: comboMetaMap.get(row.sku) ?? null,
      }),
    ),
  });
});

const homepageSkusSchema = z.object({
  skus: z.array(z.string().min(1).max(100)).max(6),
});

adminApiRouter.get("/homepage-products", async (_req, res) => {
  const [skus, catalog] = await Promise.all([
    listHomepageFeaturedSkus(),
    resolveHomepageProducts(),
  ]);
  res.json({ skus, ...catalog });
});

adminApiRouter.put("/homepage-products", async (req, res) => {
  try {
    const body = homepageSkusSchema.parse(req.body);
    await setHomepageFeaturedSkus(body.skus);
    const catalog = await resolveHomepageProducts();
    res.json({ skus: body.skus, ...catalog });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: "参数错误", details: err.errors });
      return;
    }
    if (err instanceof Error && err.message.startsWith("未知 SKU")) {
      res.status(400).json({ error: err.message });
      return;
    }
    console.error("[admin] homepage-products:", err);
    res.status(500).json({ error: "服务器内部错误" });
  }
});

/* ── 应用计费槽位（R6：统一 app+key → SKU）──────────────── */

const billingEntrySchema = z.object({
  sku: z.string().min(1).max(100),
  priceOverrideCents: z.number().int().nonnegative().nullable().optional(),
  priceOverrideUsdCents: z.number().int().nonnegative().nullable().optional(),
  active: z.boolean().optional(),
});

const billingSlotPutSchema = z.object({
  app: z.string().min(1).max(20),
  key: z.string().min(1).max(100),
  entries: z.array(billingEntrySchema).max(20),
});

adminApiRouter.get("/billing-slots", async (_req, res) => {
  try {
    const rows = await listAllBillingSlots();
    res.json({ slots: rows });
  } catch (err) {
    console.error("[admin] billing-slots:", err);
    res.status(500).json({ error: "服务器内部错误" });
  }
});

adminApiRouter.put("/billing-slots", async (req, res) => {
  try {
    const body = billingSlotPutSchema.parse(req.body);
    const rows = await setBillingSlotEntries(body.app, body.key, body.entries);
    res.json({ app: body.app, key: body.key, rows });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: "参数错误", details: err.errors });
      return;
    }
    if (err instanceof Error && err.message.startsWith("未知 SKU")) {
      res.status(400).json({ error: err.message });
      return;
    }
    console.error("[admin] billing-slots put:", err);
    res.status(500).json({ error: "服务器内部错误" });
  }
});

adminApiRouter.delete("/billing-slots", async (req, res) => {
  const app = typeof req.query.app === "string" ? req.query.app.trim() : "";
  const key = typeof req.query.key === "string" ? req.query.key.trim() : "";
  if (!app || !key) {
    res.status(400).json({ error: "缺少 app 或 key" });
    return;
  }
  try {
    await deleteBillingSlotKey(app, key);
    res.json({ success: true });
  } catch (err) {
    console.error("[admin] billing-slots delete:", err);
    res.status(500).json({ error: "服务器内部错误" });
  }
});

/* ── 分类（Q3）───────────────────────────────────────────── */

const categorySchema = z.object({
  code: z.string().min(1).max(50),
  labelI18n: z.record(z.string().min(1).max(200)),
  sortOrder: z.number().int().optional(),
  active: z.boolean().optional(),
});

adminApiRouter.get("/categories", async (_req, res) => {
  try {
    const rows = await listCategories();
    res.json({ categories: rows });
  } catch (err) {
    console.error("[admin] categories:", err);
    res.status(500).json({ error: "服务器内部错误" });
  }
});

adminApiRouter.put("/categories", async (req, res) => {
  try {
    const body = categorySchema.parse(req.body);
    const row = await upsertCategory(body);
    res.json({ category: row });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: "参数错误", details: err.errors });
      return;
    }
    console.error("[admin] categories put:", err);
    res.status(500).json({ error: "服务器内部错误" });
  }
});

/* ── 标签（R2）───────────────────────────────────────────── */

const tagGroupSchema = z.object({
  code: z.string().min(1).max(50),
  labelI18n: z.record(z.string().min(1).max(200)),
  sortOrder: z.number().int().optional(),
});

const tagSchema = z.object({
  groupId: z.number().int().positive(),
  code: z.string().min(1).max(50),
  labelI18n: z.record(z.string().min(1).max(200)),
  sortOrder: z.number().int().optional(),
  active: z.boolean().optional(),
});

adminApiRouter.get("/tags", async (_req, res) => {
  try {
    const [groups, tags] = await Promise.all([listTagGroups(), listTags()]);
    res.json({ groups, tags });
  } catch (err) {
    console.error("[admin] tags:", err);
    res.status(500).json({ error: "服务器内部错误" });
  }
});

adminApiRouter.put("/tag-groups", async (req, res) => {
  try {
    const body = tagGroupSchema.parse(req.body);
    const row = await upsertTagGroup(body);
    res.json({ group: row });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: "参数错误", details: err.errors });
      return;
    }
    console.error("[admin] tag-groups put:", err);
    res.status(500).json({ error: "服务器内部错误" });
  }
});

adminApiRouter.put("/tags", async (req, res) => {
  try {
    const body = tagSchema.parse(req.body);
    const row = await upsertTag(body);
    res.json({ tag: row });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: "参数错误", details: err.errors });
      return;
    }
    console.error("[admin] tags put:", err);
    res.status(500).json({ error: "服务器内部错误" });
  }
});

/* ── 商品关联页面（R5）──────────────────────────────────── */

const productLinksSchema = z.object({
  links: z.array(z.object({
    kind: z.enum(["internal", "media", "review", "article"]),
    title: z.string().min(1).max(300),
    titleI18n: z.record(z.string().min(1).max(300)).optional().nullable(),
    url: z.string().url().max(2000),
    sourceName: z.string().max(200).optional().nullable(),
    locale: z.string().max(10).optional().nullable(),
    active: z.boolean().optional(),
  })).max(20),
});

adminApiRouter.get("/products/:sku/links", async (req, res) => {
  try {
    const rows = await listProductLinks(String(req.params.sku));
    res.json({ links: rows });
  } catch (err) {
    console.error("[admin] product links:", err);
    res.status(500).json({ error: "服务器内部错误" });
  }
});

adminApiRouter.put("/products/:sku/links", async (req, res) => {
  try {
    const body = productLinksSchema.parse(req.body);
    const rows = await setProductLinks(String(req.params.sku), body.links);
    res.json({ links: rows });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: "参数错误", details: err.errors });
      return;
    }
    console.error("[admin] product links put:", err);
    res.status(500).json({ error: "服务器内部错误" });
  }
});

/* ── 组合商品子项 ───────────────────────────────────────── */

const comboItemsSchema = z.object({
  items: z.array(z.object({
    componentSku: z.string().min(1).max(100),
    quantity: z.number().int().min(1).max(99).optional(),
  })).max(20),
});

adminApiRouter.get("/products/:sku/combo-items", async (req, res) => {
  try {
    const sku = String(req.params.sku);
    const [combo] = await db.select().from(products).where(eq(products.sku, sku)).limit(1);
    if (!combo) {
      res.status(404).json({ error: "商品不存在" });
      return;
    }
    const rows = await listComboItems(sku);
    const meta = await resolveComboMeta(combo);
    res.json({ items: rows, combo: meta });
  } catch (err) {
    console.error("[admin] combo-items get:", err);
    res.status(500).json({ error: "服务器内部错误" });
  }
});

adminApiRouter.put("/products/:sku/combo-items", async (req, res) => {
  try {
    const sku = String(req.params.sku);
    const [combo] = await db.select().from(products).where(eq(products.sku, sku)).limit(1);
    if (!combo) {
      res.status(404).json({ error: "商品不存在" });
      return;
    }
    if (combo.kind !== "combo") {
      res.status(400).json({ error: "仅组合商品可配置子项" });
      return;
    }
    const body = comboItemsSchema.parse(req.body);
    const rows = await setComboItems(sku, body.items);
    await syncComboDerivedFields(sku);
    const [updated] = await db.select().from(products).where(eq(products.sku, sku)).limit(1);
    const meta = updated ? await resolveComboMeta(updated) : null;
    res.json({ items: rows, combo: meta });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: "参数错误", details: err.errors });
      return;
    }
    if (err instanceof Error && (
      err.message.includes("子商品") || err.message.includes("组合") || err.message.includes("未知")
    )) {
      res.status(400).json({ error: err.message });
      return;
    }
    console.error("[admin] combo-items put:", err);
    res.status(500).json({ error: "服务器内部错误" });
  }
});

adminApiRouter.post("/products", async (req, res) => {
  try {
    const body = productBodySchema.parse(req.body);
    const dup = await db.select().from(products).where(eq(products.sku, body.sku)).limit(1);
    if (dup.length > 0) {
      res.status(409).json({ error: "SKU 已存在" });
      return;
    }
    const [row] = await db.insert(products).values({
      sku: body.sku,
      name: body.name,
      nameI18n: body.nameI18n ?? null,
      element: body.element ?? null,
      material: body.material ?? null,
      materialI18n: body.materialI18n ?? null,
      color: body.color ?? null,
      colorI18n: body.colorI18n ?? null,
      weightGrams: body.weightGrams ?? null,
      beadDiameterMm: body.beadDiameterMm ?? null,
      wristCmMin: body.wristCmMin ?? null,
      wristCmMax: body.wristCmMax ?? null,
      lengthMm: body.lengthMm ?? null,
      packaging: body.packaging ?? null,
      packagingI18n: body.packagingI18n ?? null,
      attachments: body.attachments ?? null,
      description: body.description,
      descriptionI18n: body.descriptionI18n ?? null,
      priceCents: body.priceCents,
      priceCentsUsd: body.priceCentsUsd ?? null,
      category: body.category,
      kind: body.kind ?? "standard",
      comboUseComponentSum: body.kind === "combo" ? (body.comboUseComponentSum ?? true) : true,
      visibility: body.visibility ?? "public",
      stock: body.stock ?? null,
      lowStockAt: body.lowStockAt ?? null,
      slug: body.slug ?? null,
      seoTitleI18n: body.seoTitleI18n ?? null,
      seoDescI18n: body.seoDescI18n ?? null,
      requiresShipping: body.requiresShipping ?? false,
      active: body.active ?? true,
      sortOrder: body.sortOrder ?? 0,
    }).returning();
    if (body.tagIds) {
      await setProductTags(row.id, body.tagIds);
    }
    if (body.kind === "combo" && body.comboItems) {
      await setComboItems(row.sku, body.comboItems);
      await syncComboDerivedFields(row.sku);
    } else if (body.kind === "combo") {
      res.status(400).json({ error: "组合商品至少包含一个子商品" });
      return;
    }
    const [saved] = await db.select().from(products).where(eq(products.sku, row.sku)).limit(1);
    const comboMeta = saved?.kind === "combo" ? await resolveComboMeta(saved) : null;
    res.status(201).json({ product: formatAdminProduct(saved ?? row, { comboMeta }) });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: "参数错误", details: err.errors });
      return;
    }
    console.error("[admin] create product:", err);
    res.status(500).json({ error: "服务器内部错误" });
  }
});

adminApiRouter.patch("/products/:sku", async (req, res) => {
  try {
    const sku = String(req.params.sku);
    const body = productPatchSchema.parse(req.body);
    const existing = await db.select().from(products).where(eq(products.sku, sku)).limit(1);
    if (existing.length === 0) {
      res.status(404).json({ error: "商品不存在" });
      return;
    }

    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (body.name !== undefined) updates.name = body.name;
    if (body.nameI18n !== undefined) updates.nameI18n = body.nameI18n;
    if (body.element !== undefined) updates.element = body.element;
    if (body.material !== undefined) updates.material = body.material;
    if (body.materialI18n !== undefined) updates.materialI18n = body.materialI18n;
    if (body.color !== undefined) updates.color = body.color;
    if (body.colorI18n !== undefined) updates.colorI18n = body.colorI18n;
    if (body.weightGrams !== undefined) updates.weightGrams = body.weightGrams;
    if (body.beadDiameterMm !== undefined) updates.beadDiameterMm = body.beadDiameterMm;
    if (body.wristCmMin !== undefined) updates.wristCmMin = body.wristCmMin;
    if (body.wristCmMax !== undefined) updates.wristCmMax = body.wristCmMax;
    if (body.lengthMm !== undefined) updates.lengthMm = body.lengthMm;
    if (body.packaging !== undefined) updates.packaging = body.packaging;
    if (body.packagingI18n !== undefined) updates.packagingI18n = body.packagingI18n;
    if (body.attachments !== undefined) updates.attachments = body.attachments;
    if (body.kind !== undefined) updates.kind = body.kind;
    if (body.comboUseComponentSum !== undefined) updates.comboUseComponentSum = body.comboUseComponentSum;
    if (body.visibility !== undefined) updates.visibility = body.visibility;
    if (body.stock !== undefined) updates.stock = body.stock;
    if (body.lowStockAt !== undefined) updates.lowStockAt = body.lowStockAt;
    if (body.slug !== undefined) updates.slug = body.slug;
    if (body.seoTitleI18n !== undefined) updates.seoTitleI18n = body.seoTitleI18n;
    if (body.seoDescI18n !== undefined) updates.seoDescI18n = body.seoDescI18n;
    if (body.description !== undefined) updates.description = body.description;
    if (body.descriptionI18n !== undefined) updates.descriptionI18n = body.descriptionI18n;
    if (body.priceCents !== undefined) updates.priceCents = body.priceCents;
    if (body.priceCentsUsd !== undefined) updates.priceCentsUsd = body.priceCentsUsd;
    if (body.category !== undefined) updates.category = body.category;
    if (body.requiresShipping !== undefined) updates.requiresShipping = body.requiresShipping;
    if (body.active !== undefined) updates.active = body.active;
    if (body.sortOrder !== undefined) updates.sortOrder = body.sortOrder;

    const [row] = await db.update(products).set(updates).where(eq(products.sku, sku)).returning();
    if (body.tagIds !== undefined) {
      await setProductTags(row.id, body.tagIds ?? []);
    }
    if (body.comboItems !== undefined) {
      if (row.kind !== "combo") {
        res.status(400).json({ error: "仅组合商品可配置子项" });
        return;
      }
      await setComboItems(sku, body.comboItems);
    }
    if (row.kind === "combo") {
      await syncComboDerivedFields(sku);
    }
    const [saved] = await db.select().from(products).where(eq(products.sku, sku)).limit(1);
    const comboMeta = saved?.kind === "combo" ? await resolveComboMeta(saved) : null;
    res.json({ product: formatAdminProduct(saved ?? row, { comboMeta }) });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: "参数错误", details: err.errors });
      return;
    }
    console.error("[admin] update product:", err);
    res.status(500).json({ error: "服务器内部错误" });
  }
});

/* ── 共振定制（DIY）珠子与配置 ─────────────────────── */

const beadBodySchema = z.object({
  code: z.string().min(1).max(100),
  name: z.string().min(1).max(100),
  element: z.string().max(10).optional().nullable(),
  material: z.string().min(1).max(100),
  beadType: z.enum(["crystal", "spacer", "disc"]),
  diameterMm: z.number().positive().max(30),
  thicknessMm: z.number().positive().max(10).optional().nullable(),
  priceCents: z.number().int().nonnegative(),
  priceCentsUsd: z.number().int().nonnegative().optional().nullable(),
  imageUrl: z.string().max(500).optional().nullable(),
  colors: z.string().max(120).optional().nullable(),
  stock: z.number().int().nonnegative().optional(),
  active: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

const beadPatchSchema = beadBodySchema.partial().omit({ code: true });

adminApiRouter.get("/diy/beads", async (_req, res) => {
  const rows = await db.select().from(diyBeads).orderBy(asc(diyBeads.sortOrder), asc(diyBeads.id));
  res.json({ beads: rows.map(formatBead) });
});

adminApiRouter.post("/diy/beads", async (req, res) => {
  try {
    const body = beadBodySchema.parse(req.body);
    const dup = await db.select().from(diyBeads).where(eq(diyBeads.code, body.code)).limit(1);
    if (dup.length > 0) {
      res.status(409).json({ error: "珠子编码已存在" });
      return;
    }
    const [row] = await db.insert(diyBeads).values({
      code: body.code,
      name: body.name,
      element: body.element ?? null,
      material: body.material,
      beadType: body.beadType,
      diameterMm: body.diameterMm,
      thicknessMm: body.beadType === "disc" ? (body.thicknessMm ?? null) : null,
      priceCents: body.priceCents,
      priceCentsUsd: body.priceCentsUsd ?? null,
      imageUrl: body.imageUrl ?? null,
      colors: body.colors ?? null,
      stock: body.stock ?? 999,
      active: body.active ?? true,
      sortOrder: body.sortOrder ?? 0,
    }).returning();
    res.status(201).json({ bead: formatBead(row) });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: "参数错误", details: err.errors });
      return;
    }
    console.error("[admin] create bead:", err);
    res.status(500).json({ error: "服务器内部错误" });
  }
});

adminApiRouter.patch("/diy/beads/:code", async (req, res) => {
  try {
    const code = String(req.params.code);
    const body = beadPatchSchema.parse(req.body);
    const existing = await db.select().from(diyBeads).where(eq(diyBeads.code, code)).limit(1);
    if (existing.length === 0) {
      res.status(404).json({ error: "珠子不存在" });
      return;
    }
    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (body.name !== undefined) updates.name = body.name;
    if (body.element !== undefined) updates.element = body.element;
    if (body.material !== undefined) updates.material = body.material;
    if (body.beadType !== undefined) updates.beadType = body.beadType;
    if (body.diameterMm !== undefined) updates.diameterMm = body.diameterMm;
    if (body.thicknessMm !== undefined) updates.thicknessMm = body.thicknessMm;
    if (body.priceCents !== undefined) updates.priceCents = body.priceCents;
    if (body.priceCentsUsd !== undefined) updates.priceCentsUsd = body.priceCentsUsd;
    if (body.imageUrl !== undefined) updates.imageUrl = body.imageUrl;
    if (body.colors !== undefined) updates.colors = body.colors;
    if (body.stock !== undefined) updates.stock = body.stock;
    if (body.active !== undefined) updates.active = body.active;
    if (body.sortOrder !== undefined) updates.sortOrder = body.sortOrder;

    const [row] = await db.update(diyBeads).set(updates).where(eq(diyBeads.code, code)).returning();
    res.json({ bead: formatBead(row) });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: "参数错误", details: err.errors });
      return;
    }
    console.error("[admin] update bead:", err);
    res.status(500).json({ error: "服务器内部错误" });
  }
});

const diyConfigSchema = z.object({
  lengthCorrectionMm: z.number().min(0).max(30),
  minOrderCents: z.number().int().nonnegative(),
  fitToleranceMm: z.number().min(1).max(30),
  wristEaseMm: z.number().min(0).max(30),
});

adminApiRouter.get("/diy/config", async (_req, res) => {
  const row = await getDiyConfigRow();
  res.json({ config: formatDiyConfig(row) });
});

adminApiRouter.put("/diy/config", async (req, res) => {
  try {
    const body = diyConfigSchema.parse(req.body);
    await db.insert(diyConfig).values({ id: 1, ...body }).onConflictDoUpdate({
      target: diyConfig.id,
      set: { ...body, updatedAt: new Date() },
    });
    const row = await getDiyConfigRow();
    res.json({ config: formatDiyConfig(row) });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: "参数错误", details: err.errors });
      return;
    }
    console.error("[admin] update diy config:", err);
    res.status(500).json({ error: "服务器内部错误" });
  }
});

/** 后台角标：since 之后创建的订单数（无 since 默认最近 24h） */
adminApiRouter.get("/orders/new-count", async (req, res) => {
  const sinceRaw = typeof req.query.since === "string" ? req.query.since : "";
  let since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  if (sinceRaw) {
    const parsed = new Date(sinceRaw);
    if (!Number.isNaN(parsed.getTime())) since = parsed;
  }
  const [row] = await db
    .select({ value: count() })
    .from(userOrders)
    .where(gt(userOrders.createdAt, since));
  res.json({ count: row?.value ?? 0, since: since.toISOString() });
});

adminApiRouter.get("/orders", async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 100, 200);
  const rows = await db.select().from(userOrders).orderBy(desc(userOrders.createdAt)).limit(limit);
  const orders = await Promise.all(rows.map(async (o) => {
    const shipmentRows = await listShipmentsForOrder(o.orderNo);
    return {
      id: o.id,
      userId: o.userId,
      orderNo: o.orderNo,
      title: o.title,
      sku: o.sku,
      amountCents: o.amountCents,
      currency: o.currency,
      amountDisplay: `¥${(o.amountCents / 100).toFixed(2)}`,
      status: o.status,
      statusLabel: STATUS_LABELS[o.status] ?? o.status,
      appSource: o.appSource,
      appLabel: o.appSource ? APP_LABELS[o.appSource] : null,
      shippingAddress: o.shippingAddress,
      recommendationContext: o.recommendationContext,
      createdAt: o.createdAt,
      shipments: shipmentRows.map(({ shipment, events }) => formatShipment(shipment, events)),
    };
  }));
  res.json({ orders });
});

const CONTACT_STATUS_LABELS: Record<string, string> = {
  new: "待处理",
  processing: "处理中",
  resolved: "已解决",
};

adminApiRouter.get("/contact-messages", async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 100, 200);
  const statusFilter = String(req.query.status ?? "");
  const base = db.select().from(contactMessages);
  const rows = await (
    statusFilter && statusFilter in CONTACT_STATUS_LABELS
      ? base.where(eq(contactMessages.status, statusFilter as "new" | "processing" | "resolved"))
      : base
  ).orderBy(desc(contactMessages.createdAt)).limit(limit);

  res.json({
    messages: rows.map((m) => ({
      id: m.id,
      userId: m.userId,
      name: m.name,
      email: m.email,
      subject: m.subject,
      body: m.body,
      locale: m.locale,
      status: m.status,
      statusLabel: CONTACT_STATUS_LABELS[m.status] ?? m.status,
      adminNote: m.adminNote,
      handledBy: m.handledBy,
      createdAt: m.createdAt,
      updatedAt: m.updatedAt,
    })),
  });
});

const contactMessagePatchSchema = z.object({
  status: z.enum(["new", "processing", "resolved"]).optional(),
  adminNote: z.string().max(2000).optional(),
}).refine((b) => b.status !== undefined || b.adminNote !== undefined, {
  message: "至少提供一个更新字段",
});

adminApiRouter.patch("/contact-messages/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({ error: "参数错误" });
      return;
    }
    const body = contactMessagePatchSchema.parse(req.body);
    const existing = await db.select().from(contactMessages).where(eq(contactMessages.id, id)).limit(1);
    if (existing.length === 0) {
      res.status(404).json({ error: "留言不存在" });
      return;
    }
    const adminUser = (req as typeof req & { adminUser?: { id: number } }).adminUser;
    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (body.status !== undefined) updates.status = body.status;
    if (body.adminNote !== undefined) updates.adminNote = body.adminNote || null;
    if (adminUser?.id) updates.handledBy = adminUser.id;
    await db.update(contactMessages).set(updates).where(eq(contactMessages.id, id));
    res.json({ success: true, id });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: "参数错误", details: err.errors });
      return;
    }
    console.error("[admin] update contact message:", err);
    res.status(500).json({ error: "服务器内部错误" });
  }
});

const orderStatusSchema = z.object({
  status: z.enum(["pending", "paid", "shipped", "completed", "cancelled"]),
});

adminApiRouter.patch("/orders/:orderNo", async (req, res) => {
  try {
    const orderNo = String(req.params.orderNo);
    const body = orderStatusSchema.parse(req.body);
    const existing = await db.select().from(userOrders).where(eq(userOrders.orderNo, orderNo)).limit(1);
    if (existing.length === 0) {
      res.status(404).json({ error: "订单不存在" });
      return;
    }
    await db.update(userOrders).set({ status: body.status }).where(eq(userOrders.orderNo, orderNo));
    res.json({ success: true, orderNo, status: body.status });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: "参数错误", details: err.errors });
      return;
    }
    console.error("[admin] update order:", err);
    res.status(500).json({ error: "服务器内部错误" });
  }
});

const shipmentCreateSchema = z.object({
  carrier: z.string().min(1).max(100),
  trackingNo: z.string().min(1).max(100),
  note: z.string().max(500).optional(),
});

adminApiRouter.post("/orders/:orderNo/shipments", async (req, res) => {
  try {
    const orderNo = String(req.params.orderNo);
    const body = shipmentCreateSchema.parse(req.body);
    const shipment = await createShipment({
      orderNo,
      carrier: body.carrier,
      trackingNo: body.trackingNo,
      note: body.note,
    });
    const shipmentRows = await listShipmentsForOrder(orderNo);
    const current = shipmentRows.find((row) => row.shipment.id === shipment.id);
    res.status(201).json({
      success: true,
      shipment: current ? formatShipment(current.shipment, current.events) : null,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: "参数错误", details: err.errors });
      return;
    }
    if (err instanceof Error && err.message === '订单不存在') {
      res.status(404).json({ error: err.message });
      return;
    }
    console.error("[admin] create shipment:", err);
    res.status(500).json({ error: "服务器内部错误" });
  }
});
