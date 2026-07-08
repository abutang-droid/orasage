'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from '@orasage/ui/button';
import { Input } from '@orasage/ui/input';
import { useT } from '@/lib/i18n';
import type { ZiweiChart } from '@/lib/ziwei/types';
import { loginUrl } from '@/lib/login-url';
import {
  fetchZiweiChatQuota,
  type ZiweiChatQuota,
} from '@/lib/ziwei-chat-client';
import { formatZiweiQuotaLabel } from '@/lib/quota-label';
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
  minorMode?: boolean;
  postPaidRefresh?: boolean;
  onQuotaChange?: (quota: ZiweiChatQuota | null) => void;
};

const ADULT_PRESET_KEYS = [
  'chat.preset.overview',
  'chat.preset.health',
  'chat.preset.career',
  'chat.preset.daxian',
  'chat.preset.liunian',
  'chat.preset.love',
] as const;

const MINOR_PRESET_KEYS = [
  'chat.preset.minor.overview',
  'chat.preset.minor.health',
  'chat.preset.minor.study',
  'chat.preset.minor.future',
] as const;

export function ZiweiOrasageChat({
  chart,
  chartData,
  mode = 'single',
  readingId,
  loggedIn,
  minorMode = false,
  postPaidRefresh = false,
  onQuotaChange,
}: Props) {
  const t = useT();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [quota, setQuota] = useState<ZiweiChatQuota | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);
  const [followUps, setFollowUps] = useState<string[]>([]);
  const [loadingFollowUps, setLoadingFollowUps] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const initialPresets = (minorMode ? MINOR_PRESET_KEYS : ADULT_PRESET_KEYS).map((k) => t(k));

  const refreshQuota = useCallback(async () => {
    if (!loggedIn) {
      setQuota(null);
      onQuotaChange?.(null);
      return;
    }
    const q = await fetchZiweiChatQuota(readingId);
    setQuota(q);
    onQuotaChange?.(q);
    setShowPaywall(Boolean(q && q.requiresPayment));
  }, [loggedIn, readingId, onQuotaChange]);

  const loadFollowUps = useCallback(async (history: Message[]) => {
    if (history.length === 0 || history[history.length - 1]?.role !== 'assistant') return;
    setLoadingFollowUps(true);
    try {
      const res = await fetch('/api/chat/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          messages: history,
          chartData: chartData ?? chart,
          mode,
          minorMode,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && Array.isArray(data.suggestions)) {
        setFollowUps(data.suggestions.filter((s: unknown) => typeof s === 'string').slice(0, 4));
      }
    } catch { /* ignore */ }
    finally {
      setLoadingFollowUps(false);
    }
  }, [chart, chartData, mode, minorMode]);

  useEffect(() => {
    void refreshQuota();
  }, [loggedIn, readingId, postPaidRefresh, refreshQuota]);

  useEffect(() => {
    if (postPaidRefresh && loggedIn) {
      void refreshQuota();
    }
  }, [postPaidRefresh, loggedIn, refreshQuota]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

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
    setFollowUps([]);
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
          minorMode,
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

      const finalHistory = [...newMessages, { role: 'assistant' as const, content: assistantText }];
      void loadFollowUps(finalHistory);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'AI 服务暂时不可用';
      setApiError(msg);
    } finally {
      setLoading(false);
    }
  };

  const quickQuestions = messages.length === 0 ? initialPresets : followUps;

  return (
    <section className="ziwei-orasage-chat">
      <header className="ziwei-orasage-chat-header">
        <div>
          <h2 className="ziwei-section-title">Orasage 对话</h2>
          <p className="ziwei-orasage-chat-sub">{t('chat.subtitle')}</p>
        </div>
        <span className="ziwei-quota-badge">{formatZiweiQuotaLabel(quota, loggedIn)}</span>
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
              {quickQuestions.length > 0 && !loading ? (
                <div className="ziwei-preset-grid">
                  {loadingFollowUps ? (
                    <p className="ziwei-brief-muted ziwei-preset-loading">正在生成追问建议…</p>
                  ) : null}
                  {quickQuestions.map((q, i) => (
                    <Button
                      key={`${q}-${i}`}
                      type="button"
                      variant="outline"
                      size="sm"
                      className="ziwei-preset-btn h-auto justify-start whitespace-normal font-normal"
                      disabled={loading || loadingFollowUps}
                      onClick={() => void sendMessage(q)}
                    >
                      {q}
                    </Button>
                  ))}
                </div>
              ) : null}
              <form
                className="ziwei-chat-input-row"
                onSubmit={(e) => {
                  e.preventDefault();
                  void sendMessage(input);
                }}
              >
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={minorMode ? t('chat.placeholder.minor') : t('insight.placeholder')}
                  disabled={loading}
                  className="ziwei-chat-input h-auto min-h-0 flex-1 shadow-none"
                />
                <Button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="ziwei-chat-send"
                >
                  {loading ? '…' : '发送'}
                </Button>
              </form>
            </>
          )}
        </>
      )}
    </section>
  );
}
