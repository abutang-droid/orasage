import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAuthUser } from '@/lib/auth';
import { getOrderByNo } from '@/lib/orders';
import { ENV } from '@/lib/env';
import { dispatchReportJob } from '@/lib/reportJob';
import { notifyTarotOfferMerit } from '@/lib/tarot-merit';
import {
  fetchWorldMiniKitTransaction,
  resolveDevPortalApiKey,
} from '../../../../../../shared/world-minikit/get-transaction';

const bodySchema = z.object({
  orderNo: z.string().min(1),
  payload: z.object({
    transactionId: z.string().min(1),
    reference: z.string().min(1),
    from: z.string().optional(),
    chain: z.string().optional(),
    timestamp: z.string().optional(),
  }),
});

/**
 * Verify MiniKit payment via Developer Portal Get Transaction, then mark order paid.
 * Docs: GET https://developer.world.org/api/v2/minikit/transaction/{transaction_id}
 * POST /api/world/confirm
 */
export async function POST(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: '请先登录' }, { status: 401 });
  }

  try {
    const body = bodySchema.parse(await req.json());
    if (body.payload.reference !== body.orderNo) {
      return NextResponse.json({ error: 'reference mismatch' }, { status: 400 });
    }

    const order = await getOrderByNo(body.orderNo);
    if (!order) {
      return NextResponse.json({ error: '订单不存在' }, { status: 404 });
    }
    if (order.userId !== user.id) {
      return NextResponse.json({ error: '无权操作该订单' }, { status: 403 });
    }

    if (order.status === 'paid' || order.status === 'completed') {
      return NextResponse.json({
        ok: true,
        orderNo: order.orderNo,
        status: order.status,
        transactionId: body.payload.transactionId,
        alreadyPaid: true,
      });
    }
    if (order.status !== 'pending') {
      return NextResponse.json({ error: '订单状态不允许支付' }, { status: 409 });
    }

    const appId = (process.env.WORLD_APP_ID || process.env.NEXT_PUBLIC_WORLD_APP_ID || '').trim();
    const apiKey = resolveDevPortalApiKey();
    const merchantTo = (
      process.env.WORLD_PAYMENT_TO_ADDRESS ||
      process.env.NEXT_PUBLIC_WORLD_PAYMENT_TO_ADDRESS ||
      ''
    )
      .trim()
      .toLowerCase();

    if (!appId) {
      return NextResponse.json({ error: 'WORLD_APP_ID missing' }, { status: 503 });
    }

    // Get Transaction accepts app_id query; Bearer API key is optional (OpenAPI security: []).
    // Never send an RP signing key (0x + 64 hex) as Bearer.
    const verified = await fetchWorldMiniKitTransaction({
      transactionId: body.payload.transactionId,
      appId,
      apiKey: apiKey || undefined,
      type: 'payment',
      maxAttempts: 5,
      delayMs: 1600,
    });

    if (!verified.ok) {
      console.error('[world/confirm] Get Transaction failed', verified.status, verified.body);
      return NextResponse.json(
        { error: 'World payment verification failed', detail: verified.body },
        { status: 502 },
      );
    }

    const tx = verified.tx;
    const status = String(tx.transaction_status || '').toLowerCase();
    const refOk =
      !tx.reference ||
      String(tx.reference) === body.orderNo ||
      String(tx.reference) === body.payload.reference;
    if (!refOk) {
      return NextResponse.json({ error: 'Payment reference mismatch' }, { status: 400 });
    }

    if (merchantTo && tx.to && String(tx.to).toLowerCase() !== merchantTo) {
      return NextResponse.json(
        { error: 'Payment recipient mismatch', expected: merchantTo, got: tx.to },
        { status: 400 },
      );
    }

    if (status === 'failed') {
      return NextResponse.json({ error: 'Payment not successful', status }, { status: 402 });
    }
    if (status && status !== 'mined' && status !== 'pending') {
      return NextResponse.json(
        { error: 'Unexpected payment status', status },
        { status: 402 },
      );
    }
    // pending: user confirmed in World wallet; accept after short poll.
    // mined: confirmed on-chain.

    const payRes = await fetch(
      `${ENV.authInternalUrl}/internal/orders/${encodeURIComponent(body.orderNo)}/pay`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          currency: 'WOLD',
          // auth internal pay schema: mock | stripe | wallet
          provider: 'mock',
        }),
      },
    );
    const payData = await payRes.json().catch(() => ({}));
    if (!payRes.ok) {
      return NextResponse.json(
        { error: payData.error || 'Failed to mark order paid' },
        { status: payRes.status },
      );
    }

    const paidOrder = await getOrderByNo(body.orderNo);
    if (paidOrder) {
      try {
        await dispatchReportJob(paidOrder);
      } catch (err) {
        console.error('[world/confirm] report job', err);
      }
      if (paidOrder.appSource === 'tarot') {
        try {
          await notifyTarotOfferMerit({
            recommendationContext: paidOrder.recommendationContext,
            orderNo: body.orderNo,
            amountCents: paidOrder.amountCents,
            sku: paidOrder.sku,
          });
        } catch (err) {
          console.error('[world/confirm] tarot merit', err);
        }
      }
    }

    return NextResponse.json({
      ok: true,
      orderNo: body.orderNo,
      status: 'paid',
      transactionId: body.payload.transactionId,
      transactionHash: tx.transaction_hash || null,
      transactionStatus: tx.transaction_status || status || null,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: '参数错误', details: err.errors }, { status: 400 });
    }
    console.error('[world/confirm]', err);
    return NextResponse.json({ error: '确认支付失败' }, { status: 500 });
  }
}
