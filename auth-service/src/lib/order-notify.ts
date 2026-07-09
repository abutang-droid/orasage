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

import { pushHubOpsNotification } from "./message-hub.ts";

type OrderLike = {
  orderNo: string;
  title: string;
  sku?: string | null;
  amountCents: number;
  subtotalCents?: number | null;
  couponCode?: string | null;
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
  ];
  if (order.couponCode) {
    const subtotal = order.subtotalCents ?? order.amountCents;
    const subtotalStr = formatAmount({ ...order, amountCents: subtotal });
    lines.push(`优惠码：${order.couponCode}（原价 ${subtotalStr}）`);
  }
  lines.push(
    `来源：${app} · 用户 #${order.userId}`,
    `状态：${order.status}`,
    `时间：${new Date().toISOString().replace("T", " ").slice(0, 19)} UTC`,
  );
  if (order.recommendationContext) lines.push(`推荐上下文：${order.recommendationContext.slice(0, 200)}`);
  lines.push("", "后台：https://admin.orasage.com/shop/orders");
  return lines.join("\n");
}

/** 触发订单通知（fire-and-forget，调用方无需 await）。 */
export function notifyOrderEvent(event: OrderNotifyEvent, order: OrderLike): void {
  if (!enabledEvents().has(event)) return;
  const text = buildText(event, order);
  const subject = `${EVENT_LABELS[event]} ${order.orderNo} · ${formatAmount(order)}`;
  pushHubOpsNotification(subject, text);
}
