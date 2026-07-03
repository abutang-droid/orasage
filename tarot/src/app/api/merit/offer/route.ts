import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAuthUser } from '@/lib/auth';
import { isMeritAwarded, recordOfferMerit } from '@/lib/merit-service';

const bodySchema = z.object({
  kind: z.enum(['paid_reading', 'crystal_purchase', 'crystal_gift']),
  orderNo: z.string().max(64).optional(),
  amountCents: z.number().int().nonnegative().optional(),
});

/** POST /api/merit/offer — 供养功德（付费占卜/水晶等） */
export async function POST(req: NextRequest) {
  const auth = await getAuthUser();
  if (!auth) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }

  try {
    const body = bodySchema.parse(await req.json());
    const result = await recordOfferMerit(auth.userId, body.kind, {
      orderNo: body.orderNo,
      amountCents: body.amountCents,
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.reason, awarded: 0 }, { status: 400 });
    }
    if (!isMeritAwarded(result)) {
      return NextResponse.json({ awarded: 0, duplicate: true });
    }

    return NextResponse.json({
      awarded: result.awarded,
      levelUp: result.levelUp,
      newTotal: result.newTotal,
    });
  } catch (err) {
    console.error('[api/merit/offer]', err);
    return NextResponse.json({ error: '供养功德记录失败' }, { status: 500 });
  }
}
