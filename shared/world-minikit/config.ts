/** World Mini App feature flags (shared across tarot / shop / auth clients). */

export function envFlagTrue(raw: string | undefined): boolean {
  const v = (raw ?? '').trim().toLowerCase();
  return v === 'true' || v === '1' || v === 'yes';
}

/** Force World SIWE login (email/password disabled server-side when set). */
export function isWorldAuthRequired(env: NodeJS.ProcessEnv = process.env): boolean {
  return envFlagTrue(env.WORLD_AUTH_REQUIRED) || envFlagTrue(env.NEXT_PUBLIC_WORLD_AUTH_REQUIRED);
}

/** Prefer MiniKit.pay over mock/stripe when configured. */
export function isWorldPayEnabled(env: NodeJS.ProcessEnv = process.env): boolean {
  if (envFlagTrue(env.WORLD_PAY_ENABLED) || envFlagTrue(env.NEXT_PUBLIC_WORLD_PAY_ENABLED)) {
    return true;
  }
  const mode = (env.PAYMENT_MODE ?? '').trim().toLowerCase();
  return mode === 'world' || mode === 'wld' || mode === 'minikit';
}

export function worldAuthPublicUrl(env: NodeJS.ProcessEnv = process.env): string {
  const auth =
    env.NEXT_PUBLIC_AUTH_URL ||
    env.AUTH_URL ||
    (typeof window !== 'undefined' && window.location.hostname.endsWith('oricosmos.com')
      ? 'https://auth.oricosmos.com'
      : 'https://auth.orasage.com');
  return auth.replace(/\/$/, '');
}

export function worldAppId(env: NodeJS.ProcessEnv = process.env): string {
  return (env.NEXT_PUBLIC_WORLD_APP_ID || env.WORLD_APP_ID || '').trim();
}

export function worldPaymentToAddress(env: NodeJS.ProcessEnv = process.env): string {
  return (env.WORLD_PAYMENT_TO_ADDRESS || env.NEXT_PUBLIC_WORLD_PAYMENT_TO_ADDRESS || '').trim();
}
