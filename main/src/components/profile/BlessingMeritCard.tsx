'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@orasage/ui';
import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import type { BlessingMeritSummary } from '@/lib/tarot-merit';
import { tarotBlessingUrls } from '@/lib/urls';
import { useProfileAuth } from './ProfileAuth';

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

  const urls = tarotBlessingUrls(locale);
  const levelTitle = locale.startsWith('zh')
    ? data?.summary?.levelTitleZh
    : data?.summary?.levelTitleEn ?? data?.summary?.levelTitleZh;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{t('title')}</CardTitle>
        <p className="text-sm text-muted-foreground">{t('desc')}</p>
      </CardHeader>
      <CardContent className="space-y-4 p-0 pb-4">
        {loading ? (
          <p className="px-4 text-sm text-muted-foreground">{t('loading')}</p>
        ) : error ? (
          <p className="px-4 text-sm text-muted-foreground">{t('loadError')}</p>
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

        <div className="flex flex-wrap gap-2 px-4">
          <a
            href={urls.temple}
            className="inline-flex min-h-10 flex-1 items-center justify-center rounded-md border border-border px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted/40 sm:flex-none"
          >
            {t('nav.myDeity')}
          </a>
          <Link
            href="/profile/merit"
            className="inline-flex min-h-10 flex-1 items-center justify-center rounded-md border border-border px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted/40 sm:flex-none"
          >
            {t('nav.meritDetail')}
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
