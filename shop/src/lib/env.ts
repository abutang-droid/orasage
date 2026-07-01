export const ENV = {
  jwtSecret: process.env.JWT_SECRET ?? 'dev-secret-change-in-production-32chars',
  jwtCookieName: process.env.JWT_COOKIE_NAME ?? 'orasage_token',
  authUrl: process.env.AUTH_URL ?? 'https://auth.orasage.com',
  authInternalUrl: process.env.AUTH_INTERNAL_URL ?? 'http://127.0.0.1:3101',
  shopUrl: process.env.SHOP_URL ?? 'https://shop.orasage.com',
  stripeSecretKey: process.env.STRIPE_SECRET_KEY ?? '',
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? '',
  isProduction: process.env.NODE_ENV === 'production',
};

export function hasStripe() {
  return Boolean(ENV.stripeSecretKey);
}
