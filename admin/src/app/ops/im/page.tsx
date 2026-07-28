import { getStaffUser, loginUrl } from '@/lib/auth';
import { getChatConversations } from '@/lib/api';
import { redirect } from 'next/navigation';
import { ImConversationPanel } from '@/components/ImConversationPanel';

export default async function ImPage({
  searchParams,
}: {
  searchParams?: Promise<{ id?: string }>;
}) {
  const admin = await getStaffUser(['admin', 'shop_ops']);
  if (!admin) redirect(loginUrl());

  const sp = (await searchParams) ?? {};
  const selectedId = Number(sp.id) || undefined;

  let conversations: Awaited<ReturnType<typeof getChatConversations>>['conversations'] = [];
  try {
    ({ conversations } = await getChatConversations('open'));
  } catch (err) {
    console.error('[admin/im]', err);
  }

  const activeId = selectedId && conversations.some((c) => c.id === selectedId)
    ? selectedId
    : conversations[0]?.id;

  return (
    <div className="admin-page">
      <header className="page-header">
        <h1>在线客服</h1>
        <p className="muted">
          用户站内 IM ↔ Telegram 双向桥接 · 在 Telegram 中<strong>回复</strong>转发的用户消息即可回传到站内
        </p>
      </header>

      <section className="panel im-layout">
        <aside className="im-sidebar">
          <h2 className="im-sidebar-title">进行中会话</h2>
          {conversations.length === 0 ? (
            <p className="muted">暂无进行中的会话</p>
          ) : (
            <ul className="im-conv-list">
              {conversations.map((c) => (
                <li key={c.id}>
                  <a
                    href={`/im?id=${c.id}`}
                    className={`im-conv-item${activeId === c.id ? ' is-active' : ''}`}
                  >
                    <span className="im-conv-label">{c.userLabel}</span>
                    {c.unreadOps > 0 ? (
                      <span className="admin-nav-badge">{c.unreadOps > 99 ? '99+' : c.unreadOps}</span>
                    ) : null}
                    <span className="im-conv-preview">{c.lastBody ?? '—'}</span>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </aside>
        <div className="im-main">
          {activeId ? (
            <ImConversationPanel conversationId={activeId} />
          ) : (
            <p className="muted im-empty">选择左侧会话开始回复</p>
          )}
        </div>
      </section>
    </div>
  );
}
