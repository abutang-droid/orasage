import { headers } from 'next/headers';
import type { ReactNode } from 'react';
import { PortalMainBottomNav } from '@/components/PortalMainBottomNav';
import { isMainPortalHome } from '@/lib/orasage-app-shell/config';
import { ORASAGE_PATHNAME_HEADER } from '@/lib/portal-pathname';

/** 门户页面包裹：全站移动端固定底栏（与顶栏同一套主导航） */
export async function PortalChrome({ children }: { children: ReactNode; locale: string }) {
  const headersList = await headers();
  const pathname = headersList.get(ORASAGE_PATHNAME_HEADER) ?? '/';
  const isHome = isMainPortalHome(pathname);

  return (
    <>
      <main className={`flex-1${isHome ? '' : ' orasage-portal-main'}`}>{children}</main>
      <div
        className="orasage-app-shell lg:hidden"
        data-theme="light"
        style={{ minHeight: 0, background: 'transparent' }}
      >
        <PortalMainBottomNav />
      </div>
    </>
  );
}
