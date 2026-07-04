'use client';

import type { ReactNode } from 'react';
import { FixedBottomNav } from '@/lib/orasage-app-shell/BottomNav';
import { SiteTopNav } from '@/lib/orasage-app-shell/SiteTopNav';
import { CmsBackendSwitcher } from '@/components/CmsBackendSwitcher';

/** CMS 全站外壳：与平台统一的 PC 顶栏 + 移动 5 键底栏 */
export function CmsPlatformShell({ children }: { children: ReactNode }) {
  return (
    <div className="cms-platform-shell orasage-app-shell" data-theme="light">
      <SiteTopNav locale="zh-CN" context="portal" />
      <CmsBackendSwitcher />
      <div className="orasage-portal-main cms-platform-main">{children}</div>
      <FixedBottomNav context="portal" locale="zh-CN" pathname="/cms" />
    </div>
  );
}
