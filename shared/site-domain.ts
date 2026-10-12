/**
 * 公网站点根域名（如 orasage.com / orcos.win）。
 * 构建期：NEXT_PUBLIC_ROOT_DOMAIN / VITE_ROOT_DOMAIN / SITE_ROOT_DOMAIN
 * 运行期（浏览器）：从 hostname 推导（auth.orcos.win → orcos.win）
 */

const DEFAULT_ROOT_DOMAIN = 'orasage.com';

function readEnvRootDomain(): string | null {
  if (typeof process === 'undefined' || !process.env) return null;
  const candidates = [
    process.env.NEXT_PUBLIC_ROOT_DOMAIN,
    process.env.VITE_ROOT_DOMAIN,
    process.env.SITE_ROOT_DOMAIN,
    process.env.PUBLIC_ROOT_DOMAIN,
  ];
  for (const raw of candidates) {
    const v = (raw ?? '').trim().toLowerCase().replace(/^\.+/, '');
    if (v) return v;
  }
  return null;
}

/** 从 hostname 推导根域（仅处理常见两段 TLD，如 .com/.win） */
export function rootDomainFromHost(hostname: string): string | null {
  const host = hostname.trim().toLowerCase().replace(/\.$/, '');
  if (!host || host === 'localhost' || /^\d+\.\d+\.\d+\.\d+$/.test(host)) return null;
  const parts = host.split('.');
  if (parts.length < 2) return null;
  return parts.slice(-2).join('.');
}

export function getSiteRootDomain(): string {
  const fromEnv = readEnvRootDomain();
  if (fromEnv) return fromEnv;
  if (typeof window !== 'undefined' && window.location?.hostname) {
    return rootDomainFromHost(window.location.hostname) ?? DEFAULT_ROOT_DOMAIN;
  }
  return DEFAULT_ROOT_DOMAIN;
}

export type SiteUrls = {
  main: string;
  bazi: string;
  ziwei: string;
  tarot: string;
  shop: string;
  auth: string;
  authLogin: string;
  admin: string;
  temple: string;
  cms: string;
};

export function buildSiteUrls(rootDomain = getSiteRootDomain()): SiteUrls {
  const root = rootDomain.replace(/^\.+/, '');
  return {
    main: `https://${root}`,
    bazi: `https://bazi.${root}`,
    ziwei: `https://ziwei.${root}`,
    tarot: `https://tarot.${root}`,
    shop: `https://shop.${root}`,
    auth: `https://auth.${root}`,
    authLogin: `https://auth.${root}/login`,
    admin: `https://admin.${root}`,
    temple: `https://tarot.${root}/temple`,
    cms: `https://admin.${root}/cms`,
  };
}

export function siteCorsOrigins(rootDomain = getSiteRootDomain()): string[] {
  const u = buildSiteUrls(rootDomain);
  return [
    u.main,
    `https://www.${rootDomain}`,
    u.auth,
    u.shop,
    u.admin,
    u.bazi,
    u.ziwei,
    u.tarot,
  ];
}

export function siteAllowedHosts(rootDomain = getSiteRootDomain()): string[] {
  const u = buildSiteUrls(rootDomain);
  return [
    rootDomain,
    `www.${rootDomain}`,
    new URL(u.auth).hostname,
    new URL(u.admin).hostname,
    new URL(u.shop).hostname,
    new URL(u.bazi).hostname,
    new URL(u.ziwei).hostname,
    new URL(u.tarot).hostname,
  ];
}
