const AUTH_INTERNAL = process.env.AUTH_INTERNAL_URL || 'http://127.0.0.1:3101';

export type ThreeCardPaidTier = 'report' | 'bundle';

export async function verifyPaidTarotOrder(
  orderNo: string,
  tarotUserId: string,
  expectedSku: string,
): Promise<boolean> {
  try {
    const res = await fetch(`${AUTH_INTERNAL}/internal/orders/${encodeURIComponent(orderNo)}`, {
      headers: { 'x-real-ip': '127.0.0.1' },
    });
    if (!res.ok) return false;
    const data = await res.json();
    const order = data.order;
    if (!order || order.status !== 'paid' || order.appSource !== 'tarot') return false;
    if (String(order.sku ?? '') !== expectedSku) return false;
    const match = String(order.recommendationContext ?? '').match(/tarotUser:([^|]+)/);
    return match?.[1] === tarotUserId;
  } catch {
    return false;
  }
}

export async function isThreeCardOrderUsed(orderNo: string): Promise<boolean> {
  const { prisma } = await import('@/lib/prisma');
  const row = await prisma.meritLog.findUnique({
    where: { idempotencyKey: `three_card:paid:${orderNo}` },
  });
  return !!row;
}

export async function markThreeCardOrderUsed(orderNo: string, userId: string, tier: ThreeCardPaidTier) {
  const { prisma } = await import('@/lib/prisma');
  const idempotencyKey = `three_card:paid:${orderNo}`;
  const dup = await prisma.meritLog.findUnique({ where: { idempotencyKey } });
  if (dup) return;
  await prisma.meritLog.create({
    data: {
      userId,
      path: 'offer',
      amount: 0,
      reason: `three_card_paid_${tier}`,
      idempotencyKey,
    },
  });
}

export type ThreeCardReportAccess =
  | { ok: true; tier: ThreeCardPaidTier; orderNo: string }
  | { ok: false; reason: 'paywall'; skus: { report: string; bundle: string } };

export async function resolveThreeCardReportAccess(
  userId: string,
  orderNo?: string | null,
): Promise<ThreeCardReportAccess> {
  const { fetchTarotBillingSkus } = await import('@/lib/tarot-billing-config');
  const skus = await fetchTarotBillingSkus();

  if (!orderNo) {
    return {
      ok: false,
      reason: 'paywall',
      skus: { report: skus.threeCardReportSku, bundle: skus.threeCardBundleSku },
    };
  }

  const used = await isThreeCardOrderUsed(orderNo);
  if (used) {
    return {
      ok: false,
      reason: 'paywall',
      skus: { report: skus.threeCardReportSku, bundle: skus.threeCardBundleSku },
    };
  }

  const bundleOk = await verifyPaidTarotOrder(orderNo, userId, skus.threeCardBundleSku);
  if (bundleOk) {
    await markThreeCardOrderUsed(orderNo, userId, 'bundle');
    return { ok: true, tier: 'bundle', orderNo };
  }

  const reportOk = await verifyPaidTarotOrder(orderNo, userId, skus.threeCardReportSku);
  if (reportOk) {
    await markThreeCardOrderUsed(orderNo, userId, 'report');
    return { ok: true, tier: 'report', orderNo };
  }

  return {
    ok: false,
    reason: 'paywall',
    skus: { report: skus.threeCardReportSku, bundle: skus.threeCardBundleSku },
  };
}

/** 三牌阵始终允许抽牌+简读；仅完整报告需付费 */
export function canStartThreeCardBrief(): { ok: true } {
  return { ok: true };
}
