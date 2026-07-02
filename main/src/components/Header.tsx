'use client';

import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { externalUrls } from '@/lib/urls';
import { HeaderAuthButton } from '@/components/HeaderAuthButton';
import { getPortalSectionKey, shouldShowPortalBack } from '@/lib/portal-header';
import { useEffect, useState } from 'react';

const SECTION_TITLE_KEYS: Record<string, string> = {
  famous: 'famous.title',
  daozang: 'daozang.title',
  about: 'about.title',
  terms: 'terms.title',
  privacy: 'privacy.title',
  faq: 'faq.title',
  profile: 'profile.title',
};

export function Header() {
  const tNav = useTranslations('nav');
  const t = useTranslations();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const navItems: Array<
    | { href: '/famous' | '/daozang'; label: string }
    | { href: string; label: string; external: true }
  > = [
    { href: externalUrls.bazi, label: tNav('bazi'), external: true },
    { href: externalUrls.ziwei, label: tNav('ziwei'), external: true },
    { href: externalUrls.tarot, label: tNav('tarot'), external: true },
    { href: '/famous', label: tNav('famous') },
    { href: '/daozang', label: tNav('daozang') },
  ];

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const isHome = pathname === '/';
  const sectionKey = getPortalSectionKey(pathname);
  const sectionTitle = sectionKey ? t(SECTION_TITLE_KEYS[sectionKey] as 'famous.title') : null;
  const showBack = shouldShowPortalBack(pathname);

  if (!isHome) {
    return (
      <header className="safe-top border-b border-sage-border/40 bg-sage-bg">
        <div className="safe-x mx-auto flex h-12 max-w-6xl items-center justify-between px-4 sm:px-6">
          <span className="font-serif text-base tracking-wide text-sage-gold sm:text-lg">
            {sectionTitle ?? 'OraSage'}
          </span>
          {showBack && <HeaderBackButton />}
        </div>
      </header>
    );
  }

  return (
    <header className="safe-top border-b border-sage-border/40 bg-sage-bg">
      <div className="safe-x mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:h-16 sm:px-6">
        <Link href="/" className="font-serif text-lg tracking-widest text-sage-gold sm:text-xl">
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
        </nav>

        <div className="flex items-center gap-2 lg:hidden">
          <HeaderAuthButton className="px-3 py-2 text-xs" />
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

function HeaderBackButton() {
  const t = useTranslations('nav');

  return (
    <button
      type="button"
      onClick={() => window.history.back()}
      className="inline-flex min-h-[44px] items-center gap-1 text-sm text-sage-muted transition hover:text-sage-gold"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="15 18 9 12 15 6" />
      </svg>
      {t('back')}
    </button>
  );
}
