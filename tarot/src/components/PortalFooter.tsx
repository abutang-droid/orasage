'use client';

import { useLang } from '@/lib/i18n/context';
import { PortalFooter as ShellPortalFooter } from '@/lib/orasage-app-shell';
import { localeFromLang } from '@/lib/orasage-locale';

/** PC 页脚 — 与顶栏共用 shell locale */
export function PortalFooter() {
  const { lang } = useLang();
  return <ShellPortalFooter locale={localeFromLang(lang)} />;
}
