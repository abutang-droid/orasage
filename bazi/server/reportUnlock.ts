/**
 * 付费任务能否改写某条 user_readings。
 *
 * 排盘常在未登录时落库（userId=0），结账必须登录，付款人 id 与记录 id 不一致。
 * 只允许：付款人就是记录主人，或记录仍是游客（0）由付款人认领。
 * 禁止：用 A 的订单去解锁 B 的盘。
 */
export function canPayerUnlockReading(readingUserId: number, payerUserId: number): boolean {
  if (!Number.isInteger(payerUserId) || payerUserId <= 0) return false;
  if (!Number.isInteger(readingUserId) || readingUserId < 0) return false;
  if (readingUserId === payerUserId) return true;
  return readingUserId === 0;
}

export function assertPayerMayUnlock(readingUserId: number, payerUserId: number): void {
  if (!canPayerUnlockReading(readingUserId, payerUserId)) {
    throw new Error("reading user mismatch");
  }
}

export function parseReportTierFromHtml(html: string): "paid" | "free" | null {
  const head = html.slice(0, 1600);
  if (/data-report-tier=["']paid["']/.test(head)) return "paid";
  if (/data-report-tier=["']free["']/.test(head)) return "free";
  if (head.includes("paywall-section") || head.includes("解锁完整命局报告")) return "free";
  return null;
}
