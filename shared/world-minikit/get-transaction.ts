/**
 * World Developer Portal — Get Transaction
 * https://docs.world.org/api-reference/developer-portal/get-transaction
 */

export type WorldMiniKitTransactionStatus = 'pending' | 'mined' | 'failed' | string;

export type WorldMiniKitTransaction = {
  reference?: string;
  transaction_hash?: string;
  transaction_status?: WorldMiniKitTransactionStatus;
  from?: string;
  chain?: string;
  timestamp?: string;
  token_amount?: string;
  token?: string;
  to?: string;
  app_id?: string;
};

const PRIMARY_BASE = 'https://developer.world.org';
const LEGACY_BASE = 'https://developer.worldcoin.org';

/** Hex secp256k1 private keys must not be sent as Bearer Dev Portal API keys. */
export function isLikelyRpSigningKey(raw: string): boolean {
  return /^0x?[0-9a-fA-F]{64}$/.test(raw.trim());
}

export function resolveDevPortalApiKey(
  env: NodeJS.ProcessEnv = process.env,
): string {
  const raw = (env.DEV_PORTAL_API_KEY || env.WORLD_DEV_PORTAL_API_KEY || '').trim();
  if (!raw || isLikelyRpSigningKey(raw)) return '';
  return raw;
}

export async function fetchWorldMiniKitTransaction(opts: {
  transactionId: string;
  appId: string;
  apiKey?: string;
  type?: 'payment' | 'transaction';
  /** Poll while status is pending (World chain confirmation lag). */
  maxAttempts?: number;
  delayMs?: number;
}): Promise<{ ok: true; tx: WorldMiniKitTransaction } | { ok: false; status: number; body: unknown }> {
  const type = opts.type || 'payment';
  const maxAttempts = Math.max(1, opts.maxAttempts ?? 4);
  const delayMs = opts.delayMs ?? 1500;
  const path =
    `/api/v2/minikit/transaction/${encodeURIComponent(opts.transactionId)}` +
    `?app_id=${encodeURIComponent(opts.appId)}&type=${encodeURIComponent(type)}`;

  const headers: Record<string, string> = {};
  if (opts.apiKey) {
    headers.Authorization = `Bearer ${opts.apiKey}`;
  }

  let lastStatus = 0;
  let lastBody: unknown = {};

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    // Prefer primary domain; fall back to legacy once if DNS/HTTP fails hard.
    let res: Response | null = null;
    for (const base of [PRIMARY_BASE, LEGACY_BASE]) {
      try {
        res = await fetch(`${base}${path}`, { method: 'GET', headers, cache: 'no-store' });
        break;
      } catch (err) {
        console.error('[world/get-transaction] fetch error', base, err);
        res = null;
      }
    }
    if (!res) {
      return { ok: false, status: 502, body: { error: 'World Developer API unreachable' } };
    }

    lastStatus = res.status;
    lastBody = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { ok: false, status: res.status, body: lastBody };
    }

    const tx = lastBody as WorldMiniKitTransaction;
    const status = String(tx.transaction_status || '').toLowerCase();
    if (status !== 'pending' || attempt === maxAttempts - 1) {
      return { ok: true, tx };
    }
    await new Promise((r) => setTimeout(r, delayMs));
  }

  return { ok: false, status: lastStatus || 502, body: lastBody };
}
