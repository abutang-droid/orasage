import { MiniKit } from '@worldcoin/minikit-js';
import {
  COMMAND_VERSIONS,
  Command,
  ResponseEvent,
  WalletAuthError,
  sendMiniKitEvent,
} from '@worldcoin/minikit-js/commands';
import {
  worldAppId,
  worldAppUrl,
  worldAuthPublicUrl,
} from '../../../shared/world-minikit/config';

export type WorldSiweSession = {
  ok: true;
  token: string;
  user: {
    id: number;
    walletAddress?: string | null;
    nickname?: string;
    email?: string;
  };
};

function worldAuthEndpoints(authBaseUrl?: string): { nonceUrl: string; siweUrl: string } {
  // Prefer same-origin BFF on tarot (avoids CORS + keeps MiniKit on registered mini-app origin).
  if (!authBaseUrl && typeof window !== 'undefined') {
    return { nonceUrl: '/api/world/nonce', siweUrl: '/api/world/siwe' };
  }
  const authBase = (authBaseUrl || worldAuthPublicUrl()).replace(/\/$/, '');
  return {
    nonceUrl: `${authBase}/auth/world/nonce`,
    siweUrl: `${authBase}/auth/world/siwe`,
  };
}

async function reportWorldClientError(payload: Record<string, unknown>) {
  try {
    await fetch('/api/world/client-log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...payload,
        href: typeof window !== 'undefined' ? window.location.href : null,
        host: typeof window !== 'undefined' ? window.location.host : null,
        appId: worldAppId() || null,
        appUrl: worldAppUrl() || null,
        ts: new Date().toISOString(),
      }),
      keepalive: true,
    });
  } catch {
    /* ignore */
  }
}

/** ISO-8601 without milliseconds — World App is picky about SIWE timestamps. */
function isoNoMs(d: Date): string {
  return d.toISOString().replace(/\.\d{3}Z$/, 'Z');
}

/**
 * Build SIWE for wallet-auth using the Developer Portal App URL as URI/domain.
 *
 * MiniKit's default uses `window.location.href`, which often includes `?lang=`
 * / other query params and gets rejected as `malformed_request` even when the
 * portal App URL was updated correctly.
 */
function buildWalletAuthSiweMessage(opts: {
  nonce: string;
  statement?: string;
  appUrl: string;
}): string {
  const url = new URL(opts.appUrl);
  const scheme = url.protocol.replace(':', '') || 'https';
  const domain = url.host;
  // Exact portal App URL (no query/hash; no trailing slash on root).
  const uri = `${url.origin}${url.pathname === '/' ? '' : url.pathname.replace(/\/$/, '')}`;
  const issuedAt = isoNoMs(new Date());
  const expirationTime = isoNoMs(new Date(Date.now() + 60 * 60 * 1000));

  let siwe = `${scheme}://${domain} wants you to sign in with your Ethereum account:\n`;
  siwe += `{address}\n`;
  siwe += '\n';
  if (opts.statement) {
    siwe += `${opts.statement}\n`;
  }
  siwe += '\n';
  siwe += `URI: ${uri}\n`;
  siwe += `Version: 1\n`;
  siwe += `Chain ID: 480\n`;
  siwe += `Nonce: ${opts.nonce}\n`;
  siwe += `Issued At: ${issuedAt}\n`;
  siwe += `Expiration Time: ${expirationTime}\n`;
  return siwe;
}

type WalletAuthSuccess = {
  address: string;
  message: string;
  signature: string;
};

/**
 * Send a pre-built SIWE string via MiniKit (same wire format as MiniKit.walletAuth).
 */
async function walletAuthWithSiweMessage(siweMessage: string): Promise<WalletAuthSuccess> {
  return new Promise((resolve, reject) => {
    const onResponse = (response: {
      status?: string;
      address?: string;
      message?: string;
      signature?: string;
      error_code?: string;
      details?: string;
    }) => {
      MiniKit.unsubscribe(ResponseEvent.MiniAppWalletAuth);
      if (response?.status === 'error') {
        reject(
          new WalletAuthError(
            (response.error_code as 'malformed_request' | 'user_rejected' | 'generic_error') ||
              'generic_error',
            response.details,
          ),
        );
        return;
      }
      if (!response?.address || !response.message || !response.signature) {
        reject(new Error('World walletAuth returned an incomplete payload'));
        return;
      }
      resolve({
        address: response.address,
        message: response.message,
        signature: response.signature,
      });
    };

    MiniKit.subscribe(ResponseEvent.MiniAppWalletAuth, onResponse);
    try {
      sendMiniKitEvent({
        command: Command.WalletAuth,
        version: COMMAND_VERSIONS[Command.WalletAuth],
        payload: { siweMessage },
      });
    } catch (err) {
      MiniKit.unsubscribe(ResponseEvent.MiniAppWalletAuth);
      reject(err);
    }
  });
}

