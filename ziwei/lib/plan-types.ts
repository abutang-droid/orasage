export type PlanType = 'basic' | 'advanced' | 'premium';

/** Fallback display when catalog SKU price is unavailable; list prices are USDT. */
export const PLAN_PRICES: Record<PlanType, { single: string; couple: string }> = {
  basic: { single: '9.90 USDT', couple: '19.90 USDT' },
  advanced: { single: '99.00 USDT', couple: '199.00 USDT' },
  premium: { single: '299.00 USDT', couple: '499.00 USDT' },
};
