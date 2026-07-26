import { MiniKit } from '@worldcoin/minikit-js';
import type {
  CommandResultByVia,
  MiniKitWalletAuthOptions,
  WalletAuthResult,
} from '@worldcoin/minikit-js/commands';
import { worldAuthPublicUrl } from '../../../shared/world-minikit/config';

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

/**
 * Full World wallet login: nonce → MiniKit.walletAuth → auth-service SIWE verify + cookie.
 */
export async function signInWithWorldWallet(opts?: {
  statement?: string;
  authBaseUrl?: string;
}): Promise<WorldSiweSession> {
  const authBase = (opts?.authBaseUrl || worldAuthPublicUrl()).replace(/\/$/, '');

  const nonceRes = await fetch(`${authBase}/auth/world/nonce`, {
    method: 'GET',
    credentials: 'include',
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

  const result: CommandResultByVia<WalletAuthResult> = await MiniKit.walletAuth(input);
  if (result.executedWith === 'fallback') {
    throw new Error('WORLD_APP_REQUIRED');
  }

  const payload = result.data as {
    address: string;
    message: string;
    signature: string;
  };

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

  const completeRes = await fetch(`${authBase}/auth/world/siwe`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      payload,
      nonce,
      statement,
      username,
      profilePictureUrl: profilePictureUrl || null,
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
