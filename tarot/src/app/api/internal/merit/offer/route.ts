import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { recordOfferMerit } from '@/lib/merit-service';

const bodySchema = z.object({
  tarotUserId: z.string().min(1).max(80),
  kind: z.enum(['paid_reading', 'crystal_purchase', 'crystal_gift']),
  orderNo: z.string().min(1).max(64),
  amountCents: z.number().int().nonnegative().optional(),
});

const INTERNAL_SECRET = process.env.TAROT_INTERNAL_SECRET || process.env.JWT_SECRET || '';

/** POST /api/internal/merit/offer — shop 支付成功后回调 */
export async function POST(req: NextRequest) {
  const key = req.headers.get('x-tarot-internal-key');
  if (!INTERNAL_SECRET || key !== INTERNAL_SECRET) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  try {
    const body = bodySchema.parse(await req.json());
    const result = await recordOfferMerit(body.tarotUserId, body.kind, {
      orderNo: body.orderNo,
      amountCents: body.amountCents,
    });
    if (!result.ok) {
      return NextResponse.json({ error: result.reason }, { status: 400 });
    }
    return NextResponse.json(result);
  } catch (err) {
    console.error('[api/internal/merit/offer]', err);
    return NextResponse.json({ error: 'failed' }, { status: 500 });
  }
}
