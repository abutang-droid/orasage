'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  SHIPMENT_STATUS_LABELS,
  formatShippingDisplay,
  type OrderShipment,
} from '../../../../../shared/shop-fulfillment/index';

type OrderDetail = {
  orderNo: string;
  title: string;
  sku?: string | null;
  amountDisplay?: string;
  status: string;
  statusLabel?: string;
  shippingAddress?: string | null;
  createdAt?: string;
};

export default function OrderDetailPage() {
  const params = useParams();
  const orderNo = String(params.orderNo ?? '');
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [shipments, setShipments] = useState<OrderShipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderNo) return;
    let cancelled = false;
    void fetch(`/api/orders/${encodeURIComponent(orderNo)}`, { credentials: 'include' })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || '加载失败');
        return data;
      })
      .then((data) => {
        if (cancelled) return;
        setOrder(data.order);
        setShipments(data.shipments ?? []);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : '加载失败');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [orderNo]);

  if (loading) {
    return <main className="shop-page p-16 text-center text-sage-muted">加载中…</main>;
  }

  if (error || !order) {
    return (
      <main className="shop-page safe-bottom mx-auto max-w-md flex-1 py-16 text-center">
        <p className="text-sm text-red-600">{error ?? '订单不存在'}</p>
        <Link href="/" className="shop-btn-secondary mt-6 inline-block">返回商城</Link>
      </main>
    );
  }

  return (
    <main className="shop-page safe-bottom mx-auto w-full max-w-md flex-1 py-8 px-4">
      <h1 className="font-serif text-2xl text-sage-primary">订单详情</h1>
      <p className="mt-1 text-sm text-sage-muted">{order.orderNo}</p>

      <section className="mt-6 rounded-xl border border-sage-border bg-white p-4">
        <p className="font-medium text-sage-primary">{order.title}</p>
        {order.amountDisplay ? (
          <p className="mt-2 text-lg font-semibold text-sage-primary">{order.amountDisplay}</p>
        ) : null}
        <p className="mt-2 text-sm text-sage-muted">
          状态：{order.statusLabel ?? order.status}
        </p>
        {order.shippingAddress ? (
          <p className="mt-3 text-xs text-sage-muted leading-relaxed">
            收货：{formatShippingDisplay(order.shippingAddress)}
          </p>
        ) : null}
      </section>

      <section className="mt-6">
        <h2 className="text-sm font-semibold text-sage-primary">物流跟踪</h2>
        {shipments.length === 0 ? (
          <p className="mt-3 text-sm text-sage-muted">商家尚未发货，请耐心等待。</p>
        ) : (
          <ul className="mt-3 space-y-4">
            {shipments.map((shipment) => (
              <li key={shipment.id} className="rounded-xl border border-sage-border bg-white p-4">
                <p className="text-sm font-medium text-sage-primary">
                  {shipment.carrier} · {shipment.trackingNo}
                </p>
                <p className="mt-1 text-xs text-sage-muted">
                  {SHIPMENT_STATUS_LABELS[shipment.status] ?? shipment.status}
                </p>
                {shipment.events.length > 0 ? (
                  <ol className="mt-4 space-y-3 border-l border-sage-border pl-4">
                    {[...shipment.events].reverse().map((event, idx) => (
                      <li key={`${event.occurredAt}-${idx}`} className="relative">
                        <span className="absolute -left-[1.3rem] top-1.5 h-2 w-2 rounded-full bg-sage-primary" />
                        <p className="text-sm text-sage-primary">{event.description}</p>
                        {event.location ? (
                          <p className="text-xs text-sage-muted">{event.location}</p>
                        ) : null}
                        <p className="text-xs text-sage-muted">
                          {new Date(event.occurredAt).toLocaleString('zh-CN')}
                        </p>
                      </li>
                    ))}
                  </ol>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="mt-8 flex flex-col gap-3">
        <Link href="/" className="shop-btn-secondary w-full text-center">继续购物</Link>
        <a href="https://auth.orasage.com/center" className="shop-btn-primary w-full text-center">
          用户中心
        </a>
      </div>
    </main>
  );
}
