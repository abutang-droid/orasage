export { AppShell, APP_BRANDS, ORASAGE_URLS, FixedBottomNav, AppBrandMark } from './AppShell';
export type { AppShellProps, LocaleOption } from './AppShell';
export { OrasageAuthChip } from './OrasageAuthChip';
export { SiteTopNav } from './SiteTopNav';
export { LocaleSwitcher } from './LocaleSwitcher';
export { PortalFooter } from './PortalFooter';
export type { PortalFooterProps } from './PortalFooter';
export { Disclaimer } from './Disclaimer';
export type { DisclaimerProps } from './Disclaimer';
export {
  disclaimerLocale,
  getDisclaimerCopy,
  getDisclaimerPlainText,
} from './disclaimer-copy';
export type { DisclaimerVariant, DisclaimerLocale } from './disclaimer-copy';
export { setLocaleCookie, applyLocaleChange, CORE_LOCALES, LOCALE_COOKIE } from './locale-cookie';
export { pickLabel, SHELL_LABELS } from './labels';
export type { AppId, NavContext } from './config';
export {
  appBrandLabel,
  appHomeUrl,
  profileUrl,
  famousUrl,
  daozangUrl,
  insightsUrl,
  originsUrl,
  readingsUrl,
  searchUrl,
  exploreItems,
  isCurrentAppHome,
  isAppSubpage,
  shouldShowAppShellPageBack,
  isMainPortalHome,
  resolveSecondNavSlot,
} from './config';
export { getPrimaryNavCategories, getUtilityNav } from './primary-nav';
export type { NavCategory, NavLink } from './primary-nav';
