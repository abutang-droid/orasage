'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { fetchMe, type AuthUser } from '@/lib/auth';

/** PC 页脚 — 版权 / 用户信息 / 隐私与服务条款（仅桌面显示） */
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
    <footer className="orasage-portal-footer safe-bottom mt-auto">
      <div className="orasage-portal-footer-inner lg:gap-8">
        <p className="orasage-portal-footer-copy">{t('copyright')}</p>
        {user ? (
          <p className="profile-footer-user" title={user.email}>
            <span className="font-medium text-foreground">{user.displayName}</span>
            <span className="mx-2 text-border" aria-hidden>
              ·
            </span>
            <span className="truncate">{user.email}</span>
          </p>
        ) : null}
        <div className="orasage-portal-footer-links">
          <Link href="/profile/privacy" className="orasage-portal-footer-link">
            {t('privacy')}
          </Link>
          <Link href="/profile/terms" className="orasage-portal-footer-link">
            {t('terms')}
          </Link>
        </div>
      </div>
    </footer>
  );
}
