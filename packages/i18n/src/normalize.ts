import { DEFAULT_LOCALE, isCoreLocale, toCoreLocale, type CoreLocale } from './locales';

/** Clamp any normalized tag to phase-1 active locales */
export function clampToActiveLocale(locale: string): CoreLocale {
  if (isCoreLocale(locale)) return locale;
  return toCoreLocale(locale);
}

/** BCP 47 locale normalization — single source for all apps */
export function normalizeLocale(input?: string | null): string {
  if (!input?.trim()) return DEFAULT_LOCALE;
  const tag = input.trim().replace('_', '-');
  const lower = tag.toLowerCase();
  if (lower === '*' || lower === 'und') return DEFAULT_LOCALE;
  if (lower === 'zh' || lower === 'zh-hans') return 'zh-CN';
  if (lower.startsWith('zh-tw') || lower === 'zh-hant' || lower.startsWith('zh-hk')) return 'zh-CN';
  if (lower.startsWith('zh')) return 'zh-CN';
  if (lower.startsWith('pt')) return 'pt-BR';
  if (lower.startsWith('en')) return 'en';
  if (lower.startsWith('es')) return 'en';
  if (lower.startsWith('fr')) return 'en';
  if (lower.startsWith('de')) return 'en';
  if (lower.startsWith('ja')) return 'en';
  if (lower.startsWith('ko')) return 'en';
  if (lower.startsWith('vi')) return 'en';
  if (lower.startsWith('th')) return 'en';
  if (lower.startsWith('ar')) return 'en';
  return clampToActiveLocale(tag);
}
