export type PlanType = 'basic' | 'advanced' | 'premium';

export const PLAN_PRICES: Record<PlanType, { single: string; couple: string }> = {
  basic: { single: '¥9.90', couple: '¥19.90' },
  advanced: { single: '¥99.00', couple: '¥199.00' },
  premium: { single: '¥299.00', couple: '¥499.00' },
};
