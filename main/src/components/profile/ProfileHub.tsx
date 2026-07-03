'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { profileLoginUrl } from '@/lib/auth';
import { useProfileAuth } from './ProfileAuth';
import { ProfileAccountCard } from './ProfileAccountCard';

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
      {!user ? (
        <section className="rounded-2xl border border-sage-border/60 bg-sage-card/40 p-6 text-center">
          <p className="text-sm text-sage-muted">{t('guestDesc')}</p>
          <a
            href={profileLoginUrl(locale)}
            className="mt-4 inline-flex min-h-[48px] items-center justify-center rounded-full bg-sage-gold/15 px-8 text-sm font-medium text-sage-gold transition hover:bg-sage-gold/25"
          >
            {t('loginCta')}
          </a>
        </section>
      ) : (
        <ProfileAccountCard />
      )}

      <nav className="overflow-hidden rounded-2xl border border-sage-border/60 bg-sage-card/30">
        {visibleItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex min-h-[52px] items-center justify-between border-b border-sage-border/40 px-4 py-3 text-sm last:border-b-0 active:bg-sage-card/60"
          >
            <span className="text-sage-primary">{tNav(item.labelKey)}</span>
            <span className="text-sage-muted" aria-hidden>›</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
