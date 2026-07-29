/** 内部 CMS（Payload）逃生路径 — 仅超管「内部 CMS」导航使用；自研 /content/* 不再桥接 */

export type ContentAppId = 'main' | 'shop' | 'bazi' | 'ziwei' | 'tarot';

const HERO_BY_APP: Record<string, string> = {
  main: '/cms/admin/globals/home-hero',
  shop: '/cms/admin/globals/shop-home-hero',
  bazi: '/cms/admin/globals/bazi-home-hero',
  ziwei: '/cms/admin/globals/ziwei-home-hero',
  tarot: '/cms/admin/globals/tarot-home-hero',
};

const FEED_BY_APP: Record<string, string> = {
  bazi: '/cms/admin/collections/bazi-feed',
  ziwei: '/cms/admin/collections/ziwei-feed',
};

export function cmsHeroPath(app?: string | null): string {
  if (app && HERO_BY_APP[app]) return HERO_BY_APP[app];
  return '/cms/admin/globals/home-hero';
}

export function cmsFeedPath(app?: string | null): string {
  if (app && FEED_BY_APP[app]) return FEED_BY_APP[app];
  return '/cms/admin/collections/bazi-feed';
}

export const CMS_BRIDGE = {
  pages: '/cms/admin/collections/pages',
  media: '/cms/admin/collections/media',
  faith: '/cms/admin/collections/faiths',
  testimonials: '/cms/admin/collections/shop-product-testimonials',
  productPages: '/cms/admin/collections/shop-product-pages',
} as const;
