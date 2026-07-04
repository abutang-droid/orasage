import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAuthUser } from '@/lib/auth';
import { getOrderByNo, updateOrderShipping } from '@/lib/orders';
import { getProduct } from '@/lib/products';
import {
  formatShippingAddress,
  inferRequiresShipping,
  inferRequiresWristSize,
  validateShippingPayload,
  type ShippingPayload,
} from '../../../../../../../shared/shop-fulfillment/index';

const shippingSchema = z.object({
  recipients: z.array(z.object({
    name: z.string().max(100),
    phone: z.string().max(40),
    address: z.string().max(500),
    wristCm: z.string().max(20).optional(),
  })).min(1).max(2),
});

type RouteContext = { params: Promise<{ orderNo: string }> };

/** 保存订单收货信息（结账 Step 1） */
export async function POST(req: NextRequest, context: RouteContext) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: '请先登录' }, { status: 401 });
  }

  const { orderNo } = await context.params;
  const couple = req.nextUrl.searchParams.get('shipping') === 'couple';

  try {
    const order = await getOrderByNo(orderNo);
    if (!order) {
      return NextResponse.json({ error: '订单不存在' }, { status: 404 });
    }
    if (order.userId !== user.id) {
      return NextResponse.json({ error: '无权操作该订单' }, { status: 403 });
    }
    if (order.status !== 'pending') {
      return NextResponse.json({ error: '订单状态不允许修改收货信息' }, { status: 409 });
    }

    const product = order.sku ? await getProduct(order.sku) : null;
    const requiresShipping = product
      ? (product.requiresShipping ?? inferRequiresShipping(product))
      : false;
    if (!requiresShipping) {
      return NextResponse.json({ error: '该订单无需收货信息' }, { status: 400 });
    }

    const body = shippingSchema.parse(await req.json()) as ShippingPayload;
    const requireWrist = product
      ? (product.requiresWristSize ?? inferRequiresWristSize(product))
      : false;
    const validationError = validateShippingPayload(body, {
      requireWrist,
      recipientCount: couple ? 2 : 1,
    });
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const shippingAddress = formatShippingAddress({
      recipients: couple ? body.recipients.slice(0, 2) : [body.recipients[0]],
    });
    await updateOrderShipping(orderNo, shippingAddress);

    return NextResponse.json({ success: true, orderNo, shippingAddress });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: '参数错误', details: err.errors }, { status: 400 });
    }
    console.error('[orders shipping]', err);
    return NextResponse.json({ error: err instanceof Error ? err.message : '保存失败' }, { status: 500 });
  }
}
