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
        <p className="muted">左侧导航可在「运营」与「内容」之间切换；无需重复登录。</p>
      </header>

      <section className="entry-grid">
        <Link href="/analytics" className="entry-card">
          <h2>数据统计</h2>
          <p>用户、订单、测算与埋点趋势看板</p>
          <span className="entry-cta">进入统计 →</span>
        </Link>
        <Link href="/products" className="entry-card">
          <h2>运营管理</h2>
          <p>商品目录、订单履约、用户与测算统计</p>
          <span className="entry-cta">进入商品管理 →</span>
        </Link>
        <Link href="/cms/admin" className="entry-card">
          <h2>内容管理</h2>
          <p>全站 Hero、页面、媒体库与各 App 信息流（商品主图在「商品管理」中编辑）</p>
          <span className="entry-cta">进入 CMS →</span>
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
