export {
  startAppCheckout,
  CheckoutAuthRequiredError,
  isCheckoutAuthRequiredError,
  isMockCheckoutProvider,
  isWorldCheckoutProvider,
  shouldCompleteWithWorldPay,
  shopBaseUrl,
  type AppCheckoutRequest,
  type AppCheckoutResponse,
} from '../../../shared/shop-checkout/client';

import {
  redirectAfterCheckout as defaultRedirectAfterCheckout,
  shouldCompleteWithWorldPay,
  shopBaseUrl,
  type AppCheckoutResponse,
} from '../../../shared/shop-checkout/client';
import { payWithWorldWallet } from './world-pay-client';

/** World MiniKit.pay when provider/mode is world; otherwise mock/Stripe redirect. */
export async function redirectAfterCheckout(
  result: AppCheckoutResponse,
  opts?: { successUrl?: string },
): Promise<void> {
  if (shouldCompleteWithWorldPay(result)) {
    const shop = shopBaseUrl();
    const intentRes = await fetch(
      `${shop}/api/world/pay-intent?order=${encodeURIComponent(result.orderNo)}`,
      { credentials: 'include' },
    );
    const intent = await intentRes.json().catch(() => ({}));
    if (!intentRes.ok) {
      throw new Error(
        typeof intent.error === 'string'
          ? intent.error
          : `World pay intent failed (${intentRes.status})`,
      );
    }
    const confirmed = await payWithWorldWallet({
      intent: {
        reference: intent.reference || result.orderNo,
        to: intent.to,
        wldAmount: intent.wldAmount,
        description: intent.description || result.title || result.orderNo,
        orderNo: result.orderNo,
        successUrl: intent.successUrl || opts?.successUrl || null,
      },
      confirmUrl: `${shop}/api/world/confirm`,
    });
    const success =
      opts?.successUrl ||
      intent.successUrl ||
      `${typeof window !== 'undefined' ? window.location.origin : ''}/?paid=1`;
    const joiner = success.includes('?') ? '&' : '?';
    window.location.href =
      `${success}${joiner}order=${encodeURIComponent(confirmed.orderNo)}` +
      (confirmed.transactionId
        ? `&tx=${encodeURIComponent(confirmed.transactionId)}`
        : '');
    return;
  }
  await defaultRedirectAfterCheckout(result, opts);
}
