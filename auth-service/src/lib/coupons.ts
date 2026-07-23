import { eq } from "drizzle-orm";
import { db } from "../db/index.ts";
import { coupons } from "../db/schema.ts";

export type CouponRow = typeof coupons.$inferSelect;

export function formatCoupon(c: CouponRow) {
  return {
    id: c.id,
    code: c.code,
    labelI18n: c.labelI18n ?? {},
    discountType: c.discountType,
    discountValue: c.discountValue,
    minOrderCents: c.minOrderCents,
    maxUses: c.maxUses,
    usedCount: c.usedCount,
    startsAt: c.startsAt,
    endsAt: c.endsAt,
    active: c.active,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
  };
}

export async function listCoupons() {
  const rows = await db.select().from(coupons).orderBy(coupons.code);
  return rows.map(formatCoupon);
}

export type CouponInput = {
  code: string;
  labelI18n: Record<string, string>;
  discountType: "percent" | "fixed_cents";
  discountValue: number;
  minOrderCents?: number;
  maxUses?: number | null;
  startsAt?: Date | null;
  endsAt?: Date | null;
  active?: boolean;
};

export async function replaceCoupons(inputs: CouponInput[]): Promise<CouponRow[]> {
  await db.delete(coupons);
  if (inputs.length === 0) return [];
  return db
    .insert(coupons)
    .values(
      inputs.map((c) => ({
        code: c.code.toUpperCase(),
        labelI18n: c.labelI18n,
        discountType: c.discountType,
        discountValue: c.discountValue,
        minOrderCents: c.minOrderCents ?? 0,
        maxUses: c.maxUses ?? null,
        usedCount: 0,
        startsAt: c.startsAt ?? null,
        endsAt: c.endsAt ?? null,
        active: c.active ?? true,
      })),
    )
    .returning();
}

export async function findCouponByCode(code: string): Promise<CouponRow | null> {
  const normalized = code.trim().toUpperCase();
  if (!normalized) return null;
  const [row] = await db.select().from(coupons).where(eq(coupons.code, normalized)).limit(1);
  return row ?? null;
}

export function validateCoupon(coupon: CouponRow, orderCents: number, at: Date = new Date()): string | null {
  if (!coupon.active) return "优惠码已停用";
  if (coupon.startsAt && at < coupon.startsAt) return "优惠码尚未生效";
  if (coupon.endsAt && at > coupon.endsAt) return "优惠码已过期";
  if (coupon.maxUses != null && coupon.usedCount >= coupon.maxUses) return "优惠码已达使用上限";
  if (orderCents < coupon.minOrderCents) {
    return `订单金额需满 ${(coupon.minOrderCents / 100).toFixed(2)} USDT`;
  }
  return null;
}

export function applyCouponDiscount(coupon: CouponRow, orderCents: number): number {
  if (coupon.discountType === "fixed_cents") {
    return Math.max(0, orderCents - coupon.discountValue);
  }
  const pct = Math.min(100, Math.max(0, coupon.discountValue));
  return Math.max(0, Math.round(orderCents * (100 - pct) / 100));
}

export async function incrementCouponUse(code: string) {
  const row = await findCouponByCode(code);
  if (!row) return;
  await db
    .update(coupons)
    .set({ usedCount: row.usedCount + 1, updatedAt: new Date() })
    .where(eq(coupons.id, row.id));
}
