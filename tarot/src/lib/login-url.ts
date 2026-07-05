const AUTH_URL =
  (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_AUTH_URL) ||
  process.env.NEXT_PUBLIC_AUTH_URL ||
  process.env.AUTH_URL ||
  'https://auth.orasage.com';

const APP_URL =
  (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_APP_URL) ||
  process.env.NEXT_PUBLIC_APP_URL ||
  'https://tarot.orasage.com';

/** 构建带回跳路径的统一登录 URL（auth.orasage.com） */
export function buildLoginUrl(returnPath = '/'): string {
  const path = returnPath.startsWith('/') ? returnPath : `/${returnPath}`;
  const target = `${APP_URL.replace(/\/$/, '')}${path}`;
  return `${AUTH_URL.replace(/\/$/, '')}/login?redirect=${encodeURIComponent(target)}`;
}

export function buildLoginUrlFromWindow(): string {
  if (typeof window === 'undefined') return buildLoginUrl('/');
  return buildLoginUrl(`${window.location.pathname}${window.location.search}`);
}
