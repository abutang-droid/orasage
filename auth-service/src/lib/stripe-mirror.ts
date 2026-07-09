import Stripe from "stripe";
import { and, count, desc, eq, gte, inArray, sql, sum } from "drizzle-orm";
import { db } from "../db/index.ts";
import {
  stripeBalanceSnapshots,
  stripeCharges,
  stripePayouts,
  stripeRefunds,
  stripeSyncRuns,
  userOrders,
} from "../db/schema.ts";
import { ENV } from "../env.ts";

const DEFAULT_SYNC_DAYS = 90;
const PAGE_SIZE = 100;

let stripeClient: Stripe | null = null;

export function isStripeConfigured(): boolean {
  return Boolean(ENV.stripeSecretKey?.trim());
}

export function getStripeClient(): Stripe {
  if (!isStripeConfigured()) {
    throw new Error("STRIPE_SECRET_KEY 未配置");
  }
  if (!stripeClient) {
    stripeClient = new Stripe(ENV.stripeSecretKey);
  }
  return stripeClient;
}

function stripeTs(seconds: number): Date {
  return new Date(seconds * 1000);
}

function metaOrderNo(metadata: Stripe.Metadata | null | undefined): string | null {
  const orderNo = metadata?.orderNo?.trim();
  return orderNo || null;
}

function metaToRecord(metadata: Stripe.Metadata | null | undefined): Record<string, string> {
  if (!metadata) return {};
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(metadata)) {
    if (typeof v === "string") out[k] = v;
  }
  return out;
}

async function upsertCharge(charge: Stripe.Charge): Promise<void> {
  const paymentIntentId =
    typeof charge.payment_intent === "string" ? charge.payment_intent : charge.payment_intent?.id ?? null;
  const orderNo = metaOrderNo(charge.metadata);
  const row = {
    stripeId: charge.id,
    paymentIntentId,
    orderNo,
    amountCents: charge.amount,
    amountRefundedCents: charge.amount_refunded ?? 0,
    currency: (charge.currency ?? "cny").toLowerCase(),
    status: charge.status,
    paid: charge.paid,
    customerEmail: charge.billing_details?.email ?? charge.receipt_email ?? null,
    description: charge.description ?? null,
    metadata: metaToRecord(charge.metadata),
    stripeCreatedAt: stripeTs(charge.created),
    syncedAt: new Date(),
  };
  await db
    .insert(stripeCharges)
    .values(row)
    .onConflictDoUpdate({
      target: stripeCharges.stripeId,
      set: {
        paymentIntentId: row.paymentIntentId,
        orderNo: row.orderNo,
        amountCents: row.amountCents,
        amountRefundedCents: row.amountRefundedCents,
        currency: row.currency,
        status: row.status,
        paid: row.paid,
        customerEmail: row.customerEmail,
        description: row.description,
        metadata: row.metadata,
        stripeCreatedAt: row.stripeCreatedAt,
        syncedAt: row.syncedAt,
      },
    });
}

async function upsertRefund(refund: Stripe.Refund, chargeOrderNo?: string | null): Promise<void> {
  const chargeId = typeof refund.charge === "string" ? refund.charge : refund.charge?.id ?? "";
  const orderNo = metaOrderNo(refund.metadata) ?? chargeOrderNo ?? null;
  const row = {
    stripeId: refund.id,
    chargeStripeId: chargeId,
    orderNo,
    amountCents: refund.amount ?? 0,
    currency: (refund.currency ?? "cny").toLowerCase(),
    status: refund.status ?? "succeeded",
    reason: refund.reason ?? null,
    stripeCreatedAt: stripeTs(refund.created),
    syncedAt: new Date(),
  };
  await db
    .insert(stripeRefunds)
    .values(row)
    .onConflictDoUpdate({
      target: stripeRefunds.stripeId,
      set: {
        chargeStripeId: row.chargeStripeId,
        orderNo: row.orderNo,
        amountCents: row.amountCents,
        currency: row.currency,
        status: row.status,
        reason: row.reason,
        stripeCreatedAt: row.stripeCreatedAt,
        syncedAt: row.syncedAt,
      },
    });
}

