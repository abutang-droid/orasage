import { and, desc, eq, inArray } from "drizzle-orm";
import { db } from "../db/index.ts";
import { productReviews, users } from "../db/schema.ts";

export type ReviewStatus = typeof productReviews.$inferSelect["status"];

const STATUS_LABELS: Record<ReviewStatus, string> = {
  pending: "待审核",
  approved: "已通过",
  rejected: "已拒绝",
  featured: "精选",
};

export async function listReviewsForAdmin(filters?: {
  status?: string;
  sku?: string;
  limit?: number;
  offset?: number;
}) {
  const limit = Math.min(filters?.limit ?? 50, 200);
  const offset = Math.max(0, filters?.offset ?? 0);
  const conditions = [];
  if (filters?.status && filters.status in STATUS_LABELS) {
    conditions.push(eq(productReviews.status, filters.status as ReviewStatus));
  }
  if (filters?.sku?.trim()) {
    conditions.push(eq(productReviews.sku, filters.sku.trim()));
  }
  const where = conditions.length > 0 ? and(...conditions) : undefined;
  const rows = await db
    .select({
      review: productReviews,
      nickname: users.nickname,
      email: users.email,
    })
    .from(productReviews)
    .leftJoin(users, eq(productReviews.userId, users.id))
    .where(where)
    .orderBy(desc(productReviews.createdAt))
    .limit(limit)
    .offset(offset);
  return rows.map(({ review, nickname, email }) => ({
    id: review.id,
    userId: review.userId,
    userLabel: nickname || email || `用户 #${review.userId}`,
    sku: review.sku,
    orderNo: review.orderNo,
    rating: review.rating,
    body: review.body,
    status: review.status,
    statusLabel: STATUS_LABELS[review.status],
    createdAt: review.createdAt,
    updatedAt: review.updatedAt,
  }));
}

export async function listApprovedReviewsForSku(sku: string, limit = 20) {
  const rows = await db
    .select({
      review: productReviews,
      nickname: users.nickname,
    })
    .from(productReviews)
    .leftJoin(users, eq(productReviews.userId, users.id))
    .where(
      and(
        eq(productReviews.sku, sku),
        inArray(productReviews.status, ["approved", "featured"]),
      ),
    )
    .orderBy(desc(productReviews.createdAt))
    .limit(limit);
  return rows.map(({ review, nickname }) => ({
    id: review.id,
    rating: review.rating,
    body: review.body,
    author: nickname || "用户",
    featured: review.status === "featured",
    createdAt: review.createdAt,
  }));
}

export async function createProductReview(input: {
  userId: number;
  sku: string;
  orderNo?: string | null;
  rating: number;
  body: string;
}) {
  const [row] = await db
    .insert(productReviews)
    .values({
      userId: input.userId,
      sku: input.sku,
      orderNo: input.orderNo ?? null,
      rating: input.rating,
      body: input.body,
      status: "pending",
    })
    .returning();
  return row;
}

export async function updateReviewStatus(id: number, status: ReviewStatus) {
  const [row] = await db
    .update(productReviews)
    .set({ status, updatedAt: new Date() })
    .where(eq(productReviews.id, id))
    .returning();
  return row ?? null;
}
