import { Router, type Request, type Response } from "express";
import { desc, eq, and } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db/index.ts";
import { contactMessages, savedProfiles, userAddresses, userOrders, userReadings, userRecommendations } from "../db/schema.ts";
import { getAuthUser } from "../lib/auth-user.ts";
import { resolveReadingDetailUrl } from "../lib/reading-detail-url.ts";
import { formatShipment, listShipmentsForOrder } from "../lib/shop-shipments.ts";
import {
  applyCouponToOrder,
  finalizeCouponOnPaid,
  removeCouponFromOrder,
} from "../lib/order-coupon.ts";
import { notifyOrderEvent } from "../lib/order-notify.ts";
import { notifyNewTicket } from "../lib/ticket-notify.ts";
import {
  listLedgerForUser,
  listWalletsForUser,
  postWalletLedgerEntry,
  SUPPORTED_WALLET_CURRENCIES,
} from "../lib/wallets.ts";

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

const readingSyncSchema = z.object({
  appSource: z.enum(["bazi", "ziwei", "tarot"]),
  readingId: z.string().min(1).max(100),
  title: z.string().min(1).max(200),
  summary: z.string().max(2000).optional(),
  recommendationReason: z.string().max(500).optional(),
  crystalSku: z.string().max(100).optional(),
  payloadJson: z.string().max(50000).optional(),
});

accountRouter.post("/readings/sync", async (req, res) => {
  const user = await requireUser(req, res);
  if (!user) return;
  try {
    const body = readingSyncSchema.parse(req.body);
    const existing = await db
      .select()
      .from(userReadings)
      .where(eq(userReadings.readingId, body.readingId))
      .limit(1);
    if (existing.length > 0) {
      const row = existing[0];
      if (row.userId !== user.id) {
        res.status(403).json({ error: "无权更新该记录" });
        return;
      }
      const updates: {
        title?: string;
        summary?: string | null;
        recommendationReason?: string | null;
        crystalSku?: string | null;
        payloadJson?: string | null;
      } = {};
      if (body.title) updates.title = body.title;
      if (body.summary !== undefined) updates.summary = body.summary ?? null;
      if (body.recommendationReason !== undefined) {
        updates.recommendationReason = body.recommendationReason ?? null;
      }
      if (body.crystalSku !== undefined) updates.crystalSku = body.crystalSku ?? null;
      if (body.payloadJson) updates.payloadJson = body.payloadJson;

      if (Object.keys(updates).length > 0) {
        await db.update(userReadings).set(updates).where(eq(userReadings.id, row.id));
      }
      res.json({ success: true, id: row.id, duplicate: true });
      return;
    }
    const [row] = await db
      .insert(userReadings)
      .values({
        userId: user.id,
        appSource: body.appSource,
        readingId: body.readingId,
        title: body.title,
        summary: body.summary,
        recommendationReason: body.recommendationReason,
        crystalSku: body.crystalSku,
        payloadJson: body.payloadJson,
      })
      .returning();
    if (body.recommendationReason && body.crystalSku) {
      await db.insert(userRecommendations).values({
        userId: user.id,
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
    console.error("[readings] sync error:", err);
    res.status(500).json({ error: "服务器内部错误" });
  }
});

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
      reportUrl: r.appSource === "ziwei" ? null : r.reportUrl,
      detailUrl: resolveReadingDetailUrl(r.appSource, r.payloadJson, r.reportUrl),
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
      readingId: o.readingId,
      createdAt: o.createdAt,
    })),
  });
});

