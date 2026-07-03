'use client';

import type { ReactNode } from 'react';
import { FixedBottomNav } from '@/lib/orasage-app-shell/BottomNav';
import { SiteTopNav } from '@/lib/orasage-app-shell/SiteTopNav';
import { CurrencyProvider } from '@/components/CurrencyProvider';

/** Shop 全站：PC 顶栏 + 移动 5 键底栏 */
export function ShopShell({ children }: { children: ReactNode }) {
  return (
    <CurrencyProvider>
      <SiteTopNav locale="zh-CN" />
      <div className="orasage-portal-main">{children}</div>
      <div className="orasage-app-shell" data-theme="light" style={{ minHeight: 0, background: 'transparent' }}>
        <FixedBottomNav context="portal" locale="zh-CN" pathname="/shop" />
      </div>
    </CurrencyProvider>
  );
}
