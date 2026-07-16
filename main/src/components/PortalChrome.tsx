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
      <a href="#main-content" className="orasage-skip-link">
        跳到主要内容
      </a>
      <main id="main-content" className="orasage-portal-main flex-1" tabIndex={-1}>
        {children}
      </main>
      <div
        className="orasage-app-shell"
        data-theme="light"
        style={{
          minHeight: 0,
          background: 'transparent',
          ['--shell-bg' as string]: 'var(--os-color-mono-bg)',
          ['--shell-text' as string]: 'var(--os-color-mono-black)',
          ['--shell-muted' as string]: 'var(--os-color-mono-gray-deep)',
          ['--shell-gold' as string]: 'var(--os-color-mono-black)',
          ['--shell-border' as string]: 'var(--os-color-mono-gray-light)',
        }}
      >
        <FixedBottomNav context="portal" locale={locale} pathname={pathname} />
      </div>
    </>
  );
}
