import { and, asc, eq, inArray } from "drizzle-orm";
import { db } from "../db/index.ts";
import {
  products,
  ziweiChatAccounts,
  ziweiProductRecommendations,
  ziweiReadingChat,
} from "../db/schema.ts";
import { formatProduct } from "./product-format.ts";
import {
  ZIWEI_CHAT_PACK_SKU,
  ZIWEI_CHAT_YEARLY_SKU,
  isZiweiChatSku,
} from "../../../shared/ziwei-chat/skus.ts";

export { ZIWEI_CHAT_PACK_SKU, ZIWEI_CHAT_YEARLY_SKU, isZiweiChatSku };

export type ZiweiChatQuota = {
  freePerReading: number;
  freeUsed: number;
  freeRemaining: number;
  packCredits: number;
  yearlyActive: boolean;
  yearlyExpiresAt: string | null;
  canAsk: boolean;
  requiresPayment: boolean;
};

async function getOrCreateAccount(userId: number) {
  const existing = await db
    .select()
    .from(ziweiChatAccounts)
    .where(eq(ziweiChatAccounts.userId, userId))
    .limit(1);
  if (existing[0]) return existing[0];
  const [row] = await db
    .insert(ziweiChatAccounts)
    .values({ userId })
    .returning();
  return row;
}

async function getOrCreateReadingChat(userId: number, readingId: string) {
  const existing = await db
    .select()
    .from(ziweiReadingChat)
    .where(
      and(
        eq(ziweiReadingChat.userId, userId),
        eq(ziweiReadingChat.readingId, readingId),
      ),
    )
    .limit(1);
  if (existing[0]) return existing[0];
  const [row] = await db
    .insert(ziweiReadingChat)
    .values({ userId, readingId })
    .returning();
  return row;
}

function isYearlyActive(expiresAt: Date | null | undefined): boolean {
  if (!expiresAt) return false;
  return expiresAt.getTime() > Date.now();
}

export async function getZiweiChatQuota(
  userId: number,
  readingId: string,
): Promise<ZiweiChatQuota> {
  const account = await getOrCreateAccount(userId);
  const reading = await getOrCreateReadingChat(userId, readingId);
  const yearlyActive = isYearlyActive(account.yearlyExpiresAt);
  const freeRemaining = Math.max(
    0,
    ZIWEI_FREE_QUESTIONS_PER_READING - reading.freeQuestionsUsed,
  );
  const canAsk = yearlyActive || freeRemaining > 0 || account.packCredits > 0;
  return {
    freePerReading: ZIWEI_FREE_QUESTIONS_PER_READING,
    freeUsed: reading.freeQuestionsUsed,
    freeRemaining,
    packCredits: account.packCredits,
    yearlyActive,
    yearlyExpiresAt: account.yearlyExpiresAt?.toISOString() ?? null,
    canAsk,
    requiresPayment: !canAsk,
  };
}

export type ConsumeZiweiChatResult =
  | { ok: true; quota: ZiweiChatQuota; source: "yearly" | "free" | "pack" }
  | { ok: false; quota: ZiweiChatQuota; error: "quota_exhausted" };

export async function consumeZiweiChatQuestion(
  userId: number,
  readingId: string,
): Promise<ConsumeZiweiChatResult> {
  const account = await getOrCreateAccount(userId);
  const reading = await getOrCreateReadingChat(userId, readingId);
  const yearlyActive = isYearlyActive(account.yearlyExpiresAt);

  if (yearlyActive) {
    await db
      .update(ziweiReadingChat)
      .set({
        totalQuestionsUsed: reading.totalQuestionsUsed + 1,
        updatedAt: new Date(),
      })
      .where(eq(ziweiReadingChat.id, reading.id));
    const quota = await getZiweiChatQuota(userId, readingId);
    return { ok: true, quota, source: "yearly" };
  }

  const freeRemaining = ZIWEI_FREE_QUESTIONS_PER_READING - reading.freeQuestionsUsed;
  if (freeRemaining > 0) {
    await db
      .update(ziweiReadingChat)
      .set({
        freeQuestionsUsed: reading.freeQuestionsUsed + 1,
        totalQuestionsUsed: reading.totalQuestionsUsed + 1,
        updatedAt: new Date(),
      })
      .where(eq(ziweiReadingChat.id, reading.id));
    const quota = await getZiweiChatQuota(userId, readingId);
    return { ok: true, quota, source: "free" };
  }

  if (account.packCredits > 0) {
    await db
      .update(ziweiChatAccounts)
      .set({
        packCredits: account.packCredits - 1,
        updatedAt: new Date(),
      })
      .where(eq(ziweiChatAccounts.userId, userId));
    await db
      .update(ziweiReadingChat)
      .set({
        totalQuestionsUsed: reading.totalQuestionsUsed + 1,
        updatedAt: new Date(),
      })
      .where(eq(ziweiReadingChat.id, reading.id));
    const quota = await getZiweiChatQuota(userId, readingId);
    return { ok: true, quota, source: "pack" };
  }

  const quota = await getZiweiChatQuota(userId, readingId);
  return { ok: false, quota, error: "quota_exhausted" };
}

