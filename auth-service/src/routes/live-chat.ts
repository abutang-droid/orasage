import { Router } from "express";
import { z } from "zod";
import { getAuthUser } from "../lib/auth-user.ts";
import {
  getOrCreateOpenConversation,
  listMessagesForConversation,
  markMessagesReadByUser,
  sendUserChatMessage,
} from "../lib/live-chat.ts";

export const liveChatRouter = Router();

async function requireUser(req: Parameters<typeof getAuthUser>[0], res: { status: (n: number) => { json: (b: unknown) => void } }) {
  const user = await getAuthUser(req);
  if (!user) {
    res.status(401).json({ error: "未登录" });
    return null;
  }
  return user;
}

liveChatRouter.get("/conversation", async (req, res) => {
  const user = await requireUser(req, res);
  if (!user) return;
  const conversation = await getOrCreateOpenConversation(user.id);
  res.json({
    conversation: {
      id: conversation.id,
      status: conversation.status,
      updatedAt: conversation.updatedAt.toISOString(),
    },
  });
});

liveChatRouter.get("/messages", async (req, res) => {
  const user = await requireUser(req, res);
  if (!user) return;
  const conversation = await getOrCreateOpenConversation(user.id);
  const afterId = Number(req.query.afterId ?? 0);
  const messages = await listMessagesForConversation(
    conversation.id,
    Number.isFinite(afterId) ? afterId : 0,
  );
  await markMessagesReadByUser(conversation.id, user.id);
  res.json({ conversationId: conversation.id, messages });
});

const sendSchema = z.object({
  body: z.string().trim().min(1).max(2000),
});

liveChatRouter.post("/messages", async (req, res) => {
  const user = await requireUser(req, res);
  if (!user) return;
  try {
    const body = sendSchema.parse(req.body);
    const result = await sendUserChatMessage(user, body.body);
    res.status(201).json(result);
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: "参数错误" });
      return;
    }
    const message = err instanceof Error ? err.message : "发送失败";
    res.status(400).json({ error: message });
  }
});
