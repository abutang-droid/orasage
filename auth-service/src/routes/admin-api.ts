import { Router } from "express";
import { count, desc, eq, gt, and, or, ilike, asc } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db/index.ts";
import { contactMessages, homepageFeaturedProducts, products, userOrders, userReadings, users } from "../db/schema.ts";
import { requireStaff, assertPermission, requireSuperAdmin } from "../lib/admin-auth.ts";
import { formatAdminProduct } from "../lib/product-format.ts";
import { listHomepageFeaturedSkus, resolveHomepageProducts, setHomepageFeaturedSkus } from "../lib/homepage-products.ts";
import { getShopPublicConfig, setShopHomeLayout, SHOP_HOME_LAYOUTS } from "../lib/shop-settings.ts";
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
import { getHubChannelStatus, pushHubOpsNotification } from "../lib/message-hub.ts";
import { notifyTicketReply } from "../lib/ticket-notify.ts";
import {
  formatShippingZone,
  listShippingZones,
  replaceShippingZones,
  type ShippingZoneInput,
} from "../lib/shipping-zones.ts";
import { diyBeads, diyConfig } from "../db/schema.ts";
import { formatBead, formatDiyConfig, getDiyConfigRow } from "./diy.ts";
import {
  listReviewsForAdmin,
  updateReviewStatus,
  type ReviewStatus,
} from "../lib/product-reviews.ts";
import {
  formatCoupon,
  listCoupons,
  replaceCoupons,
  type CouponInput,
} from "../lib/coupons.ts";
import {
  getAnalyticsSummary,
  listRecentAnalyticsEvents,
  type AnalyticsApp,
  isAnalyticsApp,
} from "../lib/analytics.ts";
import { getAdminDashboard } from "../lib/dashboard.ts";
import {
  formatBalanceSnapshot,
  formatStripeRow,
  formatSyncRun,
  getLatestBalanceSnapshots,
  getLatestSyncRun,
  getStripeReconciliation,
  isStripeConfigured,
  listStripeCharges,
  listStripePayouts,
  listStripeRefunds,
  runStripeMirrorSync,
} from "../lib/stripe-mirror.ts";
import {
  closeConversation,
  getUnreadImCountForOps,
  listChatConversationsForAdmin,
  listMessagesForConversation,
  markMessagesReadByOps,
  sendOpsChatMessage,
} from "../lib/live-chat.ts";
import {
  getWalletUserSummary,
  listLedgerForUser,
  listWalletsAdmin,
  postWalletLedgerEntry,
} from "../lib/wallets.ts";

export const adminApiRouter = Router();
adminApiRouter.use(requireStaff);

const P = {
  overview: assertPermission("ops.overview"),
  messages: assertPermission("ops.messages"),
  products: assertPermission("shop.products"),
  orders: assertPermission("shop.orders"),
  diy: assertPermission("shop.diy"),
  shipping: assertPermission("shop.shipping"),
  promotions: assertPermission("shop.promotions"),
  reviews: assertPermission("shop.reviews"),
  billing: assertPermission("billing.slots"),
};

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

adminApiRouter.get("/me", async (req, res) => {
  const ctx = req as import("../lib/admin-auth.ts").AdminRequest;
  res.json({
    user: {
      id: ctx.adminUser.id,
      email: ctx.adminUser.email,
      nickname: ctx.adminUser.nickname,
      role: ctx.adminUser.role,
      staffLabel: ctx.adminUser.staffLabel,
      permissions: [...ctx.staffPermissions],
    },
  });
});

