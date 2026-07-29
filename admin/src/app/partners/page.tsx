import { getAdminUser, loginUrl, staffCan } from '@/lib/auth';
import { listPartners } from '@/lib/api';
import { redirect } from 'next/navigation';

export default async function PartnersPage() {
  const user = await getAdminUser();
  if (!user || !staffCan(user, 'platform.partners')) redirect(loginUrl());

  let partners: Awaited<ReturnType<typeof listPartners>>['partners'] = [];
  let platformSlug = 'orasage';
  let currentPartnerId = user.partnerId ?? 'orasage';
  try {
    const data = await listPartners();
    partners = data.partners;
    platformSlug = data.platformSlug;
    currentPartnerId = data.currentPartnerId;
  } catch (err) {
    console.error('[admin/partners]', err);
  }

  return (
    <div className="admin-page">
      <header className="page-header">
        <h1>合作方</h1>
        <p className="muted">
          多租户：平台自营 slug 固定为 <code>{platformSlug}</code>。
          当前会话 partner：<code>{currentPartnerId}</code>。
          超管可用 API 查询参数 <code>?partner=</code> 切换作用域。
        </p>
      </header>
      <section className="panel">
        <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th align="left">slug</th>
              <th align="left">名称</th>
              <th align="left">状态</th>
              <th align="left">已开通模块</th>
            </tr>
          </thead>
          <tbody>
            {partners.length === 0 ? (
              <tr>
                <td colSpan={4} className="muted">暂无数据（请确认已跑 migration 0038）</td>
              </tr>
            ) : (
              partners.map((p) => (
                <tr key={p.slug}>
                  <td>
                    <code>{p.slug}</code>
                    {p.slug === platformSlug ? (
                      <span className="badge ok" style={{ marginLeft: 8 }}>平台</span>
                    ) : null}
                  </td>
                  <td>{p.name}</td>
                  <td>{p.status}</td>
                  <td className="muted" style={{ fontSize: '0.85rem' }}>
                    {p.modules.join(', ') || '—'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}
