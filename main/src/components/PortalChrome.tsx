import { headers } from 'next/headers';
import type { ReactNode } from 'react';
import { FixedBottomNav } from '@/lib/orasage-app-shell/BottomNav';
import { isMainPortalHome } from '@/lib/orasage-app-shell/config';
import { ORASAGE_PATHNAME_HEADER } from '@/lib/portal-pathname';

/** 门户页面包裹：除首页外所有子页固定底栏（服务端判定，首屏即渲染） */
export async function PortalChrome({ children, locale }: { children: ReactNode; locale: string }) {
  const headersList = await headers();
  const pathname = headersList.get(ORASAGE_PATHNAME_HEADER) ?? '/';
  const isHome = isMainPortalHome(pathname);

  return (
    <>
      <main className={`flex-1${isHome ? '' : ' orasage-portal-main'}`}>{children}</main>
      {!isHome && (
        <div className="orasage-app-shell" data-theme="light" style={{ minHeight: 0, background: 'transparent' }}>
          <FixedBottomNav context="portal" locale={locale} pathname={pathname} />
        </div>
      )}
    </>
  );
}
