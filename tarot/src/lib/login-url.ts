import { ORASAGE_URLS } from '@/lib/orasage-app-shell/config';

function authUrl(): string {
  return (
    process.env.NEXT_PUBLIC_AUTH_URL ||
    process.env.AUTH_URL ||
    ORASAGE_URLS.authLogin.replace(/\/login$/, '')
  );
}

function appUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || ORASAGE_URLS.tarot;
}

/** 构建带回跳路径的统一登录 URL */
export function buildLoginUrl(returnPath = '/'): string {
  const path = returnPath.startsWith('/') ? returnPath : `/${returnPath}`;
  const target = `${appUrl().replace(/\/$/, '')}${path}`;
  return `${authUrl().replace(/\/$/, '')}/login?redirect=${encodeURIComponent(target)}`;
}

export function buildLoginUrlFromWindow(): string {
  if (typeof window === 'undefined') return buildLoginUrl('/');
  return buildLoginUrl(`${window.location.pathname}${window.location.search}`);
}
