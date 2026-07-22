import { pickLabel, SHELL_LABELS } from './labels';

export type AppId = 'bazi' | 'ziwei' | 'tarot' | 'shop';

/** Main 门户子页使用 portal 上下文 */
export type NavContext = AppId | 'portal';

export function isMainPortalHome(pathname: string): boolean {
  const p = pathname.replace(/\/$/, '') || '/';
  return p === '/';
}

export const APP_BRANDS: Record<AppId, string> = {
  bazi: 'BaZi',
  ziwei: 'ZiWei',
  tarot: 'Manto',
  shop: 'Energy',
};

/** 子应用品牌名（随 locale；中文商城用「能量商城」） */
export function appBrandLabel(appId: AppId, locale: string): string {
  if (appId === 'shop') {
    return pickLabel(SHELL_LABELS.energyShop, locale, APP_BRANDS.shop);
  }
  return pickLabel(SHELL_LABELS[appId], locale, APP_BRANDS[appId]);
}

export const ORASAGE_URLS = {
  main: 'https://orasage.com',
  bazi: 'https://bazi.orasage.com',
  ziwei: 'https://ziwei.orasage.com',
  tarot: 'https://tarot.orasage.com',
  shop: 'https://shop.orasage.com',
  authLogin: 'https://auth.orasage.com/login',
  temple: 'https://tarot.orasage.com/temple',
} as const;

export function mainPortalUrl(locale = 'zh-CN'): string {
  return `${ORASAGE_URLS.main}/${locale}`;
}

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
  shop: '/',
};

/** 子页面路径前缀 — 显示顶栏返回按钮 */
export const APP_SUBPAGE_PREFIXES: Record<AppId, string[]> = {
  bazi: ['/history'],
  ziwei: ['/knowledge', '/library', '/heming'],
  tarot: ['/reading', '/crystal', '/temple', '/history'],
  shop: ['/checkout', '/success', '/cart'],
};

/** 是否显示 AppShell 子页顶栏返回（按 APP_SUBPAGE_PREFIXES，与页面内返回链互斥） */
export function shouldShowAppShellPageBack(appId: AppId, pathname: string): boolean {
  if (!pathname || isCurrentAppHome(appId, pathname)) return false;
  return APP_SUBPAGE_PREFIXES[appId].some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function isAppSubpage(appId: AppId, pathname: string): boolean {
  if (!pathname) return false;
  return !isCurrentAppHome(appId, pathname);
}

export function isCurrentAppHome(appId: AppId, pathname: string): boolean {
  const home = APP_HOME_PATH[appId];
  if (home === '/') return pathname === '/' || pathname === '';
  if (appId === 'ziwei' && home === '/chart') {
    return pathname === '/chart' || pathname === '/chart/';
  }
  return pathname === home;
}

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

export function normalizePathname(pathname: string): string {
  return pathname.replace(/\/$/, '') || '/';
}

export function isOnPortalHome(pathname: string): boolean {
  return normalizePathname(pathname) === '/';
}

export function isOnProfile(pathname: string): boolean {
  const p = normalizePathname(pathname);
  return p === '/profile' || p.startsWith('/profile/');
}

export function isOnTemple(pathname: string): boolean {
  const p = normalizePathname(pathname);
  return p === '/temple' || p.startsWith('/temple/');
}
