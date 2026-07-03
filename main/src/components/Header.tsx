'use client';

import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { externalUrls } from '@/lib/urls';
import { HeaderAuthButton } from '@/components/HeaderAuthButton';
import { getPortalSectionKey, shouldShowPortalBack } from '@/lib/portal-header';
import { ArrowLeft, Menu, X } from 'lucide-react';
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
      <header className="safe-top border-b border-border/70">
        <div className="safe-x mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <span className="font-serif text-base tracking-wide text-brand-gold sm:text-lg">
            {sectionTitle ?? 'OraSage'}
          </span>
          {showBack && <HeaderBackButton />}
        </div>
      </header>
    );
  }

  return (
    <header className="safe-top">
      <div className="safe-x mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:h-16 sm:px-6">
        <Link
          href="/"
          className="inline-flex min-h-11 items-center rounded-sm font-serif text-lg tracking-widest text-brand-gold transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:text-xl"
        >
          OraSage
        </Link>

        <nav className="hidden items-center gap-5 lg:flex">
          {navItems.map((item) =>
            'external' in item && item.external ? (
              <a
                key={item.href}
                href={item.href}
                className="inline-flex min-h-11 items-center rounded-md px-1 text-sm text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                {item.label}
              </a>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className="inline-flex min-h-11 items-center rounded-md px-1 text-sm text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
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
            className="flex h-11 w-11 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground active:bg-primary/10 active:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            onClick={() => setOpen(!open)}
            aria-label="Menu"
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
          </button>
        </div>
      </div>

      {open && (
        <>
          <div
            className="fixed inset-0 top-14 z-40 bg-foreground/40 lg:hidden"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <nav className="safe-bottom fixed inset-x-0 top-14 z-50 max-h-[calc(100dvh-3.5rem)] overflow-y-auto border-b border-border bg-background px-4 py-3 shadow-surface-2 lg:hidden">
            {navItems.map((item) =>
              'external' in item && item.external ? (
                <a
                  key={item.href}
                  href={item.href}
                  className="flex min-h-12 items-center border-b border-border/60 text-base text-muted-foreground transition-colors active:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </a>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex min-h-12 items-center border-b border-border/60 text-base text-muted-foreground transition-colors active:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
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
      className="inline-flex min-h-11 items-center gap-1 rounded-md px-3 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-primary active:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <ArrowLeft className="h-[18px] w-[18px] rtl:rotate-180" aria-hidden />
      {t('back')}
    </button>
  );
}
