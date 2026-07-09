'use client';

import { useCallback, useEffect, useState, useTransition } from 'react';
import type { AdminChatMessage } from '@/lib/api';
import { sendImReplyAction } from '@/app/im-actions';
import { AdminSubmitButton } from '@/components/AdminButton';

type Props = {
  conversationId: number;
};

function formatTime(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
}

export function ImConversationPanel({ conversationId }: Props) {
  const [messages, setMessages] = useState<AdminChatMessage[]>([]);
  const [body, setBody] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/chat/conversations/${conversationId}/messages`, { cache: 'no-store' });
      if (!res.ok) return;
      const data = (await res.json()) as { messages: AdminChatMessage[] };
      setMessages(data.messages ?? []);
    } catch {
      /* ignore */
    }
  }, [conversationId]);

  useEffect(() => {
    void load();
    const timer = window.setInterval(() => void load(), 5000);
    return () => window.clearInterval(timer);
  }, [load]);

  return (
    <div className="im-thread">
      <div className="im-messages">
        {messages.length === 0 ? (
          <p className="muted">暂无消息</p>
        ) : (
          messages.map((m) => (
            <div key={m.id} className={`im-bubble im-bubble--${m.direction}`}>
              <div className="im-bubble-body">{m.body}</div>
              <div className="im-bubble-meta">{formatTime(m.createdAt)}</div>
            </div>
          ))
        )}
      </div>
      <form
        className="im-compose"
        onSubmit={(e) => {
          e.preventDefault();
          setError(null);
          startTransition(async () => {
            const result = await sendImReplyAction(conversationId, body);
            if (!result.ok) {
              setError(result.error);
              return;
            }
            setBody('');
            await load();
          });
        }}
      >
        <textarea
          className="im-compose-input"
          rows={3}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="回复用户（也可在 Telegram 回复转发消息）"
          maxLength={2000}
        />
        {error ? <p className="muted" style={{ color: '#b91c1c' }}>{error}</p> : null}
        <AdminSubmitButton type="submit" disabled={pending || !body.trim()}>
          {pending ? '发送中…' : '发送'}
        </AdminSubmitButton>
      </form>
    </div>
  );
}
