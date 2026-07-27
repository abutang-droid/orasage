/** World Mini App feature flags (shared across tarot / shop / auth clients). */

export function envFlagTrue(raw: string | undefined): boolean {
  const v = (raw ?? '').trim().toLowerCase();
  return v === 'true' || v === '1' || v === 'yes';
}

/**
 * Force World SIWE login (email/password disabled server-side when set).
 *
 * IMPORTANT: read `process.env.NEXT_PUBLIC_*` as static member expressions so
 * Next.js can inline them into the client bundle. Dynamic `env[key]` access
 * leaves the flag undefined in the browser and silently disables the gate.
 */
export function isWorldAuthRequired(_env?: NodeJS.ProcessEnv): boolean {
  return (
    envFlagTrue(process.env.NEXT_PUBLIC_WORLD_AUTH_REQUIRED) ||
    envFlagTrue(process.env.WORLD_AUTH_REQUIRED) ||
    (_env
      ? envFlagTrue(_env.NEXT_PUBLIC_WORLD_AUTH_REQUIRED) || envFlagTrue(_env.WORLD_AUTH_REQUIRED)
      : false)
  );
}

/** Prefer MiniKit.pay over mock/stripe when configured. */
export function isWorldPayEnabled(_env?: NodeJS.ProcessEnv): boolean {
  if (
    envFlagTrue(process.env.NEXT_PUBLIC_WORLD_PAY_ENABLED) ||
    envFlagTrue(process.env.WORLD_PAY_ENABLED) ||
    (_env
      ? envFlagTrue(_env.NEXT_PUBLIC_WORLD_PAY_ENABLED) || envFlagTrue(_env.WORLD_PAY_ENABLED)
      : false)
  ) {
    return true;
  }
  const mode = (
    process.env.NEXT_PUBLIC_PAYMENT_MODE ||
    process.env.PAYMENT_MODE ||
    _env?.PAYMENT_MODE ||
    ''
  )
    .trim()
    .toLowerCase();
  return mode === 'world' || mode === 'wld' || mode === 'minikit';
}

export function worldAuthPublicUrl(_env?: NodeJS.ProcessEnv): string {
  const auth =
    process.env.NEXT_PUBLIC_AUTH_URL ||
    process.env.AUTH_URL ||
    _env?.NEXT_PUBLIC_AUTH_URL ||
    _env?.AUTH_URL ||
    (typeof window !== 'undefined' && window.location.hostname.endsWith('oricosmos.com')
      ? 'https://auth.oricosmos.com'
      : 'https://auth.orasage.com');
  return auth.replace(/\/$/, '');
}

export function worldAppId(_env?: NodeJS.ProcessEnv): string {
  return (
    process.env.NEXT_PUBLIC_WORLD_APP_ID ||
    process.env.WORLD_APP_ID ||
    _env?.NEXT_PUBLIC_WORLD_APP_ID ||
    _env?.WORLD_APP_ID ||
    ''
  ).trim();
}

export function worldPaymentToAddress(_env?: NodeJS.ProcessEnv): string {
  return (
    process.env.NEXT_PUBLIC_WORLD_PAYMENT_TO_ADDRESS ||
    process.env.WORLD_PAYMENT_TO_ADDRESS ||
    _env?.NEXT_PUBLIC_WORLD_PAYMENT_TO_ADDRESS ||
    _env?.WORLD_PAYMENT_TO_ADDRESS ||
    ''
  ).trim();
}
