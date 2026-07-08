import type { Lang } from '@/lib/i18n/context';
import { localeFromTarotLang, TAROT_LANG_TO_LOCALE } from '@orasage/i18n';
import { profileUrl } from '@/lib/orasage-app-shell/config';

export const LANG_TO_LOCALE = TAROT_LANG_TO_LOCALE;

export function localeFromLang(lang: Lang): string {
  return localeFromTarotLang(lang);
}

export function profileUrlFromLang(lang: Lang): string {
  return profileUrl(localeFromLang(lang));
}

export function profileSettingsUrlFromLang(lang: Lang): string {
  return `${profileUrlFromLang(lang)}/settings`;
}

export function profileMeritUrlFromLang(lang: Lang): string {
  return `${profileUrlFromLang(lang)}/merit`;
}