async function upsertPayout(payout: Stripe.Payout): Promise<void> {
  const row = {
    stripeId: payout.id,
    amountCents: payout.amount,
    currency: (payout.currency ?? "cny").toLowerCase(),
    status: payout.status,
    arrivalDate: payout.arrival_date
      ? new Date(payout.arrival_date * 1000).toISOString().slice(0, 10)
      : null,
    stripeCreatedAt: stripeTs(payout.created),
    syncedAt: new Date(),
  };
  await db
    .insert(stripePayouts)
    .values(row)
    .onConflictDoUpdate({
      target: stripePayouts.stripeId,
      set: {
        amountCents: row.amountCents,
        currency: row.currency,
        status: row.status,
        arrivalDate: row.arrivalDate,
        stripeCreatedAt: row.stripeCreatedAt,
        syncedAt: row.syncedAt,
      },
    });
}

async function syncCharges(stripe: Stripe, since: number): Promise<number> {
  let upserted = 0;
  let startingAfter: string | undefined;
  for (;;) {
    const page = await stripe.charges.list({
      limit: PAGE_SIZE,
      created: { gte: since },
      starting_after: startingAfter,
    });
    for (const charge of page.data) {
      await upsertCharge(charge);
      upserted += 1;
    }
    if (!page.has_more || page.data.length === 0) break;
    startingAfter = page.data[page.data.length - 1]?.id;
  }
  return upserted;
}

async function syncRefunds(stripe: Stripe, since: number): Promise<number> {
  let upserted = 0;
  let startingAfter: string | undefined;
  for (;;) {
    const page = await stripe.refunds.list({
      limit: PAGE_SIZE,
      created: { gte: since },
      starting_after: startingAfter,
    });
    for (const refund of page.data) {
      const chargeId = typeof refund.charge === "string" ? refund.charge : refund.charge?.id;
      let chargeOrderNo: string | null = null;
      if (chargeId) {
        const [chargeRow] = await db
          .select({ orderNo: stripeCharges.orderNo })
          .from(stripeCharges)
          .where(eq(stripeCharges.stripeId, chargeId))
          .limit(1);
        chargeOrderNo = chargeRow?.orderNo ?? null;
      }
      await upsertRefund(refund, chargeOrderNo);
      upserted += 1;
    }
    if (!page.has_more || page.data.length === 0) break;
    startingAfter = page.data[page.data.length - 1]?.id;
  }
  return upserted;
}

async function syncPayouts(stripe: Stripe, since: number): Promise<number> {
  let upserted = 0;
  let startingAfter: string | undefined;
  for (;;) {
    const page = await stripe.payouts.list({
      limit: PAGE_SIZE,
      created: { gte: since },
      starting_after: startingAfter,
    });
    for (const payout of page.data) {
      await upsertPayout(payout);
      upserted += 1;
    }
    if (!page.has_more || page.data.length === 0) break;
    startingAfter = page.data[page.data.length - 1]?.id;
  }
  return upserted;
}

async function captureBalance(syncRunId: number, stripe: Stripe): Promise<void> {
  const balance = await stripe.balance.retrieve();
  const rows = balance.available.map((b) => ({
    syncRunId,
    currency: b.currency.toLowerCase(),
    availableCents: b.amount,
    pendingCents: balance.pending.find((p) => p.currency === b.currency)?.amount ?? 0,
    capturedAt: new Date(),
  }));
  if (rows.length === 0) {
    await db.insert(stripeBalanceSnapshots).values({
      syncRunId,
      currency: "cny",
      availableCents: 0,
      pendingCents: 0,
      capturedAt: new Date(),
    });
    return;
  }
  await db.insert(stripeBalanceSnapshots).values(rows);
}

