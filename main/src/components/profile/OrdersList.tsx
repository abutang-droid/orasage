'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { fetchOrders, type UserOrder } from '@/lib/auth';

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

const statusColors: Record<string, string> = {
  pending: 'text-yellow-400',
  paid: 'text-green-400',
  shipped: 'text-blue-400',
  completed: 'text-sage-gold',
  cancelled: 'text-sage-muted',
};

export function OrdersList() {
  const t = useTranslations('profile.orders');
  const [orders, setOrders] = useState<UserOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setOrders(await fetchOrders());
      } catch {
        setError(t('loadError'));
      } finally {
        setLoading(false);
      }
    })();
  }, [t]);

  if (loading) {
    return <p className="text-sm text-sage-muted">{t('loading')}</p>;
  }

  if (error) {
    return <p className="text-sm text-red-400">{error}</p>;
  }

  if (orders.length === 0) {
    return <p className="text-sm text-sage-muted">{t('empty')}</p>;
  }

  return (
    <ul className="space-y-3">
      {orders.map((o) => (
        <li
          key={o.id}
          className="rounded-2xl border border-sage-border/60 bg-sage-card/30 p-4"
        >
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="font-medium text-white">{o.title}</p>
              <p className="mt-1 text-xs text-sage-muted">
                {o.orderNo}
                {o.appLabel ? ` · ${o.appLabel}` : ''}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sage-gold">{o.amountDisplay}</p>
              <p className={`text-xs ${statusColors[o.status] ?? 'text-sage-muted'}`}>
                {o.statusLabel}
              </p>
            </div>
          </div>
          {o.shippingAddress && (
            <p className="mt-2 text-xs text-sage-muted">
              {t('shipping')}: {o.shippingAddress}
            </p>
          )}
          {o.recommendationContext && (
            <p className="mt-2 text-xs text-sage-gold/80">{o.recommendationContext}</p>
          )}
          {o.sku && (
            <p className="mt-1 text-xs text-sage-muted">SKU: {o.sku}</p>
          )}
          <p className="mt-2 text-xs text-sage-purple">{formatDate(o.createdAt)}</p>
        </li>
      ))}
    </ul>
  );
}
