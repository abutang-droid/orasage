import Stripe from 'stripe';

let stripeClient: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripeClient) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error('STRIPE_SECRET_KEY is not set');
    stripeClient = new Stripe(key, { apiVersion: '2025-02-24.acacia' });
  }
  return stripeClient;
}

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY?.startsWith('sk_'));
}
