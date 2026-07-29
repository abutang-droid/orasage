import { getAdminUser, loginUrl, staffCan } from '@/lib/auth';
import { CMS_BRIDGE } from '@/lib/content-bridge';
import { redirect } from 'next/navigation';

export default async function LegalAgreementsPage() {
  const user = await getAdminUser();
  if (!user) redirect(loginUrl());
  if (!staffCan(user, 'legal.agreements') && user.role !== 'admin') {
    redirect('/');
  }

  return (
    <div className="admin-page">
      <header className="page-header">
        <h1>协议管理</h1>
        <p className="muted">
          合规模块 <code>legal.agreements</code>：隐私 / 服务 / 商品协议等。Phase A 桥接 CMS 页面集合；注册与结账同意流依赖此内容。
        </p>
      </header>
      <section className="panel">
        <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
          <li>
            <a href={`${CMS_BRIDGE.pages}?where[slug][contains]=legal`}>打开 CMS 页面集合 →</a>
          </li>
          <li className="muted" style={{ marginTop: '0.75rem' }}>
            建议 slug：<code>legal/privacy</code>、<code>legal/terms</code>、商品协议等（以线上 CMS 实际为准）。
          </li>
        </ul>
      </section>
    </div>
  );
}
