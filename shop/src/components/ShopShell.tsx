'use client';

import type { ReactNode } from 'react';
import { FixedBottomNav } from '@/lib/orasage-app-shell/BottomNav';
import { SiteTopNav } from '@/lib/orasage-app-shell/SiteTopNav';
import { CurrencyProvider } from '@/components/CurrencyProvider';
import { PortalFooter } from '@/components/PortalFooter';

/** Shop 全站：PC 顶栏 + 移动 5 键底栏 + PC 页脚 */
export function ShopShell({ children }: { children: ReactNode }) {
  return (
    <CurrencyProvider>
      <SiteTopNav locale="zh-CN" context="portal" />
      <div className="orasage-portal-main flex min-h-dvh flex-col">
        {children}
        <PortalFooter />
      </div>
      <div className="orasage-app-shell" data-theme="light" style={{ minHeight: 0, background: 'transparent' }}>
        <FixedBottomNav context="portal" locale="zh-CN" pathname="/shop" />
      </div>
    </CurrencyProvider>
  );
}
