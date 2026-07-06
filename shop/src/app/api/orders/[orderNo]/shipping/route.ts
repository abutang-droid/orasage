import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAuthUser } from '@/lib/auth';
import { getOrderByNo, updateOrderShipping } from '@/lib/orders';
import { resolveOrderFulfillment } from '@/lib/order-fulfillment';
import {
  formatShippingAddress,
  validateShippingPayload,
  type ShippingPayload,
} from '../../../../../../../shared/shop-fulfillment/index';
import { proxyAuthMe } from '@/lib/auth-proxy';

const shippingSchema = z.object({
  recipients: z.array(z.object({
    name: z.string().max(100),
    phone: z.string().max(40),
    countryCode: z.string().length(2).optional(),
    province: z.string().max(100).optional(),
    city: z.string().max(100).optional(),
    district: z.string().max(100).optional(),
    address: z.string().max(500),
    postalCode: z.string().max(20).optional(),
    wristCm: z.string().max(20).optional(),
  })).min(1).max(2),
  saveToAddressBook: z.boolean().optional(),
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

    const fulfillment = await resolveOrderFulfillment(order);
    if (!fulfillment.requiresShipping) {
      return NextResponse.json({ error: '该订单无需收货信息' }, { status: 400 });
    }

    const parsed = shippingSchema.parse(await req.json());
    const payload: ShippingPayload = {
      recipients: parsed.recipients.map((r) => ({
        ...r,
        countryCode: (r.countryCode ?? 'CN').toUpperCase(),
      })),
    };
    const validationError = validateShippingPayload(payload, {
      requireWrist: fulfillment.requiresWristSize,
      recipientCount: couple ? 2 : 1,
    });
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const shippingAddress = formatShippingAddress({
      recipients: couple ? payload.recipients.slice(0, 2) : [payload.recipients[0]],
    });
    await updateOrderShipping(orderNo, shippingAddress);

    if (parsed.saveToAddressBook) {
      for (const recipient of couple ? payload.recipients.slice(0, 2) : [payload.recipients[0]]) {
        await proxyAuthMe('/addresses', {
          method: 'POST',
          body: JSON.stringify({
            name: recipient.name,
            phone: recipient.phone,
            countryCode: recipient.countryCode ?? 'CN',
            province: recipient.province ?? null,
            city: recipient.city ?? null,
            district: recipient.district ?? null,
            addressLine: recipient.address,
            postalCode: recipient.postalCode ?? null,
            wristCm: recipient.wristCm ?? null,
          }),
        });
      }
    }

    return NextResponse.json({ success: true, orderNo, shippingAddress });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: '参数错误', details: err.errors }, { status: 400 });
    }
    console.error('[orders shipping]', err);
    return NextResponse.json({ error: err instanceof Error ? err.message : '保存失败' }, { status: 500 });
  }
}
