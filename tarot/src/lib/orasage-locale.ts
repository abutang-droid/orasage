import type { Lang } from '@/lib/i18n/context';
import { profileUrl } from '@/lib/orasage-app-shell/config';

export const LANG_TO_LOCALE: Record<Lang, string> = {
  zh: 'zh-CN',
  en: 'en',
  pt: 'pt-BR',
  es: 'es',
};

export function localeFromLang(lang: Lang): string {
  return LANG_TO_LOCALE[lang] ?? 'zh-CN';
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
