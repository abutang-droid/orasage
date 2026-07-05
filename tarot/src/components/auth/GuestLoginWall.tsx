'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { buildLoginUrlFromWindow } from '@/lib/login-url';

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
  title = '登录查看完整内容',
  message,
  hint,
  ctaLabel = '登录 / 注册',
  returnPath,
  className = '',
  children,
}: GuestLoginWallProps) {
  const loginHref = returnPath
    ? `${process.env.NEXT_PUBLIC_AUTH_URL || 'https://auth.orasage.com'}/login?redirect=${encodeURIComponent(
        `${process.env.NEXT_PUBLIC_APP_URL || 'https://tarot.orasage.com'}${returnPath.startsWith('/') ? returnPath : `/${returnPath}`}`,
      )}`
    : buildLoginUrlFromWindow();

  return (
    <div className={`guest-login-wall ${className}`.trim()}>
      <div className="guest-login-wall-inner">
        <h3 className="guest-login-wall-title">{title}</h3>
        <p className="guest-login-wall-message">{message}</p>
        {hint ? <p className="guest-login-wall-hint">{hint}</p> : null}
        <Link href={loginHref} className="btn-primary guest-login-wall-cta">
          {ctaLabel}
        </Link>
      </div>
      {children ? <div className="guest-login-wall-preview" aria-hidden>{children}</div> : null}
    </div>
  );
}
