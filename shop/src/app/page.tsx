import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import { ProductCatalog } from '@/components/ProductCatalog';
import { ShopHomeHero } from '@/components/ShopHomeHero';
import { fetchProducts } from '@/lib/products';
import { DIY_ORDER_SKU } from '@/lib/diy';
import { getAuthUser } from '@/lib/auth';
import { getServerShopLocale } from '@/lib/currency-server';
import { fetchProductImageMap } from '@/lib/cms-product-images';

async function loadFeaturedSkus(locale: string): Promise<string[]> {
  try {
    const authInternalUrl = process.env.AUTH_INTERNAL_URL ?? 'http://127.0.0.1:3101';
    const res = await fetch(`${authInternalUrl}/api/products/homepage?locale=${encodeURIComponent(locale)}`, {
      next: { revalidate: 60 },
    } as RequestInit);
    if (!res.ok) return [];
    const data = await res.json() as { products?: Array<{ sku: string }> };
    return (data.products ?? []).map((p) => p.sku);
  } catch {
    return [];
  }
}

export default async function ShopPage() {
  const locale = await getServerShopLocale();
  const th = await getTranslations('home');
  const tc = await getTranslations('catalog');
  const [user, products, imageMap, featuredSkus] = await Promise.all([
    getAuthUser(),
    fetchProducts(locale),
    fetchProductImageMap(),
    loadFeaturedSkus(locale),
  ]);

  const productsWithImages = products
    .filter((p) => p.sku !== DIY_ORDER_SKU)
    .map((p) => ({
      ...p,
      imageUrl: imageMap.get(p.sku) ?? p.imageUrl ?? null,
    }));

  return (
    <main className="shop-page safe-bottom flex-1">
      <ShopHomeHero loggedIn={Boolean(user)} />

      <Suspense fallback={<p className="text-center text-sage-muted">{tc('loading')}</p>}>
        <ProductCatalog products={productsWithImages} featuredSkus={featuredSkus} />
      </Suspense>

      <p className="shop-footer-note">
        {th('footerNote')}{' '}
        <a href="https://auth.orasage.com/center">{th('userCenter')}</a>
        {th('footerView') ? ` ${th('footerView')}` : ''}
      </p>
    </main>
  );
}