export async function grantZiweiChatPurchase(userId: number, sku: string) {
  const account = await getOrCreateAccount(userId);
  const now = new Date();

  if (sku === ZIWEI_CHAT_PACK_SKU) {
    await db
      .update(ziweiChatAccounts)
      .set({
        packCredits: account.packCredits + ZIWEI_PACK_CREDITS_AMOUNT,
        updatedAt: now,
      })
      .where(eq(ziweiChatAccounts.userId, userId));
    return { packCreditsAdded: ZIWEI_PACK_CREDITS_AMOUNT };
  }

  if (sku === ZIWEI_CHAT_YEARLY_SKU) {
    const base = isYearlyActive(account.yearlyExpiresAt) && account.yearlyExpiresAt
      ? account.yearlyExpiresAt
      : now;
    const expires = new Date(base);
    expires.setDate(expires.getDate() + ZIWEI_YEARLY_DAYS);
    await db
      .update(ziweiChatAccounts)
      .set({
        yearlyExpiresAt: expires,
        updatedAt: now,
      })
      .where(eq(ziweiChatAccounts.userId, userId));
    return { yearlyExpiresAt: expires.toISOString() };
  }

  throw new Error(`unsupported ziwei chat sku: ${sku}`);
}

export async function listZiweiRecommendSkus() {
  const rows = await db
    .select()
    .from(ziweiProductRecommendations)
    .where(eq(ziweiProductRecommendations.active, true))
    .orderBy(asc(ziweiProductRecommendations.sortOrder), asc(ziweiProductRecommendations.id));
  return rows.map((r) => r.sku);
}

export async function resolveZiweiRecommendProduct(readingId: string, locale = "zh-CN") {
  const rows = await db
    .select()
    .from(ziweiProductRecommendations)
    .where(eq(ziweiProductRecommendations.active, true))
    .orderBy(asc(ziweiProductRecommendations.sortOrder), asc(ziweiProductRecommendations.id));

  if (rows.length === 0) return null;

  let hash = 0;
  for (let i = 0; i < readingId.length; i++) {
    hash = (hash * 31 + readingId.charCodeAt(i)) >>> 0;
  }
  const pick = rows[hash % rows.length];
  const catalog = await db
    .select()
    .from(products)
    .where(and(eq(products.sku, pick.sku), eq(products.active, true)))
    .limit(1);
  if (!catalog[0]) return null;
  return formatProduct(catalog[0], { locale });
}

export async function listZiweiRecommendRows() {
  return db
    .select()
    .from(ziweiProductRecommendations)
    .orderBy(asc(ziweiProductRecommendations.sortOrder), asc(ziweiProductRecommendations.id));
}

export async function setZiweiRecommendSkus(skus: string[]) {
  const unique = [...new Set(skus.map((s) => s.trim()).filter(Boolean))];
  if (unique.length > 0) {
    const existing = await db
      .select({ sku: products.sku })
      .from(products)
      .where(inArray(products.sku, unique));
    const valid = new Set(existing.map((r) => r.sku));
    const invalid = unique.filter((s) => !valid.has(s));
    if (invalid.length > 0) {
      throw new Error(`未知 SKU: ${invalid.join(", ")}`);
    }
  }

  await db.delete(ziweiProductRecommendations);
  if (unique.length > 0) {
    await db.insert(ziweiProductRecommendations).values(
      unique.map((sku, index) => ({
        sku,
        sortOrder: index,
        active: true,
      })),
    );
  }
  return listZiweiRecommendRows();
}

export const ZIWEI_FREE_QUESTIONS_PER_READING = 5;
export const ZIWEI_PACK_CREDITS_AMOUNT = 10;
export const ZIWEI_YEARLY_DAYS = 365;
