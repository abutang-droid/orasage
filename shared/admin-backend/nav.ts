import type { StaffRole } from '../staff-roles/index';

export type AdminNavItem = {
  label: string;
  href: string;
  /** 可见角色；缺省 = 全部运营员工 */
  roles?: readonly StaffRole[];
  /** 用于高亮当前项；pathname 为 Next usePathname() 返回值（不含 basePath） */
  isActive?: (pathname: string) => boolean;
};

export const OPS_NAV_ITEMS: AdminNavItem[] = [
  {
    label: '概览',
    href: '/',
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
    isActive: (p) => p.startsWith('/messages'),
  },
  {
    label: '在线客服',
    href: '/im',
    roles: ['admin', 'shop_ops'],
    isActive: (p) => p.startsWith('/im'),
  },
];

/** 商城组（R1：独立商城） */
export const SHOP_NAV_ITEMS: AdminNavItem[] = [
  {
    label: '商品',
    href: '/products',
    roles: ['admin', 'shop_ops'],
    isActive: (p) => p.startsWith('/products'),
  },
  {
    label: '标签',
    href: '/shop/tags',
    roles: ['admin', 'shop_ops'],
    isActive: (p) => p.startsWith('/shop/tags'),
  },
  {
    label: '分类',
    href: '/shop/categories',
    roles: ['admin', 'shop_ops'],
    isActive: (p) => p.startsWith('/shop/categories'),
  },
  {
    label: 'DIY 物料',
    href: '/shop/diy',
    roles: ['admin', 'shop_ops'],
    isActive: (p) => p.startsWith('/shop/diy') || p.startsWith('/beads'),
  },
  {
    label: '订单',
    href: '/shop/orders',
    roles: ['admin', 'shop_ops'],
    isActive: (p) => p.startsWith('/shop/orders') || p.startsWith('/orders'),
  },
  {
    label: '运费模板',
    href: '/shop/shipping',
    roles: ['admin', 'shop_ops'],
    isActive: (p) => p.startsWith('/shop/shipping'),
  },
  {
    label: '评价管理',
    href: '/shop/reviews',
    roles: ['admin', 'shop_ops'],
    isActive: (p) => p.startsWith('/shop/reviews'),
  },
  {
    label: '促销',
    href: '/shop/promotions',
    roles: ['admin', 'shop_ops'],
    isActive: (p) => p.startsWith('/shop/promotions'),
  },
];

/** 应用计费组（R6：app 调用参数 → 商城 SKU） */
export const BILLING_NAV_ITEMS: AdminNavItem[] = [
  {
    label: '计费槽位',
    href: '/billing',
    roles: ['admin'],
    isActive: (p) => p.startsWith('/billing'),
  },
];

/** CMS 管理路径（经 admin.orasage.com/cms 反代，href 用浏览器完整路径） */
export const CMS_NAV_ITEMS: AdminNavItem[] = [
  {
    label: 'CMS 概览',
    href: '/cms/admin',
    roles: ['admin', 'content_ops'],
    isActive: (p) => p === '/admin' || p === '/admin/',
  },
  {
    label: '页面',
    href: '/cms/admin/collections/pages',
    roles: ['admin', 'content_ops'],
    isActive: (p) => p.includes('/collections/pages'),
  },
  {
    label: '媒体库',
    href: '/cms/admin/collections/media',
    roles: ['admin', 'content_ops'],
    isActive: (p) => p.includes('/collections/media'),
  },
  {
    label: '商品精选评价',
    href: '/cms/admin/collections/shop-product-testimonials',
    roles: ['admin', 'content_ops'],
    isActive: (p) => p.includes('/collections/shop-product-testimonials'),
  },
  {
    label: '门户 Hero',
    href: '/cms/admin/globals/home-hero',
    roles: ['admin', 'content_ops'],
    isActive: (p) => p.includes('/globals/home-hero'),
  },
  {
    label: '商城 Hero',
    href: '/cms/admin/globals/shop-home-hero',
    roles: ['admin', 'content_ops'],
    isActive: (p) => p.includes('/globals/shop-home-hero'),
  },
  {
    label: '八字 Hero',
    href: '/cms/admin/globals/bazi-home-hero',
    roles: ['admin', 'content_ops'],
    isActive: (p) => p.includes('/globals/bazi-home-hero'),
  },
  {
    label: '紫微 Hero',
    href: '/cms/admin/globals/ziwei-home-hero',
    roles: ['admin', 'content_ops'],
    isActive: (p) => p.includes('/globals/ziwei-home-hero'),
  },
  {
    label: '塔罗 Hero',
    href: '/cms/admin/globals/tarot-home-hero',
    roles: ['admin', 'content_ops'],
    isActive: (p) => p.includes('/globals/tarot-home-hero'),
  },
  {
    label: '八字信息流',
    href: '/cms/admin/collections/bazi-feed',
    roles: ['admin', 'content_ops'],
    isActive: (p) => p.includes('/collections/bazi-feed'),
  },
  {
    label: '紫微信息流',
    href: '/cms/admin/collections/ziwei-feed',
    roles: ['admin', 'content_ops'],
    isActive: (p) => p.includes('/collections/ziwei-feed'),
  },
  {
    label: '宗教 / 圣地',
    href: '/cms/admin/collections/faiths',
    roles: ['admin', 'content_ops'],
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

export { canAccessNav } from '../staff-roles/index';
