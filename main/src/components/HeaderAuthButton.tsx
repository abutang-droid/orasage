'use client';

import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { fetchMe, type AuthUser } from '@/lib/auth';
import { externalUrls } from '@/lib/urls';
import { buttonVariants, cn } from '@orasage/ui';

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
        className={cn(buttonVariants({ variant: 'outline' }), 'max-w-[140px] truncate', className)}
        title={user.email}
      >
        {user.displayName}
      </Link>
    );
  }

  return (
    <a
      href={loginUrl}
      className={cn(buttonVariants({ variant: 'outline' }), className)}
    >
      {t('login')}
    </a>
  );
}
