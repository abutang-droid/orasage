'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { AppShell } from '@/lib/orasage-app-shell';
import { ShopLocaleProvider, useShopLocale } from '@/components/ShopLocaleProvider';
import { PortalFooter } from '@/components/PortalFooter';

function ShopShellInner({ children }: { children: ReactNode }) {
  const { locale } = useShopLocale();
  const pathname = usePathname() ?? '/';

  return (
    <AppShell
      appId="shop"
      locale={locale}
      theme="light"
      pathname={pathname}
      footer={<PortalFooter />}
    >
      {children}
    </AppShell>
  );
}

/** Shop 全站：PC 顶栏 + 移动品牌/登录顶栏 + 移动 5 键底栏 + PC 页脚 */
export function ShopShell({ children }: { children: ReactNode }) {
  return (
    <ShopLocaleProvider>
      <ShopShellInner>{children}</ShopShellInner>
    </ShopLocaleProvider>
  );
}
