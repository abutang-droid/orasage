import { Router } from "express";
import {
  getTarotBillingProducts,
  getTarotBillingSkus,
  resolveTarotDailyRecommendProduct,
} from "../lib/tarot-billing.ts";

export const tarotBillingRouter = Router();

tarotBillingRouter.get("/config", async (req, res) => {
  const locale = typeof req.query.locale === "string" ? req.query.locale : "zh-CN";
  try {
    const config = await getTarotBillingProducts(locale);
    res.json(config);
  } catch (err) {
    console.error("[tarot/billing] config:", err);
    res.status(500).json({ error: "服务器内部错误" });
  }
});

tarotBillingRouter.get("/daily-recommend", async (req, res) => {
  const seed = typeof req.query.seed === "string" ? req.query.seed.trim() : "";
  if (!seed) {
    res.status(400).json({ error: "缺少 seed" });
    return;
  }
  const locale = typeof req.query.locale === "string" ? req.query.locale : "zh-CN";
  try {
    const product = await resolveTarotDailyRecommendProduct(seed, locale);
    if (!product) {
      res.status(404).json({ error: "暂无推荐商品" });
      return;
    }
    res.json({ product });
  } catch (err) {
    console.error("[tarot/billing] daily-recommend:", err);
    res.status(500).json({ error: "服务器内部错误" });
  }
});

/** 内部/轻量：仅 SKU 字符串 */
tarotBillingRouter.get("/skus", async (_req, res) => {
  try {
    const skus = await getTarotBillingSkus();
    res.json({ skus });
  } catch (err) {
    console.error("[tarot/billing] skus:", err);
    res.status(500).json({ error: "服务器内部错误" });
  }
});
