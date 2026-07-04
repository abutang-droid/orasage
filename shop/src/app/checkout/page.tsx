'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useRef, useState, Suspense } from 'react';
import { ShippingForm } from '@/components/ShippingForm';
import { parseShippingAddress } from '../../../../shared/shop-fulfillment/index';

type CheckoutOrder = {
  orderNo: string;
  title: string;
  sku?: string | null;
  amountCents: number;
  currency: string;
  status: string;
  shippingAddress?: string | null;
};

type Fulfillment = {
  requiresShipping: boolean;
  requiresWristSize: boolean;
};

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderNo = searchParams.get('order') ?? '';
  const returnUrl = searchParams.get('return');
  const coupleShipping = searchParams.get('shipping') === 'couple';

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [order, setOrder] = useState<CheckoutOrder | null>(null);
  const [fulfillment, setFulfillment] = useState<Fulfillment | null>(null);
  const [shippingDone, setShippingDone] = useState(false);

  const [payLoading, setPayLoading] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const payingRef = useRef(false);

  useEffect(() => {
    if (!orderNo) {
      setLoadError('缺少订单号');
      setLoading(false);
      return;
    }

    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch(`/api/orders/${encodeURIComponent(orderNo)}`, { credentials: 'include' });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || '加载订单失败');
        if (cancelled) return;
        setOrder(data.order as CheckoutOrder);
        setFulfillment(data.fulfillment as Fulfillment);
        const hasShipping = Boolean(parseShippingAddress(data.order.shippingAddress));
        setShippingDone(hasShipping || !data.fulfillment.requiresShipping);
      } catch (err) {
        if (!cancelled) setLoadError(err instanceof Error ? err.message : '加载失败');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [orderNo]);

  function formatPayError(err: unknown): string {
    if (err instanceof TypeError) return '网络异常，请检查连接后重试';
    if (err instanceof Error && /failed to fetch|networkerror|load failed/i.test(err.message)) {
      return '网络异常，请检查连接后重试';
    }
    return err instanceof Error ? err.message : '支付失败';
  }

  async function handlePay() {
    if (!orderNo || payingRef.current || done) return;
    payingRef.current = true;
    setPayLoading(true);
    setPayError(null);
    try {
      const res = await fetch(`/api/pay?order=${encodeURIComponent(orderNo)}`, {
        method: 'POST',
        credentials: 'include',
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || '支付失败');
      setDone(true);
      if (returnUrl) {
        setTimeout(() => { window.location.href = returnUrl; }, 800);
      } else {
        setTimeout(() => router.push(`/success?order=${encodeURIComponent(orderNo)}`), 800);
      }
    } catch (err) {
      payingRef.current = false;
      setPayError(formatPayError(err));
    } finally {
      setPayLoading(false);
    }
  }

  if (loading) {
    return <main className="shop-page p-16 text-center text-sage-muted">加载订单…</main>;
  }

  if (loadError || !order) {
    return (
      <main className="shop-page safe-bottom mx-auto flex min-h-[60vh] max-w-md flex-1 flex-col items-center justify-center py-16 text-center">
        <p className="text-sm text-red-600">{loadError ?? '订单不存在'}</p>
      </main>
    );
  }

  const needsShippingStep = fulfillment?.requiresShipping && !shippingDone;

  if (needsShippingStep) {
    return (
      <main className="shop-page safe-bottom mx-auto w-full max-w-md flex-1 py-8">
        <ShippingForm
          orderNo={orderNo}
          productTitle={order.title}
          couple={coupleShipping}
          requireWrist={fulfillment?.requiresWristSize}
          onSaved={() => setShippingDone(true)}
        />
      </main>
    );
  }

  const amountDisplay = order.currency?.toUpperCase() === 'USD'
    ? `$${(order.amountCents / 100).toFixed(2)}`
    : `¥${(order.amountCents / 100).toFixed(2)}`;

  return (
    <main className="shop-page safe-bottom mx-auto flex min-h-[60vh] max-w-md flex-1 flex-col items-center justify-center py-16 text-center">
      <h1 className="font-serif text-2xl text-sage-primary">确认支付</h1>
      <p className="mt-2 text-sm text-sage-muted">{order.title}</p>
      <p className="mt-1 text-lg font-semibold text-sage-primary">{amountDisplay}</p>
      <p className="mt-3 text-sm text-sage-muted">订单号：{orderNo}</p>
      {fulfillment?.requiresShipping && order.shippingAddress ? (
        <p className="mt-4 max-w-sm text-left text-xs text-sage-muted">
          收货信息已确认，支付后将安排发货
        </p>
      ) : null}
      {payError && <p className="mt-4 text-sm text-red-600">{payError}</p>}
      {done ? (
        <p className="mt-6 text-sm text-sage-primary">支付成功，正在跳转…</p>
      ) : (
        <button
          type="button"
          disabled={payLoading || !orderNo}
          onClick={() => void handlePay()}
          className="shop-btn-primary mt-8 px-8"
        >
          {payLoading ? '处理中…' : '模拟支付（完成订单）'}
        </button>
      )}
      <p className="mt-6 max-w-sm text-xs text-sage-muted">
        当前为模拟支付模式，用于产品流程测试与风控审核。正式上线前将切换至 Stripe。
      </p>
    </main>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<main className="shop-page p-16 text-center text-sage-muted">加载中…</main>}>
      <CheckoutContent />
    </Suspense>
  );
}
