import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';
import { locales, defaultLocale } from './routing';

export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: 'always',
  // Locale lives in the URL (`localePrefix: 'always'`). Writing NEXT_LOCALE on
  // every HTML response makes Cloudflare treat pages as per-user (DYNAMIC).
  // The portal language switcher still sets the cookie for other subdomains.
  localeCookie: false,
});

export const { Link, redirect, usePathname, useRouter } = createNavigation(routing);
