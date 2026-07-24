import { LOCALE_COOKIE, LOCALE_OVERRIDE_COOKIE } from './locales';

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

function writeCookie(name: string, value: string, domainPart: string, secure: string): void {
  document.cookie = `${name}=${value}; path=/${domainPart}; max-age=31536000; SameSite=Lax${secure}`;
}

function expireHostOnlyCookie(name: string): void {
  // Host-only cookies can shadow apex-domain cookies on subdomains; clear before set.
  document.cookie = `${name}=; path=/; max-age=0`;
}

/**
 * Persist locale to the shared cross-subdomain cookies (design system §10).
 * Writes both NEXT_LOCALE and orasage_shop_locale so shop override cannot
 * drift and flip language when hopping between apps via the bottom nav.
 */
export function setLocaleCookie(locale: string): void {
  if (typeof document === 'undefined') return;
  const domain = cookieDomain();
  const domainPart = domain ? `; domain=${domain}` : '';
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  const encoded = encodeURIComponent(locale);

  expireHostOnlyCookie(LOCALE_COOKIE);
  expireHostOnlyCookie(LOCALE_OVERRIDE_COOKIE);

  writeCookie(LOCALE_COOKIE, encoded, domainPart, secure);
  writeCookie(LOCALE_OVERRIDE_COOKIE, encoded, domainPart, secure);
}
