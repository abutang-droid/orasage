'use client';

import { MessageCircle, X } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { useCallback, useEffect, useId, useRef, useState } from 'react';

const AUTH_URL = process.env.NEXT_PUBLIC_AUTH_URL || 'https://auth.orasage.com';

type ChatMessage = {
  id: number;
  direction: 'user' | 'ops';
  body: string;
  createdAt: string;
};

export function LiveChatWidget() {
  const [open, setOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const afterIdRef = useRef(0);
  const listRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descId = useId();

  const authFetch = useCallback(async (path: string, init?: RequestInit) => {
    return fetch(`${AUTH_URL}${path}`, {
      ...init,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(init?.headers ?? {}),
      },
    });
  }, []);

  const loadMessages = useCallback(async () => {
    const afterId = afterIdRef.current;
    const qs = afterId > 0 ? `?afterId=${afterId}` : '';
    const res = await authFetch(`/auth/me/chat/messages${qs}`);
    if (res.status === 401) {
      setLoggedIn(false);
      return;
    }
    if (!res.ok) return;
    setLoggedIn(true);
    const data = (await res.json()) as { messages: ChatMessage[] };
    const incoming = data.messages ?? [];
    if (incoming.length > 0) {
      afterIdRef.current = incoming[incoming.length - 1]!.id;
      setMessages((prev) => {
        const merged = [...prev];
        for (const m of incoming) {
          if (!merged.some((x) => x.id === m.id)) merged.push(m);
        }
        return merged;
      });
    }
  }, [authFetch]);

  useEffect(() => {
    void authFetch('/auth/me').then((res) => setLoggedIn(res.ok));
  }, [authFetch]);

  useEffect(() => {
    if (!open || !loggedIn) return;
    void loadMessages();
    const timer = window.setInterval(() => void loadMessages(), 4000);
    return () => window.clearInterval(timer);
  }, [open, loggedIn, loadMessages]);

  useEffect(() => {
    if (!open) return;
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages, open]);

  const loginHref = `${AUTH_URL}/login?redirect=${encodeURIComponent(
    typeof window !== 'undefined' ? window.location.href : 'https://orasage.com',
  )}`;

  return (
    <Dialog.Root open={open} onOpenChange={setOpen} modal={false}>
      <div className={`live-chat-root${open ? ' is-open' : ''}`}>
        {open ? (
          <Dialog.Content
            className="live-chat-panel"
            aria-labelledby={titleId}
            aria-describedby={descId}
            onInteractOutside={(e) => e.preventDefault()}
            onPointerDownOutside={(e) => e.preventDefault()}
            onOpenAutoFocus={(e) => {
              // 非模态：聚焦可见标题区域的关闭按钮
              e.preventDefault();
              const closeBtn = (e.currentTarget as HTMLElement).querySelector<HTMLElement>(
                '.live-chat-close',
              );
              closeBtn?.focus();
            }}
          >
            <header className="live-chat-header">
              <Dialog.Title id={titleId} className="live-chat-title">
                在线客服
              </Dialog.Title>
              <Dialog.Description id={descId} className="sr-only">
                {loggedIn ? '与客服对话。Esc 可关闭。' : '请先登录后使用在线客服。'}
              </Dialog.Description>
              <Dialog.Close type="button" className="live-chat-close" aria-label="关闭">
                <X size={18} aria-hidden />
              </Dialog.Close>
            </header>
            {!loggedIn ? (
              <div className="live-chat-body live-chat-login">
                <p>请先登录后使用在线客服。</p>
                <a className="btn-text" href={loginHref}>
                  去登录
                </a>
              </div>
            ) : (
              <>
                <div className="live-chat-body" ref={listRef}>
                  {messages.length === 0 ? (
                    <p className="live-chat-hint">你好，有什么可以帮你？</p>
                  ) : (
                    messages.map((m) => (
                      <div key={m.id} className={`live-chat-bubble live-chat-bubble--${m.direction}`}>
                        {m.body}
                      </div>
                    ))
                  )}
                </div>
                {sendError ? (
                  <p className="live-chat-error" role="status" aria-live="polite">
                    {sendError}
                  </p>
                ) : null}
                <form
                  className="live-chat-compose"
                  aria-busy={sending || undefined}
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const text = body.trim();
                    if (!text || sending) return;
                    setSending(true);
                    setSendError(null);
                    try {
                      const res = await authFetch('/auth/me/chat/messages', {
                        method: 'POST',
                        body: JSON.stringify({ body: text }),
                      });
                      if (res.ok) {
                        setBody('');
                        afterIdRef.current = 0;
                        setMessages([]);
                        await loadMessages();
                      } else {
                        setSendError('发送失败，请重试');
                      }
                    } catch {
                      setSendError('发送失败，请重试');
                    } finally {
                      setSending(false);
                    }
                  }}
                >
                  <input
                    className="live-chat-input"
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="输入消息…"
                    maxLength={2000}
                    disabled={sending}
                    aria-label="消息内容"
                  />
                  <button
                    type="submit"
                    className="live-chat-send"
                    disabled={sending || !body.trim()}
                    aria-busy={sending || undefined}
                  >
                    {sending ? '发送中…' : '发送'}
                  </button>
                </form>
              </>
            )}
          </Dialog.Content>
        ) : null}

        <Dialog.Trigger asChild>
          <button
            type="button"
            className="live-chat-fab"
            aria-label={open ? '收起客服' : '在线客服'}
            aria-expanded={open}
            aria-haspopup="dialog"
          >
            {open ? <X size={22} aria-hidden /> : <MessageCircle size={22} aria-hidden />}
          </button>
        </Dialog.Trigger>
      </div>
    </Dialog.Root>
  );
}
