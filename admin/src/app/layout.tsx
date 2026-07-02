import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';
import { getAdminUser } from '@/lib/auth';

export const metadata: Metadata = {
  title: 'OraSage 管理后台',
  description: 'OraSage 运营管理后台',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const admin = await getAdminUser();

  return (
    <html lang="zh-CN">
      <body>
        {admin ? (
          <div className="admin-layout">
            <nav className="admin-nav">
              <Link href="/" className="admin-logo">OraSage Admin</Link>
              <div className="admin-nav-links">
                <Link href="/">概览</Link>
                <Link href="/products">商品</Link>
                <Link href="/orders">订单</Link>
                <a href="https://shop.orasage.com" target="_blank" rel="noreferrer">商城</a>
                <a href="https://auth.orasage.com/center">用户中心</a>
              </div>
            </nav>
            <main className="admin-main">{children}</main>
          </div>
        ) : (
          children
        )}
      </body>
    </html>
  );
}
