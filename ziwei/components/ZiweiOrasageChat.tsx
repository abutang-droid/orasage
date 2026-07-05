'use client';

import { useEffect, useRef, useState } from 'react';
import { useT } from '@/lib/i18n';
import type { ZiweiChart } from '@/lib/ziwei/types';
import { loginUrl } from '@/lib/login-url';
import {
  fetchZiweiChatQuota,
  type ZiweiChatQuota,
} from '@/lib/ziwei-chat-client';
import { ZiweiChatPaywall } from '@/components/ZiweiChatPaywall';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

type Props = {
  chart: ZiweiChart;
  chartData?: unknown;
  mode?: 'single' | 'heming';
  readingId: string;
  loggedIn: boolean;
  onQuotaChange?: (quota: ZiweiChatQuota | null) => void;
};

export function ZiweiOrasageChat({
  chart,
  chartData,
  mode = 'single',
  readingId,
  loggedIn,
  onQuotaChange,
}: Props) {
  const t = useT();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [quota, setQuota] = useState<ZiweiChatQuota | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const PRESET_QUESTIONS = [
    t('chat.preset.overview'),
    t('chat.preset.love'),
    t('chat.preset.career'),
    t('chat.preset.daxian'),
    t('chat.preset.health'),
    t('chat.preset.liunian'),
  ];

  const refreshQuota = async () => {
    if (!loggedIn) {
      setQuota(null);
      onQuotaChange?.(null);
      return;
    }
    const q = await fetchZiweiChatQuota(readingId);
    setQuota(q);
    onQuotaChange?.(q);
    setShowPaywall(Boolean(q && q.requiresPayment));
  };

  useEffect(() => {
    void refreshQuota();
  }, [loggedIn, readingId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const quotaLabel = () => {
    if (!loggedIn) return '登录后赠送 5 次免费对话';
    if (!quota) return '加载额度…';
    if (quota.yearlyActive) return '年卡有效 · 无限问答';
    const parts: string[] = [];
    if (quota.freeRemaining > 0) parts.push(`本盘免费 ${quota.freeRemaining}/${quota.freePerReading}`);
    if (quota.packCredits > 0) parts.push(`加量余额 ${quota.packCredits}`);
    if (parts.length === 0) return '问答次数已用完';
    return parts.join(' · ');
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    if (!loggedIn) {
      window.location.href = loginUrl('/chart');
      return;
    }

    if (quota?.requiresPayment) {
      setShowPaywall(true);
      return;
    }

    setApiError('');
    const userMsg: Message = { role: 'user', content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/interpret', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          messages: newMessages,
          chartData: chartData ?? chart,
          mode,
          readingId,
        }),
      });

      if (res.status === 401) {
        window.location.href = loginUrl('/chart');
        return;
      }

      if (res.status === 402) {
        const errData = await res.json().catch(() => ({}));
        if (errData.quota) {
          setQuota(errData.quota);
          onQuotaChange?.(errData.quota);
        }
        setShowPaywall(true);
        setMessages(messages);
        return;
      }

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || '请求失败，请稍后再试');
      }

      const quotaHeader = res.headers.get('X-Ziwei-Quota');
      if (quotaHeader) {
        try {
          const nextQuota = JSON.parse(quotaHeader) as ZiweiChatQuota;
          setQuota(nextQuota);
          onQuotaChange?.(nextQuota);
          setShowPaywall(nextQuota.requiresPayment);
        } catch { /* ignore */ }
      } else {
        void refreshQuota();
      }

      if (!res.body) throw new Error('无响应流');
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let assistantText = '';
      setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        for (const line of chunk.split('\n')) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6).trim();
          if (data === '[DONE]') break;
          try {
            const parsed = JSON.parse(data);
            const delta = parsed.content ?? parsed.delta?.text ?? '';
            if (delta) {
              assistantText += delta;
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = { role: 'assistant', content: assistantText };
                return updated;
              });
            }
          } catch { /* ignore */ }
        }
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'AI 服务暂时不可用';
      setApiError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="ziwei-orasage-chat">
      <header className="ziwei-orasage-chat-header">
        <div>
          <h2 className="ziwei-section-title">Orasage 对话</h2>
          <p className="ziwei-orasage-chat-sub">{t('chat.subtitle')}</p>
        </div>
        <span className="ziwei-quota-badge">{quotaLabel()}</span>
      </header>

      {!loggedIn ? (
        <div className="ziwei-login-gate">
          <p>登录即可获赠 <strong>5 次</strong> 免费 Orasage 对话，基于你的命盘答疑解惑。</p>
          <a href={loginUrl('/chart')} className="ziwei-login-btn">
            注册 / 登录开始对话
          </a>
        </div>
      ) : (
        <>
          <div ref={scrollRef} className="ziwei-orasage-messages">
            {messages.length === 0 && (
              <p className="ziwei-brief-muted">{t('chat.empty')}</p>
            )}
            {messages.map((msg, i) => (
              <div
                key={i}
                className={msg.role === 'user' ? 'ziwei-msg ziwei-msg-user' : 'ziwei-msg ziwei-msg-ai'}
              >
                {msg.role === 'assistant' && <span className="ziwei-msg-label">Orasage</span>}
                <div>{msg.content}</div>
              </div>
            ))}
            {apiError ? <p className="ziwei-brief-error">{apiError}</p> : null}
          </div>

          {showPaywall ? (
            <ZiweiChatPaywall
              readingId={readingId}
              quota={quota}
              onPurchased={() => void refreshQuota()}
            />
          ) : (
            <>
              {messages.length === 0 && (
                <div className="ziwei-preset-grid">
                  {PRESET_QUESTIONS.map((q, i) => (
                    <button
                      key={i}
                      type="button"
                      className="ziwei-preset-btn"
                      disabled={loading}
                      onClick={() => void sendMessage(q)}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}
              <form
                className="ziwei-chat-input-row"
                onSubmit={(e) => {
                  e.preventDefault();
                  void sendMessage(input);
                }}
              >
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={t('insight.placeholder')}
                  disabled={loading}
                  className="ziwei-chat-input"
                />
                <button type="submit" disabled={loading || !input.trim()} className="ziwei-chat-send">
                  {loading ? '…' : '发送'}
                </button>
              </form>
            </>
          )}
        </>
      )}
    </section>
  );
}
