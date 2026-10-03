import { and, asc, desc, eq, sql } from "drizzle-orm";
import { db } from "../db/index.ts";
import { promoChannels, promoCommissionLegs, userOrders } from "../db/schema.ts";
import {
  computeCommissionCents,
  isPromoLeg,
  normalizePromoCode,
  promoShareLinks,
  type PromoLeg,
} from "../../../shared/promo-channel/index.ts";

export type PromoChannelRow = typeof promoChannels.$inferSelect;
export type PromoCommissionLegRow = typeof promoCommissionLegs.$inferSelect;

export type PromoChannelInput = {
  code: string;
  name: string;
  contact?: string | null;
  commissionBps: number;
  leg: PromoLeg;
  notes?: string | null;
  active: boolean;
};

export type PromoChannelStats = {
  paidOrders: number;
  pendingCents: number;
  settledCents: number;
  voidCents: number;
};

function clampBps(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(10_000, Math.max(0, Math.round(value)));
}

export function formatPromoChannel(row: PromoChannelRow, stats?: PromoChannelStats) {
  const leg = isPromoLeg(row.leg) ? row.leg : "standard";
  const shareLinks = promoShareLinks(row.code);
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    contact: row.contact,
    commissionBps: row.commissionBps,
    commissionPercent: row.commissionBps / 100,
    leg,
    notes: row.notes,
    active: row.active,
    shareUrl: shareLinks.portal,
    shareLinks,
    stats: stats ?? { paidOrders: 0, pendingCents: 0, settledCents: 0, voidCents: 0 },
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function listPromoChannels() {
  return db.select().from(promoChannels).orderBy(asc(promoChannels.leg), asc(promoChannels.code));
}

export async function getPromoChannelById(id: number) {
  if (!Number.isInteger(id) || id <= 0) return null;
  const [row] = await db.select().from(promoChannels).where(eq(promoChannels.id, id)).limit(1);
  return row ?? null;
}

export async function getPromoChannelByCode(code: string) {
  const normalized = normalizePromoCode(code);
  if (!normalized) return null;
  const [row] = await db.select().from(promoChannels).where(eq(promoChannels.code, normalized)).limit(1);
  return row ?? null;
}

export async function resolveActivePromoChannel(code: string | null | undefined) {
  if (!code) return null;
  const row = await getPromoChannelByCode(code);
  if (!row || !row.active) return null;
  return row;
}

export async function resolvePromoStamp(code: string | null | undefined) {
  const channel = await resolveActivePromoChannel(code);
  if (!channel) return { promoChannelId: null as number | null, promoChannelCode: null as string | null };
  return { promoChannelId: channel.id, promoChannelCode: channel.code };
}

export async function createPromoChannel(input: PromoChannelInput) {
  const code = normalizePromoCode(input.code);
  if (!code) throw new Error("渠道码至少 2 位字母数字");
  const name = input.name.trim();
  if (!name) throw new Error("请填写渠道名称");
  const [row] = await db.insert(promoChannels).values({
    code,
    name,
    contact: input.contact?.trim() || null,
    commissionBps: clampBps(input.commissionBps),
    leg: isPromoLeg(input.leg) ? input.leg : "gold",
    notes: input.notes?.trim() || null,
    active: input.active,
    updatedAt: new Date(),
  }).returning();
  return row;
}

export async function updatePromoChannel(id: number, patch: Partial<PromoChannelInput>) {
  const updates: Record<string, unknown> = { updatedAt: new Date() };
  if (patch.name !== undefined) {
    const name = patch.name.trim();
    if (!name) throw new Error("请填写渠道名称");
    updates.name = name;
  }
  if (patch.contact !== undefined) updates.contact = patch.contact?.trim() || null;
  if (patch.commissionBps !== undefined) updates.commissionBps = clampBps(patch.commissionBps);
  if (patch.leg !== undefined) updates.leg = isPromoLeg(patch.leg) ? patch.leg : "standard";
  if (patch.notes !== undefined) updates.notes = patch.notes?.trim() || null;
  if (patch.active !== undefined) updates.active = patch.active;
  const [row] = await db.update(promoChannels).set(updates).where(eq(promoChannels.id, id)).returning();
  if (!row) throw new Error("渠道不存在");
  return row;
}

export async function recordPromoCommissionForPaidOrder(order: {
  orderNo: string;
  amountCents: number;
  status: string;
  promoChannelId: number | null;
  promoChannelCode: string | null;
}) {
  if (order.status !== "paid") return null;
  let channelId = order.promoChannelId;
  if (!channelId && order.promoChannelCode) {
    const channel = await resolveActivePromoChannel(order.promoChannelCode);
    channelId = channel?.id ?? null;
    if (channel && !order.promoChannelId) {
      await db.update(userOrders).set({
        promoChannelId: channel.id,
        promoChannelCode: channel.code,
      }).where(eq(userOrders.orderNo, order.orderNo));
    }
  }
  if (!channelId) return null;
  const [channel] = await db.select().from(promoChannels).where(eq(promoChannels.id, channelId)).limit(1);
  if (!channel) return null;
  const commissionCents = computeCommissionCents(order.amountCents, channel.commissionBps);
  const existing = await db.select().from(promoCommissionLegs).where(eq(promoCommissionLegs.orderNo, order.orderNo)).limit(1);
  if (existing[0]) return existing[0];
  try {
    const [leg] = await db.insert(promoCommissionLegs).values({
      channelId: channel.id,
      orderNo: order.orderNo,
      orderCents: order.amountCents,
      rateBps: channel.commissionBps,
      commissionCents,
      status: "pending",
    }).returning();
    return leg;
  } catch (err) {
    const raced = await db.select().from(promoCommissionLegs).where(eq(promoCommissionLegs.orderNo, order.orderNo)).limit(1);
    if (raced[0]) return raced[0];
    throw err;
  }
}

export async function syncPromoCommissionForOrder(order: {
  orderNo: string;
  amountCents: number;
  status: string;
  promoChannelId: number | null;
  promoChannelCode: string | null;
}) {
  try {
    if (order.status === "paid" || order.status === "shipped" || order.status === "completed") {
      return await recordPromoCommissionForPaidOrder({ ...order, status: "paid" });
    }
    if (order.status === "cancelled") {
      await voidPromoCommissionForOrder(order.orderNo);
    }
  } catch (err) {
    console.error("[promo] commission sync failed:", err);
  }
  return null;
}

export async function voidPromoCommissionForOrder(orderNo: string) {
  await db.update(promoCommissionLegs).set({
    status: "void",
  }).where(and(eq(promoCommissionLegs.orderNo, orderNo), eq(promoCommissionLegs.status, "pending")));
}

export async function settlePromoChannelLegs(channelId: number, legIds?: number[]) {
  const now = new Date();
  if (legIds && legIds.length > 0) {
    for (const id of legIds) {
      await db.update(promoCommissionLegs).set({
        status: "settled",
        settledAt: now,
      }).where(and(
        eq(promoCommissionLegs.id, id),
        eq(promoCommissionLegs.channelId, channelId),
        eq(promoCommissionLegs.status, "pending"),
      ));
    }
  } else {
    await db.update(promoCommissionLegs).set({
      status: "settled",
      settledAt: now,
    }).where(and(
      eq(promoCommissionLegs.channelId, channelId),
      eq(promoCommissionLegs.status, "pending"),
    ));
  }
}

export async function statsForChannels(channelIds: number[]): Promise<Map<number, PromoChannelStats>> {
  const map = new Map<number, PromoChannelStats>();
  for (const id of channelIds) {
    map.set(id, { paidOrders: 0, pendingCents: 0, settledCents: 0, voidCents: 0 });
  }
  if (channelIds.length === 0) return map;
  const rows = await db
    .select({
      channelId: promoCommissionLegs.channelId,
      status: promoCommissionLegs.status,
      count: sql<number>`count(*)::int`,
      cents: sql<number>`coalesce(sum(${promoCommissionLegs.commissionCents}), 0)::int`,
    })
    .from(promoCommissionLegs)
    .groupBy(promoCommissionLegs.channelId, promoCommissionLegs.status);

  for (const row of rows) {
    const stats = map.get(row.channelId);
    if (!stats) continue;
    stats.paidOrders += Number(row.count);
    if (row.status === "pending") stats.pendingCents += Number(row.cents);
    else if (row.status === "settled") stats.settledCents += Number(row.cents);
    else if (row.status === "void") stats.voidCents += Number(row.cents);
  }
  return map;
}

export async function listPromoLegs(channelId: number, limit = 50) {
  return db
    .select()
    .from(promoCommissionLegs)
    .where(eq(promoCommissionLegs.channelId, channelId))
    .orderBy(desc(promoCommissionLegs.createdAt))
    .limit(limit);
}

export function formatPromoLeg(row: PromoCommissionLegRow) {
  return {
    id: row.id,
    channelId: row.channelId,
    orderNo: row.orderNo,
    orderCents: row.orderCents,
    rateBps: row.rateBps,
    commissionCents: row.commissionCents,
    status: row.status,
    settledAt: row.settledAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
  };
}
