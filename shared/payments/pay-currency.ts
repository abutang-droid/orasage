/**
 * 按支付币种路由到对应支付通道。
 * mock：完成订单并记录币种；stripe：仅 USDT(=USD)；wallet：扣对应钱包（后续扩展）。
 */

import type { PayCurrency } from '../shop-locale/index';
import { resolvePaymentMode, type PaymentMode, type PaymentModeEnv } from './mode';

export type PayProvider = 'mock' | 'stripe' | 'wallet';

export type ResolvePayProviderInput = {
  payCurrency: PayCurrency;
  env?: PaymentModeEnv;
  /** 显式指定通道；默认按 PAYMENT_MODE + 币种推断 */
  preferred?: PayProvider;
};

/** USDT → mock/stripe；WOLD → mock（或 wallet，若 preferred） */
export function resolvePayProvider(input: ResolvePayProviderInput): PayProvider {
  if (input.preferred) return input.preferred;
  const mode: PaymentMode = resolvePaymentMode(input.env);
  if (input.payCurrency === 'WOLD') {
    return mode === 'stripe' ? 'mock' : 'mock';
  }
  return mode === 'stripe' ? 'stripe' : 'mock';
}

export function payProviderLabel(provider: PayProvider, payCurrency: PayCurrency): string {
  if (provider === 'stripe') return `Stripe (${payCurrency})`;
  if (provider === 'wallet') return `Wallet (${payCurrency})`;
  return `Mock (${payCurrency})`;
}
