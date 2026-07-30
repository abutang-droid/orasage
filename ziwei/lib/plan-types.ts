export type PlanType = 'basic' | 'advanced' | 'premium';

/** Fallback display only — live prices come from auth product catalog (USD). */
export const PLAN_PRICES: Record<PlanType, { single: string; couple: string }> = {
  basic: { single: '$1.38', couple: '$2.75' },
  advanced: { single: '$13.75', couple: '$27.50' },
  premium: { single: '$41.53', couple: '$69.31' },
};
