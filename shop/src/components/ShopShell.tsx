'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { AppShell } from '@/lib/orasage-app-shell';
import { ShopLocaleProvider, useShopLocale } from '@/components/ShopLocaleProvider';
import { PortalFooter } from '@/components/PortalFooter';
import { CartProvider } from '@/lib/cart';
import { CartLink } from '@/components/CartLink';
import { AnalyticsPageView, PlausibleScript } from '@orasage/analytics/react';

function ShopShellInner({ children }: { children: ReactNode }) {
  const { locale, setLocale } = useShopLocale();
  const pathname = usePathname() ?? '/';

  return (
    <>
      <PlausibleScript />
      <AnalyticsPageView app="shop" locale={locale} path={pathname} />
      <AppShell
        appId="shop"
        locale={locale}
        onLocaleChange={setLocale}
        theme="light"
        pathname={pathname}
        footer={<PortalFooter />}
        headerExtra={<CartLink />}
      >
        {children}
      </AppShell>
    </>
  );
}

/** Shop 全站：统一顶栏（移动折叠菜单）+ 全端页脚 */
export function ShopShell({ children }: { children: ReactNode }) {
  return (
    <ShopLocaleProvider>
      <CartProvider>
        <ShopShellInner>{children}</ShopShellInner>
      </CartProvider>
    </ShopLocaleProvider>
  );
}