export async function runStripeMirrorSync(days = DEFAULT_SYNC_DAYS) {
  const stripe = getStripeClient();
  const safeDays = Math.min(Math.max(Math.floor(days), 1), 365);
  const since = Math.floor((Date.now() - safeDays * 24 * 60 * 60 * 1000) / 1000);

  const [run] = await db
    .insert(stripeSyncRuns)
    .values({ status: "running" })
    .returning();

  try {
    const [chargesUpserted, refundsUpserted, payoutsUpserted] = await Promise.all([
      syncCharges(stripe, since),
      syncRefunds(stripe, since),
      syncPayouts(stripe, since),
    ]);
    await captureBalance(run.id, stripe);
    const [finished] = await db
      .update(stripeSyncRuns)
      .set({
        status: "completed",
        chargesUpserted,
        refundsUpserted,
        payoutsUpserted,
        finishedAt: new Date(),
      })
      .where(eq(stripeSyncRuns.id, run.id))
      .returning();
    return finished;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const [failed] = await db
      .update(stripeSyncRuns)
      .set({
        status: "failed",
        errorMessage: message.slice(0, 2000),
        finishedAt: new Date(),
      })
      .where(eq(stripeSyncRuns.id, run.id))
      .returning();
    throw Object.assign(new Error(message), { syncRun: failed });
  }
}

export async function getLatestBalanceSnapshots() {
  const rows = await db
    .select()
    .from(stripeBalanceSnapshots)
    .orderBy(desc(stripeBalanceSnapshots.capturedAt))
    .limit(10);
  if (rows.length === 0) return [];
  const latestRunId = rows[0]?.syncRunId;
  if (!latestRunId) return rows.slice(0, 3);
  return rows.filter((r) => r.syncRunId === latestRunId);
}

export async function getLatestSyncRun() {
  const [run] = await db
    .select()
    .from(stripeSyncRuns)
    .orderBy(desc(stripeSyncRuns.startedAt))
    .limit(1);
  return run ?? null;
}

export async function listStripeCharges(limit = 50, offset = 0) {
  const safeLimit = Math.min(Math.max(limit, 1), 200);
  const safeOffset = Math.max(offset, 0);
  return db
    .select()
    .from(stripeCharges)
    .orderBy(desc(stripeCharges.stripeCreatedAt))
    .limit(safeLimit)
    .offset(safeOffset);
}

export async function listStripeRefunds(limit = 50, offset = 0) {
  const safeLimit = Math.min(Math.max(limit, 1), 200);
  const safeOffset = Math.max(offset, 0);
  return db
    .select()
    .from(stripeRefunds)
    .orderBy(desc(stripeRefunds.stripeCreatedAt))
    .limit(safeLimit)
    .offset(safeOffset);
}

export async function listStripePayouts(limit = 50, offset = 0) {
  const safeLimit = Math.min(Math.max(limit, 1), 200);
  const safeOffset = Math.max(offset, 0);
  return db
    .select()
    .from(stripePayouts)
    .orderBy(desc(stripePayouts.stripeCreatedAt))
    .limit(safeLimit)
    .offset(safeOffset);
}

const PAID_ORDER_STATUSES = ["paid", "shipped", "completed"] as const;

