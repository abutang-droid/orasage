'use client';

/**
 * Unified React i18n binding — the single dictionary mechanism for all
 * OraSage apps (design system §10 / platform roadmap §3).
 *
 * - Startup: detects locale from ?lang / shared NEXT_LOCALE cookie / navigator.
 * - Switch: updates state in place (no reload), persists the cross-subdomain
 *   cookie and keeps the ?lang query param in sync.
 * - Dictionaries: static maps or lazy loaders per locale.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { detectLocaleFromBrowser } from './detect';
import { setLocaleCookie } from './cookie';
import { LOCALE_LABELS } from './labels';
import { CORE_LOCALES, DEFAULT_LOCALE, toCoreLocale, type CoreLocale } from './locales';
import { formatMessage, type Messages, type TranslateFn } from './messages';

export type DictionaryEntry = Messages | (() => Promise<Messages>);
export type Dictionaries = Partial<Record<string, DictionaryEntry>>;

export interface I18nContextValue {
  locale: string;
  setLocale: (locale: string) => void;
  /** Resolved dictionary for the active locale (empty when app has none). */
  messages: Messages;
  t: TranslateFn;
  allLocales: ReadonlyArray<readonly [CoreLocale, string]>;
}

const ALL_CORE_LOCALES = CORE_LOCALES.map(
  (code) => [code, LOCALE_LABELS[code]] as const,
);

const I18nContext = createContext<I18nContextValue>({
  locale: DEFAULT_LOCALE,
  setLocale: () => {},
  messages: {},
  t: (key) => key,
  allLocales: ALL_CORE_LOCALES,
});

export interface I18nProviderProps {
  children: ReactNode;
  /** Per-locale dictionaries: static object or lazy `() => import(...)` loader. */
  dictionaries?: Dictionaries;
  initialLocale?: string;
  /** Detect from ?lang / shared cookie / navigator after mount (default true). */
  detectOnMount?: boolean;
  /**
   * Map any incoming locale to the set this app supports.
   * Defaults to the T1 core-locale mapping (zh-CN / zh-TW / en / pt-BR).
   */
  mapLocale?: (locale: string) => string;
  /** Query param synced on switch; `false` disables URL updates. Default `'lang'`. */
  urlParam?: string | false;
  onLocaleChange?: (locale: string) => void;
}

function resolveSync(entry: DictionaryEntry | undefined): Messages | undefined {
  return typeof entry === 'function' ? undefined : entry;
}

function syncUrlParam(param: string, locale: string): void {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  if (locale === DEFAULT_LOCALE) url.searchParams.delete(param);
  else url.searchParams.set(param, locale);
  window.history.replaceState({}, '', url.toString());
}

export function I18nProvider({
  children,
  dictionaries,
  initialLocale,
  detectOnMount = true,
  mapLocale = toCoreLocale,
  urlParam = 'lang',
  onLocaleChange,
}: I18nProviderProps) {
  const initial = mapLocale(initialLocale ?? DEFAULT_LOCALE);
  const [locale, setLocaleState] = useState<string>(initial);
  const [messages, setMessages] = useState<Messages>(
    () => resolveSync(dictionaries?.[initial]) ?? {},
  );

  const dictionariesRef = useRef(dictionaries);
  dictionariesRef.current = dictionaries;
  const mapLocaleRef = useRef(mapLocale);
  mapLocaleRef.current = mapLocale;
  const loadedRef = useRef<Partial<Record<string, Messages>>>({});
  const localeRef = useRef(locale);
  localeRef.current = locale;

  useEffect(() => {
    if (!detectOnMount) return;
    const detected = mapLocaleRef.current(detectLocaleFromBrowser());
    const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const hasQueryLang = Boolean(urlParam && params?.get(urlParam));
    // Deep-link ?lang= / cookie / navigator must persist NEXT_LOCALE so
    // cross-subdomain jumps (main → tarot → shop) keep the same language.
    if (detected !== localeRef.current || hasQueryLang) {
      setLocaleCookie(detected);
      if (urlParam) syncUrlParam(urlParam, detected);
    }
    setLocaleState((current) => (detected === current ? current : detected));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const entry = dictionariesRef.current?.[locale];
    if (typeof entry !== 'function') {
      setMessages(entry ?? {});
      return;
    }
    const cached = loadedRef.current[locale];
    if (cached) {
      setMessages(cached);
      return;
    }
    let cancelled = false;
    entry()
      .then((loaded) => {
        loadedRef.current[locale] = loaded;
        if (!cancelled) setMessages(loaded);
      })
      .catch(() => {
        /* keep previous messages on load failure */
      });
    return () => {
      cancelled = true;
    };
  }, [locale]);

  const setLocale = useCallback(
    (next: string) => {
      const mapped = mapLocaleRef.current(next);
      if (mapped === localeRef.current) return;
      setLocaleCookie(mapped);
      if (urlParam) syncUrlParam(urlParam, mapped);
      setLocaleState(mapped);
      onLocaleChange?.(mapped);
    },
    [urlParam, onLocaleChange],
  );

  const t = useMemo<TranslateFn>(
    () => (key, params) => {
      const raw = messages[key];
      if (raw == null) return key;
      return formatMessage(raw, params);
    },
    [messages],
  );

  const value = useMemo<I18nContextValue>(
    () => ({ locale, setLocale, messages, t, allLocales: ALL_CORE_LOCALES }),
    [locale, setLocale, messages, t],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  return useContext(I18nContext);
}

export function useT(): TranslateFn {
  return useContext(I18nContext).t;
}
