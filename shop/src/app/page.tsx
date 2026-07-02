import { Suspense } from 'react';
import { ShopHeader } from '@/components/ShopHeader';
import { ProductCatalog } from '@/components/ProductCatalog';
import { fetchProducts } from '@/lib/products';
import { getAuthUser } from '@/lib/auth';

export default async function ShopPage() {
  const [user, products] = await Promise.all([getAuthUser(), fetchProducts()]);

  return (
    <>
      <ShopHeader />
      <main className="safe-bottom mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
        <div className="mb-6 text-center sm:mb-8">
          <h1 className="font-serif text-2xl text-sage-gold sm:text-3xl">能量商城</h1>
          <p className="mt-2 text-sm text-sage-muted sm:text-base">
            命理解读推荐 · 水晶手串 · 数字报告
          </p>
          {user && (
            <p className="mt-2 text-xs text-sage-muted">
              已登录，购买后订单将同步至用户中心
            </p>
          )}
        </div>

        <Suspense fallback={<p className="text-center text-sage-muted">加载商品…</p>}>
          <ProductCatalog products={products} />
        </Suspense>

        <p className="mt-8 text-center text-xs text-sage-muted">
          完成命理解读后，可一键购买推荐水晶 · 订单可在{' '}
          <a href="https://auth.orasage.com/center" className="text-sage-gold underline">
            用户中心
          </a>{' '}
          查看
        </p>
      </main>
    </>
  );
}
