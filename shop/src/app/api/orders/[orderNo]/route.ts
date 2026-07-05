import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { getOrderByNo } from '@/lib/orders';
import { getProduct } from '@/lib/products';
import { inferRequiresShipping, inferRequiresWristSize } from '../../../../../../shared/shop-fulfillment/index';

type RouteContext = { params: Promise<{ orderNo: string }> };

/** 结账页加载订单与商品履约信息 */
export async function GET(_req: NextRequest, context: RouteContext) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: '请先登录' }, { status: 401 });
  }

  const { orderNo } = await context.params;
  try {
    const order = await getOrderByNo(orderNo);
    if (!order) {
      return NextResponse.json({ error: '订单不存在' }, { status: 404 });
    }
    if (order.userId !== user.id) {
      return NextResponse.json({ error: '无权查看该订单' }, { status: 403 });
    }

    const product = order.sku ? await getProduct(order.sku) : null;
    const fulfillment = product
      ? {
          requiresShipping: product.requiresShipping ?? inferRequiresShipping(product),
          requiresWristSize: product.requiresWristSize ?? inferRequiresWristSize(product),
        }
      : { requiresShipping: false, requiresWristSize: false };

    return NextResponse.json({
      order: {
        orderNo: order.orderNo,
        title: order.title,
        sku: order.sku,
        amountCents: order.amountCents,
        currency: order.currency,
        status: order.status,
        shippingAddress: order.shippingAddress,
        appSource: order.appSource,
      },
      fulfillment,
    });
  } catch (err) {
    console.error('[orders GET]', err);
    return NextResponse.json({ error: err instanceof Error ? err.message : '加载失败' }, { status: 500 });
  }
}
