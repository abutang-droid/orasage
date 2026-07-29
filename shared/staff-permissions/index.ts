import type { StaffRole } from '../staff-roles/index';

/**
 * Admin Config Pack — 权限枚举（Phase B 定稿）
 * @see docs/products/admin-config-pack.md
 *
 * 旧名（shop.products / content.cms.* / ops.messages / staff.manage）仍可通过
 * LEGACY_PERMISSION_ALIASES 解析与校验；新 JWT / 角色默认写入 canonical 名。
 */

/** 平台 / 运营 / 商城 / 计费 / 合规 / 应用 / 数据 */
export const STAFF_PERMISSIONS = [
  'ops.overview',
  'ops.tickets',
  'ops.im',
  'analytics.read',
  'platform.partners',
  'platform.staff',
  'platform.integrations.read',
  'shop.catalog',
  'shop.storefront',
  'shop.orders',
  'shop.diy',
  'shop.shipping',
  'shop.promotions',
  'shop.reviews',
  'billing.slots',
  'legal.agreements',
  'app.bazi',
  'app.ziwei',
  'app.tarot',
] as const;

export type StaffPermission = (typeof STAFF_PERMISSIONS)[number];

/** 内容模块（自研控制面；内部可仍写 Payload） */
export const CONTENT_PERMISSIONS = [
  'content.pages',
  'content.media',
  'content.product',
  'content.heroes',
  'content.feed',
  'content.faith',
] as const;

export type ContentPermission = (typeof CONTENT_PERMISSIONS)[number];

/**
 * @deprecated Phase B 起等同 CONTENT_PERMISSIONS；保留导出名以免 CMS 旧 import 断裂
 */
export const CMS_COLLECTION_PERMISSIONS = CONTENT_PERMISSIONS;
/** @deprecated use ContentPermission */
export type CmsCollectionPermission = ContentPermission;

export type AnyStaffPermission = StaffPermission | ContentPermission;

/** 旧权限名 → canonical（可一对多） */
export const LEGACY_PERMISSION_ALIASES: Record<string, readonly AnyStaffPermission[]> = {
  'ops.messages': ['ops.tickets'],
  'shop.products': ['shop.catalog', 'shop.storefront'],
  'staff.manage': ['platform.staff'],
  'content.cms': [...CONTENT_PERMISSIONS],
  'content.cms.pages': ['content.pages'],
  'content.cms.media': ['content.media'],
  'content.cms.shop': ['content.product'],
  'content.cms.heroes': ['content.heroes'],
  'content.cms.feed': ['content.feed'],
  'content.cms.faith': ['content.faith'],
};

const CANONICAL_SET = new Set<string>([...STAFF_PERMISSIONS, ...CONTENT_PERMISSIONS]);

export function isCanonicalPermission(value: string): value is AnyStaffPermission {
  return CANONICAL_SET.has(value);
}

export function isKnownPermission(value: string): boolean {
  return isCanonicalPermission(value) || value in LEGACY_PERMISSION_ALIASES;
}

/** 将任意已知权限名展开为 canonical 列表 */
export function expandPermission(value: string): AnyStaffPermission[] {
  if (isCanonicalPermission(value)) return [value];
  const mapped = LEGACY_PERMISSION_ALIASES[value];
  return mapped ? [...mapped] : [];
}

export const STAFF_PERMISSION_LABELS: Record<StaffPermission, string> = {
  'ops.overview': '概览',
  'ops.tickets': '客服留言/工单',
  'ops.im': '在线客服',
  'analytics.read': '数据统计（只读）',
  'platform.partners': '合作方管理',
  'platform.staff': '子账号与权限',
  'platform.integrations.read': '集成状态（只读）',
  'shop.catalog': '商品与目录',
  'shop.storefront': '店铺展示',
  'shop.orders': '订单履约',
  'shop.diy': 'DIY 物料',
  'shop.shipping': '运费模板',
  'shop.promotions': '促销券',
  'shop.reviews': '评价审核',
  'billing.slots': '应用计费槽位',
  'legal.agreements': '协议管理',
  'app.bazi': '应用 · 八字',
  'app.ziwei': '应用 · 紫微',
  'app.tarot': '应用 · 塔罗',
};

export const CONTENT_PERMISSION_LABELS: Record<ContentPermission, string> = {
  'content.pages': '内容 · 页面',
  'content.media': '内容 · 媒体库',
  'content.product': '内容 · 商品内容',
  'content.heroes': '内容 · 各站 Hero',
  'content.feed': '内容 · 信息流',
  'content.faith': '内容 · 信仰/圣地',
};

/** @deprecated use CONTENT_PERMISSION_LABELS */
export const CMS_PERMISSION_LABELS: Record<string, string> = {
  ...CONTENT_PERMISSION_LABELS,
  'content.cms.pages': CONTENT_PERMISSION_LABELS['content.pages'],
  'content.cms.media': CONTENT_PERMISSION_LABELS['content.media'],
  'content.cms.shop': CONTENT_PERMISSION_LABELS['content.product'],
  'content.cms.heroes': CONTENT_PERMISSION_LABELS['content.heroes'],
  'content.cms.feed': CONTENT_PERMISSION_LABELS['content.feed'],
  'content.cms.faith': CONTENT_PERMISSION_LABELS['content.faith'],
  'content.cms': '内容全部',
};

