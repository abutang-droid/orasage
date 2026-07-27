import { prisma } from '@/lib/prisma';

function isGuestUserId(userId: string, email?: string | null): boolean {
  return userId.startsWith('guest_') || Boolean(email?.endsWith('@manto.guest'));
}

/** 登录桥接时，把访客账号下的占卜/额度数据合并到 orasage 本地用户 */
export async function mergeGuestUserIntoTarget(guestUserId: string, targetUserId: string): Promise<void> {
  if (guestUserId === targetUserId) return;

  const guest = await prisma.user.findUnique({ where: { id: guestUserId } });
  if (!guest || !isGuestUserId(guest.id, guest.email)) return;

  await prisma.$transaction(async (tx) => {
    await tx.dailyFortuneRecord.updateMany({
      where: { userId: guestUserId },
      data: { userId: targetUserId },
    });

    const guestDays = await tx.dailyFortuneDay.findMany({ where: { userId: guestUserId } });
    for (const guestDay of guestDays) {
      const targetDay = await tx.dailyFortuneDay.findUnique({
        where: { userId_dateKey: { userId: targetUserId, dateKey: guestDay.dateKey } },
      });
      if (targetDay) {
        await tx.dailyFortuneDay.update({
          where: { id: targetDay.id },
          data: {
            drawsUsed: Math.max(targetDay.drawsUsed, guestDay.drawsUsed),
            templeBonusGranted: targetDay.templeBonusGranted || guestDay.templeBonusGranted,
          },
        });
        await tx.dailyFortuneDay.delete({ where: { id: guestDay.id } });
      } else {
        await tx.dailyFortuneDay.update({
          where: { id: guestDay.id },
          data: { userId: targetUserId },
        });
      }
    }

    await tx.singleCardReading.updateMany({
      where: { userId: guestUserId },
      data: { userId: targetUserId },
    });

    const guestSingleDays = await tx.singleCardDay.findMany({ where: { userId: guestUserId } });
    for (const guestDay of guestSingleDays) {
      const targetDay = await tx.singleCardDay.findUnique({
        where: { userId_dateKey: { userId: targetUserId, dateKey: guestDay.dateKey } },
      });
      if (targetDay) {
        await tx.singleCardDay.update({
          where: { id: targetDay.id },
          data: {
            drawsUsed: Math.max(targetDay.drawsUsed, guestDay.drawsUsed),
            templeBonusGranted: targetDay.templeBonusGranted || guestDay.templeBonusGranted,
          },
        });
        await tx.singleCardDay.delete({ where: { id: guestDay.id } });
      } else {
        await tx.singleCardDay.update({
          where: { id: guestDay.id },
          data: { userId: targetUserId },
        });
      }
    }

    await tx.threeCardReading.updateMany({
      where: { userId: guestUserId },
      data: { userId: targetUserId },
    });

    await tx.readingRecord.updateMany({
      where: { userId: guestUserId },
      data: { userId: targetUserId },
    });

    const target = await tx.user.findUnique({ where: { id: targetUserId } });
    if (target) {
      await tx.user.update({
        where: { id: targetUserId },
        data: {
          nickname:
            !target.nickname || target.nickname === '旅人'
              ? guest.nickname || target.nickname
              : target.nickname,
          birthday: target.birthday ?? guest.birthday,
          gender: target.gender ?? guest.gender,
          occupation: target.occupation ?? guest.occupation,
          faith: target.faith ?? guest.faith,
          preferredDeity: target.preferredDeity ?? guest.preferredDeity,
          countryCode: target.countryCode ?? guest.countryCode,
          continentCode: target.continentCode ?? guest.continentCode,
          onboardingCompleted: target.onboardingCompleted || guest.onboardingCompleted,
          onboardingStep: target.onboardingCompleted ? target.onboardingStep : guest.onboardingStep,
        },
      });
    }
  });
}

export async function maybeMergeGuestSession(
  guestUser: { userId: string; email: string } | null,
  targetUser: { userId: string; email: string },
): Promise<void> {
  if (!guestUser) return;
  if (guestUser.userId === targetUser.userId) return;
  if (!isGuestUserId(guestUser.userId, guestUser.email)) return;
  try {
    await mergeGuestUserIntoTarget(guestUser.userId, targetUser.userId);
  } catch (err) {
    // 并行请求可能重复合并；第二次失败不应阻断登录态
    console.error('[guest-merge] failed:', err);
  }
}
