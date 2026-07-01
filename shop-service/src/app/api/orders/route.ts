import { eq } from 'drizzle-orm';
import { getAuthUser, requireAuth } from '@/lib/auth';
import { listUserOrders } from '@/lib/orders';
import { db } from '@/lib/db';
import { orderItems } from '@/lib/schema';
import { jsonOk, handleRouteError } from '@/lib/api';
import type { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const user = requireAuth(await getAuthUser(req));
    const userId = Number(user.sub);
    const userOrders = await listUserOrders(userId);

    const ordersWithItems = await Promise.all(
      userOrders.map(async (order) => {
        const items = await db
          .select()
          .from(orderItems)
          .where(eq(orderItems.orderId, order.id));
        return { ...order, items };
      }),
    );

    return jsonOk({ orders: ordersWithItems });
  } catch (e) {
    return handleRouteError(e);
  }
}
