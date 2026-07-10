import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sourceAppLabel } from '@/lib/i18n/feature-copy';
import { resolveRequestLang } from '@/lib/i18n/request-lang';
import {
  birthFromParts,
  genderFromAuth,
  normalizeNickname,
  type OnboardingPrefill,
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
  const lang = resolveRequestLang(req);
  const auth = await getAuthUser();
  const empty: OnboardingPrefill = {
    nickname: '',
    birthdate: '',
    gender: '',
    occupation: '',
    faith: '',
    countryCode: '',
    continentCode: '',
    sourceApp: null,
    sourceLabel: null,
  };

  let local: OnboardingPrefill = { ...empty };
  if (auth) {
    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: {
        nickname: true, birthday: true, gender: true, occupation: true, faith: true,
        countryCode: true, continentCode: true,
      },
    });
    if (user) {
      local = {
        nickname: normalizeNickname(user.nickname),
        birthdate: user.birthday ? user.birthday.toISOString().slice(0, 10) : '',
        gender: genderFromAuth(user.gender),
        occupation: (user.occupation as OnboardingPrefill['occupation']) || '',
        faith: user.faith || '',
        countryCode: user.countryCode || '',
        continentCode: user.continentCode || '',
        sourceApp: 'tarot',
        sourceLabel: sourceAppLabel(lang, 'tarot'),
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
            nickname: normalizeNickname(preferred.name),
            birthdate: birthFromParts(preferred.birthYear, preferred.birthMonth, preferred.birthDay),
            gender: genderFromAuth(preferred.gender),
            occupation: '',
            faith: '',
            countryCode: '',
            continentCode: '',
            sourceApp: app,
            sourceLabel: sourceAppLabel(lang, app),
          };
        }
      }
    } catch (err) {
      console.warn('[onboarding/prefill] auth profiles:', err);
    }
  }

  const merged: OnboardingPrefill = external
    ? {
        nickname: external.nickname || local.nickname,
        birthdate: external.birthdate || local.birthdate,
        gender: external.gender || local.gender,
        occupation: local.occupation || external.occupation,
        faith: local.faith || external.faith,
        countryCode: local.countryCode || external.countryCode,
        continentCode: local.continentCode || external.continentCode,
        sourceApp: external.sourceApp,
        sourceLabel: external.sourceLabel,
      }
    : local;

  return NextResponse.json({
    prefill: merged,
    hasExternal: Boolean(external?.birthdate || external?.gender || external?.nickname),
  });
}
