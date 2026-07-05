import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  birthFromParts,
  genderFromAuth,
  type OnboardingPrefill,
  SOURCE_APP_LABELS,
} from '@/lib/onboarding-v2';

const AUTH_URL = process.env.AUTH_URL || process.env.NEXT_PUBLIC_AUTH_URL || 'https://auth.orasage.com';

type AuthProfile = {
  name?: string;
  gender?: string | null;
  birthYear?: string | null;
  birthMonth?: string | null;
  birthDay?: string | null;
  sourceApp?: string | null;
};

export async function GET(req: NextRequest) {
  const auth = await getAuthUser();
  const empty: OnboardingPrefill = {
    birthdate: '',
    gender: '',
    occupation: '',
    faith: '',
    sourceApp: null,
    sourceLabel: null,
  };

  let local: OnboardingPrefill = { ...empty };
  if (auth) {
    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: { birthday: true, gender: true, occupation: true, faith: true },
    });
    if (user) {
      local = {
        birthdate: user.birthday ? user.birthday.toISOString().slice(0, 10) : '',
        gender: genderFromAuth(user.gender),
        occupation: (user.occupation as OnboardingPrefill['occupation']) || '',
        faith: user.faith || '',
        sourceApp: 'tarot',
        sourceLabel: SOURCE_APP_LABELS.tarot,
      };
    }
  }

  let external: OnboardingPrefill | null = null;
  const cookie = req.headers.get('cookie');
  if (cookie?.includes('orasage_token')) {
    try {
      const res = await fetch(`${AUTH_URL}/auth/me/profiles`, {
        headers: { cookie },
        cache: 'no-store',
      });
      if (res.ok) {
        const data = (await res.json()) as { profiles?: AuthProfile[] };
        const profiles = data.profiles ?? [];
        const preferred = profiles.find((p) => p.sourceApp === 'bazi' || p.sourceApp === 'ziwei') ?? profiles[0];
        if (preferred) {
          const app = preferred.sourceApp ?? null;
          external = {
            birthdate: birthFromParts(preferred.birthYear, preferred.birthMonth, preferred.birthDay),
            gender: genderFromAuth(preferred.gender),
            occupation: '',
            faith: '',
            sourceApp: app,
            sourceLabel: app ? (SOURCE_APP_LABELS[app] ?? app) : null,
          };
        }
      }
    } catch (err) {
      console.warn('[onboarding/prefill] auth profiles:', err);
    }
  }

  const merged: OnboardingPrefill = external
    ? {
        birthdate: external.birthdate || local.birthdate,
        gender: external.gender || local.gender,
        occupation: local.occupation || external.occupation,
        faith: local.faith || external.faith,
        sourceApp: external.sourceApp,
        sourceLabel: external.sourceLabel,
      }
    : local;

  return NextResponse.json({
    prefill: merged,
    hasExternal: Boolean(external?.birthdate || external?.gender),
  });
}