function mapAddressRow(row: typeof userAddresses.$inferSelect) {
  return {
    id: row.id,
    label: row.label,
    name: row.name,
    phone: row.phone,
    countryCode: row.countryCode,
    province: row.province,
    city: row.city,
    district: row.district,
    addressLine: row.addressLine,
    postalCode: row.postalCode,
    wristCm: row.wristCm,
    isDefault: row.isDefault,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

const addressBodySchema = z.object({
  label: z.string().max(50).optional().nullable(),
  name: z.string().min(1).max(100),
  phone: z.string().min(1).max(40),
  countryCode: z.string().length(2).default('CN'),
  province: z.string().max(100).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  district: z.string().max(100).optional().nullable(),
  addressLine: z.string().min(1).max(500),
  postalCode: z.string().max(20).optional().nullable(),
  wristCm: z.string().max(20).optional().nullable(),
  isDefault: z.boolean().optional(),
});

accountRouter.get("/addresses", async (req, res) => {
  const user = await requireUser(req, res);
  if (!user) return;
  const rows = await db
    .select()
    .from(userAddresses)
    .where(eq(userAddresses.userId, user.id))
    .orderBy(desc(userAddresses.isDefault), desc(userAddresses.updatedAt));
  res.json({ addresses: rows.map(mapAddressRow) });
});

accountRouter.post("/addresses", async (req, res) => {
  const user = await requireUser(req, res);
  if (!user) return;
  try {
    const body = addressBodySchema.parse(req.body);
    if (body.isDefault) {
      await db.update(userAddresses).set({ isDefault: false }).where(eq(userAddresses.userId, user.id));
    }
    const existing = await db.select().from(userAddresses).where(eq(userAddresses.userId, user.id));
    const [row] = await db.insert(userAddresses).values({
      userId: user.id,
      label: body.label ?? null,
      name: body.name,
      phone: body.phone,
      countryCode: body.countryCode.toUpperCase(),
      province: body.province ?? null,
      city: body.city ?? null,
      district: body.district ?? null,
      addressLine: body.addressLine,
      postalCode: body.postalCode ?? null,
      wristCm: body.wristCm ?? null,
      isDefault: body.isDefault ?? existing.length === 0,
      updatedAt: new Date(),
    }).returning();
    res.status(201).json({ address: mapAddressRow(row) });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: "参数错误", details: err.errors });
      return;
    }
    console.error("[addresses] create error:", err);
    res.status(500).json({ error: "服务器内部错误" });
  }
});

accountRouter.put("/addresses/:id", async (req, res) => {
  const user = await requireUser(req, res);
  if (!user) return;
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    res.status(400).json({ error: "无效地址 ID" });
    return;
  }
  try {
    const body = addressBodySchema.parse(req.body);
    const [existing] = await db.select().from(userAddresses).where(and(eq(userAddresses.id, id), eq(userAddresses.userId, user.id))).limit(1);
    if (!existing) {
      res.status(404).json({ error: "地址不存在" });
      return;
    }
    if (body.isDefault) {
      await db.update(userAddresses).set({ isDefault: false }).where(eq(userAddresses.userId, user.id));
    }
    const [row] = await db.update(userAddresses).set({
      label: body.label ?? null,
      name: body.name,
      phone: body.phone,
      countryCode: body.countryCode.toUpperCase(),
      province: body.province ?? null,
      city: body.city ?? null,
      district: body.district ?? null,
      addressLine: body.addressLine,
      postalCode: body.postalCode ?? null,
      wristCm: body.wristCm ?? null,
      isDefault: body.isDefault ?? existing.isDefault,
      updatedAt: new Date(),
    }).where(eq(userAddresses.id, id)).returning();
    res.json({ address: mapAddressRow(row) });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: "参数错误", details: err.errors });
      return;
    }
    console.error("[addresses] update error:", err);
    res.status(500).json({ error: "服务器内部错误" });
  }
});

accountRouter.delete("/addresses/:id", async (req, res) => {
  const user = await requireUser(req, res);
  if (!user) return;
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    res.status(400).json({ error: "无效地址 ID" });
    return;
  }
  const [existing] = await db.select().from(userAddresses).where(and(eq(userAddresses.id, id), eq(userAddresses.userId, user.id))).limit(1);
  if (!existing) {
    res.status(404).json({ error: "地址不存在" });
    return;
  }
  await db.delete(userAddresses).where(eq(userAddresses.id, id));
  res.json({ success: true });
});

