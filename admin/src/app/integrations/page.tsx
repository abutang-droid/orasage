import Link from 'next/link';
import { getAdminUser, loginUrl, staffCan } from '@/lib/auth';
import { getNotificationStatus } from '@/lib/api';
import { NotificationStatusPanel } from '@/components/NotificationStatusPanel';
import { redirect } from 'next/navigation';

export default async function IntegrationsPage() {
  const admin = await getAdminUser();
  if (!admin || !staffCan(admin, 'platform.integrations.read')) redirect(loginUrl());

  let notifyStatus: Awaited<ReturnType<typeof getNotificationStatus>> | null = null;
  try {
    notifyStatus = await getNotificationStatus();
  } catch (err) {
    console.error('[admin/integrations]', err);
  }

  const partnerId = notifyStatus?.partnerId ?? admin.partnerId ?? 'orasage';
  const platformScoped = notifyStatus?.platformScoped ?? partnerId === 'orasage';

  return (
    <div className="admin-page">
      <header className="page-header">
        <h1>集成状态</h1>
        <p className="muted">
          L3 密钥与通道仅展示「是否已配置」，不在后台编辑明文。当前 partner：
          <code>{partnerId}</code>
          {platformScoped ? '（平台租户 · 可读全局通道状态）' : '（合作方 · L3 不共享，状态恒为未配置）'}。
        </p>
      </header>

      {notifyStatus?.note ? (
        <p className="muted panel-notice">{notifyStatus.note}</p>
      ) : null}

      {notifyStatus ? (
        <NotificationStatusPanel
          channels={notifyStatus.channels}
          orderNotifyEvents={notifyStatus.orderNotifyEvents}
        />
      ) : (
        <p className="muted">暂时无法读取通知通道状态。</p>
      )}

      <section className="panel">
        <h2 style={{ fontSize: '1rem' }}>其它 L3（只读说明）</h2>
        <ul className="muted" style={{ margin: 0, paddingLeft: '1.25rem' }}>
          <li>JWT / Cookie Domain — 部署环境变量</li>
          <li>PAYMENT_MODE / Stripe — shop 环境变量</li>
          <li>AI（DeepSeek / Manus 等）— 各命理 App 环境变量</li>
        </ul>
        <p className="muted" style={{ marginTop: '0.75rem' }}>
          客服工单见 <Link href="/ops/messages">留言</Link>。
        </p>
      </section>
    </div>
  );
}
