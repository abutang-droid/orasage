'use client';

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { fetchMe, profileLoginUrl, type AuthUser } from '@/lib/auth';

const ProfileAuthContext = createContext<{
  user: AuthUser | null;
  loading: boolean;
  refresh: () => Promise<void>;
  setUser: (user: AuthUser | null) => void;
} | null>(null);

export function useProfileAuth() {
  const ctx = useContext(ProfileAuthContext);
  if (!ctx) throw new Error('useProfileAuth must be used within ProfileAuthProvider');
  return ctx;
}

export function ProfileAuthProvider({ children, loadingLabel }: { children: ReactNode; loadingLabel: string }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const me = await fetchMe();
      setUser(me);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const me = await fetchMe();
        if (!cancelled) setUser(me);
      } catch {
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-sage-muted">
        {loadingLabel}
      </div>
    );
  }

  return (
    <ProfileAuthContext.Provider value={{ user, loading, refresh, setUser }}>
      {children}
    </ProfileAuthContext.Provider>
  );
}

export function RequireProfileAuth({ locale, children }: { locale: string; children: ReactNode }) {
  const t = useTranslations('profile');
  const { user } = useProfileAuth();

  if (!user) {
    return (
      <div className="rounded-2xl border border-sage-border/60 bg-sage-card/40 p-8 text-center">
        <p className="text-sm text-sage-muted">{t('loginRequired')}</p>
        <a
          href={profileLoginUrl(locale)}
          className="mt-4 inline-flex min-h-[44px] items-center justify-center rounded-full border border-sage-gold/40 px-6 text-sm text-sage-gold transition hover:bg-sage-gold/10"
        >
          {t('loginCta')}
        </a>
        <p className="mt-4">
          <Link href="/profile" className="text-xs text-sage-muted hover:text-sage-gold">
            ← {t('nav.overview')}
          </Link>
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
