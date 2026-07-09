import { getStaffUser, loginUrl } from '@/lib/auth';
import { listAdminWallets } from '@/lib/api';
import { redirect } from 'next/navigation';

type Props = { searchParams: Promise<{ q?: string }> };

export default async function WalletsPage({ searchParams }: Props) {
  const admin = await getStaffUser(['admin']);
  if (!admin) redirect(loginUrl());

  const { q } = await searchParams;
  const query = (q ?? '').trim();

  let wallets: Awaited<ReturnType<typeof listAdminWallets>>['wallets'] = [];
  let total = 0;
  try {
    ({ wallets, total } = await listAdminWallets(query || undefined));
  } catch (err) {
    console.error('[admin/wallets]', err);
  }

  return (
    <div className="admin-page">
      <header className="page-header">
        <h1>用户钱包</h1>
        <p className="muted">7c 内部余额账本 · 前台暂不展示 · 仅超级管理员可见</p>
      </header>

      <section className="panel" style={{ marginBottom: '1rem' }}>
        <form method="get" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="邮箱 / 昵称 / displayId / 用户 ID"
            className="shipment-input"
            style={{ minWidth: '16rem' }}
          />
          <button type="submit" className="admin-btn">搜索</button>
          {query ? <a href="/wallets" className="muted">清除</a> : null}
        </form>
      </section>

      <section className="panel">
        <p className="muted" style={{ marginBottom: '0.75rem' }}>共 {total} 条钱包记录</p>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>用户</th>
                <th>币种</th>
                <th>余额</th>
                <th>更新时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {wallets.length === 0 ? (
                <tr><td colSpan={5} className="muted">暂无钱包记录{query ? '（可尝试其他关键词）' : ''}</td></tr>
              ) : wallets.map((w) => (
                <tr key={w.id}>
                  <td>
                    <div>{w.user.nickname || w.user.email}</div>
                    <code className="muted">{w.user.email}</code>
                    {w.user.displayId ? <div className="muted">ID {w.user.displayId}</div> : null}
                  </td>
                  <td>{w.currency}</td>
                  <td><strong>{w.balanceDisplay}</strong></td>
                  <td>{new Date(w.updatedAt).toLocaleString('zh-CN')}</td>
                  <td><a href={`/wallets/${w.userId}`}>详情 / 调整</a></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
