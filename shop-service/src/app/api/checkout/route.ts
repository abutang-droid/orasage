import { z } from 'zod';
import { getAuthUser, requireAuth } from '@/lib/auth';
import { createCheckoutSession } from '@/lib/orders';
import { jsonOk, readJson, parseBody, handleRouteError } from '@/lib/api';
import type { NextRequest } from 'next/server';

const checkoutSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.number().int().positive(),
        quantity: z.number().int().positive().optional(),
      }),
    )
    .min(1),
  sourceApp: z.enum(['shop', 'bazi', 'ziwei', 'tarot', 'admin']).optional(),
  recommendationContext: z.record(z.unknown()).optional(),
  successUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional(),
  customerEmail: z.string().email().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const user = requireAuth(await getAuthUser(req));
    const body = parseBody(checkoutSchema, await readJson(req));

    const result = await createCheckoutSession({
      userId: Number(user.sub),
      items: body.items,
      sourceApp: body.sourceApp ?? 'shop',
      recommendationContext: body.recommendationContext,
      successUrl: body.successUrl,
      cancelUrl: body.cancelUrl,
      customerEmail: body.customerEmail,
    });

    return jsonOk({
      orderNumber: result.order.orderNumber,
      checkoutUrl: result.checkoutUrl,
      mode: result.mode,
      sessionId: 'sessionId' in result ? result.sessionId : undefined,
    });
  } catch (e) {
    return handleRouteError(e);
  }
}
