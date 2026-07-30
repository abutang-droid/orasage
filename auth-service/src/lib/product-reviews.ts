import { and, desc, eq, inArray } from "drizzle-orm";
import { parseCartOrderContext } from "../../../shared/shop-cart/cart-order.ts";
import { db } from "../db/index.ts";
import { productReviews, userOrders, users } from "../db/schema.ts";

export type ReviewStatus = typeof productReviews.$inferSelect["status"];

const STATUS_LABELS: Record<ReviewStatus, string> = {
  pending: "待审核",
  approved: "已通过",
  rejected: "已拒绝",
  featured: "精选",
};

/** 视为已购的订单状态（与支付镜像 / 仪表盘一致） */
const PAID_ORDER_STATUSES = ["paid", "shipped", "completed"] as const;

export type ReviewEligibility =
  | { eligible: true; orderNo: string }
  | { eligible: false; reason: "unauthenticated" | "not_purchased" };

/**
 * 用户是否已购买过该 SKU（单品订单或购物车合并订单中的行项目）。
 */
export async function findPurchasedOrderForSku(userId: number, sku: string) {
  const target = sku.trim();
  if (!target) return null;

  const [direct] = await db
    .select({
      orderNo: userOrders.orderNo,
      sku: userOrders.sku,
      recommendationContext: userOrders.recommendationContext,
    })
    .from(userOrders)
    .where(
      and(
        eq(userOrders.userId, userId),
        eq(userOrders.sku, target),
        inArray(userOrders.status, [...PAID_ORDER_STATUSES]),
      ),
    )
    .orderBy(desc(userOrders.createdAt))
    .limit(1);
  if (direct) return direct;

  const cartish = await db
    .select({
      orderNo: userOrders.orderNo,
      sku: userOrders.sku,
      recommendationContext: userOrders.recommendationContext,
    })
    .from(userOrders)
    .where(
      and(
        eq(userOrders.userId, userId),
        inArray(userOrders.status, [...PAID_ORDER_STATUSES]),
      ),
    )
    .orderBy(desc(userOrders.createdAt))
    .limit(80);

  for (const order of cartish) {
    if (order.sku === target) return order;
    const cart = parseCartOrderContext(order.recommendationContext);
    if (cart?.items.some((line) => line.sku === target)) return order;
  }
  return null;
}

export async function getReviewEligibility(
  userId: number | null,
  sku: string,
): Promise<ReviewEligibility> {
  if (userId == null) return { eligible: false, reason: "unauthenticated" };
  const order = await findPurchasedOrderForSku(userId, sku);
  if (!order) return { eligible: false, reason: "not_purchased" };
  return { eligible: true, orderNo: order.orderNo };
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

export class ReviewNotPurchasedError extends Error {
  constructor() {
    super("仅已购买该商品的用户可评价");
    this.name = "ReviewNotPurchasedError";
  }
}

export async function createProductReview(input: {
  userId: number;
  sku: string;
  orderNo?: string | null;
  rating: number;
  body: string;
}) {
  const purchased = await findPurchasedOrderForSku(input.userId, input.sku);
  if (!purchased) throw new ReviewNotPurchasedError();

  // 仅接受与已购订单一致的 orderNo，防止伪造关联
  const requested = input.orderNo?.trim();
  const orderNo =
    requested && requested === purchased.orderNo ? requested : purchased.orderNo;

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
