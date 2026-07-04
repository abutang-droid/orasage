'use client';

import { Card } from '@orasage/ui';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useProfileAuth } from './ProfileAuth';
import { ProfileAccountCard } from './ProfileAccountCard';
import { ProfileLoginCard } from './ProfileLoginCard';

type MenuItem = {
  href: string;
  labelKey: 'profiles' | 'readings' | 'recommendations' | 'orders' | 'about' | 'contact' | 'privacy' | 'terms';
  requiresAuth?: boolean;
};

const MENU_ITEMS: MenuItem[] = [
  { href: '/profile/profiles', labelKey: 'profiles', requiresAuth: true },
  { href: '/profile/readings', labelKey: 'readings', requiresAuth: true },
  { href: '/profile/recommendations', labelKey: 'recommendations', requiresAuth: true },
  { href: '/profile/orders', labelKey: 'orders', requiresAuth: true },
  { href: '/profile/about', labelKey: 'about' },
  { href: '/profile/contact', labelKey: 'contact' },
  { href: '/profile/privacy', labelKey: 'privacy' },
  { href: '/profile/terms', labelKey: 'terms' },
];

export function ProfileHub({ locale }: { locale: string }) {
  const t = useTranslations('profile');
  const tNav = useTranslations('profile.nav');
  const { user } = useProfileAuth();

  const visibleItems = MENU_ITEMS.filter((item) => !item.requiresAuth || user);

  return (
    <div className="space-y-6">
      {!user ? <ProfileLoginCard locale={locale} variant="hub" /> : <ProfileAccountCard />}

      <Card className="overflow-hidden p-0">
        <nav aria-label={t('title')}>
          {visibleItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex min-h-[52px] items-center justify-between border-b border-border px-4 py-3 text-sm transition-colors last:border-b-0 active:bg-muted/60 hover:bg-muted/40"
            >
              <span className="text-foreground">{tNav(item.labelKey)}</span>
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
