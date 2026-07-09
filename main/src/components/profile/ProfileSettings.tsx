'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@orasage/ui';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useProfileAuth } from './ProfileAuth';
import { ProfileAccountCard } from './ProfileAccountCard';
import { ProfileLoginCard } from './ProfileLoginCard';

const LEGAL_LINKS = [
  { href: '/profile/about', labelKey: 'about' },
  { href: '/profile/contact', labelKey: 'contact' },
  { href: '/profile/privacy', labelKey: 'privacy' },
  { href: '/profile/terms', labelKey: 'terms' },
] as const;

const SIGNED_IN_LINKS = [{ href: '/profile/tickets', labelKey: 'tickets' }] as const;

/**
 * 账户与设置 — 账户管理唯一入口（Hub 只保留摘要 + 链入）。
 * 语言切换已上收到全站顶栏 PortalLocaleSwitcher（2026-07-08）；
 * 祈福偏好（换信仰 / 换守护神）已迁入「我的修行」详情页。
 */
export function ProfileSettings({ locale }: { locale: string }) {
  const t = useTranslations('profile.settings');
  const tLegal = useTranslations('profile.legal');
  const tTickets = useTranslations('profile.tickets');
  const { user } = useProfileAuth();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{t('accountTitle')}</CardTitle>
          <p className="text-sm text-muted-foreground">{t('accountDesc')}</p>
        </CardHeader>
        <CardContent className="p-0 pb-4">
          {!user ? <ProfileLoginCard locale={locale} variant="gate" /> : <ProfileAccountCard embedded />}
        </CardContent>
      </Card>

      <Card className="overflow-hidden p-0">
        <CardHeader className="border-b border-border px-4 pb-3 pt-4">
          <CardTitle className="text-base">{t('helpTitle')}</CardTitle>
          <p className="text-sm text-muted-foreground">{t('helpDesc')}</p>
        </CardHeader>
        <nav aria-label={t('helpTitle')}>
          {user
            ? SIGNED_IN_LINKS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex min-h-[52px] items-center justify-between border-b border-border px-4 py-3 text-sm transition-colors hover:bg-muted/40"
                >
                  <span className="text-foreground">{tTickets('nav')}</span>
                  <span className="text-muted-foreground" aria-hidden>
                    ›
                  </span>
                </Link>
              ))
            : null}
          {LEGAL_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex min-h-[52px] items-center justify-between border-b border-border px-4 py-3 text-sm transition-colors last:border-b-0 hover:bg-muted/40"
            >
              <span className="text-foreground">{tLegal(item.labelKey)}</span>
              <span className="text-muted-foreground" aria-hidden>
                ›
              </span>
            </Link>
          ))}
        </nav>
      </Card>
    </div>
  );
}
