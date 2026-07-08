'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { AppShell } from '@/lib/orasage-app-shell';
import { ShopLocaleProvider, useShopLocale } from '@/components/ShopLocaleProvider';
import { PortalFooter } from '@/components/PortalFooter';
import { CartProvider } from '@/lib/cart';
import { CartLink } from '@/components/CartLink';

function ShopShellInner({ children }: { children: ReactNode }) {
  const { locale, setLocale } = useShopLocale();
  const pathname = usePathname() ?? '/';

  return (
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
  );
}

/** Shop 全站：PC 顶栏 + 移动品牌/登录顶栏 + 移动 5 键底栏 + PC 页脚 */
export function ShopShell({ children }: { children: ReactNode }) {
  return (
    <ShopLocaleProvider>
      <CartProvider>
        <ShopShellInner>{children}</ShopShellInner>
      </CartProvider>
    </ShopLocaleProvider>
  );
}
