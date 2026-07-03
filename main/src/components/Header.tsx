'use client';

import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { HeaderAuthButton } from '@/components/HeaderAuthButton';
import { isPortalNavItemActive, PORTAL_NAV_ITEMS } from '@/lib/portal-nav';

export function Header() {
  const tNav = useTranslations('nav');
  const pathname = usePathname();

  return (
    <header className="safe-top border-b border-border/70 lg:border-b-0">
      <div className="safe-x mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:h-16 sm:px-6">
        <Link
          href="/"
          className="inline-flex min-h-11 items-center rounded-sm font-serif text-lg tracking-widest text-brand-gold transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:text-xl"
        >
          OraSage
        </Link>

        <nav className="hidden items-center gap-5 lg:flex" aria-label="Portal navigation">
          {PORTAL_NAV_ITEMS.map((item) => {
            const label = tNav(item.id);
            const active = isPortalNavItemActive(pathname, item);
            const linkClass = `inline-flex min-h-11 items-center rounded-md px-1 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
              active ? 'font-medium text-primary' : 'text-muted-foreground hover:text-primary'
            }`;

            if (item.external) {
              return (
                <a key={item.id} href={item.href} className={linkClass}>
                  {label}
                </a>
              );
            }

            return (
              <Link key={item.id} href={item.href} className={linkClass} aria-current={active ? 'page' : undefined}>
                {label}
              </Link>
            );
          })}
          <HeaderAuthButton />
        </nav>

        <div className="lg:hidden">
          <HeaderAuthButton className="px-3 py-2 text-xs" />
        </div>
      </div>
    </header>
  );
}
