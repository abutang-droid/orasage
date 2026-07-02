'use client';

import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';

const navItems = [
  { href: '/profile', key: 'overview' as const },
  { href: '/profile/profiles', key: 'profiles' as const },
  { href: '/profile/readings', key: 'readings' as const },
  { href: '/profile/recommendations', key: 'recommendations' as const },
  { href: '/profile/orders', key: 'orders' as const },
  { href: '/profile/about', key: 'about' as const },
  { href: '/profile/contact', key: 'contact' as const },
  { href: '/profile/privacy', key: 'privacy' as const },
  { href: '/profile/terms', key: 'terms' as const },
];

export function ProfileNav() {
  const t = useTranslations('profile.nav');
  const pathname = usePathname();

  return (
    <nav className="mb-8 overflow-hidden rounded-xl border border-sage-border/60">
      {navItems.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex min-h-[48px] items-center border-b border-sage-border/40 px-4 py-3 text-sm transition last:border-b-0 ${
              active
                ? 'bg-sage-gold/10 text-sage-gold'
                : 'text-sage-muted hover:bg-sage-card hover:text-sage-primary'
            }`}
          >
            {t(item.key)}
          </Link>
        );
      })}
    </nav>
  );
}
