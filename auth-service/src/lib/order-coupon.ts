import { eq } from "drizzle-orm";
import { db } from "../db/index.ts";
import { userOrders } from "../db/schema.ts";
import {
  applyCouponDiscount,
  findCouponByCode,
  incrementCouponUse,
  validateCoupon,
} from "./coupons.ts";

export async function applyCouponToOrder(orderNo: string, code: string) {
  const [order] = await db.select().from(userOrders).where(eq(userOrders.orderNo, orderNo)).limit(1);
  if (!order) return { ok: false as const, error: "订单不存在" };
  if (order.status !== "pending") return { ok: false as const, error: "订单状态不允许使用优惠码" };
  if (order.appSource && order.appSource !== "shop") {
    return { ok: false as const, error: "该订单不支持优惠码" };
  }

  const coupon = await findCouponByCode(code);
  if (!coupon) return { ok: false as const, error: "优惠码不存在" };

  const subtotalCents = order.subtotalCents ?? order.amountCents;
  const err = validateCoupon(coupon, subtotalCents);
  if (err) return { ok: false as const, error: err };

  const discountedCents = applyCouponDiscount(coupon, subtotalCents);
  const [updated] = await db
    .update(userOrders)
    .set({
      subtotalCents,
      amountCents: discountedCents,
      couponCode: coupon.code,
    })
    .where(eq(userOrders.orderNo, orderNo))
    .returning();

  return {
    ok: true as const,
    order: updated,
    subtotalCents,
    amountCents: discountedCents,
    savingsCents: subtotalCents - discountedCents,
    couponCode: coupon.code,
  };
}

export async function removeCouponFromOrder(orderNo: string) {
  const [order] = await db.select().from(userOrders).where(eq(userOrders.orderNo, orderNo)).limit(1);
  if (!order) return { ok: false as const, error: "订单不存在" };
  if (order.status !== "pending") return { ok: false as const, error: "订单状态不允许修改优惠码" };
  if (!order.couponCode) {
    return {
      ok: true as const,
      order,
      subtotalCents: order.subtotalCents ?? order.amountCents,
      amountCents: order.amountCents,
      savingsCents: 0,
      couponCode: null as string | null,
    };
  }

  const restored = order.subtotalCents ?? order.amountCents;
  const [updated] = await db
    .update(userOrders)
    .set({
      amountCents: restored,
      couponCode: null,
      subtotalCents: null,
    })
    .where(eq(userOrders.orderNo, orderNo))
    .returning();

  return {
    ok: true as const,
    order: updated,
    subtotalCents: restored,
    amountCents: restored,
    savingsCents: 0,
    couponCode: null as string | null,
  };
}

export async function finalizeCouponOnPaid(orderNo: string) {
  const [order] = await db.select().from(userOrders).where(eq(userOrders.orderNo, orderNo)).limit(1);
  if (!order?.couponCode) return;
  await incrementCouponUse(order.couponCode);
}
