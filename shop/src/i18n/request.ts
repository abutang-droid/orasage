import { getRequestConfig } from 'next-intl/server';
import { cookies, headers } from 'next/headers';
import { CORE_LOCALES, type CoreLocale } from '@orasage/i18n';
import {
  detectShopLocale,
  SHOP_LOCALE_COOKIE,
  SHOP_LOCALE_OVERRIDE_COOKIE,
} from '../../../shared/shop-locale/index';

function queryLocaleFromHeaders(hdrs: Headers): string | null {
  // Prefer explicit middleware / proxy headers when present.
  const direct = hdrs.get('x-orasage-locale') ?? hdrs.get('x-locale');
  if (direct?.trim()) return direct.trim();

  const candidates = [
    hdrs.get('x-url'),
    hdrs.get('x-forwarded-uri'),
    hdrs.get('next-url'),
    hdrs.get('referer'),
  ].filter(Boolean) as string[];

  for (const raw of candidates) {
    try {
      const url = raw.startsWith('http') ? new URL(raw) : new URL(raw, 'http://localhost');
      const q = url.searchParams.get('locale') ?? url.searchParams.get('lang');
      if (q?.trim()) return q.trim();
    } catch {
      /* ignore */
    }
  }
  return null;
}

async function resolveShopLocale(): Promise<CoreLocale> {
  const jar = await cookies();
  const hdrs = await headers();
  const override = jar.get(SHOP_LOCALE_OVERRIDE_COOKIE)?.value;
  const portal = jar.get(SHOP_LOCALE_COOKIE)?.value;
  const locale = detectShopLocale({
    queryLocale: queryLocaleFromHeaders(hdrs),
    cookieLocale: override ?? portal,
    acceptLanguage: hdrs.get('accept-language'),
  });
  return (CORE_LOCALES as readonly string[]).includes(locale) ? (locale as CoreLocale) : 'zh-CN';
}

export default getRequestConfig(async () => {
  const locale = await resolveShopLocale();
  let messages;
  try {
    messages = (await import(`../../messages/${locale}.json`)).default;
  } catch {
    messages = (await import('../../messages/zh-CN.json')).default;
  }
  return { locale, messages };
});
