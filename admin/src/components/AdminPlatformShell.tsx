'use client';

import type { ReactNode } from 'react';
import { FixedBottomNav } from '@/lib/orasage-app-shell/BottomNav';
import { SiteTopNav } from '@/lib/orasage-app-shell/SiteTopNav';
import { AdminBackendShell } from '@/components/AdminBackendShell';

export function AdminPlatformShell({
  children,
  showSidebar = true,
}: {
  children: ReactNode;
  showSidebar?: boolean;
}) {
  return (
    <div className="admin-platform-frame orasage-app-shell" data-theme="light">
      <SiteTopNav locale="zh-CN" context="portal" />
      <div className="admin-platform-body">
        <AdminBackendShell showSidebar={showSidebar}>{children}</AdminBackendShell>
      </div>
      <FixedBottomNav context="portal" locale="zh-CN" pathname="/" />
    </div>
  );
}