accountRouter.get("/orders/:orderNo", async (req, res) => {
  const user = await requireUser(req, res);
  if (!user) return;
  const orderNo = String(req.params.orderNo);
  const [order] = await db.select().from(userOrders).where(eq(userOrders.orderNo, orderNo)).limit(1);
  if (!order || order.userId !== user.id) {
    res.status(404).json({ error: "订单不存在" });
    return;
  }
  const shipmentRows = await listShipmentsForOrder(orderNo);
  res.json({
    order: {
      id: order.id,
      orderNo: order.orderNo,
      title: order.title,
      sku: order.sku,
      amountCents: order.amountCents,
      currency: order.currency,
      amountDisplay: `¥${(order.amountCents / 100).toFixed(2)}`,
      status: order.status,
      statusLabel: STATUS_LABELS[order.status] ?? order.status,
      appSource: order.appSource,
      appLabel: order.appSource ? APP_LABELS[order.appSource] : null,
      shippingAddress: order.shippingAddress,
      recommendationContext: order.recommendationContext,
      readingId: order.readingId,
      createdAt: order.createdAt,
    },
    shipments: shipmentRows.map(({ shipment, events }) => formatShipment(shipment, events)),
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

const profileBodySchema = z.object({
  label: z.string().max(50).optional().nullable(),
  name: z.string().min(1).max(100),
  gender: z.enum(["male", "female"]).optional().nullable(),
  birthYear: z.string().max(4).optional().nullable(),
  birthMonth: z.string().max(2).optional().nullable(),
  birthDay: z.string().max(2).optional().nullable(),
  birthHour: z.string().max(2).optional().nullable(),
  birthMinute: z.string().max(2).optional().nullable(),
  birthPlaceProvince: z.string().max(50).optional().nullable(),
  birthPlaceCity: z.string().max(50).optional().nullable(),
  birthPlaceLongitude: z.string().max(20).optional().nullable(),
  sourceApp: z.enum(["bazi", "ziwei", "tarot", "shop"]).optional().nullable(),
});

function mapSavedProfile(row: typeof savedProfiles.$inferSelect) {
  return {
    id: row.id,
    label: row.label,
    name: row.name,
    gender: row.gender,
    birthYear: row.birthYear,
    birthMonth: row.birthMonth,
    birthDay: row.birthDay,
    birthHour: row.birthHour,
    birthMinute: row.birthMinute,
    birthPlaceProvince: row.birthPlaceProvince,
    birthPlaceCity: row.birthPlaceCity,
    birthPlaceLongitude: row.birthPlaceLongitude,
    sourceApp: row.sourceApp,
    sourceAppLabel: row.sourceApp ? APP_LABELS[row.sourceApp] : null,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

const PROFILE_LABELS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

function nextProfileLabel(rows: Array<{ label: string | null }>): string {
  const used = new Set(rows.map((r) => r.label?.trim()).filter(Boolean));
  for (const label of PROFILE_LABELS) {
    if (!used.has(label)) return label;
  }
  return String(rows.length + 1);
}

function profileBirthKey(body: {
  name: string;
  birthYear?: string | null;
  birthMonth?: string | null;
  birthDay?: string | null;
}) {
  return `${body.name}|${body.birthYear ?? ""}|${body.birthMonth ?? ""}|${body.birthDay ?? ""}`;
}

function profileValuesFromBody(userId: number, body: z.infer<typeof profileBodySchema>, label: string | null) {
  return {
    userId,
    label,
    name: body.name,
    gender: body.gender ?? null,
    birthYear: body.birthYear ?? null,
    birthMonth: body.birthMonth ?? null,
    birthDay: body.birthDay ?? null,
    birthHour: body.birthHour ?? null,
    birthMinute: body.birthMinute ?? null,
    birthPlaceProvince: body.birthPlaceProvince ?? null,
    birthPlaceCity: body.birthPlaceCity ?? null,
    birthPlaceLongitude: body.birthPlaceLongitude ?? null,
    sourceApp: body.sourceApp ?? null,
  };
}

accountRouter.get("/profiles", async (req, res) => {
  const user = await requireUser(req, res);
  if (!user) return;
  const rows = await db
    .select()
    .from(savedProfiles)
    .where(eq(savedProfiles.userId, user.id))
    .orderBy(desc(savedProfiles.updatedAt));
  res.json({ profiles: rows.map(mapSavedProfile) });
});

accountRouter.post("/profiles", async (req, res) => {
  const user = await requireUser(req, res);
  if (!user) return;
  try {
    const body = profileBodySchema.parse(req.body);
    const [row] = await db.insert(savedProfiles).values({
      userId: user.id,
      label: body.label ?? null,
      name: body.name,
      gender: body.gender ?? null,
      birthYear: body.birthYear ?? null,
      birthMonth: body.birthMonth ?? null,
      birthDay: body.birthDay ?? null,
      birthHour: body.birthHour ?? null,
      birthMinute: body.birthMinute ?? null,
      birthPlaceProvince: body.birthPlaceProvince ?? null,
      birthPlaceCity: body.birthPlaceCity ?? null,
      birthPlaceLongitude: body.birthPlaceLongitude ?? null,
      sourceApp: body.sourceApp ?? null,
    }).returning();
    res.status(201).json({ profile: mapSavedProfile(row) });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: "参数错误", details: err.errors });
      return;
    }
    console.error("[profiles] create error:", err);
    res.status(500).json({ error: "服务器内部错误" });
  }
});

accountRouter.put("/profiles/:id", async (req, res) => {
  const user = await requireUser(req, res);
  if (!user) return;
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    res.status(400).json({ error: "无效 ID" });
    return;
  }
  try {
    const body = profileBodySchema.parse(req.body);
    const [existing] = await db
      .select()
      .from(savedProfiles)
      .where(and(eq(savedProfiles.id, id), eq(savedProfiles.userId, user.id)))
      .limit(1);
    if (!existing) {
      res.status(404).json({ error: "资料不存在" });
      return;
    }
    const [row] = await db
      .update(savedProfiles)
      .set({
        label: body.label ?? null,
        name: body.name,
        gender: body.gender ?? null,
        birthYear: body.birthYear ?? null,
        birthMonth: body.birthMonth ?? null,
        birthDay: body.birthDay ?? null,
        birthHour: body.birthHour ?? null,
        birthMinute: body.birthMinute ?? null,
        birthPlaceProvince: body.birthPlaceProvince ?? null,
        birthPlaceCity: body.birthPlaceCity ?? null,
        birthPlaceLongitude: body.birthPlaceLongitude ?? null,
        sourceApp: body.sourceApp ?? existing.sourceApp,
        updatedAt: new Date(),
      })
      .where(eq(savedProfiles.id, id))
      .returning();
    res.json({ profile: mapSavedProfile(row) });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: "参数错误", details: err.errors });
      return;
    }
    console.error("[profiles] update error:", err);
    res.status(500).json({ error: "服务器内部错误" });
  }
});

