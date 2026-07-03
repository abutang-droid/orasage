'use client';

import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { fetchMe, type AuthUser } from '@/lib/auth';
import { externalUrls } from '@/lib/urls';

export function HeaderAuthButton({ className = '' }: { className?: string }) {
  const t = useTranslations('nav');
  const locale = useLocale();
  const pathname = usePathname();
  const [user, setUser] = useState<AuthUser | null | undefined>(undefined);

  const returnUrl = encodeURIComponent(`https://orasage.com/${locale}${pathname === '/' ? '' : pathname}`);
  const loginUrl = `${externalUrls.authLogin}?redirect=${returnUrl}`;

  useEffect(() => {
    let cancelled = false;
    fetchMe()
      .then((me) => {
        if (!cancelled) setUser(me);
      })
      .catch(() => {
        if (!cancelled) setUser(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (user === undefined) {
    return <span className={`inline-block h-11 w-20 animate-pulse rounded-md bg-muted ${className}`} aria-hidden />;
  }

  if (user) {
    return (
      <Link
        href="/profile"
        className={`inline-flex min-h-11 max-w-[140px] items-center truncate rounded-md border border-primary/40 px-4 text-sm text-primary transition-colors hover:bg-primary/10 active:bg-primary/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${className}`}
        title={user.email}
      >
        {user.displayName}
      </Link>
    );
  }

  return (
    <a
      href={loginUrl}
      className={`inline-flex min-h-11 items-center rounded-md border border-primary/40 px-4 text-sm text-primary transition-colors hover:bg-primary/10 active:bg-primary/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${className}`}
    >
      {t('login')}
    </a>
  );
}
