import Link from 'next/link';
import { eq } from 'drizzle-orm';
import { getOrderByNumber } from '@/lib/orders';
import { db } from '@/lib/db';
import { orderItems } from '@/lib/schema';

export const dynamic = 'force-dynamic';

function formatPrice(cents: number, currency: string) {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string; mock?: string }>;
}) {
  const { order: orderNumber, mock } = await searchParams;

  if (!orderNumber) {
    return (
      <div className="container empty">
        <p>未找到订单信息</p>
        <Link href="/products">返回商品列表</Link>
      </div>
    );
  }

  const order = await getOrderByNumber(orderNumber);
  const items = order
    ? await db.select().from(orderItems).where(eq(orderItems.orderId, order.id))
    : [];

  return (
    <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
      <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
      <h1 style={{ marginBottom: '0.5rem' }}>
        {mock ? '模拟支付成功' : '支付成功'}
      </h1>
      {order ? (
        <>
          <p style={{ color: 'var(--muted)', marginBottom: '1.5rem' }}>
            订单号：<strong>{order.orderNumber}</strong>
            <br />
            金额：{formatPrice(order.totalCents, order.currency)}
          </p>
          {items.length > 0 && (
            <ul style={{ listStyle: 'none', marginBottom: '2rem', color: 'var(--muted)' }}>
              {items.map((item) => {
                const snap = item.productSnapshot as { name?: string };
                return (
                  <li key={item.id}>
                    {snap.name ?? '商品'} × {item.quantity}
                  </li>
                );
              })}
            </ul>
          )}
        </>
      ) : (
        <p style={{ color: 'var(--muted)', marginBottom: '2rem' }}>订单处理中，请稍后查看「我的订单」</p>
      )}
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        <Link href="/orders" className="btn btn-primary">
          查看订单
        </Link>
        <Link href="/products" className="btn" style={{ background: 'var(--surface)', color: 'var(--text)' }}>
          继续购物
        </Link>
      </div>
    </div>
  );
}
