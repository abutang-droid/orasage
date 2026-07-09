import { getAdminUser, loginUrl } from '@/lib/auth';
import { getContactMessages, getNotificationStatus } from '@/lib/api';
import { updateContactMessageAction } from '@/app/actions';
import { redirect } from 'next/navigation';
import { AdminSubmitButton } from '@/components/AdminButton';
import { MarkMessagesSeen } from '@/components/MessagesNavBadge';
import { NotificationStatusPanel } from '@/components/NotificationStatusPanel';

const STATUSES = [
  { value: 'new', label: '待处理' },
  { value: 'processing', label: '处理中' },
  { value: 'resolved', label: '已解决' },
] as const;

const CATEGORIES = [
  { value: 'general', label: '一般咨询' },
  { value: 'complaint', label: '投诉' },
  { value: 'refund', label: '退款' },
  { value: 'bug', label: '问题反馈' },
] as const;

type Props = { searchParams: Promise<{ status?: string; category?: string }> };

export default async function MessagesPage({ searchParams }: Props) {
  const admin = await getAdminUser();
  if (!admin) redirect(loginUrl());

  const { status, category } = await searchParams;
  const activeStatus = STATUSES.some((s) => s.value === status) ? status : undefined;
  const activeCategory = CATEGORIES.some((c) => c.value === category) ? category : undefined;

  let messages: Awaited<ReturnType<typeof getContactMessages>>['messages'] = [];
  let notifyStatus: Awaited<ReturnType<typeof getNotificationStatus>> | null = null;
  try {
    [{ messages }, notifyStatus] = await Promise.all([
      getContactMessages(activeStatus, activeCategory),
      getNotificationStatus(),
    ]);
  } catch (err) {
    console.error('[admin/messages]', err);
  }

  function filterHref(next: { status?: string; category?: string }) {
    const params = new URLSearchParams();
    const s = next.status ?? activeStatus;
    const c = next.category ?? activeCategory;
    if (s) params.set('status', s);
    if (c) params.set('category', c);
    const q = params.toString();
    return q ? `/messages?${q}` : '/messages';
  }

  return (
    <div className="admin-page">
      <MarkMessagesSeen />
      <header className="page-header">
        <h1>用户工单</h1>
        <p className="muted">联系表单 / 投诉退款工单 · 内部备注 + 用户可见回复（回复将邮件通知用户）</p>
      </header>

      {notifyStatus ? (
        <NotificationStatusPanel
          channels={notifyStatus.channels}
          orderNotifyEvents={notifyStatus.orderNotifyEvents}
        />
      ) : null}

      <section className="panel">
        <nav className="muted" style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '0.75rem' }} aria-label="状态筛选">
          <span>状态：</span>
          <a href={filterHref({ status: undefined })} style={!activeStatus ? { fontWeight: 600 } : undefined}>全部</a>
          {STATUSES.map((s) => (
            <a
              key={s.value}
              href={filterHref({ status: s.value })}
              style={activeStatus === s.value ? { fontWeight: 600 } : undefined}
            >
              {s.label}
            </a>
          ))}
        </nav>
        <nav className="muted" style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '0.75rem' }} aria-label="分类筛选">
          <span>分类：</span>
          <a href={filterHref({ category: undefined })} style={!activeCategory ? { fontWeight: 600 } : undefined}>全部</a>
          {CATEGORIES.map((c) => (
            <a
              key={c.value}
              href={filterHref({ category: c.value })}
              style={activeCategory === c.value ? { fontWeight: 600 } : undefined}
            >
              {c.label}
            </a>
          ))}
        </nav>

        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>时间</th>
                <th>分类</th>
                <th>姓名 / 邮箱</th>
                <th>主题与内容</th>
                <th>订单</th>
                <th>用户</th>
                <th>状态</th>
                <th>处理</th>
              </tr>
            </thead>
            <tbody>
              {messages.length === 0 ? (
                <tr><td colSpan={9} className="muted">暂无工单</td></tr>
              ) : messages.map((m) => (
                <tr key={m.id}>
                  <td>{m.id}</td>
                  <td>{new Date(m.createdAt).toLocaleString('zh-CN')}</td>
                  <td><span className="badge">{m.categoryLabel}</span></td>
                  <td>
                    {m.name}
                    <br />
                    <a href={`mailto:${m.email}`}><code>{m.email}</code></a>
                  </td>
                  <td style={{ maxWidth: '24rem' }}>
                    {m.subject ? <strong>{m.subject}</strong> : null}
                    <p style={{ margin: '0.25rem 0', whiteSpace: 'pre-wrap' }}>{m.body}</p>
                    {m.locale ? <span className="muted">locale: {m.locale}</span> : null}
                  </td>
                  <td>{m.orderNo ? <code>{m.orderNo}</code> : <span className="muted">—</span>}</td>
                  <td>{m.userId ?? <span className="muted">游客</span>}</td>
                  <td><span className="badge">{m.statusLabel}</span></td>
                  <td>
                    <form action={updateContactMessageAction} className="inline-status-form" style={{ display: 'grid', gap: '0.35rem', minWidth: '14rem' }}>
                      <input type="hidden" name="id" value={m.id} />
                      <select name="status" defaultValue={m.status}>
                        {STATUSES.map((s) => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </select>
                      <textarea
                        name="adminReply"
                        placeholder="用户可见回复（保存后邮件通知）"
                        defaultValue={m.adminReply ?? ''}
                        rows={3}
                        className="shipment-input"
                      />
                      <input
                        type="text"
                        name="adminNote"
                        placeholder="内部备注（用户不可见）"
                        defaultValue={m.adminNote ?? ''}
                        className="shipment-input"
                      />
                      <AdminSubmitButton size="sm">保存</AdminSubmitButton>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
