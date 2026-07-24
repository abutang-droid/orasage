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

/** Shop 全站：移动壳（顶栏品牌/登录 + 5 键底栏），内容列宽与命理 App 对齐 */
export function ShopShell({ children }: { children: ReactNode }) {
  return (
    <ShopLocaleProvider>
      <CartProvider>
        <ShopShellInner>{children}</ShopShellInner>
      </CartProvider>
    </ShopLocaleProvider>
  );
}
