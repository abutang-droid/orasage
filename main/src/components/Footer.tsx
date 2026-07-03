'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { locales, localeNames } from '@/i18n/routing';

export function Footer() {
  const t = useTranslations('footer');
  const locale = useLocale();
  const pathname = usePathname();

  return (
    <footer className="safe-bottom mt-auto border-t border-sage-border bg-sage-card/40">
      <div className="safe-x mx-auto flex max-w-6xl flex-col items-center gap-5 px-5 py-8 sm:px-6">
        <p className="text-center text-xs text-sage-muted sm:text-left sm:text-sm">
          {t('copyright')}
        </p>

        <div className="flex flex-wrap justify-center gap-x-3 gap-y-2">
          {locales.map((loc) => (
            <Link
              key={loc}
              href={pathname}
              locale={loc}
              className={`min-h-[36px] rounded-full px-3 py-1.5 text-xs transition ${
                loc === locale
                  ? 'bg-sage-gold/15 text-sage-gold'
                  : 'text-sage-muted active:text-sage-gold'
              }`}
            >
              {localeNames[loc]}
            </Link>
          ))}
        </div>

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
