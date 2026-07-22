import { LOCALE_COOKIE } from './locales';

/** Cross-subdomain cookie domain (undefined on localhost). */
export function cookieDomain(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  const host = window.location.hostname;
  if (host === 'localhost' || host === '127.0.0.1') return undefined;
  if (host === 'oricosmos.com' || host.endsWith('.oricosmos.com')) return '.oricosmos.com';
  if (host === 'orasage.com' || host.endsWith('.orasage.com')) return '.orasage.com';
  return undefined;
}

/** Persist locale to the shared cross-subdomain cookie (design system §10). */
export function setLocaleCookie(locale: string): void {
  if (typeof document === 'undefined') return;
  const domain = cookieDomain();
  const domainPart = domain ? `; domain=${domain}` : '';
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${LOCALE_COOKIE}=${encodeURIComponent(locale)}; path=/${domainPart}; max-age=31536000; SameSite=Lax${secure}`;
}
