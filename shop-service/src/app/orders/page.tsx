import Link from 'next/link';
import { eq } from 'drizzle-orm';
import { getAuthUser } from '@/lib/auth';
import { listUserOrders } from '@/lib/orders';
import { db } from '@/lib/db';
import { orderItems } from '@/lib/schema';
import { loginUrl } from '@/lib/auth';

export const dynamic = 'force-dynamic';

function formatPrice(cents: number, currency: string) {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}

export default async function OrdersPage() {
  const user = await getAuthUser();
  if (!user) {
    return (
      <div className="container empty">
        <p>请先登录查看订单</p>
        <Link href={loginUrl()} className="btn btn-primary" style={{ marginTop: '1rem' }}>
          去登录
        </Link>
      </div>
    );
  }

  const userOrders = await listUserOrders(Number(user.sub));

  return (
    <div className="container">
      <h1 className="page-title">我的订单</h1>
      {userOrders.length === 0 ? (
        <p className="empty">
          暂无订单 · <Link href="/products">去逛逛</Link>
        </p>
      ) : (
        <div className="order-list">
          {await Promise.all(
            userOrders.map(async (order) => {
              const items = await db
                .select()
                .from(orderItems)
                .where(eq(orderItems.orderId, order.id));
              return (
                <article key={order.id} className="order-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <strong>{order.orderNumber}</strong>
                    <span className={`status ${order.status}`}>{order.status}</span>
                  </div>
                  <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '0.75rem' }}>
                    {new Date(order.createdAt).toLocaleString('zh-CN')} ·{' '}
                    {formatPrice(order.totalCents, order.currency)} · 来源 {order.sourceApp}
                  </p>
                  <ul style={{ listStyle: 'none', color: 'var(--muted)', fontSize: '0.9rem' }}>
                    {items.map((item) => {
                      const snap = item.productSnapshot as { name?: string };
                      return (
                        <li key={item.id}>
                          {snap.name ?? '商品'} × {item.quantity}
                        </li>
                      );
                    })}
                  </ul>
                </article>
              );
            }),
          )}
        </div>
      )}
    </div>
  );
}
