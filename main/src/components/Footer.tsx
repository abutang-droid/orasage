'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

export function Footer() {
  const t = useTranslations('footer');

  return (
    <footer className="safe-bottom mt-auto pb-[calc(var(--orasage-shell-bottom-h,56px)+env(safe-area-inset-bottom,0px))] lg:pb-0">
      <div className="safe-x mx-auto flex max-w-6xl flex-col items-center gap-5 px-5 py-8 sm:flex-row sm:justify-between sm:px-6">
        <p className="text-center text-xs text-muted-foreground sm:text-start sm:text-sm">
          {t('copyright')}
        </p>
        <div className="flex w-full justify-center gap-8 sm:w-auto sm:gap-6">
          <Link
            href="/privacy"
            className="flex min-h-11 items-center rounded-md px-1 text-sm text-muted-foreground transition-colors hover:text-primary active:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            {t('privacy')}
          </Link>
          <Link
            href="/terms"
            className="flex min-h-11 items-center rounded-md px-1 text-sm text-muted-foreground transition-colors hover:text-primary active:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            {t('terms')}
          </Link>
        </div>
      </div>
    </footer>
  );
}
