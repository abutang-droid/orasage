const DEV_JWT_SECRET = 'dev-secret-change-in-production-32chars';

if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  throw new Error('Missing required env var: JWT_SECRET');
}

export const ENV = {
  jwtSecret: process.env.JWT_SECRET ?? DEV_JWT_SECRET,
  jwtCookieName: process.env.JWT_COOKIE_NAME ?? 'orasage_token',
  authUrl: process.env.AUTH_URL ?? 'https://auth.orasage.com',
  authInternalUrl: process.env.AUTH_INTERNAL_URL ?? 'http://127.0.0.1:3101',
  shopUrl: process.env.SHOP_URL ?? 'https://shop.orasage.com',
  baziInternalUrl: process.env.BAZI_INTERNAL_URL ?? 'http://127.0.0.1:3110',
  stripeSecretKey: process.env.STRIPE_SECRET_KEY ?? '',
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? '',
  isProduction: process.env.NODE_ENV === 'production',
};

export function hasStripe() {
  return Boolean(ENV.stripeSecretKey);
}
