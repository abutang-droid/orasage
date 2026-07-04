'use client';

import type { ReactNode } from 'react';
import { FixedBottomNav } from '@/lib/orasage-app-shell/BottomNav';
import { SiteTopNav } from '@/lib/orasage-app-shell/SiteTopNav';
import { ShopLocaleProvider, useShopLocale } from '@/components/ShopLocaleProvider';
import { PortalFooter } from '@/components/PortalFooter';

function ShopShellInner({ children }: { children: ReactNode }) {
  const { locale } = useShopLocale();

  return (
    <>
      <SiteTopNav locale={locale} context="portal" />
      <div className="orasage-portal-main flex min-h-dvh flex-col">
        {children}
        <PortalFooter />
      </div>
      <div className="orasage-app-shell" data-theme="light" style={{ minHeight: 0, background: 'transparent' }}>
        <FixedBottomNav context="portal" locale={locale} pathname="/shop" />
      </div>
    </>
  );
}

/** Shop 全站：PC 顶栏 + 移动 5 键底栏 + PC 页脚；货币随语言自动切换 */
export function ShopShell({ children }: { children: ReactNode }) {
  return (
    <ShopLocaleProvider>
      <ShopShellInner>{children}</ShopShellInner>
    </ShopLocaleProvider>
  );
}
