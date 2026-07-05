'use client';

import { useEffect, useRef } from 'react';
import { useUser } from '@/lib/user';

const SESSION_KEY = 'tarot:reading-backfill';

function isGuestEmail(email?: string | null): boolean {
  return !email || email.endsWith('@manto.guest');
}

/** 登录用户进入塔罗 App 时，自动补同步未上传的占卜历史 */
export function ReadingSyncBackfill() {
  const { user, loading } = useUser();
  const ranRef = useRef(false);

  useEffect(() => {
    if (loading || ranRef.current || !user || isGuestEmail(user.email)) return;
    if (typeof window !== 'undefined' && sessionStorage.getItem(SESSION_KEY) === '1') return;

    ranRef.current = true;

    void (async () => {
      try {
        const res = await fetch('/api/readings/backfill', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        });
        if (!res.ok) return;
        const data = await res.json() as {
          remaining?: { daily: number; threeCard: number; legacy?: number };
        };
        const pending =
          (data.remaining?.daily ?? 0) +
          (data.remaining?.threeCard ?? 0) +
          (data.remaining?.legacy ?? 0);
        if (pending === 0) {
          sessionStorage.setItem(SESSION_KEY, '1');
        }
      } catch {
        /* silent */
      }
    })();
  }, [loading, user]);

  return null;
}
