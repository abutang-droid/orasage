import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAuthUser } from '@/lib/auth';
import {
  cartStartCheckoutSchema,
  createCartCheckoutOrder,
  createCheckoutOrder,
  startCheckoutSchema,
} from '@/lib/checkout-flow';

/** 已登录用户创建待支付订单（单 SKU 或购物车合并） */
export async function POST(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: '请先完成邮箱验证' }, { status: 401 });
  }

  try {
    const raw = await req.json();
    if (Array.isArray(raw.items) && raw.items.length > 0) {
      const body = cartStartCheckoutSchema.parse(raw);
      const result = await createCartCheckoutOrder(req, { ...body, userId: user.id });
      return NextResponse.json(result);
    }

    const body = startCheckoutSchema.parse(raw);
    const result = await createCheckoutOrder(req, { ...body, userId: user.id });
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: '参数错误', details: err.errors }, { status: 400 });
    }
    console.error('[checkout/start]', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : '创建订单失败' },
      { status: 500 },
    );
  }
}
