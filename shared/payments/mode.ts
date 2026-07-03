/**
 * OraSage payment mode — defaults to mock in all environments for risk review.
 * Set PAYMENT_MODE=stripe (and Stripe keys) to enable real checkout.
 */
export type PaymentMode = 'mock' | 'stripe';

export type PaymentModeEnv = {
  PAYMENT_MODE?: string;
  STRIPE_SECRET_KEY?: string;
};

/** @returns `mock` unless PAYMENT_MODE is explicitly `stripe` */
export function resolvePaymentMode(env?: PaymentModeEnv): PaymentMode {
  const source = env ?? {
    PAYMENT_MODE: process.env.PAYMENT_MODE,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  };
  const raw = (source.PAYMENT_MODE ?? 'mock').trim().toLowerCase();
  return raw === 'stripe' ? 'stripe' : 'mock';
}

export function isMockPaymentMode(env?: PaymentModeEnv): boolean {
  return resolvePaymentMode(env) === 'mock';
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
export function normalizePaymentProvider(provider: string): PaymentMode | 'stripe' {
  if (provider === 'stripe') return 'stripe';
  return 'mock';
}

export function isMockProvider(provider: string): boolean {
  const p = normalizePaymentProvider(provider);
  return p === 'mock';
}
