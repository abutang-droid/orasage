import { Router } from "express";
import { resolveBillingSlot, resolveBillingSlotsForApp } from "../lib/billing-slots.ts";

export const billingRouter = Router();

/**
 * GET /api/billing/slot?app=bazi&key=recommend.element.wood&seed=&locale=
 * App 计费/推荐统一入口：按后台配置的槽位返回商品（R6）。
 */
billingRouter.get("/slot", async (req, res) => {
  const app = typeof req.query.app === "string" ? req.query.app.trim() : "";
  const key = typeof req.query.key === "string" ? req.query.key.trim() : "";
  if (!app || !key) {
    res.status(400).json({ error: "缺少 app 或 key 参数" });
    return;
  }
  const locale = typeof req.query.locale === "string" ? req.query.locale : "zh-CN";
  const seed = typeof req.query.seed === "string" && req.query.seed.trim()
    ? req.query.seed.trim()
    : undefined;
  try {
    const result = await resolveBillingSlot(app, key, { locale, seed });
    if (!result) {
      res.status(404).json({ error: "槽位未配置或商品已下架" });
      return;
    }
    res.json(result);
  } catch (err) {
    console.error("[billing] slot:", err);
    res.status(500).json({ error: "服务器内部错误" });
  }
});

/** GET /api/billing/slots?app=tarot&locale= — 一次拉取某 App 全部槽位 */
billingRouter.get("/slots", async (req, res) => {
  const app = typeof req.query.app === "string" ? req.query.app.trim() : "";
  if (!app) {
    res.status(400).json({ error: "缺少 app 参数" });
    return;
  }
  const locale = typeof req.query.locale === "string" ? req.query.locale : "zh-CN";
  try {
    const result = await resolveBillingSlotsForApp(app, locale);
    res.json(result);
  } catch (err) {
    console.error("[billing] slots:", err);
    res.status(500).json({ error: "服务器内部错误" });
  }
});
