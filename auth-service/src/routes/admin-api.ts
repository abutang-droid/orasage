import { Router } from "express";
import { count, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db/index.ts";
import { products, userOrders, userReadings, users } from "../db/schema.ts";
import { requireAdmin } from "../lib/admin-auth.ts";
import { formatProduct } from "../lib/product-format.ts";
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
import { productBodySchema, productPatchSchema } from "./products.ts";

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
  res.json({ products: rows.map(formatProduct) });
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
      element: body.element ?? null,
      description: body.description,
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
    if (body.element !== undefined) updates.element = body.element;
    if (body.description !== undefined) updates.description = body.description;
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

adminApiRouter.get("/orders", async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 100, 200);
  const rows = await db.select().from(userOrders).orderBy(desc(userOrders.createdAt)).limit(limit);
  res.json({
    orders: rows.map((o) => ({
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
      createdAt: o.createdAt,
    })),
  });
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
