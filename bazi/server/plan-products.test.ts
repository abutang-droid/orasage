import { describe, expect, it } from 'vitest';
import { plansFromBillingSlots } from '../client/src/lib/plan-products';

describe('plansFromBillingSlots', () => {
  it('omits hidden report tiers and does not fall back to catalog SKUs', () => {
    const plans = plansFromBillingSlots('single', {
      'report.basic': [{ sku: 'report-bazi-basic', active: false, product: null }],
      'report.advanced': [{ sku: 'report-bazi-advanced', active: false, product: null }],
      'report.premium': [{ sku: 'report-bazi-premium', active: false, product: null }],
    });
    expect(plans).toEqual([]);
  });

  it('keeps only active rows that still have a product', () => {
    const plans = plansFromBillingSlots('single', {
      'report.basic': [{ sku: 'report-bazi-basic', active: false, product: null }],
      'report.advanced': [{
        sku: 'report-bazi-advanced',
        active: true,
        product: { name: '进阶报告', desc: '报告+手串', priceDisplay: '$99' },
      }],
      'report.premium': [{ sku: 'report-bazi-premium', active: true, product: null }],
    });
    expect(plans).toEqual([
      {
        type: 'advanced',
        sku: 'report-bazi-advanced',
        name: '进阶报告',
        desc: '报告+手串',
        priceDisplay: '$99',
        highlight: true,
      },
    ]);
  });

  it('reads couple slot keys separately', () => {
    const plans = plansFromBillingSlots('couple', {
      'report.basic': [{
        sku: 'report-bazi-basic',
        active: true,
        product: { name: '单人基础', priceDisplay: '$9' },
      }],
      'report.couple.basic': [{
        sku: 'report-bazi-couple-basic',
        active: true,
        product: { name: '合盘基础', priceDisplay: '$19' },
      }],
    });
    expect(plans.map((p) => p.sku)).toEqual(['report-bazi-couple-basic']);
  });
});
