import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { updateOrderStatus } from '@/lib/orders';

/** 演示支付 — 无 Stripe 密钥时完成订单（需登录） */
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
    await updateOrderStatus(orderNo, 'paid');
    return NextResponse.json({ success: true, orderNo, status: 'paid' });
  } catch (err) {
    console.error('[pay]', err);
    return NextResponse.json({ error: err instanceof Error ? err.message : '支付失败' }, { status: 500 });
  }
}
