import { NextRequest, NextResponse } from 'next/server';
import {
  getDailyInsightStats,
  incrementDailyInsightParticipation,
} from '@/lib/daily-fortune/participant-counter';

export async function GET() {
  const stats = await getDailyInsightStats();
  return NextResponse.json(stats);
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const increment = body?.increment !== false;
  const stats = increment
    ? await incrementDailyInsightParticipation()
    : await getDailyInsightStats();
  return NextResponse.json(stats);
}
