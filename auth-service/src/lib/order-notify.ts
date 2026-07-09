/**
 * 订单提醒 — 新订单 / 支付成功推送到运营 Telegram 与邮箱。
 *
 * 通道全部由环境变量开关，缺省未配置时静默跳过（只在启动后首次记录一次），
 * 不影响订单主流程（fire-and-forget，带超时）。
 *
 * 环境变量：
 *   TELEGRAM_BOT_TOKEN        — @BotFather 创建的 bot token
 *   TELEGRAM_CHAT_ID          — 接收通知的 chat/群 id（可逗号分隔多个）
 *   RESEND_API_KEY            — Resend 邮件 API key
 *   ORDER_NOTIFY_EMAIL_TO     — 收件人（可逗号分隔多个）
 *   ORDER_NOTIFY_EMAIL_FROM   — 发件人，默认 "OraSage <onboarding@resend.dev>"
 *   ORDER_NOTIFY_EVENTS       — 触发事件，默认 "created,paid"
 */

type OrderLike = {
  orderNo: string;
  title: string;
  sku?: string | null;
  amountCents: number;
  currency: string;
  status: string;
  appSource?: string | null;
  userId: number;
  recommendationContext?: string | null;
};

export type OrderNotifyEvent = "created" | "paid";

const APP_LABELS: Record<string, string> = {
  bazi: "八字排盘",
  ziwei: "紫微斗数",
  tarot: "塔罗占卜",
  shop: "能量商城",
};

const EVENT_LABELS: Record<OrderNotifyEvent, string> = {
  created: "🆕 新订单",
  paid: "💰 订单支付成功",
};

const FETCH_TIMEOUT_MS = 8000;
const warned = new Set<string>();

function warnOnce(key: string, message: string) {
  if (warned.has(key)) return;
  warned.add(key);
  console.warn(`[order-notify] ${message}`);
}

function enabledEvents(): Set<string> {
  const raw = process.env.ORDER_NOTIFY_EVENTS ?? "created,paid";
  return new Set(raw.split(",").map((s) => s.trim()).filter(Boolean));
}

function formatAmount(order: OrderLike): string {
  const value = (order.amountCents / 100).toFixed(2);
  const cur = order.currency.toUpperCase();
  if (cur === "CNY") return `¥${value}`;
  if (cur === "USD") return `$${value}`;
  return `${value} ${cur}`;
}

function buildText(event: OrderNotifyEvent, order: OrderLike): string {
  const app = order.appSource ? APP_LABELS[order.appSource] ?? order.appSource : "-";
  const lines = [
    EVENT_LABELS[event],
    `订单号：${order.orderNo}`,
    `商品：${order.title}${order.sku ? `（${order.sku}）` : ""}`,
    `金额：${formatAmount(order)}`,
    `来源：${app} · 用户 #${order.userId}`,
    `状态：${order.status}`,
    `时间：${new Date().toISOString().replace("T", " ").slice(0, 19)} UTC`,
  ];
  if (order.recommendationContext) lines.push(`推荐上下文：${order.recommendationContext.slice(0, 200)}`);
  lines.push("", "后台：https://admin.orasage.com/orders");
  return lines.join("\n");
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

async function sendTelegram(text: string): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatIds = (process.env.TELEGRAM_CHAT_ID ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  if (!token || chatIds.length === 0) {
    warnOnce("tg", "Telegram 通道未配置（TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID），跳过");
    return;
  }
  for (const chatId of chatIds) {
    const res = await timedFetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, disable_web_page_preview: true }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error(`[order-notify] Telegram 发送失败 (${res.status}): ${body.slice(0, 200)}`);
    }
  }
}

async function sendEmail(subject: string, text: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = (process.env.ORDER_NOTIFY_EMAIL_TO ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  if (!apiKey || to.length === 0) {
    warnOnce("email", "邮件通道未配置（RESEND_API_KEY / ORDER_NOTIFY_EMAIL_TO），跳过");
    return;
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
    console.error(`[order-notify] 邮件发送失败 (${res.status}): ${body.slice(0, 200)}`);
  }
}

/** 触发订单通知（fire-and-forget，调用方无需 await）。 */
export function notifyOrderEvent(event: OrderNotifyEvent, order: OrderLike): void {
  if (!enabledEvents().has(event)) return;
  const text = buildText(event, order);
  const subject = `${EVENT_LABELS[event]} ${order.orderNo} · ${formatAmount(order)}`;
  void Promise.allSettled([sendTelegram(text), sendEmail(subject, text)]).catch(() => undefined);
}
