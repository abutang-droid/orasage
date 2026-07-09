import { Router } from "express";
import { count, desc, eq, gt } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db/index.ts";
import { contactMessages, products, userOrders, userReadings, users } from "../db/schema.ts";
import { requireAdmin } from "../lib/admin-auth.ts";
import { formatAdminProduct, formatProduct } from "../lib/product-format.ts";
import { listHomepageFeaturedSkus, resolveHomepageProducts, setHomepageFeaturedSkus } from "../lib/homepage-products.ts";
import {
  BAZI_ELEMENTS,
  resolveBaziElementRecommendations,
  setBaziElementRecommendations,
  type BaziElement,
} from "../lib/bazi-recommend-products.ts";
import {
  listZiweiRecommendRows,
  setZiweiRecommendSkus,
} from "../lib/ziwei-chat.ts";
import {
  getTarotBillingSkus,
  listTarotDailyRecommendRows,
  setTarotBillingSkus,
  setTarotDailyRecommendSkus,
} from "../lib/tarot-billing.ts";
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
  res.json({ products: rows.map(formatAdminProduct) });
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

const baziElementRecSchema = z.object({
  sku: z.string().min(1).max(100),
  priceCents: z.number().int().nonnegative().nullable().optional(),
  priceCentsUsd: z.number().int().nonnegative().nullable().optional(),
});

const baziRecommendSchema = z.object({
  items: z.object({
    木: baziElementRecSchema,
    火: baziElementRecSchema,
    土: baziElementRecSchema,
    金: baziElementRecSchema,
    水: baziElementRecSchema,
  }),
}).or(z.object({
  skuMap: z.object({
    木: z.string().min(1).max(100),
    火: z.string().min(1).max(100),
    土: z.string().min(1).max(100),
    金: z.string().min(1).max(100),
    水: z.string().min(1).max(100),
  }),
}));

adminApiRouter.get("/bazi-recommend-products", async (_req, res) => {
  try {
    const data = await resolveBaziElementRecommendations();
    res.json(data);
  } catch (err) {
    console.error("[admin] bazi-recommend-products:", err);
    res.status(500).json({ error: "服务器内部错误" });
  }
});

adminApiRouter.put("/bazi-recommend-products", async (req, res) => {
  try {
    const body = baziRecommendSchema.parse(req.body);
    let input: Partial<Record<BaziElement, { sku: string; priceCents?: number | null; priceCentsUsd?: number | null }>>;
    if ("items" in body) {
      input = body.items as Partial<Record<BaziElement, { sku: string; priceCents?: number | null; priceCentsUsd?: number | null }>>;
    } else {
      input = {};
      for (const element of BAZI_ELEMENTS) {
        const sku = body.skuMap[element];
        if (sku) input[element] = { sku };
      }
    }
    const data = await setBaziElementRecommendations(input);
    res.json(data);
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: "参数错误", details: err.errors });
      return;
    }
    if (err instanceof Error && err.message.startsWith("未知 SKU")) {
      res.status(400).json({ error: err.message });
      return;
    }
    console.error("[admin] bazi-recommend-products:", err);
    res.status(500).json({ error: "服务器内部错误" });
  }
});

const ziweiRecommendSchema = z.object({
  skus: z.array(z.string().min(1).max(100)),
});

adminApiRouter.get("/ziwei-recommend-products", async (_req, res) => {
  try {
    const rows = await listZiweiRecommendRows();
    res.json({ skus: rows.map((r) => r.sku), rows });
  } catch (err) {
    console.error("[admin] ziwei-recommend-products:", err);
    res.status(500).json({ error: "服务器内部错误" });
  }
});

adminApiRouter.put("/ziwei-recommend-products", async (req, res) => {
  try {
    const body = ziweiRecommendSchema.parse(req.body);
    const rows = await setZiweiRecommendSkus(body.skus);
    res.json({ skus: rows.map((r) => r.sku), rows });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: "参数错误", details: err.errors });
      return;
    }
    if (err instanceof Error && err.message.startsWith("未知 SKU")) {
      res.status(400).json({ error: err.message });
      return;
    }
    console.error("[admin] ziwei-recommend-products:", err);
    res.status(500).json({ error: "服务器内部错误" });
  }
});

const tarotBillingSchema = z.object({
  dailyOverageSku: z.string().min(1).max(100),
  threeCardReportSku: z.string().min(1).max(100),
  threeCardBundleSku: z.string().min(1).max(100),
});

adminApiRouter.get("/tarot-billing-config", async (_req, res) => {
  try {
    const skus = await getTarotBillingSkus();
    const recommendRows = await listTarotDailyRecommendRows();
    res.json({
      ...skus,
      recommendSkus: recommendRows.map((r) => r.sku),
      recommendRows,
    });
  } catch (err) {
    console.error("[admin] tarot-billing-config:", err);
    res.status(500).json({ error: "服务器内部错误" });
  }
});

adminApiRouter.put("/tarot-billing-config", async (req, res) => {
  try {
    const body = tarotBillingSchema.parse(req.body);
    const skus = await setTarotBillingSkus(body);
    res.json({ skus });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: "参数错误", details: err.errors });
      return;
    }
    if (err instanceof Error && err.message.startsWith("未知 SKU")) {
      res.status(400).json({ error: err.message });
      return;
    }
    console.error("[admin] tarot-billing-config:", err);
    res.status(500).json({ error: "服务器内部错误" });
  }
});

const tarotRecommendSchema = z.object({
  skus: z.array(z.string().min(1).max(100)),
});

adminApiRouter.put("/tarot-daily-recommend-products", async (req, res) => {
  try {
    const body = tarotRecommendSchema.parse(req.body);
    const rows = await setTarotDailyRecommendSkus(body.skus);
    res.json({ skus: rows.map((r) => r.sku), rows });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: "参数错误", details: err.errors });
      return;
    }
    if (err instanceof Error && err.message.startsWith("未知 SKU")) {
      res.status(400).json({ error: err.message });
      return;
    }
    console.error("[admin] tarot-daily-recommend:", err);
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
      description: body.description,
      descriptionI18n: body.descriptionI18n ?? null,
      priceCents: body.priceCents,
      priceCentsUsd: body.priceCentsUsd ?? null,
      category: body.category,
      requiresShipping: body.requiresShipping ?? false,
      active: body.active ?? true,
      sortOrder: body.sortOrder ?? 0,
    }).returning();
    res.status(201).json({ product: formatProduct(row) });
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
    if (body.description !== undefined) updates.description = body.description;
    if (body.descriptionI18n !== undefined) updates.descriptionI18n = body.descriptionI18n;
    if (body.priceCents !== undefined) updates.priceCents = body.priceCents;
    if (body.priceCentsUsd !== undefined) updates.priceCentsUsd = body.priceCentsUsd;
    if (body.category !== undefined) updates.category = body.category;
    if (body.requiresShipping !== undefined) updates.requiresShipping = body.requiresShipping;
    if (body.active !== undefined) updates.active = body.active;
    if (body.sortOrder !== undefined) updates.sortOrder = body.sortOrder;

    const [row] = await db.update(products).set(updates).where(eq(products.sku, sku)).returning();
    res.json({ product: formatProduct(row) });
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