export async function getStripeReconciliation(days = 30) {
  const safeDays = Math.min(Math.max(Math.floor(days), 1), 90);
  const since = new Date(Date.now() - safeDays * 24 * 60 * 60 * 1000);

  const [orderAgg, chargeAgg, refundAgg, payoutAgg] = await Promise.all([
    db
      .select({
        count: count(),
        totalCents: sum(userOrders.amountCents),
      })
      .from(userOrders)
      .where(
        and(
          gte(userOrders.createdAt, since),
          inArray(userOrders.status, [...PAID_ORDER_STATUSES]),
        ),
      ),
    db
      .select({
        count: count(),
        grossCents: sum(stripeCharges.amountCents),
        netCents: sql<number>`coalesce(sum(${stripeCharges.amountCents} - ${stripeCharges.amountRefundedCents}), 0)`,
      })
      .from(stripeCharges)
      .where(and(gte(stripeCharges.stripeCreatedAt, since), eq(stripeCharges.paid, true))),
    db
      .select({
        count: count(),
        totalCents: sum(stripeRefunds.amountCents),
      })
      .from(stripeRefunds)
      .where(gte(stripeRefunds.stripeCreatedAt, since)),
    db
      .select({
        count: count(),
        totalCents: sum(stripePayouts.amountCents),
      })
      .from(stripePayouts)
      .where(gte(stripePayouts.stripeCreatedAt, since)),
  ]);

  const paidOrders = await db
    .select({
      orderNo: userOrders.orderNo,
      amountCents: userOrders.amountCents,
      status: userOrders.status,
      createdAt: userOrders.createdAt,
    })
    .from(userOrders)
    .where(
      and(
        gte(userOrders.createdAt, since),
        inArray(userOrders.status, [...PAID_ORDER_STATUSES]),
      ),
    )
    .orderBy(desc(userOrders.createdAt))
    .limit(500);

  const charges = await db
    .select({
      stripeId: stripeCharges.stripeId,
      orderNo: stripeCharges.orderNo,
      amountCents: stripeCharges.amountCents,
      amountRefundedCents: stripeCharges.amountRefundedCents,
      stripeCreatedAt: stripeCharges.stripeCreatedAt,
    })
    .from(stripeCharges)
    .where(and(gte(stripeCharges.stripeCreatedAt, since), eq(stripeCharges.paid, true)))
    .orderBy(desc(stripeCharges.stripeCreatedAt))
    .limit(500);

  const chargeOrderNos = new Set(
    charges.map((c) => c.orderNo).filter((v): v is string => Boolean(v)),
  );
  const ordersMissingStripe = paidOrders
    .filter((o) => !chargeOrderNos.has(o.orderNo))
    .slice(0, 20)
    .map((o) => ({
      orderNo: o.orderNo,
      amountCents: o.amountCents,
      status: o.status,
      createdAt: o.createdAt,
    }));

  const paidOrderNos = new Set(paidOrders.map((o) => o.orderNo));
  const chargesMissingOrder = charges
    .filter((c) => !c.orderNo || !paidOrderNos.has(c.orderNo))
    .slice(0, 20)
    .map((c) => ({
      stripeId: c.stripeId,
      orderNo: c.orderNo,
      amountCents: c.amountCents,
      amountRefundedCents: c.amountRefundedCents,
      stripeCreatedAt: c.stripeCreatedAt,
    }));

  const ordersTotal = Number(orderAgg[0]?.totalCents ?? 0);
  const stripeNet = Number(chargeAgg[0]?.netCents ?? 0);

  return {
    days: safeDays,
    since: since.toISOString(),
    orders: {
      count: orderAgg[0]?.count ?? 0,
      totalCents: ordersTotal,
    },
    charges: {
      count: chargeAgg[0]?.count ?? 0,
      grossCents: Number(chargeAgg[0]?.grossCents ?? 0),
      netCents: stripeNet,
    },
    refunds: {
      count: refundAgg[0]?.count ?? 0,
      totalCents: Number(refundAgg[0]?.totalCents ?? 0),
    },
    payouts: {
      count: payoutAgg[0]?.count ?? 0,
      totalCents: Number(payoutAgg[0]?.totalCents ?? 0),
    },
    deltaCents: ordersTotal - stripeNet,
    ordersMissingStripe,
    chargesMissingOrder,
    paymentMode: isStripeConfigured() ? "stripe" : "mock",
  };
}

export function formatStripeRow<T extends { stripeCreatedAt: Date; syncedAt: Date }>(row: T) {
  return {
    ...row,
    stripeCreatedAt: row.stripeCreatedAt.toISOString(),
    syncedAt: row.syncedAt.toISOString(),
  };
}

export function formatSyncRun(run: typeof stripeSyncRuns.$inferSelect | null) {
  if (!run) return null;
  return {
    ...run,
    startedAt: run.startedAt.toISOString(),
    finishedAt: run.finishedAt?.toISOString() ?? null,
  };
}

export function formatBalanceSnapshot(row: typeof stripeBalanceSnapshots.$inferSelect) {
  return {
    ...row,
    capturedAt: row.capturedAt.toISOString(),
  };
}
