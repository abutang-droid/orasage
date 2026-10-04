import { getRequestConfig } from 'next-intl/server';
import { cookies, headers } from 'next/headers';
import { CORE_LOCALES, localeFromReferrerUrl, type CoreLocale } from '@orasage/i18n';
import {
  detectShopLocale,
  SHOP_LOCALE_COOKIE,
  SHOP_LOCALE_OVERRIDE_COOKIE,
} from '../../../shared/shop-locale/index';

function queryLocaleFromHeaders(hdrs: Headers): string | null {
  for (const raw of [hdrs.get('x-url'), hdrs.get('referer'), hdrs.get('next-url')]) {
    if (!raw) continue;
    try {
      const url = new URL(raw, 'https://shop.orasage.com');
      const q = url.searchParams.get('locale') ?? url.searchParams.get('lang');
      if (q) return q;
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
    referrerLocale: localeFromReferrerUrl(hdrs.get('referer')),
    cookieLocale: override ?? portal,
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
