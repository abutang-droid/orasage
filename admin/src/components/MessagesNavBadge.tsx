'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export const MESSAGES_SEEN_KEY = 'orasage_admin_messages_seen';
export const MESSAGES_SEEN_EVENT = 'orasage-messages-seen';

/** 留言导航角标：显示上次查看留言页之后的新工单数。 */
export function MessagesNavBadge() {
  const [count, setCount] = useState(0);
  const seqRef = useRef(0);

  const refresh = useCallback(async () => {
    const seq = ++seqRef.current;
    try {
      const since = window.localStorage.getItem(MESSAGES_SEEN_KEY) ?? undefined;
      const query = since ? `?since=${encodeURIComponent(since)}` : '';
      const res = await fetch(`/api/contact-messages/new-count${query}`, { cache: 'no-store' });
      if (!res.ok) return;
      const data = (await res.json()) as { count?: number };
      if (seq !== seqRef.current) return;
      setCount(typeof data.count === 'number' ? data.count : 0);
    } catch {
      /* 网络失败时不显示角标 */
    }
  }, []);

  useEffect(() => {
    void refresh();
    const timer = window.setInterval(() => void refresh(), 60_000);
    const onSeen = () => {
      seqRef.current += 1;
      setCount(0);
      void refresh();
    };
    window.addEventListener(MESSAGES_SEEN_EVENT, onSeen);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener(MESSAGES_SEEN_EVENT, onSeen);
    };
  }, [refresh]);

  if (count <= 0) return null;
  return (
    <span className="admin-nav-badge" aria-label={`${count} 条新工单`}>
      {count > 99 ? '99+' : count}
    </span>
  );
}

/** 留言页挂载：标记已读并清除角标。 */
export function MarkMessagesSeen() {
  useEffect(() => {
    window.localStorage.setItem(MESSAGES_SEEN_KEY, new Date().toISOString());
    window.dispatchEvent(new Event(MESSAGES_SEEN_EVENT));
  }, []);
  return null;
}
