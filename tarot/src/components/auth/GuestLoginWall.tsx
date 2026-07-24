'use client';

import type { ReactNode } from 'react';
import { buttonVariants } from '@orasage/ui/button';
import { cn } from '@orasage/ui';
import { buildLoginUrlFromWindow } from '@/lib/login-url';
import { useReadingCommon } from '@/lib/i18n/reading-copy';
import { ORASAGE_URLS } from '@/lib/orasage-app-shell/config';

type GuestLoginWallProps = {
  title?: string;
  message: string;
  hint?: string;
  ctaLabel?: string;
  returnPath?: string;
  className?: string;
  children?: ReactNode;
};

export function GuestLoginWall({
  title,
  message,
  hint,
  ctaLabel,
  returnPath,
  className = '',
  children,
}: GuestLoginWallProps) {
  const common = useReadingCommon();
  const loginHref = returnPath
    ? `${process.env.NEXT_PUBLIC_AUTH_URL || ORASAGE_URLS.authLogin.replace(/\/login$/, '')}/login?redirect=${encodeURIComponent(
        `${process.env.NEXT_PUBLIC_APP_URL || ORASAGE_URLS.tarot}${returnPath.startsWith('/') ? returnPath : `/${returnPath}`}`,
      )}`
    : buildLoginUrlFromWindow();

  return (
    <div className={`guest-login-wall ${className}`.trim()}>
      <div className="guest-login-wall-inner">
        <h3 className="guest-login-wall-title">{title ?? common.loginDefaultTitle}</h3>
        <p className="guest-login-wall-message">{message}</p>
        {hint ? <p className="guest-login-wall-hint">{hint}</p> : null}
        <a
          href={loginHref}
          className={cn(buttonVariants(), 'guest-login-wall-cta w-full no-underline')}
        >
          {ctaLabel ?? common.loginDefaultCta}
        </a>
      </div>
      {children ? <div className="guest-login-wall-preview" aria-hidden>{children}</div> : null}
    </div>
  );
}
