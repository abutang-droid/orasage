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
          ['--shell-bg' as string]: '#ffffff',
          ['--shell-text' as string]: '#111615',
          ['--shell-muted' as string]: '#59645f',
          ['--shell-gold' as string]: '#111615',
          ['--shell-border' as string]: '#e3e6e2',
        }}
      >
        <FixedBottomNav context="portal" locale={locale} pathname={pathname} />
      </div>
    </>
  );
}
