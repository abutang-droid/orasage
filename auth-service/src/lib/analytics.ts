import { and, count, desc, eq, gte, sql } from "drizzle-orm";
import { db } from "../db/index.ts";
import { analyticsEvents } from "../db/schema.ts";

export const ANALYTICS_APPS = [
  "main",
  "shop",
  "admin",
  "bazi",
  "ziwei",
  "tarot",
  "cms",
  "auth",
] as const;

export type AnalyticsApp = (typeof ANALYTICS_APPS)[number];

export type AnalyticsEventInput = {
  app: AnalyticsApp;
  eventName: string;
  sessionKey: string;
  userId?: number | null;
  locale?: string | null;
  path?: string | null;
  referrerHost?: string | null;
  properties?: Record<string, string | number | boolean>;
};

const EVENT_NAME_RE = /^[a-z][a-z0-9_]{0,99}$/;

export function isAnalyticsApp(value: string): value is AnalyticsApp {
  return (ANALYTICS_APPS as readonly string[]).includes(value);
}

export function sanitizeReferrerHost(referrer: string | undefined | null): string | null {
  if (!referrer) return null;
  try {
    const host = new URL(referrer).hostname.toLowerCase().slice(0, 200);
    return host || null;
  } catch {
    return null;
  }
}

export function sanitizeProperties(
  raw: Record<string, unknown> | undefined,
): Record<string, string | number | boolean> {
  if (!raw || typeof raw !== "object") return {};
  const out: Record<string, string | number | boolean> = {};
  for (const [key, value] of Object.entries(raw).slice(0, 20)) {
    if (!/^[a-z][a-z0-9_]{0,49}$/.test(key)) continue;
    if (typeof value === "string") out[key] = value.slice(0, 500);
    else if (typeof value === "number" && Number.isFinite(value)) out[key] = value;
    else if (typeof value === "boolean") out[key] = value;
  }
  return out;
}

export function validateAnalyticsEvent(input: AnalyticsEventInput): string | null {
  if (!isAnalyticsApp(input.app)) return "invalid app";
  if (!EVENT_NAME_RE.test(input.eventName)) return "invalid event_name";
  if (!/^[a-f0-9]{32,64}$/i.test(input.sessionKey)) return "invalid session_key";
  if (input.path && input.path.length > 500) return "path too long";
  if (input.locale && input.locale.length > 12) return "locale too long";
  return null;
}

export async function insertAnalyticsEvents(events: AnalyticsEventInput[]): Promise<number> {
  if (events.length === 0) return 0;
  const rows = events.map((e) => ({
    app: e.app,
    eventName: e.eventName,
    userId: e.userId ?? null,
    sessionKey: e.sessionKey,
    locale: e.locale ?? null,
    path: e.path ?? null,
    referrerHost: e.referrerHost ?? null,
    properties: sanitizeProperties(e.properties),
  }));
  await db.insert(analyticsEvents).values(rows);
  return rows.length;
}

export async function getAnalyticsSummary(days: number) {
  const safeDays = Math.min(Math.max(Math.floor(days), 1), 90);
  const since = new Date(Date.now() - safeDays * 24 * 60 * 60 * 1000);

  const [totals, byApp, topEvents, daily] = await Promise.all([
    db.select({ value: count() }).from(analyticsEvents).where(gte(analyticsEvents.createdAt, since)),
    db
      .select({ app: analyticsEvents.app, value: count() })
      .from(analyticsEvents)
      .where(gte(analyticsEvents.createdAt, since))
      .groupBy(analyticsEvents.app)
      .orderBy(desc(count())),
    db
      .select({
        app: analyticsEvents.app,
        eventName: analyticsEvents.eventName,
        value: count(),
      })
      .from(analyticsEvents)
      .where(gte(analyticsEvents.createdAt, since))
      .groupBy(analyticsEvents.app, analyticsEvents.eventName)
      .orderBy(desc(count()))
      .limit(30),
    db
      .select({
        day: sql<string>`date_trunc('day', ${analyticsEvents.createdAt})::date`,
        value: count(),
      })
      .from(analyticsEvents)
      .where(gte(analyticsEvents.createdAt, since))
      .groupBy(sql`date_trunc('day', ${analyticsEvents.createdAt})::date`)
      .orderBy(sql`date_trunc('day', ${analyticsEvents.createdAt})::date`),
  ]);

  return {
    days: safeDays,
    since: since.toISOString(),
    total: totals[0]?.value ?? 0,
    byApp: byApp.map((r) => ({ app: r.app, count: r.value })),
    topEvents: topEvents.map((r) => ({
      app: r.app,
      eventName: r.eventName,
      count: r.value,
    })),
    daily: daily.map((r) => ({ day: r.day, count: r.value })),
  };
}

export async function listRecentAnalyticsEvents(opts: {
  app?: AnalyticsApp;
  limit?: number;
  offset?: number;
}) {
  const limit = Math.min(Math.max(opts.limit ?? 50, 1), 200);
  const offset = Math.max(opts.offset ?? 0, 0);
  const conditions = opts.app ? [eq(analyticsEvents.app, opts.app)] : [];

  const rows = await db
    .select()
    .from(analyticsEvents)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(analyticsEvents.createdAt))
    .limit(limit)
    .offset(offset);

  return rows.map((r) => ({
    id: r.id,
    app: r.app,
    eventName: r.eventName,
    userId: r.userId,
    sessionKey: r.sessionKey,
    locale: r.locale,
    path: r.path,
    referrerHost: r.referrerHost,
    properties: r.properties,
    createdAt: r.createdAt,
  }));
}