accountRouter.delete("/profiles/:id", async (req, res) => {
  const user = await requireUser(req, res);
  if (!user) return;
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    res.status(400).json({ error: "无效 ID" });
    return;
  }
  await db.delete(savedProfiles).where(and(eq(savedProfiles.id, id), eq(savedProfiles.userId, user.id)));
  res.json({ success: true });
});

accountRouter.delete("/profiles", async (req, res) => {
  const user = await requireUser(req, res);
  if (!user) return;
  await db.delete(savedProfiles).where(eq(savedProfiles.userId, user.id));
  res.json({ success: true });
});

accountRouter.post("/profiles/sync", async (req, res) => {
  const user = await requireUser(req, res);
  if (!user) return;
  try {
    const body = profileBodySchema.parse(req.body);
    const rows = await db
      .select()
      .from(savedProfiles)
      .where(eq(savedProfiles.userId, user.id))
      .orderBy(desc(savedProfiles.updatedAt));

    const key = profileBirthKey(body);
    const existing = rows.find(
      (row) =>
        profileBirthKey({
          name: row.name,
          birthYear: row.birthYear,
          birthMonth: row.birthMonth,
          birthDay: row.birthDay,
        }) === key,
    );

    if (existing) {
      const [row] = await db
        .update(savedProfiles)
        .set({
          ...profileValuesFromBody(user.id, body, body.label ?? existing.label),
          updatedAt: new Date(),
        })
        .where(eq(savedProfiles.id, existing.id))
        .returning();
      res.json({ profile: mapSavedProfile(row), created: false });
      return;
    }

    const label = body.label?.trim() || nextProfileLabel(rows);
    const [row] = await db
      .insert(savedProfiles)
      .values(profileValuesFromBody(user.id, body, label))
      .returning();
    res.status(201).json({ profile: mapSavedProfile(row), created: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: "参数错误", details: err.errors });
      return;
    }
    console.error("[profiles] sync error:", err);
    res.status(500).json({ error: "服务器内部错误" });
  }
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

const readingUpdateSchema = z.object({
  reportUrl: z.string().url().max(512).optional(),
  title: z.string().max(200).optional(),
  summary: z.string().max(2000).optional(),
});

const orderSchema = z.object({
  userId: z.number().int().positive(),
  orderNo: z.string().min(1).max(64),
  title: z.string().min(1).max(200),
  sku: z.string().max(100).optional(),
  amountCents: z.number().int().nonnegative(),
  currency: z.string().max(8).optional(),
  status: z.enum(["pending", "paid", "shipped", "completed", "cancelled"]).optional(),
  appSource: z.enum(["bazi", "ziwei", "tarot", "shop"]).optional(),
  shippingAddress: z.string().max(2000).optional(),
  recommendationContext: z.string().max(2000).optional(),
  readingId: z.string().max(100).optional(),
});

const orderUpdateSchema = z.object({
  status: z.enum(["pending", "paid", "shipped", "completed", "cancelled"]).optional(),
  shippingAddress: z.string().max(2000).optional(),
}).refine((b) => b.status !== undefined || b.shippingAddress !== undefined, {
  message: "至少提供一个更新字段",
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

internalRouter.get("/readings/:readingId", async (req, res) => {
  const readingId = String(req.params.readingId);
  const [row] = await db.select().from(userReadings).where(eq(userReadings.readingId, readingId)).limit(1);
  if (!row) {
    res.status(404).json({ error: "占卜记录不存在" });
    return;
  }
  res.json({
    reading: {
      id: row.id,
      userId: row.userId,
      appSource: row.appSource,
      readingId: row.readingId,
      title: row.title,
      summary: row.summary,
      reportUrl: row.reportUrl,
      payloadJson: row.payloadJson,
    },
  });
});

internalRouter.patch("/readings/:readingId", async (req, res) => {
  try {
    const readingId = String(req.params.readingId);
    const body = readingUpdateSchema.parse(req.body);
    const [existing] = await db.select().from(userReadings).where(eq(userReadings.readingId, readingId)).limit(1);
    if (!existing) {
      res.status(404).json({ error: "占卜记录不存在" });
      return;
    }
    const updates: Record<string, unknown> = {};
    if (body.reportUrl !== undefined) updates.reportUrl = body.reportUrl;
    if (body.title !== undefined) updates.title = body.title;
    if (body.summary !== undefined) updates.summary = body.summary;
    if (Object.keys(updates).length === 0) {
      res.status(400).json({ error: "没有需要更新的字段" });
      return;
    }
    await db.update(userReadings).set(updates).where(eq(userReadings.readingId, readingId));
    res.json({ success: true, readingId });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: "参数错误", details: err.errors });
      return;
    }
    console.error("[internal] reading update error:", err);
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
        if (body.status === "paid" && dup[0].status !== "paid") {
          notifyOrderEvent("paid", { ...dup[0], status: "paid" });
        }
      }
      res.json({ success: true, id: dup[0].id, duplicate: true, updated: Boolean(body.status) });
      return;
    }
    const [row] = await db.insert(userOrders).values({
      userId: body.userId,
      orderNo: body.orderNo,
      title: body.title,
      sku: body.sku,
      amountCents: body.amountCents,
      currency: body.currency ?? "CNY",
      status: body.status ?? "pending",
      appSource: body.appSource,
      shippingAddress: body.shippingAddress,
      recommendationContext: body.recommendationContext,
      readingId: body.readingId,
    }).returning();
    notifyOrderEvent("created", row);
    if (row.status === "paid") notifyOrderEvent("paid", row);
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

/** 登录用户查看自己的工单与运营回复 */
accountRouter.get("/tickets", async (req, res) => {
  const user = await requireUser(req, res);
  if (!user) return;
  const rows = await db
    .select()
    .from(contactMessages)
    .where(eq(contactMessages.userId, user.id))
    .orderBy(desc(contactMessages.createdAt))
    .limit(100);
  res.json({
    tickets: rows.map((m) => ({
      id: m.id,
      subject: m.subject,
      body: m.body,
      category: m.category,
      categoryLabel: CONTACT_CATEGORY_LABELS[m.category] ?? m.category,
      orderNo: m.orderNo,
      status: m.status,
      statusLabel: CONTACT_STATUS_LABELS[m.status] ?? m.status,
      adminReply: m.adminReply,
      createdAt: m.createdAt,
      updatedAt: m.updatedAt,
    })),
  });
});

accountRouter.get("/tickets/:id", async (req, res) => {
  const user = await requireUser(req, res);
  if (!user) return;
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ error: "参数错误" });
    return;
  }
  const [row] = await db
    .select()
    .from(contactMessages)
    .where(and(eq(contactMessages.id, id), eq(contactMessages.userId, user.id)))
    .limit(1);
  if (!row) {
    res.status(404).json({ error: "工单不存在" });
    return;
  }
  res.json({
    ticket: {
      id: row.id,
      subject: row.subject,
      body: row.body,
      category: row.category,
      categoryLabel: CONTACT_CATEGORY_LABELS[row.category] ?? row.category,
      orderNo: row.orderNo,
      status: row.status,
      statusLabel: CONTACT_STATUS_LABELS[row.status] ?? row.status,
      adminReply: row.adminReply,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    },
  });
});

