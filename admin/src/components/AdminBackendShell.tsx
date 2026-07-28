'use client';

import { usePathname } from 'next/navigation';
import { useState, type ReactNode } from 'react';
import {
  ADMIN_NAV_GROUPS,
  filterNavGroups,
  navItemActive,
  type AdminNavGroup,
  type AdminNavItem,
} from '@/lib/admin-backend/nav';
import type { StaffUser } from '@/lib/auth';
import type { AnyStaffPermission } from '../../../shared/staff-permissions/index';
import { OrdersNavBadge } from '@/components/OrdersNavBadge';
import { MessagesNavBadge } from '@/components/MessagesNavBadge';
import { ImNavBadge } from '@/components/ImNavBadge';

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

function NavBadge({ href }: { href: string }) {
  if (href === '/shop/orders') return <OrdersNavBadge />;
  if (href === '/ops/messages') return <MessagesNavBadge />;
  if (href === '/ops/im') return <ImNavBadge />;
  return null;
}

function NavLink({ item, pathname }: { item: AdminNavItem; pathname: string }) {
  const active = navItemActive(item, pathname);
  return (
    <a
      key={item.href}
      href={item.href}
      className={`admin-backend-nav-link${active ? ' is-active' : ''}`}
    >
      {item.label}
      <NavBadge href={item.href} />
    </a>
  );
}

function NavSection({
  group,
  pathname,
}: {
  group: AdminNavGroup;
  pathname: string;
}) {
  const [open, setOpen] = useState(false);
  if (group.collapsibleAdminOnly) {
    return (
      <div className="admin-backend-nav-group admin-backend-nav-group--collapsible">
        <button
          type="button"
          className="admin-backend-sidebar-title admin-backend-sidebar-title--button"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {group.title}
          <span aria-hidden="true">{open ? '▾' : '▸'}</span>
        </button>
        {open ? (
          <div className="admin-backend-nav-group-body">
            {group.items.map((item) => (
              <NavLink key={item.href} item={item} pathname={pathname} />
            ))}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="admin-backend-nav-group">
      <div className="admin-backend-sidebar-title">{group.title}</div>
      {group.items.map((item) => (
        <NavLink key={item.href} item={item} pathname={pathname} />
      ))}
    </div>
  );
}

function MobileNav({
  groups,
  pathname,
}: {
  groups: AdminNavGroup[];
  pathname: string;
}) {
  const items = groups.flatMap((g) => g.items);
  return (
    <nav className="admin-backend-mobile-nav" aria-label="后台快捷导航">
      {items.map((item) => {
        const active = navItemActive(item, pathname);
        return (
          <a key={item.href} href={item.href} className={active ? 'is-active' : undefined}>
            {item.label}
            <NavBadge href={item.href} />
          </a>
        );
      })}
    </nav>
  );
}

export type AdminBackendShellProps = {
  children: ReactNode;
  showSidebar?: boolean;
  wideContent?: boolean;
  staffUser?: StaffUser;
};

export function AdminBackendShell({
  children,
  showSidebar = true,
  wideContent = false,
  staffUser,
}: AdminBackendShellProps) {
  const pathname = usePathname() ?? '';
  const permSet = staffUser
    ? (new Set(staffUser.permissions) as ReadonlySet<AnyStaffPermission>)
    : null;
  const groups =
    staffUser && permSet
      ? filterNavGroups(ADMIN_NAV_GROUPS, permSet, staffUser.role)
      : ADMIN_NAV_GROUPS.filter((g) => !g.collapsibleAdminOnly);

  return (
    <div className="admin-backend-layout">
      {showSidebar ? (
        <>
          <aside className="admin-backend-sidebar" aria-label="后台导航">
            {groups.map((group) => (
              <NavSection key={group.id} group={group} pathname={pathname} />
            ))}
          </aside>
          <MobileNav groups={groups} pathname={pathname} />
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
