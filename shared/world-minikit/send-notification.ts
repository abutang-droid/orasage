/**
 * World Developer Portal — Send Notification
 * https://docs.world.org/api-reference/developer-portal/send-notification
 * https://docs.world.org/mini-apps/commands/how-to-send-notifications
 */

import { resolveDevPortalApiKey } from './get-transaction';
import { worldAppId } from './config';

const PRIMARY_URL = 'https://developer.world.org/api/v2/minikit/send-notification';
const LEGACY_URL = 'https://developer.worldcoin.org/api/v2/minikit/send-notification';

export type WorldNotificationLocalisation = {
  language: string;
  title: string;
  message: string;
};

export type SendWorldNotificationInput = {
  walletAddresses: string[];
  /** Deep link into the mini app (worldapp://mini-app?app_id=…&path=…) */
  miniAppPath: string;
  title?: string;
  message?: string;
  localisations?: WorldNotificationLocalisation[];
  appId?: string;
  apiKey?: string;
};

export type SendWorldNotificationResultItem = {
  walletAddress?: string;
  sent?: boolean;
  reason?: string;
};

export type SendWorldNotificationResult =
  | {
      ok: true;
      success: boolean;
      status?: number;
      result: SendWorldNotificationResultItem[];
    }
  | {
      ok: false;
      status: number;
      body: unknown;
      skipped?: boolean;
    };

function normalizeWallet(addr: string): string | null {
  const a = addr.trim().toLowerCase();
  if (!/^0x[a-f0-9]{40}$/.test(a)) return null;
  return a;
}

export function buildWorldMiniAppPath(opts?: {
  appId?: string;
  path?: string;
}): string {
  const appId = (opts?.appId || worldAppId() || '').trim();
  const path = (opts?.path || '/').startsWith('/')
    ? opts?.path || '/'
    : `/${opts?.path || ''}`;
  return `worldapp://mini-app?app_id=${encodeURIComponent(appId)}&path=${encodeURIComponent(path)}`;
}

/**
 * Send a push notification to opted-in World App users.
 * Requires Developer Portal API key (Bearer) + notifications enabled in portal/app.
 */
export async function sendWorldNotification(
  input: SendWorldNotificationInput,
  env: NodeJS.ProcessEnv = process.env,
): Promise<SendWorldNotificationResult> {
  const appId = (input.appId || worldAppId(env) || env.WORLD_APP_ID || '').trim();
  const apiKey = (input.apiKey || resolveDevPortalApiKey(env)).trim();
  const wallets = [...new Set(input.walletAddresses.map(normalizeWallet).filter(Boolean))] as string[];

  if (!appId) {
    return { ok: false, status: 503, body: { error: 'WORLD_APP_ID missing' }, skipped: true };
  }
  if (!apiKey) {
    return {
      ok: false,
      status: 503,
      body: {
        error:
          'DEV_PORTAL_API_KEY missing or looks like RP signing key — required for send-notification',
      },
      skipped: true,
    };
  }
  if (wallets.length === 0) {
    return { ok: false, status: 400, body: { error: 'No valid wallet addresses' }, skipped: true };
  }

  const title = (input.title || '').slice(0, 30);
  const message = (input.message || '').slice(0, 200);
  const body: Record<string, unknown> = {
    app_id: appId,
    wallet_addresses: wallets,
    mini_app_path: input.miniAppPath,
  };
  if (input.localisations?.length) {
    body.localisations = input.localisations.map((l) => ({
      language: l.language,
      title: l.title.slice(0, 30),
      message: l.message.slice(0, 200),
    }));
  } else {
    body.title = title || 'Payment received';
    body.message = message || 'Your transaction is complete!';
  }

  const headers = {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  };

  let res: Response | null = null;
  for (const url of [PRIMARY_URL, LEGACY_URL]) {
    try {
      res = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
        cache: 'no-store',
      });
      break;
    } catch (err) {
      console.error('[world/send-notification] fetch error', url, err);
      res = null;
    }
  }
  if (!res) {
    return { ok: false, status: 502, body: { error: 'World notification API unreachable' } };
  }

  const json = (await res.json().catch(() => ({}))) as {
    success?: boolean;
    status?: number;
    result?: SendWorldNotificationResultItem[];
  };
  if (!res.ok) {
    return { ok: false, status: res.status, body: json };
  }
  return {
    ok: true,
    success: Boolean(json.success),
    status: json.status,
    result: Array.isArray(json.result) ? json.result : [],
  };
}

/** Best-effort post-purchase notification (never throws). */
export async function notifyWorldPaymentComplete(opts: {
  walletAddress?: string | null;
  orderNo: string;
  title?: string;
  message?: string;
  path?: string;
  env?: NodeJS.ProcessEnv;
}): Promise<SendWorldNotificationResult | null> {
  const wallet = opts.walletAddress?.trim();
  if (!wallet) {
    console.warn('[world/send-notification] skip: no wallet address for', opts.orderNo);
    return null;
  }
  const env = opts.env || process.env;
  const appId = worldAppId(env) || env.WORLD_APP_ID || '';
  const result = await sendWorldNotification(
    {
      appId,
      walletAddresses: [wallet],
      miniAppPath: buildWorldMiniAppPath({ appId, path: opts.path || '/' }),
      localisations: [
        {
          language: 'en',
          title: (opts.title || 'Payment complete').slice(0, 30),
          message: (
            opts.message ||
            `Hey \${username}, order ${opts.orderNo} is paid. Tap to open OriCosmos.`
          ).slice(0, 200),
        },
        {
          language: 'zh',
          title: (opts.title || '支付成功').slice(0, 30),
          message: (
            opts.message ||
            `\${username}，订单 ${opts.orderNo} 已支付成功，点此打开 OriCosmos。`
          ).slice(0, 200),
        },
      ],
    },
    env,
  );
  if (!result.ok) {
    console.warn('[world/send-notification] failed', opts.orderNo, result.status, result.body);
  } else {
    console.info(
      '[world/send-notification] ok',
      opts.orderNo,
      result.result?.map((r) => `${r.walletAddress}:${r.sent}:${r.reason || ''}`).join(','),
    );
  }
  return result;
}
