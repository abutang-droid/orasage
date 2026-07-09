export type AdminNavItem = {
  label: string;
  href: string;
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
    label: '留言',
    href: '/messages',
    isActive: (p) => p.startsWith('/messages'),
  },
];

/** 商城组（R1：独立商城） */
export const SHOP_NAV_ITEMS: AdminNavItem[] = [
  {
    label: '商品',
    href: '/products',
    isActive: (p) => p.startsWith('/products'),
  },
  {
    label: '标签',
    href: '/shop/tags',
    isActive: (p) => p.startsWith('/shop/tags'),
  },
  {
    label: '分类',
    href: '/shop/categories',
    isActive: (p) => p.startsWith('/shop/categories'),
  },
  {
    label: 'DIY 物料',
    href: '/shop/diy',
    isActive: (p) => p.startsWith('/shop/diy') || p.startsWith('/beads'),
  },
  {
    label: '订单',
    href: '/shop/orders',
    isActive: (p) => p.startsWith('/shop/orders') || p.startsWith('/orders'),
  },
  {
    label: '运费模板',
    href: '/shop/shipping',
    isActive: (p) => p.startsWith('/shop/shipping'),
  },
];

/** 应用计费组（R6：app 调用参数 → 商城 SKU） */
export const BILLING_NAV_ITEMS: AdminNavItem[] = [
  {
    label: '计费槽位',
    href: '/billing',
    isActive: (p) => p.startsWith('/billing'),
  },
];

/** CMS 管理路径（经 admin.orasage.com/cms 反代，href 用浏览器完整路径） */
export const CMS_NAV_ITEMS: AdminNavItem[] = [
  {
    label: 'CMS 概览',
    href: '/cms/admin',
    isActive: (p) => p === '/admin' || p === '/admin/',
  },
  {
    label: '页面',
    href: '/cms/admin/collections/pages',
    isActive: (p) => p.includes('/collections/pages'),
  },
  {
    label: '媒体库',
    href: '/cms/admin/collections/media',
    isActive: (p) => p.includes('/collections/media'),
  },
  {
    label: '门户 Hero',
    href: '/cms/admin/globals/home-hero',
    isActive: (p) => p.includes('/globals/home-hero'),
  },
  {
    label: '商城 Hero',
    href: '/cms/admin/globals/shop-home-hero',
    isActive: (p) => p.includes('/globals/shop-home-hero'),
  },
  {
    label: '八字 Hero',
    href: '/cms/admin/globals/bazi-home-hero',
    isActive: (p) => p.includes('/globals/bazi-home-hero'),
  },
  {
    label: '紫微 Hero',
    href: '/cms/admin/globals/ziwei-home-hero',
    isActive: (p) => p.includes('/globals/ziwei-home-hero'),
  },
  {
    label: '塔罗 Hero',
    href: '/cms/admin/globals/tarot-home-hero',
    isActive: (p) => p.includes('/globals/tarot-home-hero'),
  },
  {
    label: '八字信息流',
    href: '/cms/admin/collections/bazi-feed',
    isActive: (p) => p.includes('/collections/bazi-feed'),
  },
  {
    label: '紫微信息流',
    href: '/cms/admin/collections/ziwei-feed',
    isActive: (p) => p.includes('/collections/ziwei-feed'),
  },
  {
    label: '宗教 / 圣地',
    href: '/cms/admin/collections/faiths',
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
