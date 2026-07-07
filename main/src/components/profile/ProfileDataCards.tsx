'use client';

import { Card, Icon } from '@orasage/ui';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import {
  fetchOrders,
  fetchReadings,
  fetchRecommendations,
  fetchSavedProfiles,
} from '@/lib/auth';
import { useProfileAuth } from './ProfileAuth';

type DataItem = {
  href: '/profile/profiles' | '/profile/readings' | '/profile/recommendations' | '/profile/orders';
  titleKey: 'profilesTitle' | 'readingsTitle' | 'recommendationsTitle' | 'ordersTitle';
  descKey: 'profilesDesc' | 'readingsDesc' | 'recommendationsDesc' | 'ordersDesc';
  fetchCount: () => Promise<number>;
};

const DATA_ITEMS: DataItem[] = [
  {
    href: '/profile/profiles',
    titleKey: 'profilesTitle',
    descKey: 'profilesDesc',
    fetchCount: async () => (await fetchSavedProfiles()).length,
  },
  {
    href: '/profile/readings',
    titleKey: 'readingsTitle',
    descKey: 'readingsDesc',
    fetchCount: async () => (await fetchReadings()).length,
  },
  {
    href: '/profile/recommendations',
    titleKey: 'recommendationsTitle',
    descKey: 'recommendationsDesc',
    fetchCount: async () => (await fetchRecommendations()).length,
  },
  {
    href: '/profile/orders',
    titleKey: 'ordersTitle',
    descKey: 'ordersDesc',
    fetchCount: async () => (await fetchOrders()).length,
  },
];

function CountBadge({ count, loading }: { count: number | null; loading: boolean }) {
  const t = useTranslations('profile');
  if (loading) return <span className="text-xs text-muted-foreground">{t('countLoading')}</span>;
  if (count === null) return null;
  return (
    <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
      {t('itemCount', { count })}
    </span>
  );
}

export function ProfileDataCards() {
  const t = useTranslations('profile');
  const { user } = useProfileAuth();
  const [counts, setCounts] = useState<Record<string, number | null>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      setCounts({});
      return;
    }
    let cancelled = false;
    setLoading(true);
    void Promise.all(
      DATA_ITEMS.map(async (item) => {
        try {
          const count = await item.fetchCount();
          return [item.href, count] as const;
        } catch {
          return [item.href, null] as const;
        }
      }),
    ).then((entries) => {
      if (cancelled) return;
      setCounts(Object.fromEntries(entries));
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [user]);

  return (
    <section className="space-y-3" aria-labelledby="profile-data-heading">
      <h2 id="profile-data-heading" className="text-sm font-medium text-muted-foreground">
        {t('dataSection')}
      </h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {DATA_ITEMS.map((item) => {
          const count = counts[item.href] ?? null;
          const locked = !user;

          return (
            <Link key={item.href} href={item.href} className="group block">
              <Card className="h-full overflow-hidden p-0 transition-colors group-hover:bg-muted/30 group-active:bg-muted/50">
                <div className="flex min-h-[88px] flex-col justify-between p-4">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium text-foreground">{t(item.titleKey)}</p>
                    {locked ? (
                      <Icon name="lock" className="h-4 w-4 shrink-0 text-muted-foreground" />
                    ) : (
                      <CountBadge count={count} loading={loading} />
                    )}
                  </div>
                  <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                    {locked ? t('loginToView') : t(item.descKey)}
                  </p>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
