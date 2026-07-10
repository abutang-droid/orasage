import { verifyPaidTarotOrder } from '@/lib/three-card-access';

export type SingleCardPaidTier = 'report' | 'bundle';

export async function isSingleCardOrderUsed(orderNo: string): Promise<boolean> {
  const { prisma } = await import('@/lib/prisma');
  const row = await prisma.meritLog.findUnique({
    where: { idempotencyKey: `single_card:paid:${orderNo}` },
  });
  return !!row;
}

export async function markSingleCardOrderUsed(orderNo: string, userId: string, tier: SingleCardPaidTier) {
  const { prisma } = await import('@/lib/prisma');
  const idempotencyKey = `single_card:paid:${orderNo}`;
  const dup = await prisma.meritLog.findUnique({ where: { idempotencyKey } });
  if (dup) return;
  await prisma.meritLog.create({
    data: {
      userId,
      path: 'offer',
      amount: 0,
      reason: `single_card_paid_${tier}`,
      idempotencyKey,
    },
  });
}

export type SingleCardReportAccess =
  | { ok: true; tier: SingleCardPaidTier; orderNo: string }
  | { ok: false; reason: 'paywall'; skus: { report: string; bundle: string } };

export async function resolveSingleCardReportAccess(
  userId: string,
  orderNo?: string | null,
): Promise<SingleCardReportAccess> {
  const { fetchTarotBillingSkus } = await import('@/lib/tarot-billing-config');
  const skus = await fetchTarotBillingSkus();

  if (!orderNo) {
    return {
      ok: false,
      reason: 'paywall',
      skus: { report: skus.threeCardReportSku, bundle: skus.threeCardBundleSku },
    };
  }

  const used = await isSingleCardOrderUsed(orderNo);
  if (used) {
    return {
      ok: false,
      reason: 'paywall',
      skus: { report: skus.threeCardReportSku, bundle: skus.threeCardBundleSku },
    };
  }

  const bundleOk = await verifyPaidTarotOrder(orderNo, userId, skus.threeCardBundleSku);
  if (bundleOk) {
    await markSingleCardOrderUsed(orderNo, userId, 'bundle');
    return { ok: true, tier: 'bundle', orderNo };
  }

  const reportOk = await verifyPaidTarotOrder(orderNo, userId, skus.threeCardReportSku);
  if (reportOk) {
    await markSingleCardOrderUsed(orderNo, userId, 'report');
    return { ok: true, tier: 'report', orderNo };
  }

  return {
    ok: false,
    reason: 'paywall',
    skus: { report: skus.threeCardReportSku, bundle: skus.threeCardBundleSku },
  };
}
