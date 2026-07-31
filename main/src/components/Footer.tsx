'use client';

import { useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { pickLabel, SHELL_LABELS } from '@/lib/orasage-app-shell';

/** 全站 PC 页脚标准组件 — 见 docs/design-system/OraSage-Design-System-v1.1-Revised.md §7 */
export const SITE_FOOTER_LINK_CLASS =
  'flex min-h-11 items-center rounded-md px-1 text-sm text-muted-foreground transition-colors hover:text-primary active:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background';

export function Footer() {
  const locale = useLocale();

  return (
    <footer className="safe-bottom mt-auto hidden pb-0 lg:block">
      <div className="safe-x mx-auto flex max-w-6xl flex-col items-center gap-5 px-5 py-8 sm:flex-row sm:justify-between sm:px-6">
        <p className="text-center text-xs text-muted-foreground sm:text-start sm:text-sm">
          {pickLabel(SHELL_LABELS.copyright, locale)}
        </p>
        <div className="flex w-full justify-center gap-8 sm:w-auto sm:gap-6">
          <Link href="/profile/privacy" className={SITE_FOOTER_LINK_CLASS}>
            {pickLabel(SHELL_LABELS.privacy, locale)}
          </Link>
          <Link href="/profile/terms" className={SITE_FOOTER_LINK_CLASS}>
            {pickLabel(SHELL_LABELS.terms, locale)}
          </Link>
        </div>
      </div>
    </footer>
  );
}