const contactMessageSchema = z.object({
  userId: z.number().int().positive().nullable().optional(),
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(320),
  subject: z.string().trim().max(200).optional(),
  body: z.string().trim().min(1).max(5000),
  locale: z.string().trim().max(10).optional(),
  category: z.enum(["general", "complaint", "refund", "bug"]).optional(),
  orderNo: z.string().trim().max(64).optional(),
});

/** main 门户「联系我们」表单 → 留言工单（admin 后台处理） */
internalRouter.post("/contact-messages", async (req, res) => {
  try {
    const body = contactMessageSchema.parse(req.body);
    const [row] = await db.insert(contactMessages).values({
      userId: body.userId ?? null,
      name: body.name,
      email: body.email,
      subject: body.subject || null,
      body: body.body,
      locale: body.locale || null,
      category: body.category ?? "general",
      orderNo: body.orderNo || null,
    }).returning();
    notifyNewTicket(row);
    res.status(201).json({ success: true, id: row.id });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: "参数错误", details: err.errors });
      return;
    }
    console.error("[internal] contact message error:", err);
    res.status(500).json({ error: "服务器内部错误" });
  }
});

internalRouter.get("/orders/:orderNo", async (req, res) => {
  const orderNo = String(req.params.orderNo);
  const [order] = await db.select().from(userOrders).where(eq(userOrders.orderNo, orderNo)).limit(1);
  if (!order) {
    res.status(404).json({ error: "订单不存在" });
    return;
  }
  const shipmentRows = await listShipmentsForOrder(orderNo);
  res.json({
    order,
    shipments: shipmentRows.map(({ shipment, events }) => formatShipment(shipment, events)),
  });
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
    const updates: Record<string, unknown> = {};
    if (body.status !== undefined) updates.status = body.status;
    if (body.shippingAddress !== undefined) updates.shippingAddress = body.shippingAddress;
    if (Object.keys(updates).length === 0) {
      res.status(400).json({ error: "没有需要更新的字段" });
      return;
    }
    await db.update(userOrders).set(updates).where(eq(userOrders.orderNo, orderNo));
    if (body.status === "paid" && existing[0].status !== "paid") {
      await finalizeCouponOnPaid(orderNo);
      notifyOrderEvent("paid", { ...existing[0], status: "paid" });
    }
    res.json({ success: true, orderNo, ...updates });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: "参数错误", details: err.errors });
      return;
    }
    console.error("[internal] order update error:", err);
    res.status(500).json({ error: "服务器内部错误" });
  }
});

