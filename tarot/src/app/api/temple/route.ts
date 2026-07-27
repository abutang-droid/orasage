import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAuthUser } from '@/lib/auth';
import { getMeritSummary, recordWorship } from '@/lib/merit-service';
import { resolveAiLocaleFromRequest } from '../../../../../shared/ai-locale/index';

const worshipSchema = z.object({
  deityCode: z.string().min(1).max(50),
  deityName: z.string().min(1).max(80),
  faithCode: z.string().max(80).optional().nullable(),
  worshipStage: z.number().int().min(1).max(3),
  durationSec: z.number().min(0).max(600),
  markOnboardingComplete: z.boolean().optional(),
});

/** GET /api/temple — today's check-in status */
export async function GET() {
  const auth = await getAuthUser();
  if (!auth) {
    return NextResponse.json({ prayedToday: false, summary: null });
  }

  const summary = await getMeritSummary(auth.userId);
  return NextResponse.json({
    prayedToday: summary?.prayedToday ?? false,
    summary,
  });
}

/** POST /api/temple — record daily worship (once per UTC day) */
export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthUser();
    if (!auth) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    const raw = await req.json();
    const body = worshipSchema.parse(raw);
    const language = resolveAiLocaleFromRequest(req, raw);
    const result = await recordWorship({
      userId: auth.userId,
      deityCode: body.deityCode,
      deityName: body.deityName,
      faithCode: body.faithCode,
      worshipStage: body.worshipStage,
      durationSec: body.durationSec,
      markOnboardingComplete: body.markOnboardingComplete,
      language,
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.reason }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error('[api/temple]', err);
    return NextResponse.json({ error: '参拜记录失败' }, { status: 500 });
  }
}