import { NextRequest, NextResponse } from 'next/server';
import { ENV } from '@/lib/env';
import { SHOP_LOCALE_COOKIE, SHOP_LOCALE_OVERRIDE_COOKIE } from '../../../../../../shared/shop-locale/index';
import { detectShopLocale } from '../../../../../../shared/shop-locale/index';

/** Proxy → auth GET /api/shipping/regions (AI-loaded provinces/cities). */
export async function GET(req: NextRequest) {
  const country = req.nextUrl.searchParams.get('country');
  if (!country?.trim()) {
    return NextResponse.json({ error: 'country required', items: [], manual: true }, { status: 400 });
  }
  const province = req.nextUrl.searchParams.get('province');
  const cookie = req.cookies.get(SHOP_LOCALE_COOKIE)?.value
    ?? req.cookies.get(SHOP_LOCALE_OVERRIDE_COOKIE)?.value;
  const locale = detectShopLocale({
    queryLocale: req.nextUrl.searchParams.get('locale') || req.nextUrl.searchParams.get('lang'),
    cookieLocale: cookie,
    acceptLanguage: req.headers.get('accept-language'),
  });

  const qs = new URLSearchParams({
    country: country.trim().toUpperCase(),
    locale,
  });
  if (province?.trim()) qs.set('province', province.trim());

  try {
    const res = await fetch(`${ENV.authInternalUrl}/api/shipping/regions?${qs}`, {
      cache: 'no-store',
      headers: {
        cookie: req.headers.get('cookie') ?? '',
        'accept-language': req.headers.get('accept-language') ?? '',
      },
    });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.warn('[shop] shipping regions proxy:', err);
    return NextResponse.json({
      country: country.toUpperCase(),
      province: province || null,
      items: [],
      source: 'error',
      manual: true,
      suggestion: 'Could not load regions — please enter manually',
    });
  }
}
