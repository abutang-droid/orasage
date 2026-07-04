import type { Metadata } from 'next';
import './globals.css';
import { AdminPlatformShell } from '@/components/AdminPlatformShell';
import { buildOrasageMetadata } from '@/lib/orasage-seo';
import { getAdminUser } from '@/lib/auth';

export const metadata: Metadata = buildOrasageMetadata({
  title: '管理后台',
  description: 'OraSage 运营管理后台',
  robots: { index: false, follow: false },
});

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const admin = await getAdminUser();

  return (
    <html lang="zh-CN" data-theme="light">
      <body
        className="orasage-app-shell"
        data-theme="light"
        style={{ background: 'var(--orasage-background, #fafaf8)', color: 'var(--orasage-primary, #171717)' }}
      >
        <AdminPlatformShell showSidebar={!!admin}>{children}</AdminPlatformShell>
      </body>
    </html>
  );
}
