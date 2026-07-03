'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { externalUrls } from '@/lib/urls';
import { HeaderAuthButton } from '@/components/HeaderAuthButton';

/** 门户顶栏：PC 左品牌 + 右导航（旧版样式）；移动仅 Logo + 登录 */
export function Header() {
  const tNav = useTranslations('nav');

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

  return (
    <>
      <header className="safe-top orasage-site-mobile-bar border-b border-border bg-background lg:hidden">
        <Link href="/" className="orasage-site-mobile-bar-brand font-serif tracking-widest text-foreground">
          OraSage
        </Link>
        <HeaderAuthButton className="px-3 py-2 text-xs" />
      </header>

      <header className="safe-top hidden border-b border-border bg-background lg:block">
        <div className="safe-x mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:h-16 sm:px-6">
          <Link
            href="/"
            className="inline-flex min-h-11 items-center rounded-sm font-serif text-lg tracking-widest text-foreground transition-colors hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:text-xl"
          >
            OraSage
          </Link>

          <nav className="flex items-center gap-5" aria-label="Portal navigation">
            {navItems.map((item) =>
              'external' in item && item.external ? (
                <a
                  key={item.href}
                  href={item.href}
                  className="inline-flex min-h-11 items-center rounded-md px-1 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  {item.label}
                </a>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  className="inline-flex min-h-11 items-center rounded-md px-1 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  {item.label}
                </Link>
              ),
            )}
            <HeaderAuthButton />
          </nav>
        </div>
      </header>
    </>
  );
}
