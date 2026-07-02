'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { locales, localeNames, type Locale } from '@/i18n/routing';
import { externalUrls } from '@/lib/urls';
import { HeaderAuthButton } from '@/components/HeaderAuthButton';
import { useEffect, useState } from 'react';

export function Header() {
  const t = useTranslations('nav');
  const locale = useLocale();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const navItems: Array<
    | { href: '/famous' | '/daozang'; label: string }
    | { href: string; label: string; external: true }
  > = [
    { href: externalUrls.bazi, label: t('bazi'), external: true },
    { href: externalUrls.ziwei, label: t('ziwei'), external: true },
    { href: externalUrls.tarot, label: t('tarot'), external: true },
    { href: '/famous', label: t('famous') },
    { href: '/daozang', label: t('daozang') },
  ];

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const isHome = pathname === '/';

  return (
    <header className="safe-top sticky top-0 z-50 border-b border-sage-border/60 bg-sage-bg/95 backdrop-blur-md">
      <div className="safe-x mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:h-16 sm:px-6">
        <Link
          href="/"
          className="font-serif text-lg tracking-widest text-sage-gold sm:text-xl"
        >
          OraSage
        </Link>

        <nav className="hidden items-center gap-5 lg:flex">
          {navItems.map((item) =>
            'external' in item && item.external ? (
              <a
                key={item.href}
                href={item.href}
                className="text-sm text-sage-muted transition hover:text-sage-primary"
              >
                {item.label}
              </a>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm text-sage-muted transition hover:text-sage-primary"
              >
                {item.label}
              </Link>
            ),
          )}
          <HeaderAuthButton />
          {isHome && <LocaleSwitcher current={locale as Locale} pathname={pathname} />}
        </nav>

        <div className="flex items-center gap-2 lg:hidden">
          <HeaderAuthButton className="px-3 py-2 text-xs" />
          {isHome && <LocaleSwitcher current={locale as Locale} pathname={pathname} compact />}
          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center rounded-lg text-sage-muted active:bg-sage-card"
            onClick={() => setOpen(!open)}
            aria-label="Menu"
            aria-expanded={open}
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={open ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
              />
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <>
          <div
            className="fixed inset-0 top-14 z-40 bg-black/50 lg:hidden"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <nav className="safe-bottom fixed inset-x-0 top-14 z-50 max-h-[calc(100dvh-3.5rem)] overflow-y-auto border-b border-sage-border bg-sage-bg px-4 py-3 lg:hidden">
            {navItems.map((item) =>
              'external' in item && item.external ? (
                <a
                  key={item.href}
                  href={item.href}
                  className="flex min-h-[48px] items-center border-b border-sage-border/40 text-base text-sage-muted active:text-sage-primary"
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </a>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex min-h-[48px] items-center border-b border-sage-border/40 text-base text-sage-muted active:text-sage-primary"
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              ),
            )}
          </nav>
        </>
      )}
    </header>
  );
}

function LocaleSwitcher({
  current,
  pathname,
  compact = false,
}: {
  current: Locale;
  pathname: string;
  compact?: boolean;
}) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setShow(!show)}
        className={`rounded-lg text-sage-muted hover:text-sage-primary ${
          compact ? 'min-h-[44px] px-2 text-xs' : 'min-h-[44px] px-3 text-xs'
        }`}
      >
        {localeNames[current]}
      </button>
      {show && (
        <div className="absolute right-0 top-full z-50 mt-1 max-h-64 w-40 overflow-y-auto rounded-lg border border-sage-border bg-sage-card py-1 shadow-xl">
          {locales.map((loc) => (
            <Link
              key={loc}
              href={pathname}
              locale={loc}
              className="block min-h-[40px] px-3 py-2 text-xs text-sage-muted hover:bg-sage-border/40 hover:text-sage-primary"
              onClick={() => setShow(false)}
            >
              {localeNames[loc]}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