export const ALL_PERMISSION_LABELS: Record<string, string> = {
  ...STAFF_PERMISSION_LABELS,
  ...CONTENT_PERMISSION_LABELS,
};

for (const [legacy, canonical] of Object.entries(LEGACY_PERMISSION_ALIASES)) {
  ALL_PERMISSION_LABELS[legacy] = canonical
    .map((c) => STAFF_PERMISSION_LABELS[c as StaffPermission] ?? CONTENT_PERMISSION_LABELS[c as ContentPermission] ?? c)
    .join(' + ');
}

export function permissionLabel(value: string): string {
  return ALL_PERMISSION_LABELS[value] ?? value;
}

const ROLE_DEFAULTS: Record<StaffRole, readonly AnyStaffPermission[]> = {
  admin: [...STAFF_PERMISSIONS, ...CONTENT_PERMISSIONS],
  shop_ops: [
    'ops.overview',
    'ops.tickets',
    'ops.im',
    'analytics.read',
    'platform.integrations.read',
    'shop.catalog',
    'shop.storefront',
    'shop.orders',
    'shop.diy',
    'shop.shipping',
    'shop.promotions',
    'shop.reviews',
    'content.product',
    'content.media',
    'app.bazi',
    'app.ziwei',
    'app.tarot',
  ],
  content_ops: [
    'ops.overview',
    'ops.tickets',
    'analytics.read',
    'platform.integrations.read',
    'legal.agreements',
    ...CONTENT_PERMISSIONS,
    'app.bazi',
    'app.ziwei',
    'app.tarot',
  ],
};

export type StaffPermissionInput = {
  role: StaffRole;
  grants?: readonly string[] | null;
  revokes?: readonly string[] | null;
};

function addExpanded(target: Set<AnyStaffPermission>, raw: string) {
  for (const p of expandPermission(raw)) target.add(p);
}

/** 角色默认 + grants − revokes → 有效权限集（canonical） */
export function resolveStaffPermissions(input: StaffPermissionInput): Set<AnyStaffPermission> {
  const base = new Set<AnyStaffPermission>(ROLE_DEFAULTS[input.role] ?? []);
  for (const g of input.grants ?? []) {
    if (isKnownPermission(g)) addExpanded(base, g);
  }
  for (const r of input.revokes ?? []) {
    if (isKnownPermission(r)) {
      for (const p of expandPermission(r)) base.delete(p);
    }
  }
  return base;
}

/**
 * 校验有效权限是否满足 required（required / effective 均可为旧名）
 */
export function hasStaffPermission(
  effective: ReadonlySet<string>,
  required: string,
): boolean {
  const needed = expandPermission(required);
  if (needed.length === 0) {
    // unknown required — deny
    return false;
  }
  const have = new Set<AnyStaffPermission>();
  for (const e of effective) {
    if (isKnownPermission(e)) addExpanded(have, e);
  }
  return needed.some((n) => have.has(n));
}

export function permissionsToArray(set: ReadonlySet<AnyStaffPermission>): AnyStaffPermission[] {
  return [...set].sort();
}

/**
 * 子账号可额外授予的权限（平台运营用）。
 * **永不包含 finance**（资金仅超管角色门闩）。
 */
export const ASSIGNABLE_EXTRA_PERMISSIONS: AnyStaffPermission[] = [
  'billing.slots',
  'platform.staff',
  'analytics.read',
  'ops.im',
  'shop.storefront',
  'legal.agreements',
  'platform.integrations.read',
  'app.bazi',
  'app.ziwei',
  'app.tarot',
  'content.heroes',
  'content.feed',
  'content.faith',
];

/**
 * 合作方模板可授权限（Phase D 使用；显式排除 platform.partners / finance）
 */
export const PARTNER_ASSIGNABLE_PERMISSIONS: AnyStaffPermission[] = [
  'ops.overview',
  'ops.tickets',
  'ops.im',
  'analytics.read',
  'platform.integrations.read',
  'shop.catalog',
  'shop.storefront',
  'shop.orders',
  'shop.diy',
  'shop.shipping',
  'shop.promotions',
  'shop.reviews',
  'billing.slots',
  'legal.agreements',
  ...CONTENT_PERMISSIONS,
  'app.bazi',
  'app.ziwei',
  'app.tarot',
];

/** 永不授出给合作方 / 子账号模板 */
export const PLATFORM_ONLY_PERMISSIONS: AnyStaffPermission[] = [
  'platform.partners',
];

export const CREATABLE_STAFF_ROLES: StaffRole[] = ['shop_ops', 'content_ops'];

/** content.* ↔ 旧 CMS 权限对照（文档/迁移用） */
export const CONTENT_CMS_PERMISSION_MAP: Record<ContentPermission, string> = {
  'content.pages': 'content.cms.pages',
  'content.media': 'content.cms.media',
  'content.product': 'content.cms.shop',
  'content.heroes': 'content.cms.heroes',
  'content.feed': 'content.cms.feed',
  'content.faith': 'content.cms.faith',
};
