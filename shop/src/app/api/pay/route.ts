import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { getOrderByNo, updateOrderStatus } from '@/lib/orders';
import { dispatchReportJob } from '@/lib/reportJob';

/** 模拟支付 — PAYMENT_MODE=mock 时完成订单（需登录，且订单必须属于当前用户） */
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

    await updateOrderStatus(orderNo, 'paid');
    try {
      await dispatchReportJob(order);
    } catch (err) {
      console.error('[pay] report-job error:', err);
    }
    return NextResponse.json({ success: true, orderNo, status: 'paid' });
  } catch (err) {
    console.error('[pay]', err);
    return NextResponse.json({ error: err instanceof Error ? err.message : '支付失败' }, { status: 500 });
  }
}
