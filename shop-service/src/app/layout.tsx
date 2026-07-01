import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: 'OraSage Shop',
  description: 'OraSage 命理商城 — 数字报告、会员与周边',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const authUrl = process.env.AUTH_URL ?? 'https://auth.orasage.com';
  const shopUrl = process.env.SHOP_URL ?? 'https://shop.orasage.com';
  const loginUrl = `${authUrl}/login?redirect=${encodeURIComponent(shopUrl)}`;

  return (
    <html lang="zh-CN">
      <body>
        <header className="site-header">
          <div className="container inner">
            <Link href="/" className="logo">
              OraSage Shop
            </Link>
            <nav className="nav">
              <Link href="/products">商品</Link>
              <Link href="/orders">我的订单</Link>
              <a href={loginUrl}>登录</a>
            </nav>
          </div>
        </header>
        <main>{children}</main>
        <footer className="site-footer">
          <div className="container">© {new Date().getFullYear()} OraSage · 命理与数字商品</div>
        </footer>
      </body>
    </html>
  );
}
