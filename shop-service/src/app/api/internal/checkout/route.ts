import { z } from 'zod';
import { createCheckoutSession } from '@/lib/orders';
import { isInternalRequest, internalOnlyResponse } from '@/lib/internal';
import { jsonOk, readJson, parseBody, handleRouteError } from '@/lib/api';
import type { NextRequest } from 'next/server';

const internalCheckoutSchema = z.object({
  userId: z.number().int().positive(),
  items: z
    .array(
      z.object({
        productId: z.number().int().positive(),
        quantity: z.number().int().positive().optional(),
      }),
    )
    .min(1),
  sourceApp: z.enum(['shop', 'bazi', 'ziwei', 'tarot', 'admin']),
  recommendationContext: z.record(z.unknown()).optional(),
  successUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional(),
  customerEmail: z.string().email().optional(),
});

/**
 * 内网结账 API — 供 bazi / ziwei / tarot 等 App 调用
 * POST http://127.0.0.1:3102/api/internal/checkout
 */
export async function POST(req: NextRequest) {
  if (!isInternalRequest(req)) {
    return internalOnlyResponse();
  }

  try {
    const body = parseBody(internalCheckoutSchema, await readJson(req));

    const result = await createCheckoutSession({
      userId: body.userId,
      items: body.items,
      sourceApp: body.sourceApp,
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
