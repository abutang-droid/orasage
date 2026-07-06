import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { getMeritSummary } from '@/lib/merit-service';
import { MERIT_RULES } from '@/lib/merit';
import { prisma } from '@/lib/prisma';

/** GET /api/merit — 功德概览 + 最近参拜 + 规则说明 */
export async function GET() {
  try {
    const auth = await getAuthUser();
    if (!auth) {
      return NextResponse.json({ summary: null, recentCheckins: [], rules: MERIT_RULES });
    }

    const [summary, recentCheckins] = await Promise.all([
      getMeritSummary(auth.userId),
      prisma.templeCheckin.findMany({
        where: { userId: auth.userId },
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true,
          deityCode: true,
          deityName: true,
          worshipStage: true,
          meritEarned: true,
          checkinDate: true,
          createdAt: true,
        },
      }),
    ]);

    return NextResponse.json({ summary, recentCheckins, rules: MERIT_RULES });
  } catch (err) {
    console.error('[api/merit]', err);
    return NextResponse.json({ error: '加载功德失败' }, { status: 500 });
  }
}
