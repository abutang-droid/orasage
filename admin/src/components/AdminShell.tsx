'use client';

import type { ReactNode } from 'react';
import { FixedBottomNav } from '@/lib/orasage-app-shell/BottomNav';

export function AdminShell({ children }: { children: ReactNode }) {
  return (
    <>
      <div className="orasage-portal-main">{children}</div>
      <div className="orasage-app-shell" data-theme="light" style={{ minHeight: 0, background: 'transparent' }}>
        <FixedBottomNav context="portal" locale="zh-CN" pathname="/admin" />
      </div>
    </>
  );
}
