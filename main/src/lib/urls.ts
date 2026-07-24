import { getSiteApex, orasageUrlsFor } from './orasage-app-shell/config';

const urls = orasageUrlsFor(getSiteApex());
const apex = getSiteApex();

export const externalUrls = {
  bazi: urls.bazi,
  ziwei: urls.ziwei,
  tarot: urls.tarot,
  temple: urls.temple,
  shop: urls.shop,
  auth: `https://auth.${apex}/center`,
  authLogin: urls.authLogin,
  cms: `https://admin.${apex}/cms`,
} as const;

/** 祈福 / 功德深链 */
export function tarotBlessingUrls(locale = 'zh-CN') {
  const portalBase = `https://${apex}/${locale}`;
  return {
    merit: `${portalBase}/profile/merit`,
    temple: externalUrls.temple,
    settings: `${portalBase}/profile/settings`,
    changeFaith: `${externalUrls.temple}?change=faith`,
    changeDeity: `${externalUrls.temple}?change=deity`,
  };
}
