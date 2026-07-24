import { NextRequest, NextResponse } from 'next/server';
import { fetchProducts, getProduct, type Product } from '@/lib/products';
import { detectShopLocale, formatDualShopPrice } from '@/lib/currency';
import { fetchProductImageMap } from '@/lib/cms-product-images';
import { SHOP_LOCALE_COOKIE, SHOP_LOCALE_OVERRIDE_COOKIE } from '../../../../../shared/shop-locale/index';
import { ORASAGE_URLS } from '@/lib/orasage-app-shell/config';

function mapProduct(p: Product, imageUrl?: string | null) {
  return {
    sku: p.sku,
    name: p.name,
    element: p.element,
    desc: p.desc,
    priceCents: p.priceCents,
    priceCentsUsd: p.priceCentsUsd,
    priceDisplay: formatDualShopPrice({
      priceCents: p.priceCents,
      priceCentsUsd: p.priceCentsUsd,
    }),
    category: p.category,
    requiresShipping: p.requiresShipping,
    imageUrl: imageUrl ?? null,
  };
}

export async function GET(req: NextRequest) {
  const sku = req.nextUrl.searchParams.get('sku');
  const cookie = req.cookies.get(SHOP_LOCALE_COOKIE)?.value
    ?? req.cookies.get(SHOP_LOCALE_OVERRIDE_COOKIE)?.value;
  const locale = detectShopLocale({
    queryLocale: req.nextUrl.searchParams.get('locale') || req.nextUrl.searchParams.get('lang'),
    cookieLocale: cookie,
    acceptLanguage: req.headers.get('accept-language'),
  });

  const imageMap = await fetchProductImageMap();

  if (sku) {
    const product = await getProduct(sku, locale);
    if (!product) {
      return NextResponse.json({ error: '商品不存在' }, { status: 404 });
    }
    return NextResponse.json({
      product: mapProduct(product, imageMap.get(product.sku)),
    });
  }

  const products = await fetchProducts(locale);
  return NextResponse.json({
    products: products.map((p) => ({
      ...mapProduct(p, imageMap.get(p.sku)),
      shopUrl: `${ORASAGE_URLS.shop}/product/${encodeURIComponent(p.sku)}`,
    })),
  });
}
