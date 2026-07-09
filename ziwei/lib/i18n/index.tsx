'use client';

/**
 * Ziwei i18n — thin adapter over the unified @orasage/i18n runtime.
 * Dictionaries stay app-local; detection / switching / cookie contract
 * come from the shared package.
 */

import { CORE_LOCALES, LOCALE_LABELS, type CoreLocale } from '@orasage/i18n';
import {
  I18nProvider,
  useI18n,
  useT as useSharedT,
} from '@orasage/i18n/react';
import zhCN from './zh-CN';
import zhTW from './zh-TW';
import en from './en';
import ptBR from './pt-BR';

export type Locale = CoreLocale;

export type TranslationKey = keyof typeof zhCN;

type TFunction = (key: string, params?: Record<string, string | number>) => string;

const DICTIONARIES: Record<Locale, Record<string, string>> = {
  'zh-CN': zhCN,
  'zh-TW': zhTW,
  en,
  'pt-BR': ptBR,
};

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  return <I18nProvider dictionaries={DICTIONARIES}>{children}</I18nProvider>;
}

export function useLocale() {
  const { locale, setLocale, t, allLocales } = useI18n();
  return {
    locale: locale as Locale,
    setLocale: setLocale as (locale: Locale) => void,
    t: t as TFunction,
    allLocales: allLocales as unknown as [Locale, string][],
  };
}

export const useT = (): TFunction => useSharedT();

export { CORE_LOCALES, LOCALE_LABELS };
