'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import {
  BILLING_NAV_ITEMS,
  CMS_NAV_ITEMS,
  navItemActive,
  OPS_NAV_ITEMS,
  SHOP_NAV_ITEMS,
  type AdminNavItem,
} from '@/lib/admin-backend/nav';
import { OrdersNavBadge } from '@/components/OrdersNavBadge';

const MAIN_BASE = 'https://orasage.com/zh-CN';

function BackendFooter() {
  return (
    <footer className="orasage-portal-footer safe-bottom mt-auto">
      <div className="orasage-portal-footer-inner">
        <p className="orasage-portal-footer-copy">© 2026 OraSage. 保留所有权利。</p>
        <div className="orasage-portal-footer-links">
          <a href={`${MAIN_BASE}/privacy`} className="orasage-portal-footer-link">
            隐私政策
          </a>
          <a href={`${MAIN_BASE}/terms`} className="orasage-portal-footer-link">
            服务条款
          </a>
        </div>
      </div>
    </footer>
  );
}

export type AdminBackendShellProps = {
  children: ReactNode;
  showSidebar?: boolean;
  wideContent?: boolean;
};

function NavSection({
  title,
  items,
  pathname,
}: {
  title: string;
  items: AdminNavItem[];
  pathname: string;
}) {
  return (
    <div>
      <div className="admin-backend-sidebar-title">{title}</div>
      {items.map((item) => {
        const active = navItemActive(item, pathname);
        return (
          <a
            key={item.href}
            href={item.href}
            className={`admin-backend-nav-link${active ? ' is-active' : ''}`}
          >
            {item.label}
            {item.href === '/shop/orders' ? <OrdersNavBadge /> : null}
          </a>
        );
      })}
    </div>
  );
}

function MobileNav({ pathname }: { pathname: string }) {
  const items = [...OPS_NAV_ITEMS, ...SHOP_NAV_ITEMS, ...BILLING_NAV_ITEMS, ...CMS_NAV_ITEMS];
  return (
    <nav className="admin-backend-mobile-nav" aria-label="后台快捷导航">
      {items.map((item) => {
        const active = navItemActive(item, pathname);
        return (
          <a key={item.href} href={item.href} className={active ? 'is-active' : undefined}>
            {item.label}
            {item.href === '/shop/orders' ? <OrdersNavBadge /> : null}
          </a>
        );
      })}
    </nav>
  );
}

export function AdminBackendShell({
  children,
  showSidebar = true,
  wideContent = false,
}: AdminBackendShellProps) {
  const pathname = usePathname() ?? '';

  return (
    <div className="admin-backend-layout">
      {showSidebar ? (
        <>
          <aside className="admin-backend-sidebar" aria-label="后台导航">
            <NavSection title="运营" items={OPS_NAV_ITEMS} pathname={pathname} />
            <NavSection title="商城" items={SHOP_NAV_ITEMS} pathname={pathname} />
            <NavSection title="应用计费" items={BILLING_NAV_ITEMS} pathname={pathname} />
            <NavSection title="内容" items={CMS_NAV_ITEMS} pathname={pathname} />
          </aside>
          <MobileNav pathname={pathname} />
        </>
      ) : null}
      <div className="admin-backend-main">
        <div
          className={
            wideContent ? 'admin-backend-content admin-backend-content--wide' : 'admin-backend-content'
          }
        >
          {children}
        </div>
        <BackendFooter />
      </div>
    </div>
  );
}
