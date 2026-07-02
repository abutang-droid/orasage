import { locales } from '@/i18n/routing';

export const ORASAGE_PATHNAME_HEADER = 'x-orasage-pathname';

/** Strip `/zh-CN` etc. so `/zh-CN/famous` → `/famous` */
export function stripLocalePrefix(pathname: string): string {
  for (const locale of locales) {
    const prefix = `/${locale}`;
    if (pathname === prefix || pathname === `${prefix}/`) return '/';
    if (pathname.startsWith(`${prefix}/`)) {
      return pathname.slice(prefix.length) || '/';
    }
  }
  return pathname || '/';
}
