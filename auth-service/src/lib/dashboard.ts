import { and, count, desc, eq, gte, inArray, sql, sum } from "drizzle-orm";
import { db } from "../db/index.ts";
import { userOrders, userReadings, users } from "../db/schema.ts";
import { getAnalyticsSummary } from "./analytics.ts";

const PAID_STATUSES = ["paid", "shipped", "completed"] as const;

export async function getOperationalSummary(days: number) {
  const safeDays = Math.min(Math.max(Math.floor(days), 1), 90);
  const since = new Date(Date.now() - safeDays * 24 * 60 * 60 * 1000);

  const [
    [userTotal],
    [orderTotal],
    [readingTotal],
    [newUsers],
    [newOrders],
    [paidOrders],
    [revenue],
    [newReadings],
    ordersByStatus,
    ordersByApp,
    dailyOrders,
  ] = await Promise.all([
    db.select({ value: count() }).from(users),
    db.select({ value: count() }).from(userOrders),
    db.select({ value: count() }).from(userReadings),
    db.select({ value: count() }).from(users).where(gte(users.createdAt, since)),
    db.select({ value: count() }).from(userOrders).where(gte(userOrders.createdAt, since)),
    db
      .select({ value: count() })
      .from(userOrders)
      .where(and(gte(userOrders.createdAt, since), inArray(userOrders.status, [...PAID_STATUSES]))),
    db
      .select({ value: sum(userOrders.amountCents) })
      .from(userOrders)
      .where(and(gte(userOrders.createdAt, since), inArray(userOrders.status, [...PAID_STATUSES]))),
    db.select({ value: count() }).from(userReadings).where(gte(userReadings.createdAt, since)),
    db
      .select({ status: userOrders.status, value: count() })
      .from(userOrders)
      .where(gte(userOrders.createdAt, since))
      .groupBy(userOrders.status)
      .orderBy(desc(count())),
    db
      .select({ app: userOrders.appSource, value: count() })
      .from(userOrders)
      .where(gte(userOrders.createdAt, since))
      .groupBy(userOrders.appSource)
      .orderBy(desc(count())),
    db
      .select({
        day: sql<string>`date_trunc('day', ${userOrders.createdAt})::date`,
        value: count(),
      })
      .from(userOrders)
      .where(gte(userOrders.createdAt, since))
      .groupBy(sql`date_trunc('day', ${userOrders.createdAt})::date`)
      .orderBy(sql`date_trunc('day', ${userOrders.createdAt})::date`),
  ]);

  return {
    days: safeDays,
    since: since.toISOString(),
    totals: {
      users: userTotal?.value ?? 0,
      orders: orderTotal?.value ?? 0,
      readings: readingTotal?.value ?? 0,
    },
    period: {
      newUsers: newUsers?.value ?? 0,
      newOrders: newOrders?.value ?? 0,
      paidOrders: paidOrders?.value ?? 0,
      revenueCents: Number(revenue?.value ?? 0),
      newReadings: newReadings?.value ?? 0,
    },
    ordersByStatus: ordersByStatus.map((r) => ({ status: r.status, count: r.value })),
    ordersByApp: ordersByApp.map((r) => ({
      app: r.app ?? "unknown",
      count: r.value,
    })),
    dailyOrders: dailyOrders.map((r) => ({ day: r.day, count: r.value })),
  };
}

export async function getAdminDashboard(days: number) {
  const safeDays = Math.min(Math.max(Math.floor(days), 1), 90);
  const [operations, analytics] = await Promise.all([
    getOperationalSummary(safeDays),
    getAnalyticsSummary(safeDays),
  ]);
  return {
    days: safeDays,
    since: operations.since,
    operations,
    analytics,
  };
}