/**
 * Full World wallet login: nonce → MiniKit wallet-auth → auth-service SIWE verify + cookie.
 */
export async function signInWithWorldWallet(opts?: {
  statement?: string;
  authBaseUrl?: string;
}): Promise<WorldSiweSession> {
  const appId = worldAppId();
  const install = appId ? MiniKit.install(appId) : MiniKit.install();
  if (!install.success) {
    await reportWorldClientError({
      stage: 'install',
      errorCode: install.errorCode,
      errorMessage: install.errorMessage,
    });
    throw new Error(
      install.errorMessage || install.errorCode || 'WORLD_APP_REQUIRED',
    );
  }
  if (!MiniKit.isInstalled()) {
    throw new Error('WORLD_APP_REQUIRED');
  }

  const { nonceUrl, siweUrl } = worldAuthEndpoints(opts?.authBaseUrl);

  const nonceRes = await fetch(nonceUrl, {
    method: 'GET',
    credentials: 'include',
    cache: 'no-store',
  });
  if (!nonceRes.ok) {
    throw new Error('Failed to get World login nonce');
  }
  const { nonce } = (await nonceRes.json()) as { nonce: string };
  if (!nonce || nonce.length < 8 || !/^[a-zA-Z0-9]+$/.test(nonce)) {
    throw new Error('Invalid World login nonce');
  }

  const statement =
    opts?.statement || 'Sign in to OriCosmos with your World wallet';
  if (statement.includes('\n')) {
    throw new Error('Invalid World login statement');
  }

  const appUrl = worldAppUrl();
  const siweMessage = buildWalletAuthSiweMessage({ nonce, statement, appUrl });

  await reportWorldClientError({
    stage: 'walletAuth-request',
    appUrl,
    siwePreview: siweMessage.slice(0, 280),
    nonceLen: nonce.length,
  });

  let payload: WalletAuthSuccess;
  try {
    payload = await walletAuthWithSiweMessage(siweMessage);
  } catch (err) {
    const code =
      err && typeof err === 'object' && 'code' in err
        ? String((err as { code?: string }).code || '')
        : '';
    const details =
      err && typeof err === 'object' && 'details' in err
        ? (err as { details?: unknown }).details
        : undefined;
    await reportWorldClientError({
      stage: 'walletAuth',
      code,
      details,
      message: err instanceof Error ? err.message : String(err),
      appUrl,
      siwePreview: siweMessage.slice(0, 280),
    });
    if (code === 'user_rejected') {
      throw new Error('Sign-in was cancelled');
    }
    if (code === 'malformed_request') {
      throw new Error(
        'World rejected the login request (malformed_request). Confirm Developer Portal App URL is exactly https://tarot.oricosmos.com',
      );
    }
    if (code === 'generic_error') {
      throw new Error(
        'World wallet login failed. Confirm Developer Portal App URL is https://tarot.oricosmos.com',
      );
    }
    throw err instanceof Error ? err : new Error('World walletAuth failed');
  }

  let username: string | undefined;
  let profilePictureUrl: string | undefined;
  try {
    const meta = await MiniKit.getUserByAddress(payload.address);
    username = meta?.username || MiniKit.user?.username;
    profilePictureUrl = meta?.profilePictureUrl || MiniKit.user?.profilePictureUrl;
  } catch {
    username = MiniKit.user?.username;
    profilePictureUrl = MiniKit.user?.profilePictureUrl;
  }

  // Drop invalid avatar URLs so Zod on auth-service does not 400 the whole login.
  let safeAvatar: string | null = null;
  if (profilePictureUrl) {
    try {
      const u = new URL(profilePictureUrl);
      if (u.protocol === 'http:' || u.protocol === 'https:') safeAvatar = profilePictureUrl;
    } catch {
      safeAvatar = null;
    }
  }

  const completeRes = await fetch(siweUrl, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      payload: {
        address: payload.address,
        message: payload.message,
        signature: payload.signature,
      },
      nonce,
      statement,
      username,
      profilePictureUrl: safeAvatar,
    }),
  });
  const data = await completeRes.json().catch(() => ({}));
  if (!completeRes.ok) {
    throw new Error(
      typeof data.error === 'string' ? data.error : `World login failed (${completeRes.status})`,
    );
  }
  return data as WorldSiweSession;
}

export function isMiniKitInstalled(): boolean {
  try {
    return MiniKit.isInstalled();
  } catch {
    return false;
  }
}
