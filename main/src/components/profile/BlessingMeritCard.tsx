'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@orasage/ui';
import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import type { BlessingMeritSummary } from '@/lib/tarot-merit';
import { tarotBlessingUrls } from '@/lib/urls';
import { useProfileAuth } from './ProfileAuth';

type MeritLink = {
  path: 'merit' | 'temple';
  labelKey: 'meritDetail' | 'myDeity' | 'worshipLog';
  external: boolean;
};

const MERIT_LINKS: MeritLink[] = [
  { path: 'merit', labelKey: 'meritDetail', external: true },
  { path: 'temple', labelKey: 'myDeity', external: true },
  { path: 'merit', labelKey: 'worshipLog', external: true },
];

export function BlessingMeritCard() {
  const t = useTranslations('profile.blessing');
  const locale = useLocale();
  const { user } = useProfileAuth();
  const [data, setData] = useState<BlessingMeritSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    void fetch('/api/profile/blessing-summary', { credentials: 'include', cache: 'no-store' })
      .then(async (res) => {
        if (res.status === 401) return { linked: false } as BlessingMeritSummary;
        if (!res.ok) throw new Error('load failed');
        return res.json() as Promise<BlessingMeritSummary>;
      })
      .then((payload) => {
        if (!cancelled) setData(payload);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  if (!user) return null;

  const urls = tarotBlessingUrls();
  const levelTitle = locale.startsWith('zh')
    ? data?.summary?.levelTitleZh
    : data?.summary?.levelTitleEn ?? data?.summary?.levelTitleZh;

  function resolveHref(path: MeritLink['path']) {
    if (path === 'temple') return urls.temple;
    return urls.merit;
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{t('title')}</CardTitle>
        <p className="text-sm text-muted-foreground">{t('desc')}</p>
      </CardHeader>
      <CardContent className="space-y-4 p-0">
        {loading ? (
          <p className="px-4 pb-4 text-sm text-muted-foreground">{t('loading')}</p>
        ) : error ? (
          <p className="px-4 pb-4 text-sm text-muted-foreground">{t('loadError')}</p>
        ) : data?.linked && data.summary ? (
          <dl className="grid grid-cols-2 gap-3 border-b border-border px-4 pb-4 text-sm">
            <div>
              <dt className="text-muted-foreground">{t('level')}</dt>
              <dd className="font-medium text-foreground">{levelTitle}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">{t('meritTotal')}</dt>
              <dd className="font-medium text-foreground">{data.summary.total}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">{t('streak')}</dt>
              <dd className="font-medium text-foreground">
                {data.summary.streak > 0 ? t('streakDays', { count: data.summary.streak }) : t('streakNone')}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">{t('prayedToday')}</dt>
              <dd className="font-medium text-foreground">
                {data.summary.prayedToday ? t('prayedDone') : t('prayedPending')}
              </dd>
            </div>
          </dl>
        ) : (
          <div className="space-y-3 border-b border-border px-4 pb-4">
            <p className="text-sm text-muted-foreground">{t('empty')}</p>
            <a
              href={urls.temple}
              className="inline-flex min-h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
            >
              {t('startCta')}
            </a>
          </div>
        )}

        <nav aria-label={t('title')}>
          {MERIT_LINKS.map((item) => (
            <a
              key={item.labelKey}
              href={resolveHref(item.path)}
              target={item.external ? '_blank' : undefined}
              rel={item.external ? 'noopener noreferrer' : undefined}
              className="flex min-h-[52px] items-center justify-between border-b border-border px-4 py-3 text-sm transition-colors last:border-b-0 active:bg-muted/60 hover:bg-muted/40"
            >
              <span className="text-foreground">{t(`nav.${item.labelKey}`)}</span>
              <span className="text-muted-foreground" aria-hidden>
                ›
              </span>
            </a>
          ))}
        </nav>
      </CardContent>
    </Card>
  );
}
