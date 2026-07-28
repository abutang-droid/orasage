import { canAccessNav, type StaffRole } from '../staff-roles/index';
import type { AnyStaffPermission } from '../staff-permissions/index';
import { hasStaffPermission } from '../staff-permissions/index';

export type AdminNavItem = {
  label: string;
  href: string;
  /** 权限点（7a 优先） */
  permission?: AnyStaffPermission;
  /** 可见角色（permission 缺省时回退） */
  roles?: readonly StaffRole[];
  isActive?: (pathname: string) => boolean;
};

export type AdminNavGroup = {
  id: string;
  title: string;
  items: AdminNavItem[];
  /** 仅这些角色可见整组（再叠加 item 级权限） */
  roles?: readonly StaffRole[];
  /** 超管侧栏折叠「内部 CMS」 */
  collapsibleAdminOnly?: boolean;
};

/** 平台 */
export const PLATFORM_NAV_ITEMS: AdminNavItem[] = [
  {
    label: '概览',
    href: '/',
    permission: 'ops.overview',
    isActive: (p) => p === '/' || p === '',
  },
  {
    label: '合作方',
    href: '/partners',
    roles: ['admin'],
    isActive: (p) => p.startsWith('/partners'),
  },
  {
    label: '子账号与权限',
    href: '/staff',
    permission: 'staff.manage',
    isActive: (p) => p.startsWith('/staff'),
  },
  {
    label: '集成状态',
    href: '/integrations',
    isActive: (p) => p.startsWith('/integrations'),
  },
  {
    label: '更新日志',
    href: '/changelog',
    isActive: (p) => p.startsWith('/changelog'),
  },
];

/** 商城 */
export const SHOP_NAV_ITEMS: AdminNavItem[] = [
  {
    label: '商品',
    href: '/shop/products',
    permission: 'shop.products',
    isActive: (p) => p.startsWith('/shop/products') || p.startsWith('/products'),
  },
  {
    label: '分类',
    href: '/shop/categories',
    permission: 'shop.products',
    isActive: (p) => p.startsWith('/shop/categories'),
  },
  {
    label: '标签',
    href: '/shop/tags',
    permission: 'shop.products',
    isActive: (p) => p.startsWith('/shop/tags'),
  },
  {
    label: 'DIY 物料',
    href: '/shop/diy',
    permission: 'shop.diy',
    isActive: (p) => p.startsWith('/shop/diy') || p.startsWith('/beads'),
  },
  {
    label: '订单与履约',
    href: '/shop/orders',
    permission: 'shop.orders',
    isActive: (p) => p.startsWith('/shop/orders') || p.startsWith('/orders'),
  },
  {
    label: '运费模板',
    href: '/shop/shipping',
    permission: 'shop.shipping',
    isActive: (p) => p.startsWith('/shop/shipping'),
  },
  {
    label: '促销',
    href: '/shop/promotions',
    permission: 'shop.promotions',
    isActive: (p) => p.startsWith('/shop/promotions'),
  },
  {
    label: '评价审核',
    href: '/shop/reviews',
    permission: 'shop.reviews',
    isActive: (p) => p.startsWith('/shop/reviews'),
  },
  {
    label: '店铺展示',
    href: '/shop/storefront',
    permission: 'shop.products',
    isActive: (p) => p.startsWith('/shop/storefront') || p.startsWith('/shop/crystal-home'),
  },
];

/** 应用计费 */
export const BILLING_NAV_ITEMS: AdminNavItem[] = [
  {
    label: '计费槽位',
    href: '/billing',
    permission: 'billing.slots',
    isActive: (p) => p.startsWith('/billing'),
  },
];

/**
 * 内容（Phase A：自研路径，内部仍桥接到 Payload；
 * 第三方将来只走自研 UI，不暴露 /cms/admin）
 */
export const CONTENT_NAV_ITEMS: AdminNavItem[] = [
  {
    label: '页面与文章',
    href: '/content/pages',
    permission: 'content.cms.pages',
    isActive: (p) => p.startsWith('/content/pages'),
  },
  {
    label: '媒体库',
    href: '/content/media',
    permission: 'content.cms.media',
    isActive: (p) => p.startsWith('/content/media'),
  },
  {
    label: '商品内容',
    href: '/content/products',
    permission: 'content.cms.shop',
    isActive: (p) => p.startsWith('/content/products'),
  },
  {
    label: '各站 Hero',
    href: '/content/heroes',
    permission: 'content.cms.heroes',
    isActive: (p) => p.startsWith('/content/heroes'),
  },
  {
    label: '信息流',
    href: '/content/feeds',
    permission: 'content.cms.feed',
    isActive: (p) => p.startsWith('/content/feeds'),
  },
  {
    label: '信仰与圣地',
    href: '/content/faith',
    permission: 'content.cms.faith',
    isActive: (p) => p.startsWith('/content/faith'),
  },
];

/** 合规 */
export const LEGAL_NAV_ITEMS: AdminNavItem[] = [
  {
    label: '协议管理',
    href: '/legal/agreements',
    permission: 'content.cms.pages',
    isActive: (p) => p.startsWith('/legal'),
  },
];

/** 应用 Config Pack 入口（Phase A：全体员工可见概览壳；细权在 Phase B） */
export const APPS_NAV_ITEMS: AdminNavItem[] = [
  {
    label: '八字',
    href: '/apps/bazi',
    isActive: (p) => p.startsWith('/apps/bazi'),
  },
  {
    label: '紫微',
    href: '/apps/ziwei',
    isActive: (p) => p.startsWith('/apps/ziwei'),
  },
  {
    label: '塔罗',
    href: '/apps/tarot',
    isActive: (p) => p.startsWith('/apps/tarot'),
  },
];

