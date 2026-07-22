export { AppShell, APP_BRANDS, ORASAGE_URLS, FixedBottomNav, AppBrandMark } from './AppShell';
export type { AppShellProps, LocaleOption } from './AppShell';
export { OrasageAuthChip } from './OrasageAuthChip';
export { SiteTopNav } from './SiteTopNav';
export { LocaleSwitcher } from './LocaleSwitcher';
export { setLocaleCookie, applyLocaleChange, CORE_LOCALES, LOCALE_COOKIE } from './locale-cookie';
export type { AppId, NavContext, OrasageUrls } from './config';
export {
  appBrandLabel,
  appHomeUrl,
  profileUrl,
  famousUrl,
  daozangUrl,
  exploreItems,
  isCurrentAppHome,
  isAppSubpage,
  shouldShowAppShellPageBack,
  isMainPortalHome,
  isOnPortalHome,
  isOnProfile,
  isOnTemple,
  getSiteApex,
  resolveClientSiteApex,
  orasageUrlsFor,
  apexFromHostname,
  normalizeSiteApex,
} from './config';

