/**
 * AI output locale — shared convention for all LLM call sites.
 *
 * Request bodies may send `language` (preferred), `locale`, or `lang`.
 * Resolution priority: explicit body param > ?lang= query > locale cookie > Accept-Language.
 */

import {
  detectLocale,
  LOCALE_COOKIE,
  LOCALE_OVERRIDE_COOKIE,
  normalizeLocale,
} from '../../packages/i18n/src';

export type AiLocale = 'zh-CN' | 'zh-TW' | 'en' | 'pt-BR';

/** Preferred body field for new API clients; `locale` / `lang` accepted for compatibility. */
export const AI_LOCALE_BODY_KEYS = ['language', 'locale', 'lang'] as const;

export type ResolveAiLocaleInput = {
  language?: string | null;
  locale?: string | null;
  lang?: string | null;
  queryLocale?: string | null;
  cookieLocale?: string | null;
  acceptLanguage?: string | null;
};

export function readLocaleFromCookieHeader(cookieHeader: string | null | undefined): string | null {
  if (!cookieHeader) return null;
  const cookies = cookieHeader.split(';').map((c) => c.trim());
  const read = (name: string) =>
    cookies.find((c) => c.startsWith(`${name}=`))?.slice(name.length + 1) ?? null;
  try {
    // Prefer portal NEXT_LOCALE; shop override is fallback only.
    const base = read(LOCALE_COOKIE);
    if (base) return decodeURIComponent(base);
    const override = read(LOCALE_OVERRIDE_COOKIE);
    if (override) return decodeURIComponent(override);
  } catch {
    // ignore malformed cookie values
  }
  return null;
}

export function pickBodyLocale(body: Record<string, unknown> | null | undefined): string | null {
  if (!body) return null;
  for (const key of AI_LOCALE_BODY_KEYS) {
    const value = body[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return null;
}

export function toAiLocale(raw: string): AiLocale {
  const tag = raw.trim().replace('_', '-');
  const lower = tag.toLowerCase();
  if (lower.startsWith('zh-tw') || lower === 'zh-hant' || lower.startsWith('zh-hk')) return 'zh-TW';
  const norm = normalizeLocale(tag);
  if (norm === 'en') return 'en';
  if (norm === 'pt-BR') return 'pt-BR';
  return 'zh-CN';
}

export function resolveAiLocale(input?: ResolveAiLocaleInput): AiLocale {
  const explicit =
    input?.language?.trim() ||
    input?.locale?.trim() ||
    input?.lang?.trim() ||
    null;

  if (explicit) return toAiLocale(explicit);

  const detected = detectLocale({
    queryLocale: input?.queryLocale,
    cookieLocale: input?.cookieLocale,
    acceptLanguage: input?.acceptLanguage,
  });
  return toAiLocale(detected);
}

export function resolveAiLocaleFromHeaders(headers: {
  get(name: string): string | null;
}): AiLocale {
  return resolveAiLocale({
    cookieLocale: readLocaleFromCookieHeader(headers.get('cookie')),
    acceptLanguage: headers.get('accept-language'),
  });
}

export function resolveAiLocaleFromRequest(
  req: { headers: { get(name: string): string | null }; url?: string },
  body?: Record<string, unknown> | null,
): AiLocale {
  let queryLocale: string | null = null;
  if (req.url) {
    try {
      const url = new URL(req.url);
      queryLocale =
        url.searchParams.get('lang') ||
        url.searchParams.get('locale') ||
        url.searchParams.get('language');
    } catch {
      // ignore invalid URL
    }
  }
  return resolveAiLocale({
    language: pickBodyLocale(body),
    queryLocale,
    cookieLocale: readLocaleFromCookieHeader(req.headers.get('cookie')),
    acceptLanguage: req.headers.get('accept-language'),
  });
}

const SYSTEM_PREFIX: Record<AiLocale, string> = {
  'zh-CN': '用中文（简体）撰写，',
  'zh-TW': '用中文（繁体）撰写，',
  en: 'Write in English, ',
  'pt-BR': 'Escreva em Português (Brasil), ',
};

const LANGUAGE_LABELS: Record<AiLocale, string> = {
  'zh-CN': '简体中文',
  'zh-TW': '繁體中文',
  en: 'English',
  'pt-BR': 'Português (Brasil)',
};

/** True when the UI locale must not leak Simplified/Traditional Chinese narrative. */
export function isNonChineseAiLocale(locale: AiLocale): boolean {
  return locale === 'en' || locale === 'pt-BR';
}

/**
 * Hard constraint for en / pt-BR: no Chinese interpretive prose.
 * Proper nouns from Chinese cosmology may stay in transliteration / brief romanization.
 */
export function aiNoChineseLeakRule(locale: AiLocale): string {
  if (!isNonChineseAiLocale(locale)) return '';
  if (locale === 'pt-BR') {
    return [
      'Idioma obrigatório: Português (Brasil).',
      'Não escreva interpretação, títulos de seção, listas ou frases em chinês.',
      'Não misture chinês com português. Nomes técnicos (ex.: BaZi, Zi Wei) podem ficar em romanização.',
    ].join(' ');
  }
  return [
    'Mandatory language: English.',
    'Do not write interpretations, section titles, bullet lists, or sentences in Chinese.',
    'Do not mix Chinese with English. Technical proper nouns (e.g. BaZi, Zi Wei) may stay romanized.',
  ].join(' ');
}

/** User-prompt line instructing output language (tarot / generic). */
export function aiPromptLanguageLine(locale: AiLocale): string {
  const label = LANGUAGE_LABELS[locale] ?? locale;
  const base =
    locale === 'en'
      ? `Output language: English (locale=${locale}).`
      : locale === 'pt-BR'
        ? `Idioma de saída: Português (Brasil) (locale=${locale}).`
        : `语言：${label}（locale=${locale}）`;
  const noLeak = aiNoChineseLeakRule(locale);
  return noLeak ? `${base}\n${noLeak}` : base;
}

/** Short rule for system prompts — reply in the same language as the page UI. */
export function aiLanguageReplyRule(locale: AiLocale): string {
  const label = LANGUAGE_LABELS[locale] ?? locale;
  const base =
    locale === 'en'
      ? `Reply language: must be English, matching the current page UI.`
      : locale === 'pt-BR'
        ? `Idioma da resposta: deve ser Português (Brasil), igual ao idioma da UI.`
        : `回复语言：必须使用${label}，与当前页面 UI 语言一致。`;
  const noLeak = aiNoChineseLeakRule(locale);
  return noLeak ? `${base} ${noLeak}` : base;
}

/** Strong system-prompt prefix (includes no-Chinese rule for en/pt-BR). */
export function aiSystemLanguagePrefix(locale: AiLocale): string {
  const prefix = SYSTEM_PREFIX[locale] ?? SYSTEM_PREFIX['zh-CN'];
  const noLeak = aiNoChineseLeakRule(locale);
  return noLeak ? `${prefix}${noLeak} ` : prefix;
}
