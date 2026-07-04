import { getAdminUser, loginUrl } from '@/lib/auth';
import { getStats } from '@/lib/api';
import Link from 'next/link';

export default async function AdminHome() {
  const admin = await getAdminUser();

  if (!admin) {
    return (
      <main className="admin-shell">
        <div className="login-card">
          <h1>OraSage 管理后台</h1>
          <p>需要管理员账号登录后才能访问运营功能（商品、订单、用户统计）。</p>
          <a className="btn-primary" href={loginUrl()}>
            登录运营后台
          </a>
          <p className="muted" style={{ marginTop: '1.25rem', fontSize: '0.9rem' }}>
            内容管理（Hero、页面、媒体）请访问{' '}
            <a href="/cms/admin" style={{ color: 'var(--orasage-gold, #b8943f)', textDecoration: 'underline' }}>
              CMS 后台
            </a>
          </p>
        </div>
      </main>
    );
  }

  let stats = { users: 0, orders: 0, readings: 0, products: 0 };
  try {
    stats = await getStats();
  } catch {
    // auth API 未就绪时显示占位
  }

  return (
    <div className="admin-page">
      <header className="page-header">
        <h1>运营概览</h1>
        <p className="muted">商品与订单数据来自 auth-service 统一数据源</p>
      </header>

      <section className="card-grid">
        <div className="card">
          <h2>用户总数</h2>
          <div className="value">{stats.users}</div>
        </div>
        <div className="card">
          <h2>订单总数</h2>
          <div className="value">{stats.orders}</div>
        </div>
        <div className="card">
          <h2>命理测算</h2>
          <div className="value">{stats.readings}</div>
        </div>
        <div className="card">
          <h2>在售商品</h2>
          <div className="value">{stats.products}</div>
        </div>
      </section>

      <section className="quick-links">
        <Link href="/products" className="btn-secondary">管理商品</Link>
        <Link href="/orders" className="btn-secondary">查看订单</Link>
        <a href="/cms/admin" className="btn-secondary">内容管理（CMS）</a>
        <a href="https://shop.orasage.com/api/products" className="btn-secondary" target="_blank" rel="noreferrer">
          商品 JSON API
        </a>
      </section>
    </div>
  );
}
