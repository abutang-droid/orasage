import { verifyPaidTarotOrder } from '@/lib/three-card-access';
import { prisma } from '@/lib/prisma';

const UNLOCK_REASON = 'destiny_slice_unlock';

export async function isDestinySliceUnlocked(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { destinySliceUnlockedAt: true },
  });
  return user?.destinySliceUnlockedAt != null;
}

async function isUnlockOrderConsumed(orderNo: string): Promise<boolean> {
  const row = await prisma.meritLog.findUnique({
    where: { idempotencyKey: `destiny_slice:unlock:${orderNo}` },
  });
  return !!row;
}

export async function grantDestinySliceUnlock(userId: string, orderNo: string): Promise<boolean> {
  const already = await isDestinySliceUnlocked(userId);
  if (already) return true;

  const consumed = await isUnlockOrderConsumed(orderNo);
  if (consumed) return false;

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: {
        destinySliceUnlockedAt: new Date(),
        destinySliceUnlockOrderNo: orderNo,
      },
    }),
    prisma.meritLog.create({
      data: {
        userId,
        path: 'offer',
        amount: 0,
        reason: UNLOCK_REASON,
        idempotencyKey: `destiny_slice:unlock:${orderNo}`,
      },
    }),
  ]);
  return true;
}

export async function tryUnlockFromOrder(
  userId: string,
  orderNo: string | null | undefined,
  unlockSku: string,
): Promise<boolean> {
  if (!orderNo?.trim()) return isDestinySliceUnlocked(userId);
  if (await isDestinySliceUnlocked(userId)) return true;

  const ok = await verifyPaidTarotOrder(orderNo.trim(), userId, unlockSku);
  if (!ok) return false;

  return grantDestinySliceUnlock(userId, orderNo.trim());
}
