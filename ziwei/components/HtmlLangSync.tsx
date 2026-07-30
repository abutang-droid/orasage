'use client';

import { useEffect } from 'react';
import { useLocale } from '@/lib/i18n';

const SITE_TITLE: Record<string, string> = {
  'zh-CN': '紫微斗数排盘 | OraSage',
  en: 'Zi Wei Dou Shu Chart | OraSage',
  'pt-BR': 'Mapa Zi Wei Dou Shu | OraSage',
};

/** Keep <html lang> and document.title aligned with the active UI locale. */
export function HtmlLangSync() {
  const { locale } = useLocale();

  useEffect(() => {
    document.documentElement.lang = locale;
    document.title = SITE_TITLE[locale] ?? SITE_TITLE.en;
  }, [locale]);

  return null;
}
