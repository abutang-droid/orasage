import { NextRequest, NextResponse } from 'next/server';
import { getMeritSummary } from '@/lib/merit-service';
import { prisma } from '@/lib/prisma';
import { DEITIES } from '@/lib/faiths/deities';
import { formatFaithLabel } from '@/lib/faiths/religions';

const INTERNAL_SECRET = process.env.TAROT_INTERNAL_SECRET || process.env.JWT_SECRET || '';

/** GET /api/internal/merit/summary?orasageUserId= — main 门户拉取功德摘要 */
export async function GET(req: NextRequest) {
  const key = req.headers.get('x-tarot-internal-key');
  if (!INTERNAL_SECRET || key !== INTERNAL_SECRET) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const raw = req.nextUrl.searchParams.get('orasageUserId');
  const orasageUserId = raw ? Number(raw) : NaN;
  if (!Number.isFinite(orasageUserId) || orasageUserId <= 0) {
    return NextResponse.json({ error: 'invalid orasageUserId' }, { status: 400 });
  }

  try {
    const externalId = `orasage:${orasageUserId}`;
    const user = await prisma.user.findUnique({
      where: { externalId },
      select: {
        id: true,
        preferredDeity: true,
        faith: true,
        countryCode: true,
        continentCode: true,
      },
    });
    if (!user) {
      return NextResponse.json({ linked: false });
    }

    const summary = await getMeritSummary(user.id);
    if (!summary) {
      return NextResponse.json({ linked: false });
    }

    const deity = user.preferredDeity
      ? DEITIES.find((d) => d.id === user.preferredDeity)
      : undefined;

    return NextResponse.json({
      linked: true,
      preferredDeity: user.preferredDeity,
      prefs: {
        faith: user.faith,
        faithLabelZh: user.faith ? formatFaithLabel(user.faith) : null,
        faithLabelEn: user.faith ? formatFaithLabel(user.faith) : null,
        countryCode: user.countryCode,
        continentCode: user.continentCode,
        deityId: user.preferredDeity,
        deityNameZh: deity?.name ?? null,
        deityNameEn: deity?.nameEN ?? null,
      },
      summary: {
        total: summary.total,
        level: summary.level,
        levelTitleZh: summary.levelTitleZh,
        levelTitleEn: summary.levelTitleEn,
        streak: summary.streak,
        prayedToday: summary.prayedToday,
      },
    });
  } catch (err) {
    console.error('[api/internal/merit/summary]', err);
    return NextResponse.json({ error: 'failed' }, { status: 500 });
  }
}
