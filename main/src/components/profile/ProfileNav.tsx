'use client';

import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';

const navItems = [
  { href: '/profile', key: 'overview' as const },
  { href: '/profile/profiles', key: 'profiles' as const },
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
    <nav className="mb-8 flex gap-2 overflow-x-auto border-b border-sage-border/60 pb-3 sm:flex-wrap">
      {navItems.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`shrink-0 rounded-full px-4 py-2 text-sm transition ${
              active
                ? 'bg-sage-purple/30 text-white'
                : 'text-sage-muted hover:bg-sage-card hover:text-white'
            }`}
          >
            {t(item.key)}
          </Link>
        );
      })}
    </nav>
  );
}
