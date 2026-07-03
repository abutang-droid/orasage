import Stripe from 'stripe';
import { ENV } from './env';
import { paymentsUseStripe } from './payment-mode';

let stripe: Stripe | null = null;

export function getStripe(): Stripe | null {
  if (!paymentsUseStripe()) return null;
  if (!ENV.stripeSecretKey) return null;
  if (!stripe) {
    stripe = new Stripe(ENV.stripeSecretKey);
  }
  return stripe;
}
