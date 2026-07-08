import { getAdminUser, loginUrl } from '@/lib/auth';
import { getContactMessages } from '@/lib/api';
import { updateContactMessageAction } from '@/app/actions';
import { redirect } from 'next/navigation';
import { AdminSubmitButton } from '@/components/AdminButton';

const STATUSES = [
  { value: 'new', label: '待处理' },
  { value: 'processing', label: '处理中' },
  { value: 'resolved', label: '已解决' },
] as const;

type Props = { searchParams: Promise<{ status?: string }> };

export default async function MessagesPage({ searchParams }: Props) {
  const admin = await getAdminUser();
  if (!admin) redirect(loginUrl());

  const { status } = await searchParams;
  const activeFilter = STATUSES.some((s) => s.value === status) ? status : undefined;

  let messages: Awaited<ReturnType<typeof getContactMessages>>['messages'] = [];
  try {
    ({ messages } = await getContactMessages(activeFilter));
  } catch (err) {
    console.error('[admin/messages]', err);
  }

  return (
    <div className="admin-page">
      <header className="page-header">
        <h1>用户留言</h1>
        <p className="muted">来自门户「联系我们」表单的留言工单 · 处理后更新状态并留备注</p>
      </header>

      <section className="panel">
        <nav className="muted" style={{ display: 'flex', gap: '1rem', marginBottom: '0.75rem' }} aria-label="状态筛选">
          <a href="/messages" style={!activeFilter ? { fontWeight: 600 } : undefined}>全部</a>
          {STATUSES.map((s) => (
            <a
              key={s.value}
              href={`/messages?status=${s.value}`}
              style={activeFilter === s.value ? { fontWeight: 600 } : undefined}
            >
              {s.label}
            </a>
          ))}
        </nav>

        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>时间</th>
                <th>姓名 / 邮箱</th>
                <th>主题与内容</th>
                <th>用户</th>
                <th>状态</th>
                <th>备注</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {messages.length === 0 ? (
                <tr><td colSpan={8} className="muted">暂无留言</td></tr>
              ) : messages.map((m) => (
                <tr key={m.id}>
                  <td>{m.id}</td>
                  <td>{new Date(m.createdAt).toLocaleString('zh-CN')}</td>
                  <td>
                    {m.name}
                    <br />
                    <a href={`mailto:${m.email}`}><code>{m.email}</code></a>
                  </td>
                  <td style={{ maxWidth: '28rem' }}>
                    {m.subject ? <strong>{m.subject}</strong> : null}
                    <p style={{ margin: '0.25rem 0', whiteSpace: 'pre-wrap' }}>{m.body}</p>
                    {m.locale ? <span className="muted">locale: {m.locale}</span> : null}
                  </td>
                  <td>{m.userId ?? <span className="muted">游客</span>}</td>
                  <td><span className="badge">{m.statusLabel}</span></td>
                  <td className="muted" style={{ maxWidth: '14rem', whiteSpace: 'pre-wrap' }}>
                    {m.adminNote || '—'}
                  </td>
                  <td>
                    <form action={updateContactMessageAction} className="inline-status-form" style={{ display: 'grid', gap: '0.35rem' }}>
                      <input type="hidden" name="id" value={m.id} />
                      <select name="status" defaultValue={m.status}>
                        {STATUSES.map((s) => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </select>
                      <input
                        type="text"
                        name="adminNote"
                        placeholder="处理备注"
                        defaultValue={m.adminNote ?? ''}
                        className="shipment-input"
                      />
                      <AdminSubmitButton size="sm">更新</AdminSubmitButton>
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
