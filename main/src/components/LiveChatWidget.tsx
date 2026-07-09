'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

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
  const afterIdRef = useRef(0);
  const listRef = useRef<HTMLDivElement>(null);

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

  if (!loggedIn && !open) {
    return (
      <button
        type="button"
        className="live-chat-fab"
        aria-label="在线客服"
        onClick={() => setOpen(true)}
      >
        💬
      </button>
    );
  }

  return (
    <div className={`live-chat-root${open ? ' is-open' : ''}`}>
      {open ? (
        <div className="live-chat-panel" role="dialog" aria-label="在线客服">
          <header className="live-chat-header">
            <strong>在线客服</strong>
            <button type="button" className="live-chat-close" onClick={() => setOpen(false)} aria-label="关闭">
              ×
            </button>
          </header>
          {!loggedIn ? (
            <div className="live-chat-body live-chat-login">
              <p>请先登录后使用在线客服。</p>
              <a className="btn-text" href={`${AUTH_URL}/login?redirect=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : 'https://orasage.com')}`}>
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
              <form
                className="live-chat-compose"
                onSubmit={async (e) => {
                  e.preventDefault();
                  const text = body.trim();
                  if (!text || sending) return;
                  setSending(true);
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
                    }
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
                />
                <button type="submit" className="live-chat-send" disabled={sending || !body.trim()}>
                  发送
                </button>
              </form>
            </>
          )}
        </div>
      ) : null}
      <button
        type="button"
        className="live-chat-fab"
        aria-label={open ? '收起客服' : '在线客服'}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? '×' : '💬'}
      </button>
    </div>
  );
}
