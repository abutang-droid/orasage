import { Router } from "express";
import { z } from "zod";
import { getAuthUser } from "../lib/auth-user.ts";
import {
  createProductReview,
  getReviewEligibility,
  listApprovedReviewsForSku,
  ReviewPurchaseRequiredError,
} from "../lib/product-reviews.ts";

export const reviewsRouter = Router();

reviewsRouter.get("/products/:sku/eligibility", async (req, res) => {
  try {
    const sku = String(req.params.sku);
    const user = await getAuthUser(req);
    const eligibility = await getReviewEligibility(user?.id ?? null, sku);
    res.json(eligibility);
  } catch (err) {
    console.error("[reviews] eligibility:", err);
    res.status(500).json({ error: "加载评价权限失败" });
  }
});

reviewsRouter.get("/products/:sku", async (req, res) => {
  try {
    const sku = String(req.params.sku);
    const reviews = await listApprovedReviewsForSku(sku);
    res.json({ reviews });
  } catch (err) {
    console.error("[reviews] list:", err);
    res.status(500).json({ error: "加载评价失败" });
  }
});

const submitSchema = z.object({
  sku: z.string().min(1).max(100),
  orderNo: z.string().max(64).optional(),
  rating: z.number().int().min(1).max(5),
  body: z.string().min(5).max(2000),
});

reviewsRouter.post("/", async (req, res) => {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      res.status(401).json({ error: "请先登录" });
      return;
    }
    const body = submitSchema.parse(req.body);
    const review = await createProductReview({
      userId: user.id,
      sku: body.sku,
      orderNo: body.orderNo,
      rating: body.rating,
      body: body.body,
    });
    res.status(201).json({
      success: true,
      review: {
        id: review.id,
        status: review.status,
        message: "评价已提交，审核通过后将展示在商品页",
      },
    });
  } catch (err) {
    if (err instanceof ReviewPurchaseRequiredError) {
      res.status(403).json({ error: err.message, code: "purchase_required" });
      return;
    }
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: "参数错误", details: err.errors });
      return;
    }
    console.error("[reviews] submit:", err);
    res.status(500).json({ error: "提交评价失败" });
  }
});
