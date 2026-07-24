import { getRequestConfig } from 'next-intl/server';
import { cookies, headers } from 'next/headers';
import { CORE_LOCALES, type CoreLocale } from '@orasage/i18n';
import {
  detectShopLocale,
  SHOP_LOCALE_COOKIE,
  SHOP_LOCALE_OVERRIDE_COOKIE,
} from '../../../shared/shop-locale/index';

async function resolveShopLocale(): Promise<CoreLocale> {
  const jar = await cookies();
  const hdrs = await headers();
  // Prefer portal NEXT_LOCALE; shop override is fallback (kept in sync by setLocaleCookie).
  const portal = jar.get(SHOP_LOCALE_COOKIE)?.value;
  const override = jar.get(SHOP_LOCALE_OVERRIDE_COOKIE)?.value;
  const locale = detectShopLocale({
    cookieLocale: portal ?? override,
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
