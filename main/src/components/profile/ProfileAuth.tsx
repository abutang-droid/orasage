'use client';

import { Skeleton } from '@orasage/ui';
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { fetchMe, type AuthUser } from '@/lib/auth';
import { ProfileLoginCard } from './ProfileLoginCard';

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
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3" aria-busy="true" aria-live="polite">
        <Skeleton className="h-4 w-32" />
        <span className="sr-only">{loadingLabel}</span>
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
  const { user } = useProfileAuth();

  if (!user) {
    return <ProfileLoginCard locale={locale} variant="gate" />;
  }

  return <>{children}</>;
}
