'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { fetchMe, type AuthUser } from '@/lib/auth';

const footerLinkClass =
  'flex min-h-11 items-center rounded-md px-1 text-sm text-muted-foreground transition-colors hover:text-primary active:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background';

/** PC 页脚 — 与门户首页 Footer 同款布局；额外展示登录用户信息 */
export function ProfileFooter() {
  const t = useTranslations('footer');
  const [user, setUser] = useState<AuthUser | null>(null);

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

  return (
    <footer className="safe-bottom mt-auto hidden pb-0 lg:block">
      <div className="safe-x mx-auto flex max-w-6xl flex-col items-center gap-5 px-5 py-8 sm:flex-row sm:justify-between sm:px-6">
        <div className="text-center sm:text-start">
          <p className="text-xs text-muted-foreground sm:text-sm">{t('copyright')}</p>
          {user ? (
            <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
              <span className="font-medium text-foreground">{user.displayName}</span>
              <span className="mx-1.5" aria-hidden>
                ·
              </span>
              <span>{user.email}</span>
            </p>
          ) : null}
        </div>
        <div className="flex w-full justify-center gap-8 sm:w-auto sm:gap-6">
          <Link href="/profile/privacy" className={footerLinkClass}>
            {t('privacy')}
          </Link>
          <Link href="/profile/terms" className={footerLinkClass}>
            {t('terms')}
          </Link>
        </div>
      </div>
    </footer>
  );
}
