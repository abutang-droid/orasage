import Link from 'next/link';
import { ShopHeader } from '@/components/ShopHeader';

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order } = await searchParams;

  return (
    <>
      <ShopHeader showBack />
      <main className="shop-page safe-bottom mx-auto flex min-h-[60dvh] max-w-lg flex-1 flex-col items-center justify-center py-12 text-center">
        <div className="shop-success-icon">✓</div>
        <h1 className="mt-4 font-serif text-2xl text-sage-primary">支付成功</h1>
        {order && (
          <p className="mt-3 text-sm text-sage-muted">
            订单号：<span className="text-sage-primary">{order}</span>
          </p>
        )}
        <p className="mt-2 text-sm text-sage-muted">订单已同步到您的用户中心</p>
        <div className="mt-8 flex w-full max-w-xs flex-col gap-3">
          <a href="https://auth.orasage.com/center" className="shop-btn-primary w-full">
            查看我的订单
          </a>
          <Link href="/" className="shop-btn-secondary w-full">
            继续购物
          </Link>
        </div>
      </main>
    </>
  );
}
