import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAuthUser } from '@/lib/auth';
import { getOrderByNo } from '@/lib/orders';
import { dispatchReportJob } from '@/lib/reportJob';
import { notifyTarotOfferMerit } from '@/lib/tarot-merit';
import { parseShippingAddress } from '../../../../../shared/shop-fulfillment/index';
import { orderNeedsShippingBeforePay } from '@/lib/order-fulfillment';
import { ENV } from '@/lib/env';
import { paymentsUseStripe } from '@/lib/payment-mode';
import { normalizePayCurrency } from '@/lib/currency';
import { resolvePayProvider } from '../../../../../shared/payments/pay-currency';

const bodySchema = z.object({
  currency: z.string().min(3).max(8),
  provider: z.enum(['mock', 'stripe', 'wallet']).optional(),
});

/**
 * 支付入口：选择 USDT / WOLD 后路由到对应支付通道。
 * - mock（默认）：auth internal /pay 标记已付
 * - wallet：扣对应币种钱包
 * - stripe：仅 USDT（数字商品已在建单时走 Stripe Session；此处返回提示）
 */
export async function POST(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: '请先登录' }, { status: 401 });
  }

  const orderNo = req.nextUrl.searchParams.get('order');
  if (!orderNo) {
    return NextResponse.json({ error: '缺少订单号' }, { status: 400 });
  }

  try {
    const raw = await req.json().catch(() => ({}));
    const body = bodySchema.parse(raw);
    const payCurrency = normalizePayCurrency(body.currency);
    if (!payCurrency) {
      return NextResponse.json({ error: '请选择 USDT 或 WOLD 支付' }, { status: 400 });
    }

    const order = await getOrderByNo(orderNo);
    if (!order) {
      return NextResponse.json({ error: '订单不存在' }, { status: 404 });
    }
    if (order.userId !== user.id) {
      return NextResponse.json({ error: '无权操作该订单' }, { status: 403 });
    }
    if (order.status !== 'pending') {
      return NextResponse.json({ error: '订单状态不允许支付' }, { status: 409 });
    }

    const needsShipping = await orderNeedsShippingBeforePay(order);
    if (needsShipping && !parseShippingAddress(order.shippingAddress)) {
      return NextResponse.json({ error: '请先填写收货信息' }, { status: 400 });
    }

    const preferred = body.provider
      ?? (paymentsUseStripe() && payCurrency === 'USDT' ? undefined : 'mock');
    const provider = resolvePayProvider({
      payCurrency,
      preferred: preferred === 'stripe' ? 'stripe' : preferred,
    });

    // Stripe 实体单仍走 mock/wallet；数字商品建单时已给 checkoutUrl
    const payProvider = provider === 'stripe' ? 'mock' : provider;

    const res = await fetch(
      `${ENV.authInternalUrl}/internal/orders/${encodeURIComponent(orderNo)}/pay`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          currency: payCurrency,
          provider: payProvider,
        }),
      },
    );
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return NextResponse.json(
        { error: (data as { error?: string }).error || '支付失败' },
        { status: res.status },
      );
    }

    const paidOrder = await getOrderByNo(orderNo);
    if (paidOrder) {
      void dispatchReportJob(paidOrder).catch((err) => {
        console.error('[pay] report-job error:', err);
      });
      if (paidOrder.appSource === 'tarot') {
        await notifyTarotOfferMerit({
          recommendationContext: paidOrder.recommendationContext,
          orderNo,
          amountCents: paidOrder.amountCents,
          sku: paidOrder.sku,
        });
      }
    }

    return NextResponse.json({
      success: true,
      orderNo,
      status: 'paid',
      currency: payCurrency,
      amountCents: (data as { amountCents?: number }).amountCents,
      provider: payProvider,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: '参数错误', details: err.errors }, { status: 400 });
    }
    console.error('[pay]', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : '支付失败' },
      { status: 500 },
    );
  }
}
