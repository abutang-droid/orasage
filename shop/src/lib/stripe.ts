import Stripe from 'stripe';
import { ENV, hasStripe } from './env';

let stripe: Stripe | null = null;

export function getStripe() {
  if (!hasStripe()) return null;
  if (!stripe) {
    stripe = new Stripe(ENV.stripeSecretKey);
  }
  return stripe;
}
