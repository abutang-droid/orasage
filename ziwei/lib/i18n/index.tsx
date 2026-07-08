'use client';

import { detectLocaleFromBrowser, toCoreLocale } from '@orasage/i18n';
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import zhCN from './zh-CN';
import zhTW from './zh-TW';
import en from './en';
import ptBR from './pt-BR';

export type Locale = 'zh-CN' | 'zh-TW' | 'en' | 'pt-BR';

export type TranslationKey = keyof typeof zhCN;

type TFunction = (key: string, params?: Record<string, string | number>) => string;

interface LocaleContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: TFunction;
  allLocales: [Locale, string][];
}

const LOCALE_LABELS: Record<Locale, string> = {
  'zh-CN': '简体中文',
  'zh-TW': '繁體中文',
  'en': 'English',
  'pt-BR': 'Português (BR)',
};

const DICTIONARIES: Record<Locale, Record<string, string>> = {
  'zh-CN': zhCN,
  'zh-TW': zhTW,
  'en': en,
  'pt-BR': ptBR,
};

const LocaleContext = createContext<LocaleContextType>({
  locale: 'zh-CN',
  setLocale: () => {},
  t: (key: string) => key,
  allLocales: [],
});

function getLocaleFromBrowser(): Locale {
  if (typeof window === 'undefined') return 'zh-CN';
  return toCoreLocale(detectLocaleFromBrowser()) as Locale;
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('zh-CN');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setLocaleState(getLocaleFromBrowser());
    setReady(true);
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    const url = new URL(window.location.href);
    if (newLocale === 'zh-CN') {
      url.searchParams.delete('lang');
    } else {
      url.searchParams.set('lang', newLocale);
    }
    window.history.replaceState({}, '', url.toString());
  }, []);

  const t: TFunction = useCallback((key: string, params?: Record<string, string | number>) => {
    const dict = DICTIONARIES[locale];
    let text = dict[key] ?? key;
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        text = text.replace(`{${k}}`, String(v));
      }
    }
    return text;
  }, [locale]);

  if (!ready) {
    return <>{children}</>;
  }

  return (
    <LocaleContext.Provider value={{
      locale,
      setLocale,
      t,
      allLocales: Object.entries(LOCALE_LABELS) as [Locale, string][],
    }}>
      {children}
    </LocaleContext.Provider>
  );
}

export const useLocale = () => useContext(LocaleContext);
export const useT = (): TFunction => useContext(LocaleContext).t;
