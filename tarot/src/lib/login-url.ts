import { ORASAGE_URLS } from '@/lib/orasage-app-shell/config';
import { isWorldAuthRequired } from '../../../shared/world-minikit/config';

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

/** 构建带回跳路径的统一登录 URL；origin 优先用当前页，避免 env 与线上域名不一致 */
export function buildLoginUrl(returnPath = '/', origin?: string): string {
  const path = returnPath.startsWith('/') ? returnPath : `/${returnPath}`;
  const base = (origin || appUrl()).replace(/\/$/, '');
  const target = `${base}${path}`;
  // World Mini App: keep login on the registered origin (tarot), not auth.*
  if (isWorldAuthRequired()) {
    try {
      const u = new URL(target);
      u.searchParams.set('world_login', '1');
      return u.toString();
    } catch {
      return `${base}/?world_login=1`;
    }
  }
  return `${authUrl().replace(/\/$/, '')}/login?redirect=${encodeURIComponent(target)}`;
}

export function buildLoginUrlFromWindow(): string {
  if (typeof window === 'undefined') return buildLoginUrl('/');
  return buildLoginUrl(
    `${window.location.pathname}${window.location.search}`,
    window.location.origin,
  );
}
