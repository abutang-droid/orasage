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
  tarot: 'ManTo',
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
  shop: ['/success'],
};

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

/** 底栏第 2 键探索轮换项（八字 / 塔罗 / 紫微 / 道藏 / 名人） */
export const BOTTOM_NAV_ROTATION = ['bazi', 'tarot', 'ziwei', 'daozang', 'famous'] as const;
export type BottomNavRotationId = (typeof BOTTOM_NAV_ROTATION)[number];

/** 固定底栏锚点页 — 与第 1/3/4/5 键功能重叠时需轮换第 2 键 */
export type NavAnchor = 'portal-home' | 'temple' | 'shop' | 'profile';

export const ANCHOR_ROTATION_SLOT: Record<NavAnchor, BottomNavRotationId> = {
  'portal-home': 'bazi',
  temple: 'ziwei',
  shop: 'tarot',
  profile: 'famous',
};

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

export function detectNavAnchor(context: NavContext, pathname: string): NavAnchor | null {
  if (context === 'portal') {
    if (isOnPortalHome(pathname)) return 'portal-home';
    if (isOnProfile(pathname)) return 'profile';
    return null;
  }
  if (context === 'shop' && isCurrentAppHome('shop', pathname)) return 'shop';
  if (isOnTemple(pathname)) return 'temple';
  return null;
}

export function rotationExploreLink(
  id: BottomNavRotationId,
  locale: string,
): { href: string; label: string } {
  switch (id) {
    case 'bazi':
      return { href: ORASAGE_URLS.bazi, label: pickLabel(SHELL_LABELS.bazi, locale) };
    case 'tarot':
      return { href: ORASAGE_URLS.tarot, label: pickLabel(SHELL_LABELS.tarot, locale) };
    case 'ziwei':
      return { href: ORASAGE_URLS.ziwei, label: pickLabel(SHELL_LABELS.ziwei, locale) };
    case 'daozang':
      return { href: daozangUrl(locale), label: pickLabel(SHELL_LABELS.daozang, locale) };
    case 'famous':
      return { href: famousUrl(locale), label: pickLabel(SHELL_LABELS.famous, locale) };
  }
}

export type SecondNavSlot = {
  href: string;
  label: string;
  active: boolean;
};

/** 底栏第 2 键：锚点页用探索轮换，否则为当前子应用品牌 */
export function resolveSecondNavSlot(
  context: NavContext,
  pathname: string,
  locale: string,
): SecondNavSlot {
  const anchor = detectNavAnchor(context, pathname);
  if (anchor) {
    const link = rotationExploreLink(ANCHOR_ROTATION_SLOT[anchor], locale);
    return { href: link.href, label: link.label, active: false };
  }

  if (context === 'portal') {
    return { href: mainPortalUrl(locale), label: 'OraSage', active: false };
  }

  const appId = context;
  return {
    href: appHomeUrl(appId),
    label: appBrandLabel(appId, locale),
    active: isCurrentAppHome(appId, pathname),
  };
}
