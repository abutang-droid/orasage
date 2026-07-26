'use client';

import type { ReactNode } from 'react';
import { buttonVariants } from '@orasage/ui/button';
import { cn } from '@orasage/ui';
import { buildLoginUrl, buildLoginUrlFromWindow } from '@/lib/login-url';
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
  const origin = typeof window !== 'undefined' ? window.location.origin : undefined;
  const loginHref = returnPath
    ? buildLoginUrl(returnPath, origin)
    : buildLoginUrlFromWindow();

  return (
    <div className={`guest-login-wall ${className}`.trim()}>
      <div className="guest-login-wall-inner">
        <h3 className="guest-login-wall-title">{title ?? common.loginDefaultTitle}</h3>
        <p className="guest-login-wall-message">{message}</p>
        {hint ? <p className="guest-login-wall-hint">{hint}</p> : null}
        <a
          href={loginHref}
          className={cn(buttonVariants(), 'guest-login-wall-cta os-solid-cta os-solid-cta--block w-full no-underline')}
        >
          {ctaLabel ?? common.loginDefaultCta}
        </a>
      </div>
      {children ? <div className="guest-login-wall-preview" aria-hidden>{children}</div> : null}
    </div>
  );
}
