import { Router } from "express";
import { ingestTelegramOpsReply, ingestTelegramTopicMessage } from "../lib/live-chat.ts";
import { resolveImChatId } from "../lib/message-hub.ts";

export const telegramWebhookRouter = Router();

type TgUpdate = {
  message?: {
    message_id: number;
    text?: string;
    chat?: { id: number; type?: string };
    message_thread_id?: number;
    reply_to_message?: { message_id: number };
    from?: { is_bot?: boolean; first_name?: string };
  };
};

telegramWebhookRouter.post("/", async (req, res) => {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (secret) {
    const header = req.headers["x-telegram-bot-api-secret-token"];
    if (header !== secret) {
      res.status(403).json({ error: "forbidden" });
      return;
    }
  }

  const update = req.body as TgUpdate;
  const msg = update.message;
  if (!msg?.text) {
    res.json({ ok: true, skipped: true });
    return;
  }
  if (msg.from?.is_bot) {
    res.json({ ok: true, skipped: true });
    return;
  }

  const imChatId = resolveImChatId();
  if (imChatId && msg.chat?.id !== Number(imChatId)) {
    res.json({ ok: true, skipped: true, reason: "chat_mismatch" });
    return;
  }

  try {
    // Forum 超级群：在对应话题里直接回复
    if (msg.message_thread_id) {
      const row = await ingestTelegramTopicMessage(
        msg.message_thread_id,
        msg.text,
        msg.from?.first_name,
      );
      res.json({ ok: true, mode: "topic", ingested: Boolean(row) });
      return;
    }

    // 兼容：普通群 / 回复链模式
    if (msg.reply_to_message?.message_id) {
      const row = await ingestTelegramOpsReply(msg.reply_to_message.message_id, msg.text);
      res.json({ ok: true, mode: "reply", ingested: Boolean(row) });
      return;
    }

    res.json({ ok: true, skipped: true, reason: "no_thread_or_reply" });
  } catch (err) {
    console.error("[telegram-webhook]", err);
    res.status(500).json({ error: "ingest failed" });
  }
});
