import { NextRequest, NextResponse } from 'next/server';
import { getMeritSummary } from '@/lib/merit-service';
import { prisma } from '@/lib/prisma';

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
      select: { id: true, preferredDeity: true },
    });
    if (!user) {
      return NextResponse.json({ linked: false });
    }

    const summary = await getMeritSummary(user.id);
    if (!summary) {
      return NextResponse.json({ linked: false });
    }

    return NextResponse.json({
      linked: true,
      preferredDeity: user.preferredDeity,
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
