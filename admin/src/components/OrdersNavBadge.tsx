'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export const ORDERS_SEEN_KEY = 'orasage_admin_orders_seen';
export const ORDERS_SEEN_EVENT = 'orasage-orders-seen';

/** 订单导航角标：显示上次查看订单页之后的新订单数（未看过则统计最近 24h）。 */
export function OrdersNavBadge() {
  const [count, setCount] = useState(0);
  const seqRef = useRef(0);

  const refresh = useCallback(async () => {
    const seq = ++seqRef.current;
    try {
      const since = window.localStorage.getItem(ORDERS_SEEN_KEY) ?? undefined;
      const query = since ? `?since=${encodeURIComponent(since)}` : '';
      const res = await fetch(`/api/orders/new-count${query}`, { cache: 'no-store' });
      if (!res.ok) return;
      const data = (await res.json()) as { count?: number };
      // 丢弃过期响应（已读事件后旧请求回包不应把角标置回）
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
    window.addEventListener(ORDERS_SEEN_EVENT, onSeen);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener(ORDERS_SEEN_EVENT, onSeen);
    };
  }, [refresh]);

  if (count <= 0) return null;
  return (
    <span className="admin-nav-badge" aria-label={`${count} 个新订单`}>
      {count > 99 ? '99+' : count}
    </span>
  );
}

/** 订单页挂载：标记已读并清除角标。 */
export function MarkOrdersSeen() {
  useEffect(() => {
    window.localStorage.setItem(ORDERS_SEEN_KEY, new Date().toISOString());
    window.dispatchEvent(new Event(ORDERS_SEEN_EVENT));
  }, []);
  return null;
}
