export type ReadingSyncSource = 'bazi' | 'ziwei' | 'tarot';

export type ReadingSyncPayload = {
  appSource: ReadingSyncSource;
  readingId: string;
  title: string;
  summary?: string;
  recommendationReason?: string;
  crystalSku?: string;
};

const AUTH_URL =
  (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_AUTH_URL) ||
  (typeof import.meta !== 'undefined' && (import.meta as { env?: { VITE_AUTH_URL?: string } }).env?.VITE_AUTH_URL) ||
  'https://auth.orasage.com';

/** 登录用户完成占卜/排盘后同步到用户中心（未登录静默跳过） */
export async function syncReading(payload: ReadingSyncPayload): Promise<void> {
  if (!payload.readingId?.trim() || !payload.title?.trim()) return;
  try {
    const res = await fetch(`${AUTH_URL}/auth/me/readings/sync`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.status === 401) return;
    if (!res.ok) {
      console.warn('[reading-sync] failed:', res.status);
    }
  } catch (err) {
    console.warn('[reading-sync] error:', err);
  }
}

export function newReadingId(app: ReadingSyncSource): string {
  const rand = typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  return `${app}:${rand}`;
}

export const WUXING_CRYSTAL_SKU: Record<string, string> = {
  木: 'crystal-wood',
  火: 'crystal-fire',
  土: 'crystal-earth',
  金: 'crystal-metal',
  水: 'crystal-water',
};
