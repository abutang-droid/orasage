import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAuthUser } from '@/lib/auth';
import { getOrderByNo } from '@/lib/orders';
import { ENV } from '@/lib/env';
import { dispatchReportJob } from '@/lib/reportJob';
import { notifyTarotOfferMerit } from '@/lib/tarot-merit';

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
 * Verify MiniKit payment via World Developer API, then mark order paid.
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
    const apiKeyRaw = (process.env.DEV_PORTAL_API_KEY || process.env.WORLD_DEV_PORTAL_API_KEY || '').trim();
    // RP signing keys are 32-byte hex; Dev Portal API keys are not. Don't Bearer-auth with a private key.
    const apiKey = /^0x?[0-9a-fA-F]{64}$/.test(apiKeyRaw) ? '' : apiKeyRaw;

    if (appId && apiKey) {
      const verifyUrl =
        `https://developer.worldcoin.org/api/v2/minikit/transaction/${encodeURIComponent(body.payload.transactionId)}` +
        `?app_id=${encodeURIComponent(appId)}&type=payment`;
      const verifyRes = await fetch(verifyUrl, {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      const tx = await verifyRes.json().catch(() => ({}));
      if (!verifyRes.ok) {
        console.error('[world/confirm] verify failed', verifyRes.status, tx);
        return NextResponse.json(
          { error: 'World payment verification failed', detail: tx },
          { status: 502 },
        );
      }
      const status = String(tx.status || tx.transaction_status || '').toLowerCase();
      const refOk =
        !tx.reference ||
        String(tx.reference) === body.orderNo ||
        String(tx.reference) === body.payload.reference;
      if (!refOk) {
        return NextResponse.json({ error: 'Payment reference mismatch' }, { status: 400 });
      }
      // Accept mined / confirmed / success; reject failed explicitly.
      if (status.includes('fail') || status === 'failed' || status === 'error') {
        return NextResponse.json({ error: 'Payment not successful', status }, { status: 402 });
      }
    } else {
      console.warn(
        '[world/confirm] Valid DEV_PORTAL_API_KEY missing — trusting MiniKit payload (set a non-hex API key for cloud verify)',
      );
    }

    const payRes = await fetch(
      `${ENV.authInternalUrl}/internal/orders/${encodeURIComponent(body.orderNo)}/pay`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          currency: 'WOLD',
          provider: 'mock',
          worldTransactionId: body.payload.transactionId,
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
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: '参数错误', details: err.errors }, { status: 400 });
    }
    console.error('[world/confirm]', err);
    return NextResponse.json({ error: '确认支付失败' }, { status: 500 });
  }
}
