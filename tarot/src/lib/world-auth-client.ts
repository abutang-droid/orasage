import { MiniKit } from '@worldcoin/minikit-js';
import type {
  CommandResultByVia,
  MiniKitWalletAuthOptions,
  WalletAuthResult,
} from '@worldcoin/minikit-js/commands';
import { worldAppId, worldAuthPublicUrl } from '../../../shared/world-minikit/config';

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
        ts: new Date().toISOString(),
      }),
      keepalive: true,
    });
  } catch {
    /* ignore */
  }
}

/**
 * Full World wallet login: nonce → MiniKit.walletAuth → auth-service SIWE verify + cookie.
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

  // MiniKit builds SIWE from window.location.href — strip query/hash so the URI
  // matches the Developer Portal app URL (https://tarot.oricosmos.com).
  const priorUrl =
    typeof window !== 'undefined'
      ? `${window.location.pathname}${window.location.search}${window.location.hash}`
      : '';
  if (typeof window !== 'undefined') {
    const clean = `${window.location.origin}${window.location.pathname || '/'}`;
    if (window.location.href !== clean) {
      window.history.replaceState({}, '', clean);
    }
  }

  // Match official minikit-js demo / next-15-template walletAuth options.
  const statement =
    opts?.statement ||
    `Authenticate (${typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID().replace(/-/g, '') : nonce}).`;
  const input = {
    nonce,
    statement,
    expirationTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    notBefore: new Date(Date.now() - 24 * 60 * 60 * 1000),
    fallback: async () => {
      throw new Error('WORLD_APP_REQUIRED');
    },
  } satisfies MiniKitWalletAuthOptions;

  let result: CommandResultByVia<WalletAuthResult>;
  try {
    result = await MiniKit.walletAuth(input);
  } catch (err) {
    if (typeof window !== 'undefined' && priorUrl) {
      window.history.replaceState({}, '', priorUrl);
    }
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
    });
    if (code === 'user_rejected') {
      throw new Error('Sign-in was cancelled');
    }
    if (code === 'malformed_request') {
      throw new Error('World rejected the login request (malformed_request)');
    }
    if (code === 'generic_error') {
      throw new Error(
        'World wallet login failed. Confirm Developer Portal App URL is https://tarot.oricosmos.com',
      );
    }
    throw err instanceof Error ? err : new Error('World walletAuth failed');
  }
  if (typeof window !== 'undefined' && priorUrl) {
    window.history.replaceState({}, '', priorUrl);
  }
  if (result.executedWith === 'fallback') {
    throw new Error('WORLD_APP_REQUIRED');
  }

  const payload = result.data as {
    address?: string;
    message?: string;
    signature?: string;
    status?: string;
    error_code?: string;
  };
  if (!payload?.address || !payload.message || !payload.signature) {
    throw new Error(
      payload?.error_code
        ? `World walletAuth error: ${payload.error_code}`
        : 'World walletAuth returned an incomplete payload',
    );
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