const orderCouponSchema = z.object({
  code: z.string().min(1).max(50),
});

internalRouter.post("/orders/:orderNo/coupon", async (req, res) => {
  try {
    const orderNo = String(req.params.orderNo);
    const { code } = orderCouponSchema.parse(req.body);
    const result = await applyCouponToOrder(orderNo, code);
    if (!result.ok) {
      res.status(400).json({ error: result.error });
      return;
    }
    res.json({
      success: true,
      orderNo,
      couponCode: result.couponCode,
      subtotalCents: result.subtotalCents,
      amountCents: result.amountCents,
      savingsCents: result.savingsCents,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: "参数错误", details: err.errors });
      return;
    }
    console.error("[internal] apply coupon:", err);
    res.status(500).json({ error: "服务器内部错误" });
  }
});

internalRouter.delete("/orders/:orderNo/coupon", async (req, res) => {
  try {
    const orderNo = String(req.params.orderNo);
    const result = await removeCouponFromOrder(orderNo);
    if (!result.ok) {
      res.status(400).json({ error: result.error });
      return;
    }
    res.json({
      success: true,
      orderNo,
      couponCode: result.couponCode,
      subtotalCents: result.subtotalCents,
      amountCents: result.amountCents,
      savingsCents: result.savingsCents,
    });
  } catch (err) {
    console.error("[internal] remove coupon:", err);
    res.status(500).json({ error: "服务器内部错误" });
  }
});

