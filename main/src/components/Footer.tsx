'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

export function Footer() {
  const t = useTranslations('footer');

  return (
    <footer className="mt-auto border-t border-sage-border bg-sage-card/40">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row">
        <p className="text-sm text-sage-muted">{t('copyright')}</p>
        <div className="flex gap-6 text-sm">
          <Link href="/privacy" className="text-sage-muted transition hover:text-sage-gold">
            {t('privacy')}
          </Link>
          <Link href="/terms" className="text-sage-muted transition hover:text-sage-gold">
            {t('terms')}
          </Link>
        </div>
      </div>
    </footer>
  );
}
