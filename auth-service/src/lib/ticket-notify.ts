import { siteUrls } from './site-urls.ts';
/**
 * 工单 / 留言通知 — 新工单推运营；运营回复推用户邮箱。
 */

import { pushHubOpsNotification, sendHubUserEmail } from "./message-hub.ts";

type TicketLike = {
  id: number;
  name: string;
  email: string;
  subject?: string | null;
  body: string;
  category?: string | null;
  orderNo?: string | null;
  locale?: string | null;
};

const CATEGORY_LABELS: Record<string, string> = {
  general: "一般咨询",
  complaint: "投诉",
  refund: "退款",
  bug: "问题反馈",
};

function categoryLabel(code: string | null | undefined): string {
  if (!code) return CATEGORY_LABELS.general;
  return CATEGORY_LABELS[code] ?? code;
}

function buildNewTicketText(ticket: TicketLike): string {
  const lines = [
    "📩 新用户工单",
    `编号：#${ticket.id}`,
    `分类：${categoryLabel(ticket.category)}`,
    `姓名：${ticket.name}`,
    `邮箱：${ticket.email}`,
  ];
  if (ticket.orderNo) lines.push(`关联订单：${ticket.orderNo}`);
  if (ticket.subject) lines.push(`主题：${ticket.subject}`);
  lines.push("", ticket.body.slice(0, 1500));
  if (ticket.locale) lines.push("", `locale: ${ticket.locale}`);
  lines.push("", `后台：${siteUrls().admin}/messages`);
  return lines.join("\n");
}

/** 新工单 → 运营 Telegram + 运营邮箱。 */
export function notifyNewTicket(ticket: TicketLike): void {
  const subject = `新工单 #${ticket.id} · ${categoryLabel(ticket.category)}`;
  pushHubOpsNotification(subject, buildNewTicketText(ticket));
}

/** 运营回复 → 用户邮箱（Resend）。 */
export function notifyTicketReply(ticket: TicketLike & { adminReply: string }): void {
  const subject = ticket.subject
    ? `Re: ${ticket.subject}`
    : `OraSage 工单 #${ticket.id} 回复`;
  const lines = [
    `你好 ${ticket.name}，`,
    "",
    "我们已回复你的留言：",
    "",
    ticket.adminReply,
    "",
    "---",
    "你的原始留言：",
    ticket.body.slice(0, 800),
    "",
    "如需继续沟通，请登录 OraSage 在「我的 → 我的工单」查看，或再次联系我们。",
    `${siteUrls().main}/profile/tickets`,
  ];
  void sendHubUserEmail(ticket.email, subject, lines.join("\n")).catch(() => undefined);
}
