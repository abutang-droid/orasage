import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';
import { AdminShell } from '@/components/AdminShell';
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
        <AdminShell>
          {admin ? (
            <div className="admin-layout">
              <nav className="admin-nav">
                <Link href="/" className="admin-logo">OraSage Admin</Link>
                <div className="admin-nav-links">
                  <Link href="/">概览</Link>
                  <Link href="/products">商品</Link>
                  <Link href="/orders">订单</Link>
                  <a href="/cms/admin">内容管理</a>
                  <a href="https://shop.orasage.com" target="_blank" rel="noreferrer">商城</a>
                  <a href="https://auth.orasage.com/center">用户中心</a>
                </div>
              </nav>
              <main className="admin-main">{children}</main>
            </div>
          ) : (
            <main className="admin-main">{children}</main>
          )}
        </AdminShell>
      </body>
    </html>
  );
}
