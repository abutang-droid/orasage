import {
  isMockPaymentMode,
  resolvePaymentMode,
  shouldUseStripePayments,
  type PaymentMode,
} from '../../../shared/payments/mode';

export { resolvePaymentMode, isMockPaymentMode, shouldUseStripePayments, type PaymentMode };

/** Whether checkout should create a Stripe session (explicit stripe mode + keys) */
export function paymentsUseStripe(): boolean {
  return shouldUseStripePayments({
    PAYMENT_MODE: process.env.PAYMENT_MODE,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  });
}
