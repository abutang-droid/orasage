import type { StaffRole } from '../staff-roles/index';

/** 运营后台权限点（7a）；与 admin-api 路由、侧栏导航、CMS collection 对齐 */
export const STAFF_PERMISSIONS = [
  'ops.overview',
  'ops.messages',
  'shop.products',
  'shop.orders',
  'shop.diy',
  'shop.shipping',
  'shop.promotions',
  'shop.reviews',
  'billing.slots',
  'content.cms',
  'staff.manage',
] as const;

export type StaffPermission = (typeof STAFF_PERMISSIONS)[number];

/** CMS 子权限；持有 content.cms 则默认包含全部子项 */
export const CMS_COLLECTION_PERMISSIONS = [
  'content.cms.pages',
  'content.cms.media',
  'content.cms.shop',
  'content.cms.heroes',
  'content.cms.feed',
  'content.cms.faith',
] as const;

export type CmsCollectionPermission = (typeof CMS_COLLECTION_PERMISSIONS)[number];

export type AnyStaffPermission = StaffPermission | CmsCollectionPermission;

export const STAFF_PERMISSION_LABELS: Record<StaffPermission, string> = {
  'ops.overview': '概览',
  'ops.messages': '留言/工单',
  'shop.products': '商品与目录',
  'shop.orders': '订单履约',
  'shop.diy': 'DIY 物料',
  'shop.shipping': '运费模板',
  'shop.promotions': '促销券',
  'shop.reviews': '评价管理',
  'billing.slots': '应用计费槽位',
  'content.cms': 'CMS 全部内容',
  'staff.manage': '子账号管理',
};

export const CMS_PERMISSION_LABELS: Record<CmsCollectionPermission, string> = {
  'content.cms.pages': 'CMS · 页面',
  'content.cms.media': 'CMS · 媒体库',
  'content.cms.shop': 'CMS · 商城内容',
  'content.cms.heroes': 'CMS · 各站 Hero',
  'content.cms.feed': 'CMS · 八字/紫微信息流',
  'content.cms.faith': 'CMS · 宗教/圣地',
};

const ROLE_DEFAULTS: Record<StaffRole, readonly AnyStaffPermission[]> = {
  admin: [...STAFF_PERMISSIONS, ...CMS_COLLECTION_PERMISSIONS],
  shop_ops: [
    'ops.overview',
    'ops.messages',
    'shop.products',
    'shop.orders',
    'shop.diy',
    'shop.shipping',
    'shop.promotions',
    'shop.reviews',
    // 商品编辑页通过 admin 代理写入 CMS 详情页与媒体
    'content.cms.shop',
    'content.cms.media',
  ],
  content_ops: [
    'ops.overview',
    'ops.messages',
    'content.cms',
    ...CMS_COLLECTION_PERMISSIONS,
  ],
};

export type StaffPermissionInput = {
  role: StaffRole;
  grants?: readonly string[] | null;
  revokes?: readonly string[] | null;
};

function isKnownPermission(value: string): value is AnyStaffPermission {
  return (STAFF_PERMISSIONS as readonly string[]).includes(value)
    || (CMS_COLLECTION_PERMISSIONS as readonly string[]).includes(value);
}

/** 角色默认 + grants − revokes → 有效权限集 */
export function resolveStaffPermissions(input: StaffPermissionInput): Set<AnyStaffPermission> {
  const base = new Set<AnyStaffPermission>(ROLE_DEFAULTS[input.role] ?? []);
  for (const g of input.grants ?? []) {
    if (isKnownPermission(g)) base.add(g);
  }
  for (const r of input.revokes ?? []) {
    if (isKnownPermission(r)) base.delete(r);
  }
  // content.cms 隐含全部 CMS 子权限（除非被 revoke 掉）
  if (base.has('content.cms')) {
    for (const cms of CMS_COLLECTION_PERMISSIONS) {
      if (!(input.revokes ?? []).includes(cms)) base.add(cms);
    }
  }
  return base;
}

export function hasStaffPermission(
  effective: ReadonlySet<AnyStaffPermission>,
  required: AnyStaffPermission,
): boolean {
  if (effective.has(required)) return true;
  // shop.* 风格：无通配符实现，调用方传具体权限
  if (required.startsWith('content.cms.') && effective.has('content.cms')) return true;
  return false;
}

export function permissionsToArray(set: ReadonlySet<AnyStaffPermission>): AnyStaffPermission[] {
  return [...set].sort();
}

/** 可分配给子账号的额外权限（不含 staff.manage，不含 admin 专属 billing 除非显式 grant） */
export const ASSIGNABLE_EXTRA_PERMISSIONS: StaffPermission[] = [
  'billing.slots',
  'staff.manage',
];

export const CREATABLE_STAFF_ROLES: StaffRole[] = ['shop_ops', 'content_ops'];
