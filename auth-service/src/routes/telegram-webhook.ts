import { Router } from "express";
import { ingestTelegramOpsReply } from "../lib/live-chat.ts";
import { sendHubTelegram } from "../lib/message-hub.ts";

export const telegramWebhookRouter = Router();

type TgUpdate = {
  message?: {
    message_id: number;
    text?: string;
    chat?: { id?: number | string };
    reply_to_message?: { message_id: number };
    from?: { is_bot?: boolean };
  };
};

const TIP_COOLDOWN_MS = 60_000;
let lastTipAt = 0;

function isOpsChat(chatId: number | string | undefined): boolean {
  if (chatId == null) return false;
  const allowed = (process.env.TELEGRAM_CHAT_ID ?? "")
    .split(",")
    .map((s) => s.trim().replace(/^[“”‘’"']+|[“”‘’"']+$/g, ""))
    .filter(Boolean);
  const id = String(chatId);
  return allowed.includes(id);
}

async function tipOps(text: string) {
  const now = Date.now();
  if (now - lastTipAt < TIP_COOLDOWN_MS) return;
  lastTipAt = now;
  await sendHubTelegram(text);
}

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
    res.json({ ok: true, skipped: true, reason: "no_text" });
    return;
  }
  if (msg.from?.is_bot) {
    res.json({ ok: true, skipped: true, reason: "bot" });
    return;
  }

  // 只处理运营配置的 chat（私聊 bot / 运营群）
  if (!isOpsChat(msg.chat?.id)) {
    res.json({ ok: true, skipped: true, reason: "chat_not_allowed" });
    return;
  }

  if (!msg.reply_to_message?.message_id) {
    void tipOps(
      "ℹ️ 回写客户请对某条「💬 客户消息」使用 Telegram 的「回复」，不要直接发新消息。不同客户点不同消息回复即可。",
    );
    res.json({ ok: true, skipped: true, reason: "need_reply" });
    return;
  }

  try {
    const row = await ingestTelegramOpsReply(msg.reply_to_message.message_id, msg.text);
    if (!row) {
      void tipOps(
        "⚠️ 未匹配到客户会话。请回复机器人转发的「💬 客户消息」原条（带会话号的那条），不要回复自己的其它消息。",
      );
      res.json({ ok: true, ingested: false });
      return;
    }
    console.info(
      `[telegram-webhook] ops reply → conversation #${row.conversationId} message #${row.id}`,
    );
    res.json({ ok: true, ingested: true, conversationId: row.conversationId, messageId: row.id });
  } catch (err) {
    console.error("[telegram-webhook]", err);
    res.status(500).json({ error: "ingest failed" });
  }
});