/** 客服 */
export const OPS_NAV_ITEMS: AdminNavItem[] = [
  {
    label: '留言',
    href: '/ops/messages',
    permission: 'ops.messages',
    isActive: (p) => p.startsWith('/ops/messages') || p.startsWith('/messages'),
  },
  {
    label: '在线客服',
    href: '/ops/im',
    roles: ['admin', 'shop_ops'],
    isActive: (p) => p.startsWith('/ops/im') || p.startsWith('/im'),
  },
];

/** 数据 */
export const ANALYTICS_NAV_ITEMS: AdminNavItem[] = [
  {
    label: '数据统计',
    href: '/analytics',
    isActive: (p) => p.startsWith('/analytics'),
  },
];

/** 资金（仅平台超管） */
export const FINANCE_NAV_ITEMS: AdminNavItem[] = [
  {
    label: '资金对账',
    href: '/finance',
    roles: ['admin'],
    isActive: (p) => p.startsWith('/finance'),
  },
  {
    label: '用户钱包',
    href: '/wallets',
    roles: ['admin'],
    isActive: (p) => p.startsWith('/wallets'),
  },
];

/** 超管折叠：直接 Payload（非交付面） */
export const INTERNAL_CMS_NAV_ITEMS: AdminNavItem[] = [
  {
    label: 'CMS 概览',
    href: '/cms/admin',
    roles: ['admin'],
    isActive: (p) => p === '/admin' || p === '/admin/' || p === '/cms/admin',
  },
  {
    label: '页面',
    href: '/cms/admin/collections/pages',
    roles: ['admin'],
    isActive: (p) => p.includes('/collections/pages'),
  },
  {
    label: '媒体库',
    href: '/cms/admin/collections/media',
    roles: ['admin'],
    isActive: (p) => p.includes('/collections/media'),
  },
  {
    label: '商品精选评价',
    href: '/cms/admin/collections/shop-product-testimonials',
    roles: ['admin'],
    isActive: (p) => p.includes('/collections/shop-product-testimonials'),
  },
  {
    label: '门户 Hero',
    href: '/cms/admin/globals/home-hero',
    roles: ['admin'],
    isActive: (p) => p.includes('/globals/home-hero'),
  },
  {
    label: '商城 Hero',
    href: '/cms/admin/globals/shop-home-hero',
    roles: ['admin'],
    isActive: (p) => p.includes('/globals/shop-home-hero'),
  },
  {
    label: '八字 / 紫微 / 塔罗 Hero',
    href: '/cms/admin/globals/bazi-home-hero',
    roles: ['admin'],
    isActive: (p) =>
      p.includes('/globals/bazi-home-hero')
      || p.includes('/globals/ziwei-home-hero')
      || p.includes('/globals/tarot-home-hero'),
  },
  {
    label: '信息流 / 信仰',
    href: '/cms/admin/collections/bazi-feed',
    roles: ['admin'],
    isActive: (p) =>
      p.includes('/collections/bazi-feed')
      || p.includes('/collections/ziwei-feed')
      || p.includes('/collections/faiths')
      || p.includes('/collections/sanctuaries'),
  },
];

export const ADMIN_NAV_GROUPS: AdminNavGroup[] = [
  { id: 'platform', title: '平台', items: PLATFORM_NAV_ITEMS },
  { id: 'shop', title: '商城', items: SHOP_NAV_ITEMS },
  { id: 'billing', title: '应用计费', items: BILLING_NAV_ITEMS },
  { id: 'content', title: '内容', items: CONTENT_NAV_ITEMS },
  { id: 'legal', title: '合规', items: LEGAL_NAV_ITEMS },
  { id: 'apps', title: '应用', items: APPS_NAV_ITEMS },
  { id: 'ops', title: '客服', items: OPS_NAV_ITEMS },
  { id: 'analytics', title: '数据', items: ANALYTICS_NAV_ITEMS },
  { id: 'finance', title: '资金', items: FINANCE_NAV_ITEMS, roles: ['admin'] },
  {
    id: 'internal-cms',
    title: '内部 CMS',
    items: INTERNAL_CMS_NAV_ITEMS,
    roles: ['admin'],
    collapsibleAdminOnly: true,
  },
];

/** @deprecated 使用 ADMIN_NAV_GROUPS；保留导出以免旧 import 断裂 */
export const CMS_NAV_ITEMS = INTERNAL_CMS_NAV_ITEMS;

export function navItemActive(item: AdminNavItem, pathname: string): boolean {
  if (item.isActive) return item.isActive(pathname);
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

export function canAccessNavItem(
  permissions: ReadonlySet<AnyStaffPermission>,
  role: StaffRole,
  item: AdminNavItem,
): boolean {
  if (item.permission) {
    // content.cms 隐含子权限
    if (hasStaffPermission(permissions, item.permission)) return true;
    return false;
  }
  return canAccessNav(role, item.roles);
}

export function filterNavItems(
  items: readonly AdminNavItem[],
  permissions: ReadonlySet<AnyStaffPermission>,
  role: StaffRole,
): AdminNavItem[] {
  return items.filter((item) => canAccessNavItem(permissions, role, item));
}

export function filterNavGroups(
  groups: readonly AdminNavGroup[],
  permissions: ReadonlySet<AnyStaffPermission>,
  role: StaffRole,
): AdminNavGroup[] {
  return groups
    .filter((group) => {
      if (group.roles && role !== 'admin' && !group.roles.includes(role)) return false;
      if (group.collapsibleAdminOnly && role !== 'admin') return false;
      return true;
    })
    .map((group) => ({
      ...group,
      items: filterNavItems(group.items, permissions, role),
    }))
    .filter((group) => group.items.length > 0);
}

export { canAccessNav } from '../staff-roles/index';
