import type { ReactNode } from 'react';
import { FixedBottomNav } from '@/lib/orasage-app-shell/BottomNav';
import { ORASAGE_PATHNAME_HEADER } from '@/lib/portal-pathname';
import { headers } from 'next/headers';

/** 门户页面包裹：全站移动端 5 键底栏（PC 由 CSS 隐藏，顶栏导航代替） */
export async function PortalChrome({ children, locale }: { children: ReactNode; locale: string }) {
  const headersList = await headers();
  const pathname = headersList.get(ORASAGE_PATHNAME_HEADER) ?? '/';

  return (
    <>
      <main className="orasage-portal-main flex-1">{children}</main>
      <div
        className="orasage-app-shell"
        data-theme="light"
        style={{
          minHeight: 0,
          background: 'transparent',
          // 与 main 页面 background token（白底）一致，底栏不形成色块
          ['--shell-bg' as string]: '#ffffff',
        }}
      >
        <FixedBottomNav context="portal" locale={locale} pathname={pathname} />
      </div>
    </>
  );
}
