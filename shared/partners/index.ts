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

/* ── Phase E：交付模板与 Module API scopes ─────────────── */

export const DELIVERY_TEMPLATE_IDS = ['shop-only', 'tarot-only', 'full-apps'] as const;
export type DeliveryTemplateId = (typeof DELIVERY_TEMPLATE_IDS)[number];

export const DELIVERY_TEMPLATES: Record<DeliveryTemplateId, readonly PartnerModuleKey[]> = {
  'shop-only': ['shop', 'billing', 'ops', 'analytics'],
  'tarot-only': ['app.tarot', 'billing', 'content', 'legal', 'ops', 'analytics'],
  'full-apps': [
    'shop',
    'billing',
    'content',
    'legal',
    'ops',
    'analytics',
    'app.bazi',
    'app.ziwei',
    'app.tarot',
  ],
};

export function isDeliveryTemplateId(value: string): value is DeliveryTemplateId {
  return (DELIVERY_TEMPLATE_IDS as readonly string[]).includes(value);
}

export function modulesForTemplate(template: DeliveryTemplateId): PartnerModuleKey[] {
  return [...DELIVERY_TEMPLATES[template]];
}

/** Module API scope 字符串 */
export type ModuleApiScope =
  | `module:${PartnerModuleKey}`
  | 'config:read'
  | 'config:write';

export const FORBIDDEN_MODULE_API_SCOPES = [
  'module:finance',
  'finance',
  'wallets',
  'module:platform',
] as const;

export function moduleScope(moduleKey: PartnerModuleKey): ModuleApiScope {
  return `module:${moduleKey}`;
}

export function sanitizeApiKeyScopes(raw: readonly string[]): string[] {
  const out = new Set<string>();
  for (const s of raw) {
    const scope = s.trim();
    if (!scope) continue;
    if ((FORBIDDEN_MODULE_API_SCOPES as readonly string[]).includes(scope)) continue;
    if (scope === 'config:read' || scope === 'config:write') {
      out.add(scope);
      continue;
    }
    if (scope.startsWith('module:')) {
      const mod = scope.slice('module:'.length);
      if (isPartnerModuleKey(mod) && mod !== 'platform') out.add(scope);
    }
  }
  if (out.size === 0) out.add('config:read');
  return [...out];
}

/** Key scopes ∩ 启用模块 → 有效 module scopes */
export function effectiveModuleScopes(
  keyScopes: readonly string[],
  enabledModules: readonly string[],
): Set<string> {
  const enabled = new Set(enabledModules);
  const out = new Set<string>();
  for (const s of keyScopes) {
    if (s === 'config:read' || s === 'config:write') {
      out.add(s);
      continue;
    }
    if (s.startsWith('module:')) {
      const mod = s.slice('module:'.length);
      if (enabled.has(mod)) out.add(s);
    }
  }
  return out;
}

export function hasModuleScope(
  effective: ReadonlySet<string>,
  moduleKey: PartnerModuleKey,
): boolean {
  return effective.has(`module:${moduleKey}`);
}
