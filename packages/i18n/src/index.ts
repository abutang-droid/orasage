export {
  PHASE_1_LOCALES,
  CORE_LOCALES,
  EXTENDED_LOCALES,
  FUTURE_LOCALES,
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  LOCALE_OVERRIDE_COOKIE,
  isCoreLocale,
  isExtendedLocale,
  toCoreLocale,
  type CoreLocale,
  type ExtendedLocale,
  type Locale,
  type Phase1Locale,
} from './locales';

export { normalizeLocale, clampToActiveLocale } from './normalize';
export { detectLocale, detectLocaleFromBrowser, type DetectLocaleOptions } from './detect';
export { LOCALE_LABELS, FUTURE_LOCALE_LABELS, localeLabel } from './labels';
export { cookieDomain, cookieDomainFromHost, setLocaleCookie } from './cookie';
export {
  createTranslator,
  formatMessage,
  type MessageCatalog,
  type MessageParams,
  type Messages,
  type TranslateFn,
} from './messages';
export {
  TAROT_LANG_TO_LOCALE,
  LOCALE_TO_TAROT_LANG,
  localeFromTarotLang,
  tarotLangFromLocale,
  type TarotLang,
} from './bridge';
