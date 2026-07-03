'use client';

import type { ReactNode } from 'react';
import { FixedBottomNav } from '@/lib/orasage-app-shell/BottomNav';
import { CurrencyProvider } from '@/components/CurrencyProvider';

/** Shop 全页固定底栏（非 Main 门户首页） */
export function ShopShell({ children }: { children: ReactNode }) {
  return (
    <CurrencyProvider>
      <div className="orasage-portal-main">{children}</div>
      <div className="orasage-app-shell" data-theme="light" style={{ minHeight: 0, background: 'transparent' }}>
        <FixedBottomNav context="portal" locale="zh-CN" pathname="/shop" />
      </div>
    </CurrencyProvider>
  );
}
