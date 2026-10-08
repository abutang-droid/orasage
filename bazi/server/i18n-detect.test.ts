import { describe, expect, it } from 'vitest';
import { detectLocale, localeFromReferrerUrl } from '@orasage/i18n';

describe('detectLocale', () => {
  it('prefers query locale over cookie and Accept-Language', () => {
    expect(
      detectLocale({
        queryLocale: 'zh-CN',
        cookieLocale: 'en',
        acceptLanguage: 'en-US,en;q=0.9',
      }),
    ).toBe('zh-CN');
  });

  it('defaults to zh-CN when nothing is provided', () => {
    expect(detectLocale({})).toBe('zh-CN');
    expect(detectLocale()).toBe('zh-CN');
  });

  it('uses portal referrer path before cookie', () => {
    expect(
      detectLocale({
        referrerLocale: 'zh-CN',
        cookieLocale: 'en',
        acceptLanguage: 'en-US',
      }),
    ).toBe('zh-CN');
  });
});

describe('localeFromReferrerUrl', () => {
  it('reads /zh-CN from portal referrer', () => {
    expect(localeFromReferrerUrl('https://orasage.com/zh-CN/readings')).toBe('zh-CN');
  });

  it('reads ?lang= from fortune-app referrer', () => {
    expect(localeFromReferrerUrl('https://bazi.orasage.com/?lang=zh-CN')).toBe('zh-CN');
  });

  it('returns null for unrelated hosts', () => {
    expect(localeFromReferrerUrl('https://example.com/zh-CN')).toBeNull();
  });
});
