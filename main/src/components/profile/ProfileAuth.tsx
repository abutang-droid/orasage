'use client';

import { Skeleton } from '@orasage/ui';
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { fetchMe, type AuthUser } from '@/lib/auth';
import { ProfileLoginCard } from './ProfileLoginCard';

const ProfileAuthContext = createContext<{
  user: AuthUser | null;
  loading: boolean;
  loadingLabel: string;
  refresh: () => Promise<void>;
  setUser: (user: AuthUser | null) => void;
} | null>(null);

export function useProfileAuth() {
  const ctx = useContext(ProfileAuthContext);
  if (!ctx) throw new Error('useProfileAuth must be used within ProfileAuthProvider');
  return ctx;
}

/** 可选：公开页（如 /contact）未包 Provider 时返回 null */
export function useOptionalProfileAuth() {
  return useContext(ProfileAuthContext);
}

function AuthLoadingSkeleton({ label }: { label: string }) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3" aria-busy="true" aria-live="polite">
      <Skeleton className="h-4 w-32" />
      <span className="sr-only">{label}</span>
    </div>
  );
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

  // 始终渲染 children：公共政策（隐私/条款/配送/退货/联系）等未登录可见页
  // 不得被登录检查骨架挡住。需登录的子页由 RequireProfileAuth 自行门禁。
  return (
    <ProfileAuthContext.Provider value={{ user, loading, loadingLabel, refresh, setUser }}>
      {children}
    </ProfileAuthContext.Provider>
  );
}

export function RequireProfileAuth({ locale, children }: { locale: string; children: ReactNode }) {
  const { user, loading, loadingLabel } = useProfileAuth();

  if (loading) {
    return <AuthLoadingSkeleton label={loadingLabel} />;
  }

  if (!user) {
    return <ProfileLoginCard locale={locale} variant="gate" />;
  }

  return <>{children}</>;
}
