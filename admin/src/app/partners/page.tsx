import { getAdminUser, loginUrl, staffCan } from '@/lib/auth';
import { redirect } from 'next/navigation';

const PARTNERS = [
  {
    slug: 'orasage',
    name: 'OraSage 平台自营',
    status: 'active',
    modules: ['shop', 'billing', 'content', 'legal', 'app.bazi', 'app.ziwei', 'app.tarot', 'ops', 'analytics'],
  },
] as const;

export default async function PartnersPage() {
  const user = await getAdminUser();
  if (!user || !staffCan(user, 'platform.partners')) redirect(loginUrl());

  return (
    <div className="admin-page">
      <header className="page-header">
        <h1>合作方</h1>
        <p className="muted">
          多租户 day-1：平台自营 slug 固定为 <code>orasage</code>。本页为 Phase A 占位；Phase D 接入
          partners / partner_modules 表与隔离。
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
            {PARTNERS.map((p) => (
              <tr key={p.slug}>
                <td>
                  <code>{p.slug}</code>
                </td>
                <td>{p.name}</td>
                <td>{p.status}</td>
                <td className="muted" style={{ fontSize: '0.85rem' }}>
                  {p.modules.join(', ')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
