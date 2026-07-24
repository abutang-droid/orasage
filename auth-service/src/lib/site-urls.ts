/** Apex + public URLs for the current deployment (orasage | oricosmos). */
export function siteApex(): string {
  const raw =
    process.env.SITE_APEX ||
    process.env.NEXT_PUBLIC_SITE_APEX ||
    process.env.JWT_COOKIE_DOMAIN?.replace(/^\./, '') ||
    process.env.COOKIE_DOMAIN?.replace(/^\./, '') ||
    'orasage.com';
  return raw.replace(/^https?:\/\//, '').split('/')[0].trim();
}

export function siteUrls(apex = siteApex()) {
  return {
    main: `https://${apex}`,
    auth: `https://auth.${apex}`,
    shop: `https://shop.${apex}`,
    admin: `https://admin.${apex}`,
    bazi: `https://bazi.${apex}`,
    ziwei: `https://ziwei.${apex}`,
    tarot: `https://tarot.${apex}`,
    temple: `https://tarot.${apex}/temple`,
  };
}

export function allowedRedirectHosts(apex = siteApex()): string[] {
  return [
    apex,
    `auth.${apex}`,
    `admin.${apex}`,
    `shop.${apex}`,
    `bazi.${apex}`,
    `ziwei.${apex}`,
    `tarot.${apex}`,
    `cms.${apex}`,
  ];
}
