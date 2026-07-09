'use client';

import type { ReactNode } from 'react';
import { FixedBottomNav } from '@/lib/orasage-app-shell/BottomNav';
import { SiteTopNav } from '@/lib/orasage-app-shell/SiteTopNav';
import { AdminBackendShell } from '@/components/AdminBackendShell';

export function AdminPlatformShell({
  children,
  showSidebar = true,
  staffRole,
}: {
  children: ReactNode;
  showSidebar?: boolean;
  staffRole?: import('@/lib/auth').StaffRole;
}) {
  return (
    <div className="admin-platform-frame orasage-app-shell" data-theme="light">
      <SiteTopNav locale="zh-CN" context="portal" />
      <div className="admin-platform-body">
        <AdminBackendShell showSidebar={showSidebar} staffRole={staffRole}>{children}</AdminBackendShell>
      </div>
      <FixedBottomNav context="portal" locale="zh-CN" pathname="/" />
    </div>
  );
}
