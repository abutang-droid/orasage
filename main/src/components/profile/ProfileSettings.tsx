'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@orasage/ui';
import { useEffect, useState, useTransition } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { locales, localeNames, type Locale } from '@/i18n/routing';
import { usePathname, useRouter } from '@/i18n/navigation';
import { updateProfile } from '@/lib/auth';
import type { BlessingMeritSummary } from '@/lib/tarot-merit';
import { tarotBlessingUrls } from '@/lib/urls';
import { useProfileAuth } from './ProfileAuth';
import { ProfileLoginCard } from './ProfileLoginCard';

type SettingsRowProps = {
  href: string;
  emoji: string;
  title: string;
  subtitle?: string | null;
};

function SettingsRow({ href, emoji, title, subtitle }: SettingsRowProps) {
  return (
    <a
      href={href}
      className="flex min-h-[56px] items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 text-sm transition-colors hover:bg-muted/40 active:bg-muted/60"
    >
      <span className="text-xl" aria-hidden>
        {emoji}
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

function formatFaithSubtitle(
  prefs: BlessingMeritSummary['prefs'] | null,
  locale: string,
  notSet: string,
): string {
  if (!prefs?.faith) return notSet;
  const label = locale.startsWith('zh')
    ? prefs.faithLabelZh
    : prefs.faithLabelEn ?? prefs.faithLabelZh;
  const parts = [label || prefs.faith];
  if (prefs.countryCode) parts.push(prefs.countryCode);
  return parts.filter(Boolean).join(' · ');
}

function formatDeitySubtitle(
  prefs: BlessingMeritSummary['prefs'] | null,
  locale: string,
  notChosen: string,
): string {
  if (!prefs?.deityId) return notChosen;
  return locale.startsWith('zh')
    ? prefs.deityNameZh ?? prefs.deityId
    : prefs.deityNameEn ?? prefs.deityNameZh ?? prefs.deityId;
}

export function ProfileSettings({ locale }: { locale: string }) {
  const t = useTranslations('profile.settings');
  const tBlessingNav = useTranslations('profile.blessing.nav');
  const currentLocale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useProfileAuth();
  const [pending, startTransition] = useTransition();
  const [prefs, setPrefs] = useState<BlessingMeritSummary['prefs'] | null>(null);

  const urls = tarotBlessingUrls(locale);

  useEffect(() => {
    if (!user) {
      setPrefs(null);
      return;
    }
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
  }, [user]);

  function switchLocale(next: Locale) {
    if (next === currentLocale) return;
    startTransition(() => {
      router.replace(pathname, { locale: next });
      if (user) {
        void updateProfile({ languagePreference: next }).catch(() => undefined);
      }
    });
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{t('languageTitle')}</CardTitle>
          <p className="text-sm text-muted-foreground">{t('languageDesc')}</p>
        </CardHeader>
        <CardContent className="space-y-2 p-0 pb-4">
          {locales.map((code) => {
            const active = code === currentLocale;
            return (
              <button
                key={code}
                type="button"
                disabled={pending}
                onClick={() => switchLocale(code)}
                className={`flex w-full min-h-[48px] items-center justify-between border-b border-border px-4 py-3 text-left text-sm transition-colors last:border-b-0 ${
                  active ? 'bg-muted/50 text-foreground' : 'text-foreground hover:bg-muted/30'
                }`}
              >
                <span>{localeNames[code]}</span>
                {active ? (
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                    {t('languageCurrent')}
                  </span>
                ) : null}
              </button>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{t('blessingTitle')}</CardTitle>
          <p className="text-sm text-muted-foreground">{t('blessingDesc')}</p>
        </CardHeader>
        <CardContent className="space-y-2">
          {!user ? (
            <ProfileLoginCard locale={locale} variant="gate" />
          ) : (
            <>
              <SettingsRow
                href={urls.changeFaith}
                emoji="🌍"
                title={t('changeFaith')}
                subtitle={formatFaithSubtitle(prefs, currentLocale, t('notSet'))}
              />
              <SettingsRow
                href={urls.changeDeity}
                emoji="🛐"
                title={t('changeDeity')}
                subtitle={formatDeitySubtitle(prefs, currentLocale, t('notChosen'))}
              />
            </>
          )}
        </CardContent>
      </Card>

      <Card className="overflow-hidden p-0">
        <nav aria-label={t('title')}>
          <a
            href={urls.merit}
            className="flex min-h-[52px] items-center justify-between border-b border-border px-4 py-3 text-sm transition-colors last:border-b-0 hover:bg-muted/40"
          >
            <span className="text-foreground">{tBlessingNav('meritDetail')}</span>
            <span className="text-muted-foreground" aria-hidden>
              ›
            </span>
          </a>
        </nav>
      </Card>
    </div>
  );
}
