import { LOCALE_COOKIE } from './locales';

/** Cross-subdomain cookie domain from a hostname (undefined on localhost). */
export function cookieDomainFromHost(hostname: string): string | undefined {
  const host = hostname.split(':')[0]?.toLowerCase().trim() ?? '';
  if (!host || host === 'localhost' || host === '127.0.0.1') return undefined;
  if (host === 'oricosmos.com' || host.endsWith('.oricosmos.com')) return '.oricosmos.com';
  if (host === 'orasage.com' || host.endsWith('.orasage.com')) return '.orasage.com';
  return undefined;
}

/** Cross-subdomain cookie domain (undefined on localhost / SSR without window). */
export function cookieDomain(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  return cookieDomainFromHost(window.location.hostname);
}

/** Persist locale to the shared cross-subdomain cookie (design system §10). */
export function setLocaleCookie(locale: string): void {
  if (typeof document === 'undefined') return;
  const domain = cookieDomain();
  const domainPart = domain ? `; domain=${domain}` : '';
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${LOCALE_COOKIE}=${encodeURIComponent(locale)}; path=/${domainPart}; max-age=31536000; SameSite=Lax${secure}`;
}