const walletLedgerSchema = z.object({
  userId: z.number().int().positive(),
  currency: z.string().min(3).max(8),
  amountCents: z.number().int().refine((n) => n !== 0, "amountCents 不能为 0"),
  kind: z.enum(["credit", "debit", "adjustment", "refund", "hold", "release"]),
  referenceType: z.string().max(50).optional(),
  referenceId: z.string().max(100).optional(),
  note: z.string().max(500).optional(),
  createdBy: z.number().int().positive().optional(),
  idempotencyKey: z.string().max(120).optional(),
});

/** 内部记账（shop / 退款等调用；幂等键可选） */
internalRouter.post("/wallets/ledger", async (req, res) => {
  try {
    const body = walletLedgerSchema.parse(req.body);
    const result = await postWalletLedgerEntry(body);
    res.status(result.duplicate ? 200 : 201).json(result);
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
    console.error("[internal] wallet ledger:", err);
    res.status(500).json({ error: "服务器内部错误" });
  }
});

internalRouter.get("/users/:userId/wallets", async (req, res) => {
  const userId = Number(req.params.userId);
  if (!Number.isInteger(userId) || userId <= 0) {
    res.status(400).json({ error: "参数错误" });
    return;
  }
  const wallets = await listWalletsForUser(userId);
  res.json({ wallets, currencies: SUPPORTED_WALLET_CURRENCIES });
});

internalRouter.get("/users/:userId/wallet-ledger", async (req, res) => {
  const userId = Number(req.params.userId);
  if (!Number.isInteger(userId) || userId <= 0) {
    res.status(400).json({ error: "参数错误" });
    return;
  }
  const limit = Math.min(Number(req.query.limit) || 50, 200);
  const entries = await listLedgerForUser(userId, limit);
  res.json({ entries });
});
