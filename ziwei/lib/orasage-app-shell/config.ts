export type AppId = 'bazi' | 'ziwei' | 'tarot';

export const APP_BRANDS: Record<AppId, string> = {
  bazi: 'BaZi',
  ziwei: 'ZiWei',
  tarot: 'ManTo',
};

export const ORASAGE_URLS = {
  main: 'https://orasage.com',
  bazi: 'https://bazi.orasage.com',
  ziwei: 'https://ziwei.orasage.com',
  tarot: 'https://tarot.orasage.com',
  shop: 'https://shop.orasage.com',
  authLogin: 'https://auth.orasage.com/login',
  temple: 'https://tarot.orasage.com/temple',
} as const;

export function profileUrl(locale = 'zh-CN'): string {
  return `${ORASAGE_URLS.main}/${locale}/profile`;
}

export function famousUrl(locale = 'zh-CN'): string {
  return `${ORASAGE_URLS.main}/${locale}/famous`;
}

export function daozangUrl(locale = 'zh-CN'): string {
  return `${ORASAGE_URLS.main}/${locale}/daozang`;
}

export const APP_HOME_PATH: Record<AppId, string> = {
  bazi: '/',
  ziwei: '/chart',
  tarot: '/',
};

export function appHomeUrl(appId: AppId): string {
  const base = ORASAGE_URLS[appId];
  const path = APP_HOME_PATH[appId];
  return path === '/' ? base : `${base}${path}`;
}

export type ExploreItem = {
  id: string;
  href: string;
  labels: Record<string, string>;
};

export function exploreItems(locale = 'zh-CN'): ExploreItem[] {
  return [
    {
      id: 'bazi',
      href: ORASAGE_URLS.bazi,
      labels: { 'zh-CN': '八字揭秘', en: 'BaZi Insights', 'zh-TW': '八字揭秘' },
    },
    {
      id: 'ziwei',
      href: ORASAGE_URLS.ziwei,
      labels: { 'zh-CN': '紫微斗数', en: 'ZiWei Dou Shu', 'zh-TW': '紫微斗數' },
    },
    {
      id: 'famous',
      href: famousUrl(locale),
      labels: { 'zh-CN': '名人案例', en: 'Famous Cases', 'zh-TW': '名人案例' },
    },
    {
      id: 'daozang',
      href: daozangUrl(locale),
      labels: { 'zh-CN': '道藏库', en: 'Dao Canon', 'zh-TW': '道藏庫' },
    },
  ];
}
