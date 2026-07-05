import { Router } from "express";
import { z } from "zod";
import { getAuthUser } from "../lib/auth-user.ts";
import {
  consumeZiweiChatQuestion,
  getZiweiChatQuota,
  grantZiweiChatPurchase,
  resolveZiweiRecommendProduct,
} from "../lib/ziwei-chat.ts";

export const ziweiChatRouter = Router();

const readingIdSchema = z.object({
  readingId: z.string().min(1).max(100),
});

ziweiChatRouter.get("/quota", async (req, res) => {
  const user = await getAuthUser(req);
  if (!user) {
    res.status(401).json({ error: "未登录" });
    return;
  }
  const readingId = typeof req.query.readingId === "string" ? req.query.readingId.trim() : "";
  if (!readingId) {
    res.status(400).json({ error: "缺少 readingId" });
    return;
  }
  try {
    const quota = await getZiweiChatQuota(user.id, readingId);
    res.json({ quota });
  } catch (err) {
    console.error("[ziwei/chat] quota:", err);
    res.status(500).json({ error: "服务器内部错误" });
  }
});

ziweiChatRouter.post("/consume", async (req, res) => {
  const user = await getAuthUser(req);
  if (!user) {
    res.status(401).json({ error: "未登录" });
    return;
  }
  try {
    const body = readingIdSchema.parse(req.body);
    const result = await consumeZiweiChatQuestion(user.id, body.readingId);
    if (!result.ok) {
      res.status(402).json({ error: "quota_exhausted", quota: result.quota });
      return;
    }
    res.json({ success: true, source: result.source, quota: result.quota });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: "参数错误" });
      return;
    }
    console.error("[ziwei/chat] consume:", err);
    res.status(500).json({ error: "服务器内部错误" });
  }
});

ziweiChatRouter.get("/recommend", async (req, res) => {
  const readingId = typeof req.query.readingId === "string" ? req.query.readingId.trim() : "";
  if (!readingId) {
    res.status(400).json({ error: "缺少 readingId" });
    return;
  }
  const locale = typeof req.query.locale === "string" ? req.query.locale : "zh-CN";
  try {
    const product = await resolveZiweiRecommendProduct(readingId, locale);
    if (!product) {
      res.status(404).json({ error: "暂无推荐商品" });
      return;
    }
    res.json({ product });
  } catch (err) {
    console.error("[ziwei/chat] recommend:", err);
    res.status(500).json({ error: "服务器内部错误" });
  }
});

const grantSchema = z.object({
  userId: z.number().int().positive(),
  sku: z.string().min(1).max(100),
  orderNo: z.string().max(64).optional(),
});

export const ziweiChatInternalRouter = Router();

ziweiChatInternalRouter.post("/grant", async (req, res) => {
  try {
    const body = grantSchema.parse(req.body);
    const result = await grantZiweiChatPurchase(body.userId, body.sku);
    res.json({ success: true, ...result });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: "参数错误" });
      return;
    }
    if (err instanceof Error && err.message.startsWith("unsupported")) {
      res.status(400).json({ error: err.message });
      return;
    }
    console.error("[ziwei/chat] grant:", err);
    res.status(500).json({ error: "服务器内部错误" });
  }
});
