export const externalUrls = {
  bazi: 'https://bazi.orasage.com',
  ziwei: 'https://ziwei.orasage.com',
  tarot: 'https://tarot.orasage.com',
  temple: 'https://tarot.orasage.com/temple',
  shop: 'https://shop.orasage.com',
  auth: 'https://auth.orasage.com/center',
  authLogin: 'https://auth.orasage.com/login',
  cms: 'https://admin.orasage.com/cms',
} as const;

function withQuery(url: string, key: 'lang' | 'locale', locale: string): string {
  const u = new URL(url);
  u.searchParams.set(key, locale);
  return u.toString();
}

/** Cross-subdomain links that preserve the active portal locale. */
export function externalUrlsForLocale(locale = 'zh-CN') {
  return {
    bazi: withQuery(externalUrls.bazi, 'lang', locale),
    ziwei: withQuery(externalUrls.ziwei, 'lang', locale),
    tarot: withQuery(externalUrls.tarot, 'lang', locale),
    temple: withQuery(externalUrls.temple, 'lang', locale),
    shop: withQuery(externalUrls.shop, 'locale', locale),
    auth: externalUrls.auth,
    authLogin: withQuery(externalUrls.authLogin, 'lang', locale),
    cms: externalUrls.cms,
  } as const;
}

/** 祈福 / 功德深链 */
export function tarotBlessingUrls(locale = 'zh-CN') {
  const portalBase = `https://orasage.com/${locale}`;
  const urls = externalUrlsForLocale(locale);
  return {
    merit: `${portalBase}/profile/merit`,
    temple: urls.temple,
    settings: `${portalBase}/profile/settings`,
    changeFaith: `${urls.temple}${urls.temple.includes('?') ? '&' : '?'}change=faith`,
    changeDeity: `${urls.temple}${urls.temple.includes('?') ? '&' : '?'}change=deity`,
  };
}
