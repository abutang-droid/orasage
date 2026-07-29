import { cookies, headers } from 'next/headers';
import {
  currencyForLocale,
  detectShopLocale,
  SHOP_LOCALE_COOKIE,
  SHOP_LOCALE_OVERRIDE_COOKIE,
  type ShopCurrency,
} from '../../../shared/shop-locale/index';

function queryLocaleFromHeaders(hdrs: Headers): string | null {
  const direct = hdrs.get('x-orasage-locale') ?? hdrs.get('x-locale');
  if (direct?.trim()) return direct.trim();
  for (const raw of [hdrs.get('x-url'), hdrs.get('x-forwarded-uri'), hdrs.get('next-url'), hdrs.get('referer')]) {
    if (!raw) continue;
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

export async function getServerShopLocale(): Promise<string> {
  const jar = await cookies();
  const hdrs = await headers();
  const override = jar.get(SHOP_LOCALE_OVERRIDE_COOKIE)?.value;
  const portal = jar.get(SHOP_LOCALE_COOKIE)?.value;
  return detectShopLocale({
    queryLocale: queryLocaleFromHeaders(hdrs),
    cookieLocale: override ?? portal,
    acceptLanguage: hdrs.get('accept-language'),
  });
}

export async function getServerShopCurrency(): Promise<ShopCurrency> {
  return currencyForLocale(await getServerShopLocale());
}
