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
    const override = read(LOCALE_OVERRIDE_COOKIE);
    if (override) return decodeURIComponent(override);
    const base = read(LOCALE_COOKIE);
    if (base) return decodeURIComponent(base);
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

/** Prefix for system prompts (bazi / ziwei report style). */
export function aiSystemLanguagePrefix(locale: AiLocale): string {
  return SYSTEM_PREFIX[locale] ?? SYSTEM_PREFIX['zh-CN'];
}

/** User-prompt line instructing output language (tarot / generic). */
export function aiPromptLanguageLine(locale: AiLocale): string {
  const label = LANGUAGE_LABELS[locale] ?? locale;
  return `语言：${label}（locale=${locale}）`;
}

/** Short rule for system prompts — reply in the same language as the page UI. */
export function aiLanguageReplyRule(locale: AiLocale): string {
  const label = LANGUAGE_LABELS[locale] ?? locale;
  return `回复语言：必须使用${label}，与当前页面 UI 语言一致。`;
}
