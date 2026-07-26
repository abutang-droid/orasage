import {
  isMockPaymentMode,
  isWorldPaymentMode,
  resolvePaymentMode,
  shouldUseStripePayments,
  type PaymentMode,
} from '../../../shared/payments/mode';

export {
  resolvePaymentMode,
  isMockPaymentMode,
  isWorldPaymentMode,
  shouldUseStripePayments,
  type PaymentMode,
};

/** Whether checkout should create a Stripe session (explicit stripe mode + keys) */
export function paymentsUseStripe(): boolean {
  return shouldUseStripePayments({
    PAYMENT_MODE: process.env.PAYMENT_MODE,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  });
}

/** World App MiniKit.pay (WLD) — set PAYMENT_MODE=world */
export function paymentsUseWorld(): boolean {
  return isWorldPaymentMode({
    PAYMENT_MODE: process.env.PAYMENT_MODE,
  });
}
