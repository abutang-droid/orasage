import { NextRequest, NextResponse } from 'next/server';
import { fetchProducts, getProduct } from '@/lib/products';
import { detectShopLocale } from '@/lib/currency';
import { SHOP_LOCALE_COOKIE, SHOP_LOCALE_OVERRIDE_COOKIE } from '../../../../../shared/shop-locale/index';

export async function GET(req: NextRequest) {
  const sku = req.nextUrl.searchParams.get('sku');
  const cookie = req.cookies.get(SHOP_LOCALE_OVERRIDE_COOKIE)?.value
    ?? req.cookies.get(SHOP_LOCALE_COOKIE)?.value;
  const locale = detectShopLocale({
    cookieLocale: cookie,
    acceptLanguage: req.headers.get('accept-language'),
  });

  if (sku) {
    const product = await getProduct(sku, locale);
    if (!product) {
      return NextResponse.json({ error: '商品不存在' }, { status: 404 });
    }
    return NextResponse.json({
      product: {
        sku: product.sku,
        name: product.name,
        element: product.element,
        desc: product.desc,
        priceCents: product.priceCents,
        priceDisplay: product.priceDisplay ?? `¥${(product.priceCents / 100).toFixed(2)}`,
        category: product.category,
        requiresShipping: product.requiresShipping,
      },
    });
  }

  const products = await fetchProducts(locale);
  return NextResponse.json({
    products: products.map((p) => ({
      sku: p.sku,
      name: p.name,
      element: p.element,
      desc: p.desc,
      priceCents: p.priceCents,
      priceDisplay: p.priceDisplay ?? `¥${(p.priceCents / 100).toFixed(2)}`,
      category: p.category,
      shopUrl: `https://shop.orasage.com?sku=${encodeURIComponent(p.sku)}`,
    })),
  });
}
