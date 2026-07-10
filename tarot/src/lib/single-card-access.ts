import { verifyPaidTarotOrder } from '@/lib/three-card-access';
import { consumeTempleFreeReport } from '@/lib/single-card-quota';

export type SingleCardPaidTier = 'report' | 'bundle' | 'temple_free';

export async function isSingleCardOrderUsed(orderNo: string): Promise<boolean> {
  const { prisma } = await import('@/lib/prisma');
  const row = await prisma.meritLog.findUnique({
    where: { idempotencyKey: `single_card:paid:${orderNo}` },
  });
  return !!row;
}

export async function markSingleCardOrderUsed(orderNo: string, userId: string, tier: SingleCardPaidTier) {
  const { prisma } = await import('@/lib/prisma');
  const idempotencyKey = tier === 'temple_free'
    ? `single_card:temple_free:${orderNo}`
    : `single_card:paid:${orderNo}`;
  const dup = await prisma.meritLog.findUnique({ where: { idempotencyKey } });
  if (dup) return;
  await prisma.meritLog.create({
    data: {
      userId,
      path: 'offer',
      amount: 0,
      reason: `single_card_${tier}`,
      idempotencyKey,
    },
  });
}

export type SingleCardReportAccess =
  | { ok: true; tier: SingleCardPaidTier; orderNo: string }
  | { ok: false; reason: 'paywall'; skus: { report: string; bundle: string }; templeFreeAvailable: boolean };

export async function resolveSingleCardReportAccess(
  userId: string,
  orderNo?: string | null,
  opts?: { useTempleFree?: boolean },
): Promise<SingleCardReportAccess> {
  const { fetchTarotBillingSkus } = await import('@/lib/tarot-billing-config');
  const skus = await fetchTarotBillingSkus();
  const paywallFallback = {
    ok: false as const,
    reason: 'paywall' as const,
    skus: { report: skus.threeCardReportSku, bundle: skus.threeCardBundleSku },
    templeFreeAvailable: false,
  };

  if (opts?.useTempleFree) {
    const consumed = await consumeTempleFreeReport(userId);
    if (consumed.ok) {
      const key = `temple-free:${userId}:${consumed.dateKey}`;
      await markSingleCardOrderUsed(key, userId, 'temple_free');
      return { ok: true, tier: 'temple_free', orderNo: key };
    }
  }

  if (!orderNo) {
    const { getSingleCardQuota } = await import('@/lib/single-card-quota');
    const quota = await getSingleCardQuota(userId);
    return { ...paywallFallback, templeFreeAvailable: quota.templeFreeReportAvailable };
  }

  const used = await isSingleCardOrderUsed(orderNo);
  if (used) {
    const { getSingleCardQuota } = await import('@/lib/single-card-quota');
    const quota = await getSingleCardQuota(userId);
    return { ...paywallFallback, templeFreeAvailable: quota.templeFreeReportAvailable };
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

  const { getSingleCardQuota } = await import('@/lib/single-card-quota');
  const quota = await getSingleCardQuota(userId);
  return { ...paywallFallback, templeFreeAvailable: quota.templeFreeReportAvailable };
}
