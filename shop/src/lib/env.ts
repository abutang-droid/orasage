import { paymentsUseStripe } from './payment-mode';
import { getSiteApex, orasageUrlsFor } from './orasage-app-shell/config';

const DEV_JWT_SECRET = 'dev-secret-change-in-production-32chars';

if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  throw new Error('Missing required env var: JWT_SECRET');
}

function defaultPublicUrls() {
  return orasageUrlsFor(getSiteApex());
}

export const ENV = {
  jwtSecret: process.env.JWT_SECRET ?? DEV_JWT_SECRET,
  jwtCookieName: process.env.JWT_COOKIE_NAME ?? 'orasage_token',
  authUrl: process.env.AUTH_URL ?? process.env.NEXT_PUBLIC_AUTH_URL ?? defaultPublicUrls().auth,
  authInternalUrl: process.env.AUTH_INTERNAL_URL ?? 'http://127.0.0.1:3101',
  shopUrl: process.env.SHOP_URL ?? process.env.NEXT_PUBLIC_SHOP_URL ?? defaultPublicUrls().shop,
  baziInternalUrl: process.env.BAZI_INTERNAL_URL ?? 'http://127.0.0.1:3110',
  ziweiInternalUrl: process.env.ZIWEI_INTERNAL_URL ?? 'http://127.0.0.1:3111',
  stripeSecretKey: process.env.STRIPE_SECRET_KEY ?? '',
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? '',
  paymentMode: process.env.PAYMENT_MODE ?? 'mock',
  isProduction: process.env.NODE_ENV === 'production',
};

/** @deprecated Use paymentsUseStripe() — Stripe keys alone do not enable live payments */
export function hasStripe() {
  return paymentsUseStripe();
}
