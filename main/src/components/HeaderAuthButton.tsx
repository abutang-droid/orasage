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
    return <span className={`inline-block h-9 w-16 animate-pulse rounded-full bg-sage-card/60 ${className}`} aria-hidden />;
  }

  if (user) {
    return (
      <Link
        href="/profile"
        className={`max-w-[140px] truncate rounded-full border border-sage-gold/40 px-4 py-2 text-sm text-sage-gold transition hover:bg-sage-gold/10 ${className}`}
        title={user.email}
      >
        {user.displayName}
      </Link>
    );
  }

  return (
    <a
      href={loginUrl}
      className={`rounded-full border border-sage-gold/40 px-4 py-2 text-sm text-sage-gold transition hover:bg-sage-gold/10 ${className}`}
    >
      {t('login')}
    </a>
  );
}
