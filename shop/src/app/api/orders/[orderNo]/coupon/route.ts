import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { applyOrderCoupon, getOrderByNo, removeOrderCoupon } from '@/lib/orders';

type RouteContext = { params: Promise<{ orderNo: string }> };

async function assertOrderAccess(orderNo: string, userId: number) {
  const order = await getOrderByNo(orderNo);
  if (!order) return { error: NextResponse.json({ error: '订单不存在' }, { status: 404 }) };
  if (order.userId !== userId) {
    return { error: NextResponse.json({ error: '无权操作该订单' }, { status: 403 }) };
  }
  return { order };
}

export async function POST(req: NextRequest, context: RouteContext) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: '请先登录' }, { status: 401 });

  const { orderNo } = await context.params;
  try {
    const access = await assertOrderAccess(orderNo, user.id);
    if (access.error) return access.error;

    const body = await req.json().catch(() => ({})) as { code?: string };
    const code = String(body.code ?? '').trim();
    if (!code) return NextResponse.json({ error: '请输入优惠码' }, { status: 400 });

    const result = await applyOrderCoupon(orderNo, code);
    return NextResponse.json(result);
  } catch (err) {
    console.error('[orders coupon POST]', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : '应用优惠码失败' },
      { status: 400 },
    );
  }
}

export async function DELETE(_req: NextRequest, context: RouteContext) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: '请先登录' }, { status: 401 });

  const { orderNo } = await context.params;
  try {
    const access = await assertOrderAccess(orderNo, user.id);
    if (access.error) return access.error;

    const result = await removeOrderCoupon(orderNo);
    return NextResponse.json(result);
  } catch (err) {
    console.error('[orders coupon DELETE]', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : '移除优惠码失败' },
      { status: 400 },
    );
  }
}
