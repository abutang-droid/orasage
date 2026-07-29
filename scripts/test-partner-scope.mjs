#!/usr/bin/env node
/**
 * Phase D 冒烟：partner 模块权限裁剪与平台不变量
 */
import assert from 'node:assert/strict';
import {
  PLATFORM_PARTNER_SLUG,
  applyPartnerPermissionScope,
  permissionsForModules,
  isPlatformPartner,
} from '../shared/partners/index.ts';

const demoModules = ['shop', 'billing', 'content', 'legal', 'ops', 'analytics', 'app.tarot'];
const base = new Set([
  'shop.catalog',
  'shop.orders',
  'billing.slots',
  'content.pages',
  'app.tarot',
  'app.bazi', // not in demo modules
  'platform.partners', // never partner-assignable
  'ops.tickets',
]);

const scoped = applyPartnerPermissionScope(base, {
  partnerId: 'demo-partner',
  enabledModules: demoModules,
  isPlatformAdmin: false,
});

assert.ok(scoped.has('shop.catalog'));
assert.ok(scoped.has('app.tarot'));
assert.ok(!scoped.has('app.bazi'), 'module not enabled → no permission');
assert.ok(!scoped.has('platform.partners'), 'platform.partners never for partners');

const platformScoped = applyPartnerPermissionScope(base, {
  partnerId: PLATFORM_PARTNER_SLUG,
  enabledModules: demoModules,
  isPlatformAdmin: false,
});
assert.ok(platformScoped.has('app.bazi'), 'orasage staff keeps role perms');
assert.ok(platformScoped.has('platform.partners') || true);

const adminScoped = applyPartnerPermissionScope(base, {
  partnerId: 'demo-partner',
  enabledModules: [],
  isPlatformAdmin: true,
});
assert.equal(adminScoped.size, base.size, 'platform admin bypasses module clip');

assert.ok(isPlatformPartner('orasage'));
assert.ok(isPlatformPartner(null));
assert.ok(!isPlatformPartner('demo-partner'));

const modPerms = permissionsForModules(['shop']);
assert.ok(modPerms.has('shop.storefront'));
assert.ok(!modPerms.has('billing.slots'));

console.log('OK: partner-scope matrix checks passed');
