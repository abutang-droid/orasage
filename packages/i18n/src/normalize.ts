import { DEFAULT_LOCALE } from './locales';

/** BCP 47 locale normalization — single source for all apps */
export function normalizeLocale(input?: string | null): string {
  if (!input?.trim()) return DEFAULT_LOCALE;
  const tag = input.trim().replace('_', '-');
  const lower = tag.toLowerCase();
  if (lower === 'zh' || lower === 'zh-hans') return 'zh-CN';
  if (lower.startsWith('zh-tw') || lower === 'zh-hant' || lower.startsWith('zh-hk')) return 'zh-TW';
  if (lower.startsWith('zh')) return 'zh-CN';
  if (lower.startsWith('pt')) return 'pt-BR';
  if (lower.startsWith('es')) return 'es';
  if (lower.startsWith('en')) return 'en';
  if (lower.startsWith('fr')) return 'fr';
  if (lower.startsWith('de')) return 'de';
  if (lower.startsWith('ja')) return 'ja';
  if (lower.startsWith('ko')) return 'ko';
  if (lower.startsWith('vi')) return 'vi';
  if (lower.startsWith('th')) return 'th';
  if (lower.startsWith('ar')) return 'ar';
  return tag;
}
