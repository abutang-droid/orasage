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

/**
 * Full World wallet login: nonce → MiniKit.walletAuth → auth-service SIWE verify + cookie.
 */
export async function signInWithWorldWallet(opts?: {
  statement?: string;
  authBaseUrl?: string;
}): Promise<WorldSiweSession> {
  const appId = worldAppId();
  if (appId) {
    MiniKit.install(appId);
  } else {
    MiniKit.install();
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
  if (!nonce || nonce.length < 8) {
    throw new Error('Invalid World login nonce');
  }

  const statement = opts?.statement || 'Sign in to OriCosmos with your World wallet';
  const input = {
    nonce,
    statement,
    expirationTime: new Date(Date.now() + 1000 * 60 * 60),
    fallback: async () => {
      throw new Error('WORLD_APP_REQUIRED');
    },
  } satisfies MiniKitWalletAuthOptions;

  let result: CommandResultByVia<WalletAuthResult>;
  try {
    result = await MiniKit.walletAuth(input);
  } catch (err) {
    const code =
      err && typeof err === 'object' && 'code' in err
        ? String((err as { code?: string }).code || '')
        : '';
    if (code === 'user_rejected') {
      throw new Error('Sign-in was cancelled');
    }
    throw err instanceof Error ? err : new Error('World walletAuth failed');
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
