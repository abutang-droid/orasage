'use client';

import { Alert, AlertDescription, Button, Card, CardContent } from '@orasage/ui';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { fetchRecommendations, type UserRecommendation } from '@/lib/auth';
import { externalUrls } from '@/lib/urls';
import { ProfileListSkeleton } from './ProfileListSkeleton';

const CRYSTAL_LABELS: Record<string, string> = {
  'crystal-wood': '绿幽灵',
  'crystal-fire': '红玛瑙',
  'crystal-earth': '黄水晶',
  'crystal-metal': '白水晶',
  'crystal-water': '海蓝宝',
};

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export function RecommendationsList({ compact = false }: { compact?: boolean }) {
  const t = useTranslations('profile.recommendations');
  const [items, setItems] = useState<UserRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [buyingId, setBuyingId] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setItems(await fetchRecommendations());
      } catch {
        setError(t('loadError'));
      } finally {
        setLoading(false);
      }
    })();
  }, [t]);

  if (loading) {
    return <ProfileListSkeleton rows={compact ? 2 : 3} />;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">{t('empty')}</p>;
  }

  const list = compact ? items.slice(0, 3) : items;

  return (
    <ul className="space-y-3">
      {list.map((r) => {
        const crystalName = CRYSTAL_LABELS[r.crystalSku] ?? r.crystalSku;
        return (
          <li key={r.id}>
            <Card>
              <CardContent className="p-4 sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-primary">{crystalName}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {r.appLabel}
                      {!compact && ` · ${formatDate(r.createdAt)}`}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={buyingId === r.id}
                      loading={buyingId === r.id}
                      onClick={async () => {
                        setBuyingId(r.id);
                        try {
                          const res = await fetch('/api/checkout', {
                            method: 'POST',
                            credentials: 'include',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              sku: r.crystalSku,
                              recommendationContext: r.reason,
                              readingId: r.readingId ?? undefined,
                              successUrl: `${window.location.origin}/profile/orders`,
                            }),
                          });
                          const data = await res.json().catch(() => ({}));
                          if (res.status === 401) {
                            window.location.href = `${externalUrls.authLogin}?redirect=${encodeURIComponent(window.location.href)}`;
                            return;
                          }
                          if (!res.ok) throw new Error(data.error || '结账失败');
                          if (data.checkoutUrl) window.location.href = data.checkoutUrl;
                          else if (data.orderNo) {
                            window.location.href = `${externalUrls.shop}/checkout?order=${encodeURIComponent(data.orderNo)}`;
                          }
                        } catch {
                          setError(t('buyError'));
                        } finally {
                          setBuyingId(null);
                        }
                      }}
                    >
                      {buyingId === r.id ? t('buying') : t('buyNow')}
                    </Button>
                    <Button asChild variant="ghost" size="sm">
                      <a href={`${externalUrls.shop}?sku=${encodeURIComponent(r.crystalSku)}`}>{t('viewShop')}</a>
                    </Button>
                  </div>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{r.reason}</p>
              </CardContent>
            </Card>
          </li>
        );
      })}
    </ul>
  );
}
