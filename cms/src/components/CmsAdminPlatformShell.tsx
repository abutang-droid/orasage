'use client';

import type { ReactNode } from 'react';
import { FixedBottomNav } from '@/lib/orasage-app-shell/BottomNav';
import { AdminBackendShell } from '@/components/AdminBackendShell';

export function CmsAdminPlatformShell({ children }: { children: ReactNode }) {
  return (
    <div className="admin-platform-frame orasage-app-shell" data-theme="light">
      <div className="admin-platform-body">
        <AdminBackendShell showSidebar wideContent>
          {children}
        </AdminBackendShell>
      </div>
      <FixedBottomNav context="portal" locale="zh-CN" pathname="/cms" />
    </div>
  );
}
