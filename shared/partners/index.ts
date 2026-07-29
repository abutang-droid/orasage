/**
 * Config Pack 多租户（Phase D）
 * partnerId = partners.slug；平台自营固定 orasage。
 */

import {
  CONTENT_PERMISSIONS,
  PARTNER_ASSIGNABLE_PERMISSIONS,
  type AnyStaffPermission,
} from '../staff-permissions/index';

export const PLATFORM_PARTNER_SLUG = 'orasage';

export const PARTNER_MODULE_KEYS = [
  'shop',
  'billing',
  'content',
  'legal',
  'ops',
  'analytics',
  'app.bazi',
  'app.ziwei',
  'app.tarot',
  'platform',
] as const;

export type PartnerModuleKey = (typeof PARTNER_MODULE_KEYS)[number];

export function isPartnerModuleKey(value: string): value is PartnerModuleKey {
  return (PARTNER_MODULE_KEYS as readonly string[]).includes(value);
}

/** 模块 → 可授权限点（合作方有效权限 = 角色权限 ∩ 模块权限 ∩ PARTNER_ASSIGNABLE） */
export const MODULE_PERMISSIONS: Record<PartnerModuleKey, readonly AnyStaffPermission[]> = {
  shop: [
    'shop.catalog',
    'shop.storefront',
    'shop.orders',
    'shop.diy',
    'shop.shipping',
    'shop.promotions',
    'shop.reviews',
  ],
  billing: ['billing.slots'],
  content: [...CONTENT_PERMISSIONS],
  legal: ['legal.agreements'],
  ops: ['ops.overview', 'ops.tickets', 'ops.im'],
  analytics: ['analytics.read'],
  'app.bazi': ['app.bazi'],
  'app.ziwei': ['app.ziwei'],
  'app.tarot': ['app.tarot'],
  platform: ['platform.integrations.read', 'platform.staff'],
};

export function permissionsForModules(
  modules: readonly string[],
): Set<AnyStaffPermission> {
  const out = new Set<AnyStaffPermission>();
  for (const m of modules) {
    if (!isPartnerModuleKey(m)) continue;
    for (const p of MODULE_PERMISSIONS[m]) out.add(p);
  }
  return out;
}

const PARTNER_ASSIGNABLE_SET = new Set<AnyStaffPermission>(PARTNER_ASSIGNABLE_PERMISSIONS);

/**
 * 非平台合作方：有效权限 = 角色解析结果 ∩ 模块权限 ∩ PARTNER_ASSIGNABLE
 * 平台 orasage / 超管：不做模块裁剪（由角色与 grants 决定）
 */
export function applyPartnerPermissionScope(
  base: ReadonlySet<AnyStaffPermission>,
  opts: { partnerId: string; enabledModules: readonly string[]; isPlatformAdmin: boolean },
): Set<AnyStaffPermission> {
  if (opts.isPlatformAdmin || opts.partnerId === PLATFORM_PARTNER_SLUG) {
    return new Set(base);
  }
  const allowed = permissionsForModules(opts.enabledModules);
  const out = new Set<AnyStaffPermission>();
  for (const p of base) {
    if (allowed.has(p) && PARTNER_ASSIGNABLE_SET.has(p)) out.add(p);
  }
  return out;
}

export function isPlatformPartner(partnerId: string | null | undefined): boolean {
  return !partnerId || partnerId === PLATFORM_PARTNER_SLUG;
}
