import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { ensureAuthUser, setAuthCookie } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { genderToAuth, OCCUPATION_OPTIONS, GENDER_OPTIONS } from '@/lib/onboarding-v2';
import { syncSavedProfile } from '@/lib/profile-sync';

const bodySchema = z.object({
  birthdate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  gender: z.enum(GENDER_OPTIONS),
  occupation: z.enum(OCCUPATION_OPTIONS),
  faith: z.string().min(1).max(80),
});

export async function POST(req: NextRequest) {
  try {
    const ensured = await ensureAuthUser();
    const body = bodySchema.parse(await req.json());
    const [y, m, d] = body.birthdate.split('-');

    await prisma.user.update({
      where: { id: ensured.userId },
      data: {
        birthday: new Date(body.birthdate),
        gender: body.gender,
        occupation: body.occupation,
        faith: body.faith,
        onboardingCompleted: true,
        onboardingStep: 'done',
      },
    });

    const cookie = req.headers.get('cookie');
    if (cookie?.includes('orasage_token')) {
      void syncSavedProfile({
        name: '旅人',
        gender: genderToAuth(body.gender),
        birthYear: y,
        birthMonth: m,
        birthDay: d,
        sourceApp: 'tarot',
      });
    }

    const res = NextResponse.json({ ok: true, redirect: '/' });
    if (ensured.newToken) res.cookies.set(setAuthCookie(ensured.newToken));
    return res;
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: '请完整填写引导信息' }, { status: 400 });
    }
    console.error('[onboarding/complete]', err);
    return NextResponse.json({ error: '保存失败' }, { status: 500 });
  }
}
