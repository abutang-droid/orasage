import { NextResponse } from 'next/server';
import { cookies, headers } from 'next/headers';
import { fetchProductImageMap } from '@/lib/cms-product-images';
import {
  detectShopLocale,
  formatDualShopPrice,
  SHOP_LOCALE_COOKIE,
  SHOP_LOCALE_OVERRIDE_COOKIE,
} from '../../../../../../shared/shop-locale/index';
import { ORASAGE_URLS } from '@/lib/orasage-app-shell/config';

const authInternalUrl = process.env.AUTH_INTERNAL_URL ?? 'http://127.0.0.1:3101';

export async function GET() {
  try {
    const jar = await cookies();
    const hdrs = await headers();
    const locale = detectShopLocale({
      cookieLocale: jar.get(SHOP_LOCALE_OVERRIDE_COOKIE)?.value ?? jar.get(SHOP_LOCALE_COOKIE)?.value,
      acceptLanguage: hdrs.get('accept-language'),
    });
    const [res, imageMap] = await Promise.all([
      fetch(`${authInternalUrl}/api/products/homepage?locale=${encodeURIComponent(locale)}`, {
        next: { revalidate: 60 },
      } as RequestInit),
      fetchProductImageMap(),
    ]);
    if (!res.ok) throw new Error(`homepage API ${res.status}`);
    const data = await res.json() as {
      products?: Array<{ sku: string } & Record<string, unknown>>;
      categories?: unknown;
    };
    const products = (data.products ?? []).map((p) => ({
      ...p,
      imageUrl: imageMap.get(p.sku) ?? null,
    }));
    return NextResponse.json({ ...data, products });
  } catch (err) {
    console.warn('[shop] homepage products fallback:', err);
    const { FALLBACK_PRODUCTS, categoryLabels } = await import('@/lib/products');
    const products = FALLBACK_PRODUCTS.slice(0, 6).map((p) => ({
      sku: p.sku,
      name: p.name,
      element: p.element ?? null,
      desc: p.desc,
      description: p.desc,
      priceCents: p.priceCents,
      priceCentsUsd: p.priceCentsUsd,
      priceDisplay: formatDualShopPrice({
        priceCents: p.priceCents,
        priceCentsUsd: p.priceCentsUsd,
      }),
      category: p.category,
      categoryLabel: categoryLabels[p.category],
      shopUrl: `${ORASAGE_URLS.shop}?sku=${encodeURIComponent(p.sku)}`,
    }));
    const categorySet = new Set(products.map((p) => p.category));
    const categories = (['crystal', 'report', 'service'] as const)
      .filter((id) => categorySet.has(id))
      .map((id) => ({ id, label: categoryLabels[id] }));
    return NextResponse.json({ products, categories });
  }
}
