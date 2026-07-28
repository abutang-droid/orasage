import { getAdminUser, loginUrl } from '@/lib/auth';
import { getStats } from '@/lib/api';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function AdminHome() {
  const admin = await getAdminUser();

  if (!admin) {
    redirect(loginUrl());
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
        <h1>后台首页</h1>
        <p className="muted">左侧按模块分组（平台 / 商城 / 内容 / 应用…）；无需重复登录。</p>
      </header>

      <section className="entry-grid">
        <Link href="/analytics" className="entry-card">
          <h2>数据统计</h2>
          <p>用户、订单、测算与埋点趋势看板</p>
          <span className="entry-cta">进入统计 →</span>
        </Link>
        <Link href="/shop/products" className="entry-card">
          <h2>商城</h2>
          <p>商品目录、订单履约、店铺展示</p>
          <span className="entry-cta">进入商城 →</span>
        </Link>
        <Link href="/content/pages" className="entry-card">
          <h2>内容</h2>
          <p>页面、Hero、媒体与商品内容（自研入口；内部可桥接 CMS）</p>
          <span className="entry-cta">进入内容 →</span>
        </Link>
        <Link href="/changelog" className="entry-card">
          <h2>更新日志</h2>
          <p>后台与配置规范相关交付记录</p>
          <span className="entry-cta">查看日志 →</span>
        </Link>
      </section>

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
    </div>
  );
}
