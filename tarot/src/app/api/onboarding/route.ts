import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAuthUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  advanceOnboarding,
  ensureReferralCode,
  getMeritSummary,
} from '@/lib/merit-service';
import { ONBOARDING_STEPS, type OnboardingStep } from '@/lib/merit';

const stepSchema = z.object({
  step: z.enum(ONBOARDING_STEPS as unknown as [string, ...string[]]),
});

const NEXT_URL: Record<OnboardingStep, string> = {
  welcome: '/onboarding',
  reading: '/onboarding',
  faith: '/onboarding',
  deity: '/onboarding',
  worship: '/onboarding',
  done: '/',
};

/** GET /api/onboarding — 当前引导步骤与建议跳转 */
export async function GET() {
  const auth = await getAuthUser();
  if (!auth) {
    return NextResponse.json({
      step: 'welcome',
      nextUrl: '/onboarding',
      completed: false,
    });
  }

  const user = await prisma.user.findUnique({
    where: { id: auth.userId },
    select: { onboardingStep: true, onboardingCompleted: true, referralCode: true },
  });
  if (!user) {
    return NextResponse.json({ step: 'welcome', nextUrl: '/onboarding', completed: false });
  }

  const step = (user.onboardingStep || 'welcome') as OnboardingStep;
  return NextResponse.json({
    step,
    nextUrl: NEXT_URL[step] ?? '/',
    completed: user.onboardingCompleted,
    referralCode: user.referralCode ?? (await ensureReferralCode(auth.userId)),
  });
}

/** POST /api/onboarding — 推进引导步骤 */
export async function POST(req: NextRequest) {
  const auth = await getAuthUser();
  if (!auth) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }

  try {
    const { step } = stepSchema.parse(await req.json());
    const advanced = await advanceOnboarding(auth.userId, step as OnboardingStep);
    const summary = await getMeritSummary(auth.userId);
    return NextResponse.json({
      step: advanced,
      nextUrl: NEXT_URL[advanced as OnboardingStep],
      completed: summary?.onboardingCompleted ?? false,
    });
  } catch (err) {
    console.error('[api/onboarding]', err);
    return NextResponse.json({ error: '更新引导状态失败' }, { status: 500 });
  }
}
