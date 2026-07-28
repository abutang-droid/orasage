import Link from 'next/link';
import { getAdminUser, loginUrl } from '@/lib/auth';
import { getNotificationStatus } from '@/lib/api';
import { NotificationStatusPanel } from '@/components/NotificationStatusPanel';
import { redirect } from 'next/navigation';

export default async function IntegrationsPage() {
  const admin = await getAdminUser();
  if (!admin) redirect(loginUrl());

  let notifyStatus: Awaited<ReturnType<typeof getNotificationStatus>> | null = null;
  try {
    notifyStatus = await getNotificationStatus();
  } catch (err) {
    console.error('[admin/integrations]', err);
  }

  return (
    <div className="admin-page">
      <header className="page-header">
        <h1>集成状态</h1>
        <p className="muted">
          L3 密钥与通道仅展示「是否已配置」，不在后台编辑明文。partner 作用域：
          <code>orasage</code>（单租户）。支付模式 / Stripe / AI Key 等亦属 L3，后续可扩展只读探测。
        </p>
      </header>

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
