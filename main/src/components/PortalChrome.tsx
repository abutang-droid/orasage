import type { ReactNode } from 'react';
import { FixedBottomNav } from '@/lib/orasage-app-shell/BottomNav';
import { LocaleFallbackNotice } from '@/lib/orasage-app-shell/LocaleFallbackNotice';
import { ORASAGE_PATHNAME_HEADER } from '@/lib/portal-pathname';
import { headers } from 'next/headers';

/** 门户页面包裹：全站固定 5 键底栏（移动壳，宽屏同布局） */
export async function PortalChrome({ children, locale }: { children: ReactNode; locale: string }) {
  const headersList = await headers();
  const pathname = headersList.get(ORASAGE_PATHNAME_HEADER) ?? '/';

  return (
    <>
      <div
        className="orasage-app-shell"
        data-theme="light"
        style={{
          minHeight: 0,
          background: 'transparent',
          ['--shell-bg' as string]: '#fafaf8',
          ['--shell-text' as string]: '#171717',
          ['--shell-muted' as string]: '#6b7280',
          ['--shell-gold' as string]: '#171717',
          ['--shell-border' as string]: '#e7e5e4',
        }}
      >
        <LocaleFallbackNotice locale={locale} />
      </div>
      <main className="orasage-portal-main flex-1">{children}</main>
      <div
        className="orasage-app-shell"
        data-theme="light"
        style={{
          minHeight: 0,
          background: 'transparent',
          ['--shell-bg' as string]: '#fafaf8',
          ['--shell-text' as string]: '#171717',
          ['--shell-muted' as string]: '#6b7280',
          ['--shell-gold' as string]: '#171717',
          ['--shell-border' as string]: '#e7e5e4',
        }}
      >
        <FixedBottomNav context="portal" locale={locale} pathname={pathname} />
      </div>
    </>
  );
}
