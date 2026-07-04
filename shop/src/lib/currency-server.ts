import { cookies, headers } from 'next/headers';
import {
  currencyForLocale,
  detectShopLocale,
  SHOP_LOCALE_COOKIE,
  SHOP_LOCALE_OVERRIDE_COOKIE,
  type ShopCurrency,
} from '../../../shared/shop-locale/index';

export async function getServerShopLocale(): Promise<string> {
  const jar = await cookies();
  const hdrs = await headers();
  const override = jar.get(SHOP_LOCALE_OVERRIDE_COOKIE)?.value;
  const portal = jar.get(SHOP_LOCALE_COOKIE)?.value;
  return detectShopLocale({
    cookieLocale: override ?? portal,
    acceptLanguage: hdrs.get('accept-language'),
  });
}

export async function getServerShopCurrency(): Promise<ShopCurrency> {
  return currencyForLocale(await getServerShopLocale());
}
