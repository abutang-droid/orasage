import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getMeritLevel } from '@/lib/merit';

/** GET /api/merit/leaderboard — 持光者及以上功德榜（公开） */
export async function GET(req: NextRequest) {
  const limit = Math.min(50, Math.max(1, parseInt(req.nextUrl.searchParams.get('limit') || '20', 10) || 20));

  try {
    const users = await prisma.user.findMany({
      where: { meritTotal: { gt: 0 } },
      orderBy: { meritTotal: 'desc' },
      take: limit * 3,
      select: {
        id: true,
        nickname: true,
        meritTotal: true,
        meritLevel: true,
        faith: true,
      },
    });

    const entries = users
      .map((u) => {
        const levelInfo = getMeritLevel(u.meritTotal);
        return {
          nickname: maskNickname(u.nickname),
          meritTotal: u.meritTotal,
          level: levelInfo.level,
          levelTitleZh: levelInfo.titleZh,
          levelTitleEn: levelInfo.titleEn,
          faith: u.faith,
        };
      })
      .filter((e) => e.level >= 2)
      .slice(0, limit)
      .map((entry, index) => ({ rank: index + 1, ...entry }));

    return NextResponse.json({ entries, updatedAt: new Date().toISOString() });
  } catch (err) {
    console.error('[api/merit/leaderboard]', err);
    return NextResponse.json({ error: '加载排行榜失败' }, { status: 500 });
  }
}

function maskNickname(nickname: string): string {
  const trimmed = nickname.trim();
  if (!trimmed || trimmed === '旅人') return '匿名信徒';
  if (trimmed.length <= 1) return `${trimmed}*`;
  return `${trimmed[0]}${'*'.repeat(Math.min(trimmed.length - 1, 3))}`;
}
