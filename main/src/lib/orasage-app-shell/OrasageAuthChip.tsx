'use client';

import { useEffect, useState } from 'react';
import { ORASAGE_URLS, profileUrl } from './config';
import { pickLabel, SHELL_LABELS } from './labels';

type AuthMeUser = {
  displayName: string;
  email: string;
};

export function OrasageAuthChip({ locale = 'zh-CN' }: { locale?: string }) {
  const [user, setUser] = useState<AuthMeUser | null | undefined>(undefined);
  const authBase = ORASAGE_URLS.authLogin.replace(/\/login$/, '');

  useEffect(() => {
    let cancelled = false;
    fetch(`${authBase}/auth/me`, { credentials: 'include' })
      .then(async (res) => {
        if (res.status === 401) return null;
        if (!res.ok) throw new Error(`auth/me ${res.status}`);
        const data = await res.json();
        return data.user as AuthMeUser;
      })
      .then((me) => {
        if (!cancelled) setUser(me);
      })
      .catch(() => {
        if (!cancelled) setUser(null);
      });
    return () => {
      cancelled = true;
    };
  }, [authBase]);

  if (user === undefined) {
    return (
      <span
        className="orasage-auth-chip orasage-auth-chip--loading"
        aria-hidden
      />
    );
  }

  if (user) {
    return (
      <a
        href={profileUrl(locale)}
        className="orasage-auth-chip orasage-auth-chip--signed-in"
        title={`${pickLabel(SHELL_LABELS.signedIn, locale)} · ${user.email}`}
      >
        {user.displayName}
      </a>
    );
  }

  const returnUrl = encodeURIComponent(
    typeof window !== 'undefined' ? window.location.href : ORASAGE_URLS.main,
  );
  const loginUrl = `${ORASAGE_URLS.authLogin}?redirect=${returnUrl}`;

  return (
    <a href={loginUrl} className="orasage-auth-chip">
      {pickLabel(SHELL_LABELS.login, locale)}
    </a>
  );
}
