'use client';

import { Alert, AlertDescription, Badge, Card, CardContent } from '@orasage/ui';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { fetchOrders, type UserOrder } from '@/lib/auth';
import { ProfileListSkeleton } from './ProfileListSkeleton';
import { formatShippingDisplay } from '../../../../shared/shop-fulfillment/index';

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

const statusVariant: Record<string, 'default' | 'secondary' | 'outline' | 'muted' | 'destructive'> = {
  pending: 'secondary',
  paid: 'default',
  shipped: 'outline',
  completed: 'default',
  cancelled: 'muted',
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
    return <ProfileListSkeleton rows={3} />;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (orders.length === 0) {
    return <p className="text-sm text-muted-foreground">{t('empty')}</p>;
  }

  return (
    <ul className="space-y-3">
      {orders.map((o) => (
        <li key={o.id}>
          <Card>
            <CardContent className="p-4 sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-foreground">{o.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {o.orderNo}
                    {o.appLabel ? ` · ${o.appLabel}` : ''}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-primary">{o.amountDisplay}</p>
                  <Badge variant={statusVariant[o.status] ?? 'muted'} className="mt-1">
                    {o.statusLabel}
                  </Badge>
                </div>
              </div>
              {o.shippingAddress && (
                <p className="mt-3 text-xs text-muted-foreground">
                  {t('shipping')}: {formatShippingDisplay(o.shippingAddress) || o.shippingAddress}
                </p>
              )}
              {o.recommendationContext && (
                <p className="mt-2 text-xs text-primary/90">{o.recommendationContext}</p>
              )}
              {o.sku && <p className="mt-1 text-xs text-muted-foreground">SKU: {o.sku}</p>}
              <p className="mt-3 text-xs text-muted-foreground">{formatDate(o.createdAt)}</p>
            </CardContent>
          </Card>
        </li>
      ))}
    </ul>
  );
}
