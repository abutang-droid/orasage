'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export function ImNavBadge() {
  const [count, setCount] = useState(0);
  const seqRef = useRef(0);

  const refresh = useCallback(async () => {
    const seq = ++seqRef.current;
    try {
      const res = await fetch('/api/chat/unread-count', { cache: 'no-store' });
      if (!res.ok) return;
      const data = (await res.json()) as { count?: number };
      if (seq !== seqRef.current) return;
      setCount(typeof data.count === 'number' ? data.count : 0);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    void refresh();
    const timer = window.setInterval(() => void refresh(), 60_000);
    return () => window.clearInterval(timer);
  }, [refresh]);

  if (count <= 0) return null;
  return (
    <span className="admin-nav-badge" aria-label={`${count} 条未读 IM`}>
      {count > 99 ? '99+' : count}
    </span>
  );
}
