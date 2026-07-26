import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { getOrderByNo } from '@/lib/orders';
import { woldPerUsdt, resolveWoldCents } from '../../../../../../shared/shop-locale/index';
import { paymentsUseWorld } from '@/lib/payment-mode';

/**
 * Build a MiniKit.pay intent for a pending order (WLD via World wallet).
 * GET /api/world/pay-intent?order=
 */
export async function GET(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: '请先登录' }, { status: 401 });
  }

  if (!paymentsUseWorld() && process.env.WORLD_PAY_ENABLED !== 'true') {
    return NextResponse.json({ error: 'World pay is not enabled' }, { status: 503 });
  }

  const to = (process.env.WORLD_PAYMENT_TO_ADDRESS || '').trim();
  if (!/^0x[a-fA-F0-9]{40}$/.test(to)) {
    return NextResponse.json(
      { error: 'WORLD_PAYMENT_TO_ADDRESS is not configured' },
      { status: 503 },
    );
  }

  const orderNo = req.nextUrl.searchParams.get('order')?.trim();
  if (!orderNo) {
    return NextResponse.json({ error: '缺少订单号' }, { status: 400 });
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

  // List price is USDT cents; convert to WLD using site FX (defaults 1:1).
  const usdtCents =
    order.currency === 'WOLD'
      ? Math.max(1, Math.round(order.amountCents / woldPerUsdt()))
      : order.amountCents;
  const woldCents = resolveWoldCents(usdtCents);
  const wldAmount = Math.max(0.01, Number((woldCents / 100).toFixed(2)));

  const successUrl = req.nextUrl.searchParams.get('successUrl');

  return NextResponse.json({
    reference: order.orderNo,
    orderNo: order.orderNo,
    to,
    wldAmount,
    description: order.title || `Order ${order.orderNo}`,
    successUrl: successUrl || null,
    amountCents: order.amountCents,
    currency: order.currency,
  });
}
