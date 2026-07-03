'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { buttonVariants, cn } from '@orasage/ui';

export function Footer() {
  const t = useTranslations('footer');

  return (
    <footer className="safe-bottom mt-auto border-t border-border bg-card/50">
      <div className="safe-x mx-auto flex max-w-6xl flex-col items-center gap-5 px-5 py-8 sm:flex-row sm:justify-between sm:px-6">
        <p className="text-center text-xs text-muted-foreground sm:text-start sm:text-sm">
          {t('copyright')}
        </p>
        <div className="flex w-full justify-center gap-8 sm:w-auto sm:gap-6">
          <Link
            href="/privacy"
            className={cn(
              buttonVariants({ variant: 'ghost' }),
              'px-1 font-normal text-muted-foreground hover:bg-transparent hover:text-primary active:bg-transparent active:text-primary',
            )}
          >
            {t('privacy')}
          </Link>
          <Link
            href="/terms"
            className={cn(
              buttonVariants({ variant: 'ghost' }),
              'px-1 font-normal text-muted-foreground hover:bg-transparent hover:text-primary active:bg-transparent active:text-primary',
            )}
          >
            {t('terms')}
          </Link>
        </div>
      </div>
    </footer>
  );
}
