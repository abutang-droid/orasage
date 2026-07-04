import { Suspense } from 'react';
import { ShopHeader } from '@/components/ShopHeader';
import { ProductCatalog } from '@/components/ProductCatalog';
import { fetchProducts } from '@/lib/products';
import { getAuthUser } from '@/lib/auth';
import { getServerShopLocale } from '@/lib/currency-server';

export default async function ShopPage() {
  const locale = await getServerShopLocale();
  const [user, products] = await Promise.all([getAuthUser(), fetchProducts(locale)]);

  return (
    <>
      <ShopHeader />
      <main className="shop-page safe-bottom flex-1">
        <div className="shop-hero">
          <h1 className="shop-hero-title">能量商城</h1>
          <p className="shop-hero-subtitle">命理解读推荐 · 水晶手串 · 数字报告</p>
          {user && (
            <p className="shop-hero-meta">已登录，购买后订单将同步至用户中心</p>
          )}
        </div>

        <Suspense fallback={<p className="text-center text-sage-muted">加载商品…</p>}>
          <ProductCatalog products={products} />
        </Suspense>

        <p className="shop-footer-note">
          完成命理解读后，可一键购买推荐水晶 · 订单可在{' '}
          <a href="https://auth.orasage.com/center">用户中心</a> 查看
        </p>
      </main>
    </>
  );
}
