import { and, desc, eq, inArray } from "drizzle-orm";
import { db } from "../db/index.ts";
import { productReviews, userOrders, users } from "../db/schema.ts";

export type ReviewStatus = typeof productReviews.$inferSelect["status"];

const STATUS_LABELS: Record<ReviewStatus, string> = {
  pending: "待审核",
  approved: "已通过",
  rejected: "已拒绝",
  featured: "精选",
};

/** 已付款及后续履约状态才可评价（含购物车订单内含该 SKU） */
const REVIEW_ELIGIBLE_ORDER_STATUSES = ["paid", "shipped", "completed"] as const;

export class ReviewPurchaseRequiredError extends Error {
  constructor(message = "仅购买过该商品的用户可评价") {
    super(message);
    this.name = "ReviewPurchaseRequiredError";
  }
}

function orderContainsSku(
  order: { sku: string | null; recommendationContext: string | null },
  sku: string,
): boolean {
  if (order.sku === sku) return true;
  const raw = order.recommendationContext?.trim();
  if (!raw) return false;
  try {
    const parsed = JSON.parse(raw) as {
      type?: string;
      items?: Array<{ sku?: string }>;
    };
    if (parsed.type === "shop_cart" && Array.isArray(parsed.items)) {
      return parsed.items.some((item) => item?.sku === sku);
    }
  } catch {
    /* ignore malformed context */
  }
  return false;
}

export async function findEligibleOrderForSku(userId: number, sku: string) {
  const rows = await db
    .select({
      orderNo: userOrders.orderNo,
      sku: userOrders.sku,
      recommendationContext: userOrders.recommendationContext,
      status: userOrders.status,
      createdAt: userOrders.createdAt,
    })
    .from(userOrders)
    .where(
      and(
        eq(userOrders.userId, userId),
        inArray(userOrders.status, [...REVIEW_ELIGIBLE_ORDER_STATUSES]),
      ),
    )
    .orderBy(desc(userOrders.createdAt))
    .limit(100);

  for (const row of rows) {
    if (orderContainsSku(row, sku)) return row;
  }
  return null;
}

export type ReviewEligibility =
  | { authenticated: false; canReview: false; reason: "login_required"; orderNo: null }
  | { authenticated: true; canReview: false; reason: "purchase_required"; orderNo: null }
  | { authenticated: true; canReview: true; reason: "ok"; orderNo: string };

export async function getReviewEligibility(
  userId: number | null,
  sku: string,
): Promise<ReviewEligibility> {
  if (!userId) {
    return {
      authenticated: false,
      canReview: false,
      reason: "login_required",
      orderNo: null,
    };
  }
  const order = await findEligibleOrderForSku(userId, sku);
  if (!order) {
    return {
      authenticated: true,
      canReview: false,
      reason: "purchase_required",
      orderNo: null,
    };
  }
  return {
    authenticated: true,
    canReview: true,
    reason: "ok",
    orderNo: order.orderNo,
  };
}

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
  const eligible = await findEligibleOrderForSku(input.userId, input.sku);
  if (!eligible) {
    throw new ReviewPurchaseRequiredError();
  }

  let orderNo = eligible.orderNo;
  const claimedNo = input.orderNo?.trim();
  if (claimedNo && claimedNo !== eligible.orderNo) {
    const [claimed] = await db
      .select({
        orderNo: userOrders.orderNo,
        sku: userOrders.sku,
        recommendationContext: userOrders.recommendationContext,
        status: userOrders.status,
        userId: userOrders.userId,
      })
      .from(userOrders)
      .where(eq(userOrders.orderNo, claimedNo))
      .limit(1);
    const statusOk = claimed
      && (REVIEW_ELIGIBLE_ORDER_STATUSES as readonly string[]).includes(claimed.status);
    if (
      !claimed
      || claimed.userId !== input.userId
      || !statusOk
      || !orderContainsSku(claimed, input.sku)
    ) {
      throw new ReviewPurchaseRequiredError("订单与商品不匹配，无法评价");
    }
    orderNo = claimed.orderNo;
  }

  const [row] = await db
    .insert(productReviews)
    .values({
      userId: input.userId,
      sku: input.sku,
      orderNo,
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
