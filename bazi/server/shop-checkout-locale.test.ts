import { describe, expect, it } from 'vitest';
import { buildShopCheckoutUrl } from '../client/src/lib/plan-products';

describe('buildShopCheckoutUrl locale', () => {
  it('always ships locale+lang for Chinese unlock hops', () => {
    const url = buildShopCheckoutUrl({
      sku: 'report-bazi-basic',
      returnUrl: 'https://bazi.orasage.com/classic?paid=1',
      planType: 'basic',
      mode: 'single',
      locale: 'zh-CN',
      context: '八字深度解读',
    });
    const qs = new URL(url).searchParams;
    expect(qs.get('locale')).toBe('zh-CN');
    expect(qs.get('lang')).toBe('zh-CN');
    expect(qs.get('sku')).toBe('report-bazi-basic');
    expect(qs.get('appSource')).toBe('bazi');
  });

  it('defaults to zh-CN when locale is omitted', () => {
    const url = buildShopCheckoutUrl({
      sku: 'report-bazi-basic',
      returnUrl: 'https://bazi.orasage.com/classic?paid=1',
      planType: 'basic',
      mode: 'single',
    });
    const qs = new URL(url).searchParams;
    expect(qs.get('locale')).toBe('zh-CN');
    expect(qs.get('lang')).toBe('zh-CN');
  });

  it('keeps English when locale is en', () => {
    const url = buildShopCheckoutUrl({
      sku: 'report-bazi-basic',
      returnUrl: 'https://bazi.orasage.com/classic?paid=1&lang=en',
      planType: 'basic',
      mode: 'single',
      locale: 'en',
    });
    const qs = new URL(url).searchParams;
    expect(qs.get('locale')).toBe('en');
    expect(qs.get('lang')).toBe('en');
  });
});
