/**
 * OraSage payment mode — defaults to mock in all environments for risk review.
 * Set PAYMENT_MODE=stripe (and Stripe keys) for Stripe.
 * Set PAYMENT_MODE=world for World App MiniKit.pay (WLD wallet).
 */
export type PaymentMode = 'mock' | 'stripe' | 'world';

export type PaymentModeEnv = {
  PAYMENT_MODE?: string;
  STRIPE_SECRET_KEY?: string;
  WORLD_PAYMENT_TO_ADDRESS?: string;
  WORLD_APP_ID?: string;
  DEV_PORTAL_API_KEY?: string;
};

/** @returns `mock` | `stripe` | `world` */
export function resolvePaymentMode(env?: PaymentModeEnv): PaymentMode {
  const source = env ?? {
    PAYMENT_MODE: process.env.PAYMENT_MODE,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  };
  const raw = (source.PAYMENT_MODE ?? 'mock').trim().toLowerCase();
  if (raw === 'stripe') return 'stripe';
  if (raw === 'world' || raw === 'wld' || raw === 'minikit') return 'world';
  return 'mock';
}

export function isMockPaymentMode(env?: PaymentModeEnv): boolean {
  return resolvePaymentMode(env) === 'mock';
}

export function isWorldPaymentMode(env?: PaymentModeEnv): boolean {
  return resolvePaymentMode(env) === 'world';
}

/** Stripe is used only when mode is stripe AND secret key is configured */
export function shouldUseStripePayments(env?: PaymentModeEnv): boolean {
  const source = env ?? {
    PAYMENT_MODE: process.env.PAYMENT_MODE,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  };
  return resolvePaymentMode(source) === 'stripe' && Boolean(source.STRIPE_SECRET_KEY?.trim());
}

/** Normalize API provider field (legacy `demo` → `mock`) */
export function normalizePaymentProvider(provider: string): PaymentMode {
  if (provider === 'stripe') return 'stripe';
  if (provider === 'world' || provider === 'wld' || provider === 'minikit') return 'world';
  return 'mock';
}

export function isMockProvider(provider: string): boolean {
  const p = normalizePaymentProvider(provider);
  return p === 'mock';
}
