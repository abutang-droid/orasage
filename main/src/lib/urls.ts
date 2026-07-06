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

/** 祈福 / 功德深链 */
export function tarotBlessingUrls(locale = 'zh-CN') {
  const portalBase = `https://orasage.com/${locale}`;
  return {
    merit: `${portalBase}/profile/merit`,
    temple: externalUrls.temple,
    settings: `${portalBase}/profile/settings`,
    changeFaith: `${externalUrls.temple}?change=faith`,
    changeDeity: `${externalUrls.temple}?change=deity`,
  };
}
