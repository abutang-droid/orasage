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

const KNOWN_APEXES = ['oricosmos.com', 'orasage.com'] as const;

export function normalizeSiteApex(raw: string): string {
  return raw
    .replace(/^https?:\/\//, '')
    .replace(/^\./, '')
    .split('/')[0]
    .trim()
    .toLowerCase();
}

/** Derive apex from a hostname (tarot.oricosmos.com → oricosmos.com). */
export function apexFromHostname(hostname: string): string | null {
  const host = hostname.toLowerCase().split(':')[0].trim();
  if (!host || host === 'localhost' || host === '127.0.0.1') return null;
  for (const apex of KNOWN_APEXES) {
    if (host === apex || host.endsWith(`.${apex}`)) return apex;
  }
  const parts = host.split('.').filter(Boolean);
  if (parts.length >= 2) return parts.slice(-2).join('.');
  return null;
}

/**
 * Apex host for the current deployment (orasage.com | oricosmos.com).
 * Priority: env → browser host → default orasage.com
 */
export function getSiteApex(): string {
  const raw =
    (typeof process !== 'undefined' &&
      (process.env.NEXT_PUBLIC_SITE_APEX ||
        process.env.SITE_APEX ||
        process.env.VITE_SITE_APEX)) ||
    '';
  if (raw) return normalizeSiteApex(raw);

  if (typeof window !== 'undefined' && window.location?.hostname) {
    const fromHost = apexFromHostname(window.location.hostname);
    if (fromHost) return fromHost;
  }

  return 'orasage.com';
}

export type OrasageUrls = {
  main: string;
  bazi: string;
  ziwei: string;
  tarot: string;
  shop: string;
  authLogin: string;
  temple: string;
};

export function orasageUrlsFor(apex: string = getSiteApex()): OrasageUrls {
  return {
    main: `https://${apex}`,
    bazi: `https://bazi.${apex}`,
    ziwei: `https://ziwei.${apex}`,
    tarot: `https://tarot.${apex}`,
    shop: `https://shop.${apex}`,
    authLogin: `https://auth.${apex}/login`,
    temple: `https://tarot.${apex}/temple`,
  };
}

/**
 * Cross-app public URLs — always resolved via getSiteApex() (env or runtime host).
 * Use property access at call sites (not module-level snapshots).
 */
export const ORASAGE_URLS: OrasageUrls = new Proxy({} as OrasageUrls, {
  get(_target, prop: string | symbol) {
    if (typeof prop !== 'string') return undefined;
    const urls = orasageUrlsFor(getSiteApex());
    return urls[prop as keyof OrasageUrls];
  },
});

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
