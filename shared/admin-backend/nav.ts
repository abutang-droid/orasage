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
    label: '商品',
    href: '/products',
    isActive: (p) => p.startsWith('/products'),
  },
  {
    label: '珠子',
    href: '/beads',
    isActive: (p) => p.startsWith('/beads'),
  },
  {
    label: '订单',
    href: '/orders',
    isActive: (p) => p.startsWith('/orders'),
  },
  {
    label: '留言',
    href: '/messages',
    isActive: (p) => p.startsWith('/messages'),
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
