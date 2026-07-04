import { Suspense } from 'react';
import { ProductCatalog } from '@/components/ProductCatalog';
import { ShopHomeHero } from '@/components/ShopHomeHero';
import { fetchProducts } from '@/lib/products';
import { getAuthUser } from '@/lib/auth';
import { getServerShopLocale } from '@/lib/currency-server';

export default async function ShopPage() {
  const locale = await getServerShopLocale();
  const [user, products] = await Promise.all([getAuthUser(), fetchProducts(locale)]);

  return (
    <main className="shop-page safe-bottom flex-1">
      <ShopHomeHero loggedIn={Boolean(user)} />

      <Suspense fallback={<p className="text-center text-sage-muted">加载商品…</p>}>
        <ProductCatalog products={products} />
      </Suspense>

      <p className="shop-footer-note">
        完成命理解读后，可一键购买推荐水晶 · 订单可在{' '}
        <a href="https://auth.orasage.com/center">用户中心</a> 查看
      </p>
    </main>
  );
}
