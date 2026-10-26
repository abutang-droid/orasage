/**
 * 消息中枢 — Telegram / Resend 通道封装（订单提醒、工单、测试探针共用）。
 *
 * 通道全部由环境变量开关；未配置时静默跳过（仅 warnOnce）。
 */

const FETCH_TIMEOUT_MS = 8000;
const warned = new Set<string>();

function warnOnce(key: string, message: string) {
  if (warned.has(key)) return;
  warned.add(key);
  console.warn(`[message-hub] ${message}`);
}

async function timedFetch(url: string, init: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

export type HubChannelStatus = {
  telegram: { configured: boolean; chatCount: number };
  email: { configured: boolean; recipientCount: number };
};

/** 运营后台可读：通道是否已配置（不暴露密钥）。 */
export function getHubChannelStatus(): HubChannelStatus {
  const chatIds = (process.env.TELEGRAM_CHAT_ID ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  const recipients = (process.env.ORDER_NOTIFY_EMAIL_TO ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  return {
    telegram: {
      configured: Boolean(process.env.TELEGRAM_BOT_TOKEN && chatIds.length > 0),
      chatCount: chatIds.length,
    },
    email: {
      configured: Boolean(process.env.RESEND_API_KEY && recipients.length > 0),
      recipientCount: recipients.length,
    },
  };
}

/** 向运营 Telegram 群推送文本。 */
export async function sendHubTelegram(text: string): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatIds = (process.env.TELEGRAM_CHAT_ID ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  if (!token || chatIds.length === 0) {
    warnOnce("tg", "Telegram 通道未配置（TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID），跳过");
    return false;
  }
  let ok = true;
  for (const chatId of chatIds) {
    const res = await timedFetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, disable_web_page_preview: true }),
    });
    if (!res.ok) {
      ok = false;
      const body = await res.text().catch(() => "");
      console.error(`[message-hub] Telegram 发送失败 (${res.status}): ${body.slice(0, 200)}`);
    }
  }
  return ok;
}

/** 经 Resend 发运营邮件（订单提醒等）。 */
export async function sendHubOpsEmail(subject: string, text: string): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = (process.env.ORDER_NOTIFY_EMAIL_TO ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  if (!apiKey || to.length === 0) {
    warnOnce("ops-email", "运营邮件通道未配置（RESEND_API_KEY / ORDER_NOTIFY_EMAIL_TO），跳过");
    return false;
  }
  const from = process.env.ORDER_NOTIFY_EMAIL_FROM || "OraSage <onboarding@resend.dev>";
  const res = await timedFetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ from, to, subject, text }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error(`[message-hub] 运营邮件发送失败 (${res.status}): ${body.slice(0, 200)}`);
    return false;
  }
  return true;
}

/** 向用户邮箱发送工单回复等对外邮件。 */
export async function sendHubUserEmail(to: string, subject: string, text: string): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    warnOnce("user-email", "Resend 未配置（RESEND_API_KEY），跳过用户邮件");
    return false;
  }
  const from = process.env.ORDER_NOTIFY_EMAIL_FROM || "OraSage <onboarding@resend.dev>";
  const res = await timedFetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ from, to, subject, text }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error(`[message-hub] 用户邮件发送失败 (${res.status}): ${body.slice(0, 200)}`);
    return false;
  }
  return true;
}

/** fire-and-forget 推送到运营 Telegram + 运营邮箱。 */
export function pushHubOpsNotification(subject: string, text: string): void {
  void Promise.allSettled([sendHubTelegram(text), sendHubOpsEmail(subject, text)]).catch(() => undefined);
}

/** 发送 Telegram 并返回 message_id（IM 桥接用）。 */
export async function sendHubTelegramReturningId(
  text: string,
  options?: { chatId?: string; messageThreadId?: number },
): Promise<number | null> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = options?.chatId ?? resolveImChatId();
  if (!token || !chatId) {
    warnOnce("tg", "Telegram 通道未配置（TELEGRAM_BOT_TOKEN / TELEGRAM_IM_CHAT_ID），跳过");
    return null;
  }
  const payload: Record<string, unknown> = {
    chat_id: chatId,
    text,
    disable_web_page_preview: true,
  };
  if (options?.messageThreadId) {
    payload.message_thread_id = options.messageThreadId;
  }
  const res = await timedFetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error(`[message-hub] Telegram 发送失败 (${res.status}): ${body.slice(0, 200)}`);
    return null;
  }
  const data = (await res.json().catch(() => null)) as { result?: { message_id?: number } } | null;
  return data?.result?.message_id ?? null;
}

/** IM 客服超级群 id；可与订单通知群分开。 */
export function resolveImChatId(): string | null {
  const im = (process.env.TELEGRAM_IM_CHAT_ID ?? "").trim();
  if (im) return im;
  const fallback = (process.env.TELEGRAM_CHAT_ID ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  return fallback[0] ?? null;
}

/** 在 Forum 超级群创建话题，返回 message_thread_id。 */
export async function createTelegramForumTopic(name: string): Promise<number | null> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = resolveImChatId();
  if (!token || !chatId) return null;

  const res = await timedFetch(`https://api.telegram.org/bot${token}/createForumTopic`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      name: name.slice(0, 128),
    }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error(`[message-hub] createForumTopic 失败 (${res.status}): ${body.slice(0, 200)}`);
    return null;
  }
  const data = (await res.json().catch(() => null)) as {
    result?: { message_thread_id?: number };
  } | null;
  return data?.result?.message_thread_id ?? null;
}
