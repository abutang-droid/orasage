'use client';

import { type ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { isPortalNavItemActive, PORTAL_NAV_ITEMS, type PortalNavItemDef } from '@/lib/portal-nav';

function NavIcon({ id, active }: { id: PortalNavItemDef['id']; active: boolean }) {
  const color = active ? 'var(--shell-primary)' : 'var(--shell-muted)';
  const icons: Record<PortalNavItemDef['id'], ReactNode> = {
    bazi: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" aria-hidden>
        <circle cx="12" cy="12" r="8" />
        <path d="M12 4v16M4 12h16" />
      </svg>
    ),
    ziwei: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" aria-hidden>
        <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
      </svg>
    ),
    tarot: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" aria-hidden>
        <rect x="5" y="3" width="14" height="18" rx="2" />
        <path d="M9 8h6M9 12h6" />
      </svg>
    ),
    famous: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" aria-hidden>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
      </svg>
    ),
    daozang: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" aria-hidden>
        <path d="M6 4h12v16H6z" />
        <path d="M9 8h6M9 12h6M9 16h4" />
      </svg>
    ),
  };
  return <>{icons[id]}</>;
}

/** Mobile bottom tab bar — mirrors main portal header navigation */
export function PortalMainBottomNav() {
  const t = useTranslations('nav');
  const pathname = usePathname();

  return (
    <nav className="orasage-app-bottomnav orasage-portal-bottomnav lg:hidden" aria-label="Portal navigation">
      <div className="orasage-app-bottomnav-inner">
        {PORTAL_NAV_ITEMS.map((item) => {
          const active = isPortalNavItemActive(pathname, item);
          const label = t(item.id);
          const className = 'orasage-app-nav-item';
          const activeAttr = active ? 'true' : 'false';

          if (item.external) {
            return (
              <a
                key={item.id}
                href={item.href}
                className={className}
                data-active={activeAttr}
              >
                <NavIcon id={item.id} active={active} />
                <span>{label}</span>
              </a>
            );
          }

          return (
            <Link
              key={item.id}
              href={item.href}
              className={className}
              data-active={activeAttr}
            >
              <NavIcon id={item.id} active={active} />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
