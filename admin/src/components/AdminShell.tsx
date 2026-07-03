'use client';

import type { ReactNode } from 'react';
import { FixedBottomNav } from '@/lib/orasage-app-shell/BottomNav';
import { SiteTopNav } from '@/lib/orasage-app-shell/SiteTopNav';

/** Admin 全站：PC 顶栏 + 移动 5 键底栏 */
export function AdminShell({ children }: { children: ReactNode }) {
  return (
    <>
      <SiteTopNav locale="zh-CN" context="portal" />
      <div className="orasage-portal-main">{children}</div>
      <div className="orasage-app-shell" data-theme="light" style={{ minHeight: 0, background: 'transparent' }}>
        <FixedBottomNav context="portal" locale="zh-CN" pathname="/admin" />
      </div>
    </>
  );
}
