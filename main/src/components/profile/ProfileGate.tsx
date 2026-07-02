'use client';

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { fetchMe, profileLoginUrl, type AuthUser } from '@/lib/auth';

const ProfileAuthContext = createContext<{
  user: AuthUser;
  refresh: () => Promise<void>;
  setUser: (user: AuthUser) => void;
} | null>(null);

export function useProfileAuth() {
  const ctx = useContext(ProfileAuthContext);
  if (!ctx) throw new Error('useProfileAuth must be used within ProfileGate');
  return ctx;
}

type Props = {
  locale: string;
  children: ReactNode;
  loadingLabel: string;
};

export function ProfileGate({ locale, children, loadingLabel }: Props) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const me = await fetchMe();
    if (me) setUser(me);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const me = await fetchMe();
        if (cancelled) return;
        if (!me) {
          window.location.href = profileLoginUrl(locale);
          return;
        }
        setUser(me);
      } catch {
        if (!cancelled) window.location.href = profileLoginUrl(locale);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [locale]);

  if (loading || !user) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-sage-muted">
        {loadingLabel}
      </div>
    );
  }

  return (
    <ProfileAuthContext.Provider value={{ user, refresh, setUser }}>
      {children}
    </ProfileAuthContext.Provider>
  );
}
