'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { locales, localeNames, type Locale } from '@/i18n/routing';
import { externalUrls } from '@/lib/urls';
import { useState } from 'react';

export function Header() {
  const t = useTranslations('nav');
  const locale = useLocale();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const navItems = [
    { href: '/', label: t('home') },
    { href: '/about', label: t('about') },
    { href: '/faq', label: t('faq') },
    { href: '/famous', label: t('famous') },
    { href: '/daozang', label: t('daozang') },
  ] as const;

  return (
    <header className="sticky top-0 z-50 border-b border-sage-border/60 bg-sage-bg/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="font-serif text-xl tracking-widest text-sage-gold">
          OraSage
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-sage-muted transition hover:text-white"
            >
              {item.label}
            </Link>
          ))}
          <a
            href={externalUrls.auth}
            className="rounded-full border border-sage-gold/40 px-4 py-1.5 text-sm text-sage-gold transition hover:bg-sage-gold/10"
          >
            {t('login')}
          </a>
          <LocaleSwitcher current={locale as Locale} pathname={pathname} />
        </nav>

        <button
          className="md:hidden text-sage-muted"
          onClick={() => setOpen(!open)}
          aria-label="Menu"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={open ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
          </svg>
        </button>
      </div>

      {open && (
        <div className="border-t border-sage-border px-4 py-4 md:hidden">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="block py-2 text-sage-muted" onClick={() => setOpen(false)}>
              {item.label}
            </Link>
          ))}
          <a href={externalUrls.auth} className="mt-2 block text-sage-gold">{t('login')}</a>
        </div>
      )}
    </header>
  );
}

function LocaleSwitcher({ current, pathname }: { current: Locale; pathname: string }) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setShow(!show)}
        className="text-xs text-sage-muted hover:text-white"
      >
        {localeNames[current]}
      </button>
      {show && (
        <div className="absolute right-0 top-6 z-50 max-h-64 w-36 overflow-y-auto rounded-lg border border-sage-border bg-sage-card py-1 shadow-xl">
          {locales.map((loc) => (
            <Link
              key={loc}
              href={pathname}
              locale={loc}
              className="block px-3 py-1.5 text-xs text-sage-muted hover:bg-sage-border/40 hover:text-white"
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
