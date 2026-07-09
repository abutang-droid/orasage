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

export const OPS_NAV_ITEMS: AdminNavItem[] = [
  {
    label: '概览',
    href: '/',
    permission: 'ops.overview',
    isActive: (p) => p === '/' || p === '',
  },
  {
    label: '数据统计',
    href: '/analytics',
    isActive: (p) => p.startsWith('/analytics'),
  },
  {
    label: '资金对账',
    href: '/finance',
    roles: ['admin'],
    isActive: (p) => p.startsWith('/finance'),
  },
  {
    label: '留言',
    href: '/messages',
    permission: 'ops.messages',
    isActive: (p) => p.startsWith('/messages'),
  },
  {
    label: '在线客服',
    href: '/im',
    roles: ['admin', 'shop_ops'],
    isActive: (p) => p.startsWith('/im'),
  },
  {
    label: '子账号',
    href: '/staff',
    permission: 'staff.manage',
    isActive: (p) => p.startsWith('/staff'),
  },
  {
    label: '用户钱包',
    href: '/wallets',
    roles: ['admin'],
    isActive: (p) => p.startsWith('/wallets'),
  },
];

/** 商城组（R1：独立商城） */
export const SHOP_NAV_ITEMS: AdminNavItem[] = [
  {
    label: '商品',
    href: '/products',
    permission: 'shop.products',
    isActive: (p) => p.startsWith('/products'),
  },
  {
    label: '标签',
    href: '/shop/tags',
    permission: 'shop.products',
    isActive: (p) => p.startsWith('/shop/tags'),
  },
  {
    label: '分类',
    href: '/shop/categories',
    permission: 'shop.products',
    isActive: (p) => p.startsWith('/shop/categories'),
  },
  {
    label: 'DIY 物料',
    href: '/shop/diy',
    permission: 'shop.diy',
    isActive: (p) => p.startsWith('/shop/diy') || p.startsWith('/beads'),
  },
  {
    label: '订单',
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
    label: '评价管理',
    href: '/shop/reviews',
    permission: 'shop.reviews',
    isActive: (p) => p.startsWith('/shop/reviews'),
  },
  {
    label: '促销',
    href: '/shop/promotions',
    permission: 'shop.promotions',
    isActive: (p) => p.startsWith('/shop/promotions'),
  },
  {
    label: '水晶专题',
    href: '/shop/crystal-home',
    permission: 'shop.products',
    isActive: (p) => p.startsWith('/shop/crystal-home'),
  },
];

/** 应用计费组（R6：app 调用参数 → 商城 SKU） */
export const BILLING_NAV_ITEMS: AdminNavItem[] = [
  {
    label: '计费槽位',
    href: '/billing',
    permission: 'billing.slots',
    isActive: (p) => p.startsWith('/billing'),
  },
];

/** CMS 管理路径（经 admin.orasage.com/cms 反代，href 用浏览器完整路径） */
export const CMS_NAV_ITEMS: AdminNavItem[] = [
  {
    label: 'CMS 概览',
    href: '/cms/admin',
    permission: 'content.cms',
    isActive: (p) => p === '/admin' || p === '/admin/',
  },
  {
    label: '页面',
    href: '/cms/admin/collections/pages',
    permission: 'content.cms.pages',
    isActive: (p) => p.includes('/collections/pages'),
  },
  {
    label: '媒体库',
    href: '/cms/admin/collections/media',
    permission: 'content.cms.media',
    isActive: (p) => p.includes('/collections/media'),
  },
  {
    label: '商品精选评价',
    href: '/cms/admin/collections/shop-product-testimonials',
    permission: 'content.cms.shop',
    isActive: (p) => p.includes('/collections/shop-product-testimonials'),
  },
  {
    label: '门户 Hero',
    href: '/cms/admin/globals/home-hero',
    permission: 'content.cms.heroes',
    isActive: (p) => p.includes('/globals/home-hero'),
  },
  {
    label: '商城 Hero',
    href: '/cms/admin/globals/shop-home-hero',
    permission: 'content.cms.heroes',
    isActive: (p) => p.includes('/globals/shop-home-hero'),
  },
  {
    label: '八字 Hero',
    href: '/cms/admin/globals/bazi-home-hero',
    permission: 'content.cms.heroes',
    isActive: (p) => p.includes('/globals/bazi-home-hero'),
  },
  {
    label: '紫微 Hero',
    href: '/cms/admin/globals/ziwei-home-hero',
    permission: 'content.cms.heroes',
    isActive: (p) => p.includes('/globals/ziwei-home-hero'),
  },
  {
    label: '塔罗 Hero',
    href: '/cms/admin/globals/tarot-home-hero',
    permission: 'content.cms.heroes',
    isActive: (p) => p.includes('/globals/tarot-home-hero'),
  },
  {
    label: '八字信息流',
    href: '/cms/admin/collections/bazi-feed',
    permission: 'content.cms.feed',
    isActive: (p) => p.includes('/collections/bazi-feed'),
  },
  {
    label: '紫微信息流',
    href: '/cms/admin/collections/ziwei-feed',
    permission: 'content.cms.feed',
    isActive: (p) => p.includes('/collections/ziwei-feed'),
  },
  {
    label: '宗教 / 圣地',
    href: '/cms/admin/collections/faiths',
    permission: 'content.cms.faith',
    isActive: (p) =>
      p.includes('/collections/faiths') ||
      p.includes('/collections/sanctuaries') ||
      p.includes('/collections/geo-regions') ||
      p.includes('/collections/geo-countries') ||
      p.includes('/collections/country-faiths'),
  },
];

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
    return hasStaffPermission(permissions, item.permission);
  }
  return canAccessNav(role, item.roles);
}

export { canAccessNav } from '../staff-roles/index';
