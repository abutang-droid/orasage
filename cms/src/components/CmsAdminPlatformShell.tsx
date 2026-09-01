'use client';

import type { ReactNode } from 'react';
import { SiteTopNav } from '@/lib/orasage-app-shell/SiteTopNav';
import { AdminBackendShell } from '@/components/AdminBackendShell';

export function CmsAdminPlatformShell({ children }: { children: ReactNode }) {
  return (
    <div className="admin-platform-frame orasage-app-shell" data-theme="light">
      <SiteTopNav locale="zh-CN" context="portal" />
      <div className="admin-platform-body">
        <AdminBackendShell showSidebar wideContent>
          {children}
        </AdminBackendShell>
      </div>
    </div>
  );
}
