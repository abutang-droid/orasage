import { Router, type Request, type Response } from "express";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db/index.ts";
import { userOrders, userReadings, userRecommendations } from "../db/schema.ts";
import { getAuthUser } from "../lib/auth-user.ts";

export const accountRouter = Router();

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

async function requireUser(req: Request, res: Response) {
  const user = await getAuthUser(req);
  if (!user) {
    res.status(401).json({ error: "未登录" });
    return null;
  }
  return user;
}

accountRouter.get("/readings", async (req, res) => {
  const user = await requireUser(req, res);
  if (!user) return;
  const rows = await db.select().from(userReadings).where(eq(userReadings.userId, user.id)).orderBy(desc(userReadings.createdAt)).limit(50);
  res.json({
    readings: rows.map((r) => ({
      id: r.id,
      appSource: r.appSource,
      appLabel: APP_LABELS[r.appSource] ?? r.appSource,
      readingId: r.readingId,
      title: r.title,
      summary: r.summary,
      recommendationReason: r.recommendationReason,
      crystalSku: r.crystalSku,
      createdAt: r.createdAt,
    })),
  });
});

accountRouter.get("/orders", async (req, res) => {
  const user = await requireUser(req, res);
  if (!user) return;
  const rows = await db.select().from(userOrders).where(eq(userOrders.userId, user.id)).orderBy(desc(userOrders.createdAt)).limit(50);
  res.json({
    orders: rows.map((o) => ({
      id: o.id,
      orderNo: o.orderNo,
      title: o.title,
      amountCents: o.amountCents,
      currency: o.currency,
      amountDisplay: `¥${(o.amountCents / 100).toFixed(2)}`,
      status: o.status,
      statusLabel: STATUS_LABELS[o.status] ?? o.status,
      appSource: o.appSource,
      appLabel: o.appSource ? APP_LABELS[o.appSource] : null,
      createdAt: o.createdAt,
    })),
  });
});

accountRouter.get("/recommendations", async (req, res) => {
  const user = await requireUser(req, res);
  if (!user) return;
  const rows = await db.select().from(userRecommendations).where(eq(userRecommendations.userId, user.id)).orderBy(desc(userRecommendations.createdAt)).limit(20);
  res.json({
    recommendations: rows.map((r) => ({
      id: r.id,
      appSource: r.appSource,
      appLabel: APP_LABELS[r.appSource] ?? r.appSource,
      crystalSku: r.crystalSku,
      reason: r.reason,
      readingId: r.readingId,
      createdAt: r.createdAt,
    })),
  });
});

const readingSchema = z.object({
  userId: z.number().int().positive(),
  appSource: z.enum(["bazi", "ziwei", "tarot"]),
  readingId: z.string().min(1).max(100),
  title: z.string().min(1).max(200),
  summary: z.string().max(2000).optional(),
  recommendationReason: z.string().max(500).optional(),
  crystalSku: z.string().max(100).optional(),
});

const orderSchema = z.object({
  userId: z.number().int().positive(),
  orderNo: z.string().min(1).max(64),
  title: z.string().min(1).max(200),
  amountCents: z.number().int().nonnegative(),
  currency: z.string().max(8).optional(),
  status: z.enum(["pending", "paid", "shipped", "completed", "cancelled"]).optional(),
  appSource: z.enum(["bazi", "ziwei", "tarot", "shop"]).optional(),
});

const orderUpdateSchema = z.object({
  status: z.enum(["pending", "paid", "shipped", "completed", "cancelled"]),
});

export const internalRouter = Router();

internalRouter.post("/readings", async (req, res) => {
  try {
    const body = readingSchema.parse(req.body);
    const existing = await db.select().from(userReadings).where(eq(userReadings.readingId, body.readingId)).limit(1);
    if (existing.length > 0) {
      res.json({ success: true, id: existing[0].id, duplicate: true });
      return;
    }
    const [row] = await db.insert(userReadings).values({
      userId: body.userId,
      appSource: body.appSource,
      readingId: body.readingId,
      title: body.title,
      summary: body.summary,
      recommendationReason: body.recommendationReason,
      crystalSku: body.crystalSku,
    }).returning();
    if (body.recommendationReason && body.crystalSku) {
      await db.insert(userRecommendations).values({
        userId: body.userId,
        appSource: body.appSource,
        crystalSku: body.crystalSku,
        reason: body.recommendationReason,
        readingId: body.readingId,
      });
    }
    res.status(201).json({ success: true, id: row.id });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: "参数错误", details: err.errors });
      return;
    }
    console.error("[internal] reading error:", err);
    res.status(500).json({ error: "服务器内部错误" });
  }
});

internalRouter.post("/orders", async (req, res) => {
  try {
    const body = orderSchema.parse(req.body);
    const dup = await db.select().from(userOrders).where(eq(userOrders.orderNo, body.orderNo)).limit(1);
    if (dup.length > 0) {
      if (body.status && body.status !== dup[0].status) {
        await db.update(userOrders).set({ status: body.status }).where(eq(userOrders.orderNo, body.orderNo));
      }
      res.json({ success: true, id: dup[0].id, duplicate: true, updated: Boolean(body.status) });
      return;
    }
    const [row] = await db.insert(userOrders).values({
      userId: body.userId,
      orderNo: body.orderNo,
      title: body.title,
      amountCents: body.amountCents,
      currency: body.currency ?? "CNY",
      status: body.status ?? "pending",
      appSource: body.appSource,
    }).returning();
    res.status(201).json({ success: true, id: row.id });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: "参数错误", details: err.errors });
      return;
    }
    console.error("[internal] order error:", err);
    res.status(500).json({ error: "服务器内部错误" });
  }
});

internalRouter.patch("/orders/:orderNo", async (req, res) => {
  try {
    const orderNo = String(req.params.orderNo);
    const body = orderUpdateSchema.parse(req.body);
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
    console.error("[internal] order update error:", err);
    res.status(500).json({ error: "服务器内部错误" });
  }
});
