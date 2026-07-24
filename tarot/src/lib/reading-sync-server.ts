import type { ReadingSyncPayload } from '../../../shared/reading-sync/sync';
import { ORASAGE_URLS } from '@/lib/orasage-app-shell/config';

const AUTH_URL =
  process.env.AUTH_URL ||
  process.env.NEXT_PUBLIC_AUTH_URL ||
  ORASAGE_URLS.authLogin.replace(/\/login$/, '');

/** 服务端将占卜记录同步到用户中心（需请求携带 orasage_token） */
export async function syncReadingFromServer(
  cookieHeader: string | null | undefined,
  payload: ReadingSyncPayload,
): Promise<string | null> {
  if (!cookieHeader?.includes('orasage_token')) return null;
  if (!payload.readingId?.trim() || !payload.title?.trim()) return null;

  try {
    const res = await fetch(`${AUTH_URL}/auth/me/readings/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookieHeader,
      },
      body: JSON.stringify(payload),
      cache: 'no-store',
    });
    if (res.status === 401) return null;
    if (!res.ok) {
      console.warn('[reading-sync-server] failed:', res.status);
      return null;
    }
    return payload.readingId;
  } catch (err) {
    console.warn('[reading-sync-server] error:', err);
    return null;
  }
}
