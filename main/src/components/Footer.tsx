'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

export function Footer() {
  const t = useTranslations('footer');

  return (
    <footer className="safe-bottom mt-auto border-t border-sage-border bg-sage-card/40">
      <div className="safe-x mx-auto flex max-w-6xl flex-col items-center gap-5 px-5 py-8 sm:flex-row sm:justify-between sm:px-6">
        <p className="text-center text-xs text-sage-muted sm:text-left sm:text-sm">
          {t('copyright')}
        </p>
        <div className="flex w-full justify-center gap-8 sm:w-auto sm:gap-6">
          <Link
            href="/privacy"
            className="min-h-[44px] flex items-center text-sm text-sage-muted active:text-sage-gold"
          >
            {t('privacy')}
          </Link>
          <Link
            href="/terms"
            className="min-h-[44px] flex items-center text-sm text-sage-muted active:text-sage-gold"
          >
            {t('terms')}
          </Link>
        </div>
      </div>
    </footer>
  );
}