adminApiRouter.get("/stats", P.overview, async (_req, res) => {
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

adminApiRouter.get("/analytics/summary", async (req, res) => {
  const days = Number(req.query.days ?? 7);
  const summary = await getAnalyticsSummary(Number.isFinite(days) ? days : 7);
  res.json(summary);
});

adminApiRouter.get("/analytics/events", async (req, res) => {
  const app = typeof req.query.app === "string" && isAnalyticsApp(req.query.app)
    ? (req.query.app as AnalyticsApp)
    : undefined;
  const limit = Number(req.query.limit ?? 50);
  const offset = Number(req.query.offset ?? 0);
  const events = await listRecentAnalyticsEvents({
    app,
    limit: Number.isFinite(limit) ? limit : 50,
    offset: Number.isFinite(offset) ? offset : 0,
  });
  res.json({ events });
});

adminApiRouter.get("/dashboard", async (req, res) => {
  const days = Number(req.query.days ?? 7);
  const dashboard = await getAdminDashboard(Number.isFinite(days) ? days : 7);
  res.json(dashboard);
});

adminApiRouter.get("/products", P.products, async (_req, res) => {
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

adminApiRouter.get("/homepage-products", P.products, async (_req, res) => {
  const [skus, catalog] = await Promise.all([
    listHomepageFeaturedSkus(),
    resolveHomepageProducts(),
  ]);
  res.json({ skus, ...catalog });
});

adminApiRouter.put("/homepage-products", P.products, async (req, res) => {
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

const shopLayoutSchema = z.object({
  homeLayout: z.enum(SHOP_HOME_LAYOUTS),
});

adminApiRouter.get("/shop-config", P.products, async (_req, res) => {
  const config = await getShopPublicConfig();
  res.json({
    ...config,
    layouts: SHOP_HOME_LAYOUTS.map((id) => ({
      id,
      label: id === "legacy" ? "经典目录（全品类）" : "水晶专题（五行主编排）",
    })),
  });
});

adminApiRouter.put("/shop-config", P.products, async (req, res) => {
  try {
    const body = shopLayoutSchema.parse(req.body);
    const homeLayout = await setShopHomeLayout(body.homeLayout);
    res.json({ homeLayout });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: "参数错误", details: err.errors });
      return;
    }
    if (err instanceof Error && err.message.includes("无效")) {
      res.status(400).json({ error: err.message });
      return;
    }
    console.error("[admin] shop-config:", err);
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

adminApiRouter.get("/billing-slots", P.billing, async (_req, res) => {
  try {
    const rows = await listAllBillingSlots();
    res.json({ slots: rows });
  } catch (err) {
    console.error("[admin] billing-slots:", err);
    res.status(500).json({ error: "服务器内部错误" });
  }
});

adminApiRouter.put("/billing-slots", P.billing, async (req, res) => {
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

adminApiRouter.delete("/billing-slots", P.billing, async (req, res) => {
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

adminApiRouter.get("/categories", P.products, async (_req, res) => {
  try {
    const rows = await listCategories();
    res.json({ categories: rows });
  } catch (err) {
    console.error("[admin] categories:", err);
    res.status(500).json({ error: "服务器内部错误" });
  }
});

adminApiRouter.put("/categories", P.products, async (req, res) => {
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

adminApiRouter.get("/tags", P.products, async (_req, res) => {
  try {
    const [groups, tags] = await Promise.all([listTagGroups(), listTags()]);
    res.json({ groups, tags });
  } catch (err) {
    console.error("[admin] tags:", err);
    res.status(500).json({ error: "服务器内部错误" });
  }
});

adminApiRouter.put("/tag-groups", P.products, async (req, res) => {
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

adminApiRouter.put("/tags", P.products, async (req, res) => {
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

adminApiRouter.get("/products/:sku/links", P.products, async (req, res) => {
  try {
    const rows = await listProductLinks(String(req.params.sku));
    res.json({ links: rows });
  } catch (err) {
    console.error("[admin] product links:", err);
    res.status(500).json({ error: "服务器内部错误" });
  }
});

adminApiRouter.put("/products/:sku/links", P.products, async (req, res) => {
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

adminApiRouter.get("/products/:sku/combo-items", P.products, async (req, res) => {
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

adminApiRouter.put("/products/:sku/combo-items", P.products, async (req, res) => {
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

adminApiRouter.post("/products", P.products, async (req, res) => {
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
      salePriceCents: body.salePriceCents ?? null,
      salePriceCentsUsd: body.salePriceCentsUsd ?? null,
      saleStartsAt: body.saleStartsAt ?? null,
      saleEndsAt: body.saleEndsAt ?? null,
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

adminApiRouter.patch("/products/:sku", P.products, async (req, res) => {
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
    if (body.salePriceCents !== undefined) updates.salePriceCents = body.salePriceCents;
    if (body.salePriceCentsUsd !== undefined) updates.salePriceCentsUsd = body.salePriceCentsUsd;
    if (body.saleStartsAt !== undefined) updates.saleStartsAt = body.saleStartsAt;
    if (body.saleEndsAt !== undefined) updates.saleEndsAt = body.saleEndsAt;
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

adminApiRouter.delete("/products/:sku", P.products, async (req, res) => {
  try {
    const sku = String(req.params.sku);
    const [existing] = await db.select().from(products).where(eq(products.sku, sku)).limit(1);
    if (!existing) {
      res.status(404).json({ error: "商品不存在" });
      return;
    }

    await db
      .update(products)
      .set({ active: false, visibility: "unlisted", updatedAt: new Date() })
      .where(eq(products.sku, sku));
    await db.delete(homepageFeaturedProducts).where(eq(homepageFeaturedProducts.sku, sku));

    res.json({ success: true, sku, active: false });
  } catch (err) {
    console.error("[admin] delete product:", err);
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

adminApiRouter.get("/diy/beads", P.diy, async (_req, res) => {
  const rows = await db.select().from(diyBeads).orderBy(asc(diyBeads.sortOrder), asc(diyBeads.id));
  res.json({ beads: rows.map(formatBead) });
});

adminApiRouter.post("/diy/beads", P.diy, async (req, res) => {
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

adminApiRouter.patch("/diy/beads/:code", P.diy, async (req, res) => {
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

adminApiRouter.get("/diy/config", P.diy, async (_req, res) => {
  const row = await getDiyConfigRow();
  res.json({ config: formatDiyConfig(row) });
});

adminApiRouter.put("/diy/config", P.diy, async (req, res) => {
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
adminApiRouter.get("/orders/new-count", P.orders, async (req, res) => {
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

adminApiRouter.get("/orders", P.orders, async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 50, 200);
  const offset = Math.max(0, Number(req.query.offset) || 0);
  const statusFilter = String(req.query.status ?? "");
  const appFilter = String(req.query.app ?? "");
  const q = String(req.query.q ?? "").trim();

  const conditions = [];
  if (statusFilter && statusFilter in STATUS_LABELS) {
    conditions.push(eq(userOrders.status, statusFilter as typeof userOrders.status.enumValues[number]));
  }
  if (appFilter && appFilter in APP_LABELS) {
    conditions.push(eq(userOrders.appSource, appFilter as typeof userOrders.appSource.enumValues[number]));
  }
  if (q) {
    conditions.push(
      or(
        ilike(userOrders.orderNo, `%${q}%`),
        ilike(userOrders.sku, `%${q}%`),
        ilike(userOrders.title, `%${q}%`),
      ),
    );
  }
  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [totalRow] = await db.select({ value: count() }).from(userOrders).where(where);
  const rows = await db
    .select()
    .from(userOrders)
    .where(where)
    .orderBy(desc(userOrders.createdAt))
    .limit(limit)
    .offset(offset);

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
  res.json({ orders, total: totalRow?.value ?? 0, limit, offset });
});

const CONTACT_STATUS_LABELS: Record<string, string> = {
  new: "待处理",
  processing: "处理中",
  resolved: "已解决",
};

const CONTACT_CATEGORY_LABELS: Record<string, string> = {
  general: "一般咨询",
  complaint: "投诉",
  refund: "退款",
  bug: "问题反馈",
};

/** 消息中枢通道状态（不暴露密钥） */
adminApiRouter.get("/notifications/status", async (_req, res) => {
  const channels = getHubChannelStatus();
  const events = (process.env.ORDER_NOTIFY_EVENTS ?? "created,paid").split(",").map((s) => s.trim()).filter(Boolean);
  res.json({ channels, orderNotifyEvents: events });
});

/** 发送测试通知到已配置的 Telegram / 运营邮箱 */
adminApiRouter.post("/notifications/test", async (_req, res) => {
  const text = [
    "🔔 OraSage 消息中枢测试",
    `时间：${new Date().toISOString()}`,
    "若收到此消息，订单提醒与工单通知通道已就绪。",
  ].join("\n");
  pushHubOpsNotification("OraSage 消息中枢测试", text);
  res.json({ success: true, message: "测试通知已发送（未配置的通道将静默跳过）" });
});

/** 留言工单角标：since 之后新建且状态为 new 的条数 */
adminApiRouter.get("/contact-messages/new-count", async (req, res) => {
  const sinceRaw = typeof req.query.since === "string" ? req.query.since : "";
  let since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  if (sinceRaw) {
    const parsed = new Date(sinceRaw);
    if (!Number.isNaN(parsed.getTime())) since = parsed;
  }
  const [row] = await db
    .select({ value: count() })
    .from(contactMessages)
    .where(and(eq(contactMessages.status, "new"), gt(contactMessages.createdAt, since)));
  res.json({ count: row?.value ?? 0, since: since.toISOString() });
});

adminApiRouter.get("/contact-messages", P.messages, async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 100, 200);
  const statusFilter = String(req.query.status ?? "");
  const categoryFilter = String(req.query.category ?? "");
  const conditions = [];
  if (statusFilter && statusFilter in CONTACT_STATUS_LABELS) {
    conditions.push(eq(contactMessages.status, statusFilter as "new" | "processing" | "resolved"));
  }
  if (categoryFilter && categoryFilter in CONTACT_CATEGORY_LABELS) {
    conditions.push(eq(contactMessages.category, categoryFilter as "general" | "complaint" | "refund" | "bug"));
  }
  const where = conditions.length > 0 ? and(...conditions) : undefined;
  const rows = await db
    .select()
    .from(contactMessages)
    .where(where)
    .orderBy(desc(contactMessages.createdAt))
    .limit(limit);

  res.json({
    messages: rows.map((m) => ({
      id: m.id,
      userId: m.userId,
      name: m.name,
      email: m.email,
      subject: m.subject,
      body: m.body,
      locale: m.locale,
      category: m.category,
      categoryLabel: CONTACT_CATEGORY_LABELS[m.category] ?? m.category,
      orderNo: m.orderNo,
      status: m.status,
      statusLabel: CONTACT_STATUS_LABELS[m.status] ?? m.status,
      adminNote: m.adminNote,
      adminReply: m.adminReply,
      handledBy: m.handledBy,
      createdAt: m.createdAt,
      updatedAt: m.updatedAt,
    })),
  });
});

const contactMessagePatchSchema = z.object({
  status: z.enum(["new", "processing", "resolved"]).optional(),
  adminNote: z.string().max(2000).optional(),
  adminReply: z.string().max(5000).optional(),
}).refine((b) => b.status !== undefined || b.adminNote !== undefined || b.adminReply !== undefined, {
  message: "至少提供一个更新字段",
});

adminApiRouter.patch("/contact-messages/:id", P.messages, async (req, res) => {
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
    const prev = existing[0];
    const adminUser = (req as typeof req & { adminUser?: { id: number } }).adminUser;
    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (body.status !== undefined) updates.status = body.status;
    if (body.adminNote !== undefined) updates.adminNote = body.adminNote || null;
    if (body.adminReply !== undefined) updates.adminReply = body.adminReply || null;
    if (adminUser?.id) updates.handledBy = adminUser.id;
    await db.update(contactMessages).set(updates).where(eq(contactMessages.id, id));

    const replyChanged = body.adminReply !== undefined
      && body.adminReply.trim()
      && body.adminReply.trim() !== (prev.adminReply ?? "").trim();
    if (replyChanged) {
      notifyTicketReply({
        id: prev.id,
        name: prev.name,
        email: prev.email,
        subject: prev.subject,
        body: prev.body,
        category: prev.category,
        orderNo: prev.orderNo,
        adminReply: body.adminReply!.trim(),
      });
    }

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

adminApiRouter.patch("/orders/:orderNo", P.orders, async (req, res) => {
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

adminApiRouter.post("/orders/:orderNo/shipments", P.orders, async (req, res) => {
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

const batchShipmentSchema = z.object({
  items: z.array(z.object({
    orderNo: z.string().min(1),
    carrier: z.string().min(1).max(100),
    trackingNo: z.string().min(1).max(100),
    note: z.string().max(500).optional(),
  })).min(1).max(50),
});

adminApiRouter.post("/orders/shipments/batch", P.orders, async (req, res) => {
  try {
    const { items } = batchShipmentSchema.parse(req.body);
    const results: Array<{ orderNo: string; ok: boolean; error?: string }> = [];
    for (const item of items) {
      try {
        await createShipment(item);
        results.push({ orderNo: item.orderNo, ok: true });
      } catch (err) {
        results.push({
          orderNo: item.orderNo,
          ok: false,
          error: err instanceof Error ? err.message : "发货失败",
        });
      }
    }
    res.json({ results, success: results.every((r) => r.ok) });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: "参数错误", details: err.errors });
      return;
    }
    console.error("[admin] batch shipment:", err);
    res.status(500).json({ error: "服务器内部错误" });
  }
});

const shippingZoneSchema = z.object({
  code: z.string().min(1).max(50),
  labelI18n: z.record(z.string()).default({}),
  countryCodes: z.array(z.string()).default([]),
  flatRateCents: z.number().int().min(0),
  perRecipient: z.boolean().default(true),
  weightFreeGrams: z.number().int().min(0).nullable().optional(),
  weightBlockGrams: z.number().int().min(1).nullable().optional(),
  weightBlockCents: z.number().int().min(0).nullable().optional(),
  sortOrder: z.number().int().default(0),
  isDefault: z.boolean().default(false),
  active: z.boolean().default(true),
});

adminApiRouter.get("/shipping/zones", P.shipping, async (_req, res) => {
  const zones = await listShippingZones();
  res.json({ zones: zones.map(formatShippingZone) });
});

adminApiRouter.put("/shipping/zones", P.shipping, async (req, res) => {
  try {
    const body = z.object({ zones: z.array(shippingZoneSchema) }).parse(req.body);
    const saved = await replaceShippingZones(body.zones as ShippingZoneInput[]);
    res.json({ zones: saved.map(formatShippingZone) });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: "参数错误", details: err.errors });
      return;
    }
    console.error("[admin] shipping zones:", err);
    res.status(500).json({ error: "服务器内部错误" });
  }
});

/* ── UGC 评价（Phase D）────────────────────────────────── */

adminApiRouter.get("/reviews", P.reviews, async (req, res) => {
  try {
    const status = typeof req.query.status === "string" ? req.query.status : undefined;
    const sku = typeof req.query.sku === "string" ? req.query.sku : undefined;
    const limit = Number(req.query.limit) || 50;
    const offset = Number(req.query.offset) || 0;
    const reviews = await listReviewsForAdmin({ status, sku, limit, offset });
    res.json({ reviews });
  } catch (err) {
    console.error("[admin] reviews:", err);
    res.status(500).json({ error: "服务器内部错误" });
  }
});

const reviewStatusSchema = z.object({
  status: z.enum(["pending", "approved", "rejected", "featured"]),
});

adminApiRouter.patch("/reviews/:id", P.reviews, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({ error: "参数错误" });
      return;
    }
    const body = reviewStatusSchema.parse(req.body);
    const row = await updateReviewStatus(id, body.status as ReviewStatus);
    if (!row) {
      res.status(404).json({ error: "评价不存在" });
      return;
    }
    res.json({ success: true, id, status: row.status });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: "参数错误", details: err.errors });
      return;
    }
    console.error("[admin] review patch:", err);
    res.status(500).json({ error: "服务器内部错误" });
  }
});

/* ── 促销券（Phase D）──────────────────────────────────── */

const couponSchema = z.object({
  code: z.string().min(1).max(50),
  labelI18n: z.record(z.string()).default({}),
  discountType: z.enum(["percent", "fixed_cents"]),
  discountValue: z.number().int().min(0),
  minOrderCents: z.number().int().min(0).optional(),
  maxUses: z.number().int().min(1).nullable().optional(),
  startsAt: z.string().datetime().nullable().optional(),
  endsAt: z.string().datetime().nullable().optional(),
  active: z.boolean().optional(),
});

adminApiRouter.get("/coupons", P.promotions, async (_req, res) => {
  try {
    const coupons = await listCoupons();
    res.json({ coupons });
  } catch (err) {
    console.error("[admin] coupons:", err);
    res.status(500).json({ error: "服务器内部错误" });
  }
});

adminApiRouter.put("/coupons", P.promotions, async (req, res) => {
  try {
    const body = z.object({ coupons: z.array(couponSchema) }).parse(req.body);
    const inputs: CouponInput[] = body.coupons.map((c) => ({
      code: c.code,
      labelI18n: c.labelI18n,
      discountType: c.discountType,
      discountValue: c.discountValue,
      minOrderCents: c.minOrderCents,
      maxUses: c.maxUses,
      startsAt: c.startsAt ? new Date(c.startsAt) : null,
      endsAt: c.endsAt ? new Date(c.endsAt) : null,
      active: c.active,
    }));
    const saved = await replaceCoupons(inputs);
    res.json({ coupons: saved.map(formatCoupon) });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: "参数错误", details: err.errors });
      return;
    }
    console.error("[admin] coupons put:", err);
    res.status(500).json({ error: "服务器内部错误" });
  }
});

/* ── 在线 IM（#8）──────────────────────────────────────── */

adminApiRouter.get("/chat/unread-count", async (_req, res) => {
  const count = await getUnreadImCountForOps();
  res.json({ count });
});

adminApiRouter.get("/chat/conversations", async (req, res) => {
  const status = typeof req.query.status === "string" ? req.query.status : undefined;
  const conversations = await listChatConversationsForAdmin(status);
  res.json({ conversations });
});

adminApiRouter.get("/chat/conversations/:id/messages", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ error: "参数错误" });
    return;
  }
  const messages = await listMessagesForConversation(id, 0);
  await markMessagesReadByOps(id);
  res.json({ messages });
});

adminApiRouter.post("/chat/conversations/:id/messages", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ error: "参数错误" });
    return;
  }
  const body = typeof req.body?.body === "string" ? req.body.body.trim() : "";
  if (!body) {
    res.status(400).json({ error: "消息不能为空" });
    return;
  }
  try {
    const message = await sendOpsChatMessage(id, body);
    res.status(201).json({ message });
  } catch (err) {
    const message = err instanceof Error ? err.message : "发送失败";
    res.status(400).json({ error: message });
  }
});

adminApiRouter.post("/chat/conversations/:id/close", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ error: "参数错误" });
    return;
  }
  await closeConversation(id);
  res.json({ success: true });
});

/* ── Stripe 对账镜像（7d-v1，仅超级管理员）──────────────── */

adminApiRouter.get("/stripe/status", requireSuperAdmin, async (_req, res) => {
  const [lastSync, balances] = await Promise.all([getLatestSyncRun(), getLatestBalanceSnapshots()]);
  res.json({
    configured: isStripeConfigured(),
    lastSync: formatSyncRun(lastSync),
    balances: balances.map(formatBalanceSnapshot),
  });
});

adminApiRouter.post("/stripe/sync", requireSuperAdmin, async (req, res) => {
  if (!isStripeConfigured()) {
    res.status(503).json({ error: "STRIPE_SECRET_KEY 未配置" });
    return;
  }
  try {
    const days = Number(req.body?.days ?? 90);
    const run = await runStripeMirrorSync(Number.isFinite(days) ? days : 90);
    res.json({ syncRun: formatSyncRun(run) });
  } catch (err) {
    const message = err instanceof Error ? err.message : "同步失败";
    const syncRun = (err as { syncRun?: unknown }).syncRun ?? null;
    res.status(500).json({ error: message, syncRun: formatSyncRun(syncRun as ReturnType<typeof formatSyncRun>) });
  }
});

adminApiRouter.get("/stripe/reconciliation", requireSuperAdmin, async (req, res) => {
  const days = Number(req.query.days ?? 30);
  const data = await getStripeReconciliation(Number.isFinite(days) ? days : 30);
  res.json(data);
});

adminApiRouter.get("/stripe/charges", requireSuperAdmin, async (req, res) => {
  const limit = Number(req.query.limit ?? 50);
  const offset = Number(req.query.offset ?? 0);
  const rows = await listStripeCharges(
    Number.isFinite(limit) ? limit : 50,
    Number.isFinite(offset) ? offset : 0,
  );
  res.json({ charges: rows.map(formatStripeRow) });
});

adminApiRouter.get("/stripe/refunds", requireSuperAdmin, async (req, res) => {
  const limit = Number(req.query.limit ?? 50);
  const offset = Number(req.query.offset ?? 0);
  const rows = await listStripeRefunds(
    Number.isFinite(limit) ? limit : 50,
    Number.isFinite(offset) ? offset : 0,
  );
  res.json({ refunds: rows.map(formatStripeRow) });
});

adminApiRouter.get("/stripe/payouts", requireSuperAdmin, async (req, res) => {
  const limit = Number(req.query.limit ?? 50);
  const offset = Number(req.query.offset ?? 0);
  const rows = await listStripePayouts(
    Number.isFinite(limit) ? limit : 50,
    Number.isFinite(offset) ? offset : 0,
  );
  res.json({ payouts: rows.map(formatStripeRow) });
});

/** 7c 用户钱包 — 仅超级管理员 */
adminApiRouter.get("/wallets", requireSuperAdmin, async (req, res) => {
  const q = String(req.query.q ?? "");
  const limit = Number(req.query.limit) || 50;
  const offset = Number(req.query.offset) || 0;
  const data = await listWalletsAdmin({ q, limit, offset });
  res.json(data);
});

adminApiRouter.get("/wallets/:userId", requireSuperAdmin, async (req, res) => {
  const userId = Number(req.params.userId);
  if (!Number.isInteger(userId) || userId <= 0) {
    res.status(400).json({ error: "参数错误" });
    return;
  }
  const summary = await getWalletUserSummary(userId);
  if (!summary) {
    res.status(404).json({ error: "用户不存在" });
    return;
  }
  res.json(summary);
});

adminApiRouter.get("/wallets/:userId/ledger", requireSuperAdmin, async (req, res) => {
  const userId = Number(req.params.userId);
  if (!Number.isInteger(userId) || userId <= 0) {
    res.status(400).json({ error: "参数错误" });
    return;
  }
  const limit = Math.min(Number(req.query.limit) || 50, 200);
  const entries = await listLedgerForUser(userId, limit);
  res.json({ entries });
});

const walletAdjustSchema = z.object({
  currency: z.string().min(3).max(8),
  amountCents: z.number().int().refine((n) => n !== 0, "调整金额不能为 0"),
  note: z.string().max(500).optional(),
});

adminApiRouter.post("/wallets/:userId/adjustment", requireSuperAdmin, async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    if (!Number.isInteger(userId) || userId <= 0) {
      res.status(400).json({ error: "参数错误" });
      return;
    }
    const body = walletAdjustSchema.parse(req.body);
    const adminUser = (req as typeof req & { adminUser?: { id: number } }).adminUser;
    const result = await postWalletLedgerEntry({
      userId,
      currency: body.currency,
      amountCents: body.amountCents,
      kind: "adjustment",
      referenceType: "admin_adjustment",
      referenceId: adminUser?.id ? String(adminUser.id) : undefined,
      note: body.note,
      createdBy: adminUser?.id,
      idempotencyKey: `admin-adjust:${userId}:${body.currency}:${Date.now()}:${body.amountCents}`,
    });
    res.status(201).json(result);
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: "参数错误", details: err.errors });
      return;
    }
    const message = err instanceof Error ? err.message : "服务器内部错误";
    if (message === "用户不存在" || message.includes("不支持") || message === "余额不足") {
      res.status(400).json({ error: message });
      return;
    }
    console.error("[admin] wallet adjustment:", err);
    res.status(500).json({ error: "服务器内部错误" });
  }
});
