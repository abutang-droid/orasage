import { Router } from "express";
import { ingestTelegramOpsReply } from "../lib/live-chat.ts";

export const telegramWebhookRouter = Router();

type TgUpdate = {
  message?: {
    message_id: number;
    text?: string;
    reply_to_message?: { message_id: number };
    from?: { is_bot?: boolean };
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
  if (!msg?.text || !msg.reply_to_message?.message_id) {
    res.json({ ok: true, skipped: true });
    return;
  }
  if (msg.from?.is_bot) {
    res.json({ ok: true, skipped: true });
    return;
  }

  try {
    const row = await ingestTelegramOpsReply(msg.reply_to_message.message_id, msg.text);
    res.json({ ok: true, ingested: Boolean(row) });
  } catch (err) {
    console.error("[telegram-webhook]", err);
    res.status(500).json({ error: "ingest failed" });
  }
});
