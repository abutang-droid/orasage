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

type ProductPreview = {
  sku: string;
  name: string;
  desc: string;
  priceDisplay: string;
};

type GuestStep = 'email' | 'exists' | 'creating';

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderNo = searchParams.get('order') ?? '';
  const sku = searchParams.get('sku') ?? '';
  const returnUrl = searchParams.get('return');
  const coupleShipping = searchParams.get('shipping') === 'couple';
  const readingId = searchParams.get('readingId') ?? undefined;
  const planType = searchParams.get('planType') ?? undefined;
  const appSource = searchParams.get('appSource') ?? 'shop';

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [order, setOrder] = useState<CheckoutOrder | null>(null);
  const [fulfillment, setFulfillment] = useState<Fulfillment | null>(null);
  const [shippingDone, setShippingDone] = useState(false);
  const [productPreview, setProductPreview] = useState<ProductPreview | null>(null);
  const [guestStep, setGuestStep] = useState<GuestStep>('email');
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [guestLoading, setGuestLoading] = useState(false);

  const [payLoading, setPayLoading] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const payingRef = useRef(false);
  const guestStartedRef = useRef(false);

  useEffect(() => {
    if (orderNo) {
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
      return () => { cancelled = true; };
    }

    if (sku) {
      let cancelled = false;
      void (async () => {
        try {
          const res = await fetch(`/api/products?sku=${encodeURIComponent(sku)}`, { credentials: 'include' });
          const data = await res.json().catch(() => ({}));
          if (!res.ok) throw new Error(data.error || '加载商品失败');
          const product = data.product as ProductPreview & { priceDisplay?: string };
          if (cancelled) return;
          setProductPreview({
            sku: product.sku,
            name: product.name,
            desc: product.desc,
            priceDisplay: product.priceDisplay ?? '',
          });
          setLoading(false);

          // 已登录则直接创建订单
          if (!guestStartedRef.current) {
            guestStartedRef.current = true;
            const started = await tryStartOrderFromSku();
            if (started) return;
            guestStartedRef.current = false;
          }
        } catch (err) {
          if (!cancelled) setLoadError(err instanceof Error ? err.message : '加载失败');
          if (!cancelled) setLoading(false);
        }
      })();
      return () => { cancelled = true; };
    }

    setLoadError('缺少订单号或商品');
    setLoading(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderNo, sku]);

  async function tryStartOrderFromSku(): Promise<boolean> {
    if (!sku) return false;
    setGuestLoading(true);
    setEmailError(null);
    setGuestStep('creating');
    try {
      const res = await fetch('/api/checkout/start', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sku,
          appSource,
          readingId,
          planType,
          shippingMode: coupleShipping ? 'couple' : 'single',
          successUrl: returnUrl ?? undefined,
          recommendationContext: searchParams.get('context') ?? undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 401) {
        setGuestStep('email');
        return false;
      }
      if (!res.ok) throw new Error(data.error || '创建订单失败');

      const params = new URLSearchParams({ order: data.orderNo });
      if (returnUrl) params.set('return', returnUrl);
      if (coupleShipping) params.set('shipping', 'couple');
      router.replace(`/checkout?${params.toString()}`);
      return true;
    } catch (err) {
      setGuestStep('email');
      setEmailError(err instanceof Error ? err.message : '创建订单失败');
      return false;
    } finally {
      setGuestLoading(false);
    }
  }

  async function startOrderFromSku() {
    await tryStartOrderFromSku();
  }

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) {
      setEmailError('请输入邮箱');
      return;
    }
    setGuestLoading(true);
    setEmailError(null);
    try {
      const res = await fetch('/api/checkout/identify', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || '邮箱验证失败');

      if (data.exists) {
        setGuestStep('exists');
        return;
      }

      await startOrderFromSku();
    } catch (err) {
      setEmailError(err instanceof Error ? err.message : '邮箱验证失败');
    } finally {
      setGuestLoading(false);
    }
  }

  async function handleBindExisting() {
    setGuestLoading(true);
    setEmailError(null);
    try {
      const res = await fetch('/api/checkout/bind', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || '绑定失败');
      await startOrderFromSku();
    } catch (err) {
      setEmailError(err instanceof Error ? err.message : '绑定失败');
    } finally {
      setGuestLoading(false);
    }
  }

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

  if (loadError && !order && !productPreview) {
    return (
      <main className="shop-page safe-bottom mx-auto flex min-h-[60vh] max-w-md flex-1 flex-col items-center justify-center py-16 text-center">
        <p className="text-sm text-red-600">{loadError}</p>
      </main>
    );
  }

  // SKU 访客结账：邮箱收集
  if (!orderNo && productPreview) {
    if (guestStep === 'creating') {
      return <main className="shop-page p-16 text-center text-sage-muted">正在创建订单…</main>;
    }

    return (
      <main className="shop-page safe-bottom mx-auto w-full max-w-md flex-1 py-8 px-4">
        <h1 className="font-serif text-2xl text-sage-primary text-center">确认购买</h1>
        <div className="mt-6 rounded-xl border border-sage-border bg-white/60 p-5">
          <p className="font-semibold text-sage-primary">{productPreview.name}</p>
          <p className="mt-1 text-sm text-sage-muted">{productPreview.desc}</p>
          <p className="mt-3 text-lg font-semibold text-sage-primary">{productPreview.priceDisplay}</p>
        </div>

        {guestStep === 'exists' ? (
          <div className="mt-6">
            <p className="text-sm text-sage-primary text-center">
              该邮箱 <strong>{email}</strong> 已注册
            </p>
            <p className="mt-2 text-xs text-sage-muted text-center">可直接使用此账号完成购买，或重新填写邮箱</p>
            {emailError && <p className="mt-3 text-sm text-red-600 text-center">{emailError}</p>}
            <div className="mt-6 flex flex-col gap-3">
              <button
                type="button"
                disabled={guestLoading}
                onClick={() => void handleBindExisting()}
                className="shop-btn-primary w-full"
              >
                {guestLoading ? '处理中…' : '直接使用'}
              </button>
              <button
                type="button"
                disabled={guestLoading}
                onClick={() => { setGuestStep('email'); setEmailError(null); }}
                className="w-full py-2.5 text-sm text-sage-muted underline"
              >
                重新填写邮箱
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={(e) => void handleEmailSubmit(e)} className="mt-6">
            <label className="block text-sm text-sage-muted mb-2">
              用于接收订单与报告的邮箱
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="mt-2 w-full rounded-lg border border-sage-border px-3 py-2.5 text-sage-primary"
              />
            </label>
            {emailError && <p className="mt-2 text-sm text-red-600">{emailError}</p>}
            <button type="submit" disabled={guestLoading} className="shop-btn-primary mt-6 w-full">
              {guestLoading ? '处理中…' : '继续支付'}
            </button>
          </form>
        )}

        <p className="mt-6 text-xs text-center text-sage-muted">
          无需提前注册。新邮箱将自动创建账号并绑定本次订单。
        </p>
      </main>
    );
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
