'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { Button } from '@orasage/ui/button';
import { buildLoginUrlFromWindow } from '@/lib/login-url';
import { useReadingCommon } from '@/lib/i18n/reading-copy';

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
    ? `${process.env.NEXT_PUBLIC_AUTH_URL || 'https://auth.orasage.com'}/login?redirect=${encodeURIComponent(
        `${process.env.NEXT_PUBLIC_APP_URL || 'https://tarot.orasage.com'}${returnPath.startsWith('/') ? returnPath : `/${returnPath}`}`,
      )}`
    : buildLoginUrlFromWindow();

  return (
    <div className={`guest-login-wall ${className}`.trim()}>
      <div className="guest-login-wall-inner">
        <h3 className="guest-login-wall-title">{title ?? common.loginDefaultTitle}</h3>
        <p className="guest-login-wall-message">{message}</p>
        {hint ? <p className="guest-login-wall-hint">{hint}</p> : null}
        <Button asChild className="guest-login-wall-cta w-full">
          <Link href={loginHref}>{ctaLabel ?? common.loginDefaultCta}</Link>
        </Button>
      </div>
      {children ? <div className="guest-login-wall-preview" aria-hidden>{children}</div> : null}
    </div>
  );
}
