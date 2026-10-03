import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  computeCommissionCents,
  normalizePromoCode,
  promoCodeFromSearchParams,
  promoShareLinks,
} from './index.ts';

test('normalizePromoCode uppercases and strips junk', () => {
  assert.equal(normalizePromoCode(' wechat-01 '), 'WECHAT-01');
  assert.equal(normalizePromoCode('a'), null);
  assert.equal(normalizePromoCode(''), null);
});

test('promoCodeFromSearchParams reads ch then partner', () => {
  const params = new URLSearchParams('utm=x&ch=gold01&partner=ignored');
  assert.equal(promoCodeFromSearchParams(params), 'GOLD01');
  assert.equal(promoCodeFromSearchParams(new URLSearchParams('partner=silver_2')), 'SILVER_2');
});

test('computeCommissionCents uses bps and rounds', () => {
  assert.equal(computeCommissionCents(10_000, 1000), 1000);
  assert.equal(computeCommissionCents(1999, 1000), 200);
  assert.equal(computeCommissionCents(100, 0), 0);
  assert.equal(computeCommissionCents(-1, 1000), 0);
});

test('promoShareLinks include channel query', () => {
  const links = promoShareLinks('WECHAT01');
  assert.equal(links.portal, 'https://orasage.com/zh-CN?ch=WECHAT01');
  assert.ok(links.bazi.includes('ch=WECHAT01'));
  assert.ok(links.shop.includes('ch=WECHAT01'));
});
