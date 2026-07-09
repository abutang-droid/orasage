import { Router } from "express";
import { z } from "zod";
import {
  applyCouponDiscount,
  findCouponByCode,
  validateCoupon,
} from "../lib/coupons.ts";

export const couponsPublicRouter = Router();

couponsPublicRouter.post("/validate", async (req, res) => {
  try {
    const body = z.object({
      code: z.string().min(1).max(50),
      orderCents: z.number().int().min(0),
    }).parse(req.body);
    const coupon = await findCouponByCode(body.code);
    if (!coupon) {
      res.status(404).json({ error: "优惠码不存在" });
      return;
    }
    const err = validateCoupon(coupon, body.orderCents);
    if (err) {
      res.status(400).json({ error: err });
      return;
    }
    const discountedCents = applyCouponDiscount(coupon, body.orderCents);
    res.json({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      orderCents: body.orderCents,
      discountedCents,
      savingsCents: body.orderCents - discountedCents,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: "参数错误" });
      return;
    }
    console.error("[coupons] validate:", err);
    res.status(500).json({ error: "验证优惠码失败" });
  }
});
