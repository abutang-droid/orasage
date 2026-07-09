'use client';

import { useState } from 'react';
import { AdminSubmitButton } from '@/components/AdminButton';

type ChannelStatus = {
  telegram: { configured: boolean; chatCount: number };
  email: { configured: boolean; recipientCount: number };
};

export function NotificationStatusPanel({
  channels,
  orderNotifyEvents,
}: {
  channels: ChannelStatus;
  orderNotifyEvents: string[];
}) {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onTest() {
    setMessage(null);
    setError(null);
    try {
      const res = await fetch('/api/notifications/test', { method: 'POST' });
      const data = (await res.json()) as { message?: string; error?: string };
      if (!res.ok) throw new Error(data.error || '发送失败');
      setMessage(data.message ?? '已发送');
    } catch (e) {
      setError(e instanceof Error ? e.message : '发送失败');
    }
  }

  return (
    <section className="panel" style={{ marginBottom: '1rem' }}>
      <h2 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>消息中枢 · 订单提醒通道</h2>
      <ul className="muted" style={{ margin: '0 0 0.75rem', paddingLeft: '1.25rem' }}>
        <li>
          Telegram：{channels.telegram.configured ? `已配置（${channels.telegram.chatCount} 个 chat）` : '未配置'}
        </li>
        <li>
          运营邮箱（Resend）：{channels.email.configured ? `已配置（${channels.email.recipientCount} 个收件人）` : '未配置'}
        </li>
        <li>订单事件：{orderNotifyEvents.join(', ') || '—'}</li>
      </ul>
      <p className="muted" style={{ marginBottom: '0.5rem' }}>
        在 VPS <code>auth-service/.env</code> 配置 <code>TELEGRAM_BOT_TOKEN</code>、<code>TELEGRAM_CHAT_ID</code>、<code>RESEND_API_KEY</code>、<code>ORDER_NOTIFY_EMAIL_TO</code> 后重启 auth。
      </p>
      <AdminSubmitButton type="button" size="sm" onClick={() => void onTest()}>
        发送测试通知
      </AdminSubmitButton>
      {message ? <p className="muted" style={{ marginTop: '0.5rem' }}>{message}</p> : null}
      {error ? <p style={{ marginTop: '0.5rem', color: 'var(--destructive, #c00)' }}>{error}</p> : null}
    </section>
  );
}
