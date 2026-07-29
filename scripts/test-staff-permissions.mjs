#!/usr/bin/env node
/**
 * Phase B permission matrix smoke (no test runner required).
 * Run: node scripts/test-staff-permissions.mjs
 */
import {
  expandPermission,
  hasStaffPermission,
  resolveStaffPermissions,
  ASSIGNABLE_EXTRA_PERMISSIONS,
  PARTNER_ASSIGNABLE_PERMISSIONS,
  PLATFORM_ONLY_PERMISSIONS,
} from '../shared/staff-permissions/index.ts';

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

// Legacy expand
assert(expandPermission('shop.products').includes('shop.catalog'), 'shop.products → catalog');
assert(expandPermission('shop.products').includes('shop.storefront'), 'shop.products → storefront');
assert(expandPermission('ops.messages')[0] === 'ops.tickets', 'ops.messages → tickets');
assert(expandPermission('staff.manage')[0] === 'platform.staff', 'staff.manage → platform.staff');
assert(expandPermission('content.cms.shop')[0] === 'content.product', 'cms.shop → product');

// Role defaults
const shop = resolveStaffPermissions({ role: 'shop_ops' });
assert(hasStaffPermission(shop, 'shop.catalog'), 'shop_ops catalog');
assert(hasStaffPermission(shop, 'shop.products'), 'shop_ops legacy products');
assert(hasStaffPermission(shop, 'ops.im'), 'shop_ops im');
assert(hasStaffPermission(shop, 'analytics.read'), 'shop_ops analytics');
assert(!hasStaffPermission(shop, 'platform.partners'), 'shop_ops no partners');
assert(!hasStaffPermission(shop, 'platform.staff'), 'shop_ops no staff by default');

const content = resolveStaffPermissions({ role: 'content_ops' });
assert(hasStaffPermission(content, 'content.heroes'), 'content_ops heroes');
assert(hasStaffPermission(content, 'content.cms.heroes'), 'content_ops legacy heroes');
assert(hasStaffPermission(content, 'legal.agreements'), 'content_ops legal');
assert(!hasStaffPermission(content, 'shop.orders'), 'content_ops no orders');

// Legacy grant still works
const granted = resolveStaffPermissions({
  role: 'content_ops',
  grants: ['billing.slots', 'staff.manage'],
});
assert(hasStaffPermission(granted, 'billing.slots'), 'grant billing');
assert(hasStaffPermission(granted, 'platform.staff'), 'legacy staff.manage grant');

// Partner template never includes finance-ish or partners admin
assert(!PARTNER_ASSIGNABLE_PERMISSIONS.includes('platform.partners'), 'partner no partners admin');
assert(!ASSIGNABLE_EXTRA_PERMISSIONS.some((p) => String(p).startsWith('finance')), 'no finance extras');
assert(PLATFORM_ONLY_PERMISSIONS.includes('platform.partners'), 'partners platform-only');

console.log('OK: staff-permissions matrix checks passed');
