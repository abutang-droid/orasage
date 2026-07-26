export type PlanType = 'basic' | 'advanced' | 'premium';

/** Fallback display when catalog SKU price is unavailable; U/W abbreviations. */
export const PLAN_PRICES: Record<PlanType, { single: string; couple: string }> = {
  basic: { single: '9.90 U / 9.90 W', couple: '19.90 U / 19.90 W' },
  advanced: { single: '99.00 U / 99.00 W', couple: '199.00 U / 199.00 W' },
  premium: { single: '299.00 U / 299.00 W', couple: '499.00 U / 499.00 W' },
};
