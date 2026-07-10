'use client';

import { useEffect } from 'react';
import { useTarotLocale } from '@/lib/i18n/context';

/** Keeps <html lang> in sync with the active locale after client hydration. */
export function HtmlLangSync() {
  const { locale } = useTarotLocale();

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return null;
}
