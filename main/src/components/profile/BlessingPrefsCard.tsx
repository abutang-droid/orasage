'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@orasage/ui';
import { Globe, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import type { BlessingMeritSummary } from '@/lib/tarot-merit';
import { tarotBlessingUrls } from '@/lib/urls';

type Prefs = BlessingMeritSummary['prefs'] | null;

function formatFaithSubtitle(prefs: Prefs, locale: string, notSet: string): string {
  if (!prefs?.faith) return notSet;
  const label = locale.startsWith('zh')
    ? prefs.faithLabelZh
    : prefs.faithLabelEn ?? prefs.faithLabelZh;
  const parts = [label || prefs.faith];
  if (prefs.countryCode) parts.push(prefs.countryCode);
  return parts.filter(Boolean).join(' · ');
}

function formatDeitySubtitle(prefs: Prefs, locale: string, notChosen: string): string {
  if (!prefs?.deityId) return notChosen;
  return locale.startsWith('zh')
    ? prefs.deityNameZh ?? prefs.deityId
    : prefs.deityNameEn ?? prefs.deityNameZh ?? prefs.deityId;
}

function PrefRow({
  href,
  icon,
  title,
  subtitle,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  subtitle?: string | null;
}) {
  return (
    <a
      href={href}
      className="flex min-h-[56px] items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 text-sm transition-colors hover:bg-muted/40 active:bg-muted/60"
    >
      <span className="text-muted-foreground" aria-hidden>
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-foreground">{title}</span>
        {subtitle ? (
          <span className="mt-0.5 block truncate text-xs text-muted-foreground">{subtitle}</span>
        ) : null}
      </span>
      <span className="text-muted-foreground" aria-hidden>
        ›
      </span>
    </a>
  );
}

/** 祈福偏好（换信仰 / 换守护神）— 属「我的修行」，从设置页迁入（2026-07-08） */
export function BlessingPrefsCard() {
  const t = useTranslations('profile.settings');
  const locale = useLocale();
  const [prefs, setPrefs] = useState<Prefs>(null);

  const urls = tarotBlessingUrls(locale);

  useEffect(() => {
    let cancelled = false;
    void fetch('/api/profile/blessing-summary', { credentials: 'include', cache: 'no-store' })
      .then(async (res) => (res.ok ? res.json() : null))
      .then((data: BlessingMeritSummary | null) => {
        if (!cancelled) setPrefs(data?.prefs ?? null);
      })
      .catch(() => {
        if (!cancelled) setPrefs(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{t('blessingTitle')}</CardTitle>
        <p className="text-sm text-muted-foreground">{t('blessingDesc')}</p>
      </CardHeader>
      <CardContent className="space-y-2">
        <PrefRow
          href={urls.changeFaith}
          icon={<Globe size={18} strokeWidth={1.6} />}
          title={t('changeFaith')}
          subtitle={formatFaithSubtitle(prefs, locale, t('notSet'))}
        />
        <PrefRow
          href={urls.changeDeity}
          icon={<Sparkles size={18} strokeWidth={1.6} />}
          title={t('changeDeity')}
          subtitle={formatDeitySubtitle(prefs, locale, t('notChosen'))}
        />
      </CardContent>
    </Card>
  );
}
