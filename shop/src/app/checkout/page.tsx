'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useRef, useState, Suspense, useCallback } from 'react';
import { ShippingForm } from '@/components/ShippingForm';
import { CheckoutStepper } from '@/components/CheckoutStepper';
import { useCart } from '@/lib/cart';
import { parseShippingAddress, inferCoupleEligible } from '../../../../shared/shop-fulfillment/index';

type CheckoutOrder = {
  orderNo: string;
  title: string;
  sku?: string | null;
  amountCents: number;
  currency: string;
  status: string;
  shippingAddress?: string | null;
  appSource?: string | null;
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

const REPORT_APP_SOURCES = new Set(['bazi', 'ziwei', 'tarot']);

function appendOrderToReturnUrl(returnUrl: string, orderNo: string): string {
  try {
    const url = new URL(returnUrl);
    url.searchParams.set('order', orderNo);
    if (!url.searchParams.has('paid')) url.searchParams.set('paid', '1');
    return url.toString();
  } catch {
    const sep = returnUrl.includes('?') ? '&' : '?';
    return `${returnUrl}${sep}order=${encodeURIComponent(orderNo)}`;
  }
}

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { clear: clearCart } = useCart();
  const orderNo = searchParams.get('order') ?? '';
  const sku = searchParams.get('sku') ?? '';
  const returnUrl = searchParams.get('return');
  const coupleFromUrl = searchParams.get('shipping') === 'couple';
  const [coupleShipping, setCoupleShipping] = useState(coupleFromUrl);
  const readingId = searchParams.get('readingId') ?? undefined;
  const planType = searchParams.get('planType') ?? undefined;
  const appSource = searchParams.get('appSource') ?? 'shop';
  const priceCentsParam = searchParams.get('priceCents');
  const priceCentsUsdParam = searchParams.get('priceCentsUsd');
  const priceCents = priceCentsParam ? Number(priceCentsParam) : undefined;
  const priceCentsUsd = priceCentsUsdParam ? Number(priceCentsUsdParam) : undefined;

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [order, setOrder] = useState<CheckoutOrder | null>(null);
  const [fulfillment, setFulfillment] = useState<Fulfillment | null>(null);
  const [cartItems, setCartItems] = useState<Array<{ sku: string; name: string; quantity: number }> | null>(null);
  const [shippingDone, setShippingDone] = useState(false);
  const [productPreview, setProductPreview] = useState<ProductPreview | null>(null);
  const [guestStep, setGuestStep] = useState<GuestStep>('email');
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [guestLoading, setGuestLoading] = useState(false);

  const [flowPhase, setFlowPhase] = useState<'idle' | 'shipping' | 'paying' | 'done' | 'error'>('idle');
  const [payError, setPayError] = useState<string | null>(null);
  const [orderAppSource, setOrderAppSource] = useState<string | null>(null);
  const payingRef = useRef(false);
  const guestStartedRef = useRef(false);
  const autoFlowOrderRef = useRef<string | null>(null);

  useEffect(() => {
    setCoupleShipping(coupleFromUrl);
  }, [coupleFromUrl]);

  const coupleEligible = inferCoupleEligible(order?.sku ?? sku);

  const handleCoupleChange = useCallback((next: boolean) => {
    setCoupleShipping(next);
    const params = new URLSearchParams(searchParams.toString());
    if (next) params.set('shipping', 'couple');
    else params.delete('shipping');
    router.replace(`/checkout?${params.toString()}`, { scroll: false });
  }, [router, searchParams]);

  const effectiveAppSource = orderAppSource ?? appSource;
  const isReportAppCheckout = REPORT_APP_SOURCES.has(effectiveAppSource);
  const isReportDigitalCheckout = isReportAppCheckout && !fulfillment?.requiresShipping;

  const submitMockShipping = useCallback(async (targetOrderNo: string): Promise<void> => {
    const recipients = coupleShipping
      ? [
          { name: '收货人甲', phone: '13800000001', countryCode: 'CN', address: '模拟地址甲', wristCm: '16' },
          { name: '收货人乙', phone: '13800000002', countryCode: 'CN', address: '模拟地址乙', wristCm: '17' },
        ]
      : [{ name: '收货人', phone: '13800000000', countryCode: 'CN', address: '模拟收货地址', wristCm: '16' }];
    const shipUrl = `/api/orders/${encodeURIComponent(targetOrderNo)}/shipping${coupleShipping ? '?shipping=couple' : ''}`;
    const res = await fetch(shipUrl, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipients }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || '保存收货信息失败');
    setShippingDone(true);
  }, [coupleShipping]);

  const completePayment = useCallback(async (targetOrderNo: string) => {
    if (payingRef.current) {
      throw new Error('支付正在进行，请稍候');
    }
    payingRef.current = true;
    setFlowPhase('paying');
    setPayError(null);
    try {
      const res = await fetch(`/api/pay?order=${encodeURIComponent(targetOrderNo)}`, {
        method: 'POST',
        credentials: 'include',
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || '支付失败');
      setFlowPhase('done');
      clearCart();
      if (returnUrl) {
        const target = appendOrderToReturnUrl(returnUrl, targetOrderNo);
        window.location.replace(target);
      } else {
        router.replace(`/success?order=${encodeURIComponent(targetOrderNo)}`);
      }
    } catch (err) {
      payingRef.current = false;
      setFlowPhase('error');
      setPayError(err instanceof Error ? err.message : '支付失败');
      throw err;
    }
  }, [returnUrl, router, clearCart]);

  const runReportAutoCheckout = useCallback(async (
    targetOrderNo: string,
    needsShipping: boolean,
    alreadyShipped: boolean,
  ) => {
    if (autoFlowOrderRef.current === targetOrderNo) return;
    autoFlowOrderRef.current = targetOrderNo;
    setFlowPhase(needsShipping && !alreadyShipped ? 'shipping' : 'paying');
    try {
      if (needsShipping && !alreadyShipped) {
        await submitMockShipping(targetOrderNo);
      }
      await completePayment(targetOrderNo);
    } catch (err) {
      autoFlowOrderRef.current = null;
      payingRef.current = false;
      setFlowPhase('error');
      setPayError(err instanceof Error ? err.message : '结账失败');
    }
  }, [submitMockShipping, completePayment]);

  useEffect(() => {
    if (orderNo) {
      let cancelled = false;
      void (async () => {
        try {
          const res = await fetch(`/api/orders/${encodeURIComponent(orderNo)}`, { credentials: 'include' });
          const data = await res.json().catch(() => ({}));
          if (!res.ok) throw new Error(data.error || '加载订单失败');
          if (cancelled) return;
          const loadedOrder = data.order as CheckoutOrder;
          const loadedFulfillment = data.fulfillment as Fulfillment;
          setOrder(loadedOrder);
          setFulfillment(loadedFulfillment);
          setCartItems(Array.isArray(data.cartItems) ? data.cartItems : null);
          if (loadedOrder.appSource) setOrderAppSource(loadedOrder.appSource);
          const hasShipping = Boolean(parseShippingAddress(loadedOrder.shippingAddress));
          setShippingDone(hasShipping || !loadedFulfillment.requiresShipping);

          if (
            REPORT_APP_SOURCES.has(loadedOrder.appSource ?? appSource)
            && loadedOrder.status === 'pending'
            && !loadedFulfillment.requiresShipping
          ) {
            void runReportAutoCheckout(
              orderNo,
              loadedFulfillment.requiresShipping,
              hasShipping,
            );
          }
        } catch (err) {
          if (!cancelled) setLoadError(err instanceof Error ? err.message : '加载失败');
        } finally {
          if (!cancelled) setLoading(false);
        }
      })();
      return () => {
        cancelled = true;
        autoFlowOrderRef.current = null;
      };
    }

    if (sku) {
      let cancelled = false;
      void (async () => {
        try {
          const res = await fetch(`/api/products?sku=${encodeURIComponent(sku)}`, { credentials: 'include' });
          const data = await res.json().catch(() => ({}));
          if (!res.ok) throw new Error(data.error || '加载商品失败');
          const product = data.product as ProductPreview & { priceDisplay?: string; priceCents?: number };
          if (cancelled) return;
          const displayPrice = priceCents && Number.isFinite(priceCents)
            ? `¥${(priceCents / 100).toFixed(2)}`
            : (product.priceDisplay ?? '');
          setProductPreview({
            sku: product.sku,
            name: product.name,
            desc: product.desc,
            priceDisplay: displayPrice,
          });
          setLoading(false);

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
          priceCents: priceCents && Number.isFinite(priceCents) ? priceCents : undefined,
          priceCentsUsd: priceCentsUsd && Number.isFinite(priceCentsUsd) ? priceCentsUsd : undefined,
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
      if (appSource) params.set('appSource', appSource);
      if (planType) params.set('planType', planType);
      if (readingId) params.set('readingId', readingId);
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

  if (loading) {
    return (
      <main className="shop-page p-16 text-center text-sage-muted">
        {isReportDigitalCheckout ? '正在解锁报告…' : '加载订单…'}
      </main>
    );
  }

  if (loadError && !order && !productPreview) {
    return (
      <main className="shop-page safe-bottom mx-auto flex min-h-[60vh] max-w-md flex-1 flex-col items-center justify-center py-16 text-center">
        <p className="text-sm text-red-600">{loadError}</p>
      </main>
    );
  }

  if (!orderNo && productPreview) {
    if (guestStep === 'creating') {
      return <main className="shop-page p-16 text-center text-sage-muted">正在准备订单…</main>;
    }

    return (
      <main className="shop-page safe-bottom mx-auto w-full max-w-md flex-1 py-8 px-4">
        <CheckoutStepper current="contact" requiresShipping={false} />
        <h1 className="font-serif text-2xl text-sage-primary text-center mt-6">确认购买</h1>
        <div className="mt-6 rounded-xl border border-sage-border bg-white/60 p-5">
          <p className="text-xs text-sage-muted mb-1">{productPreview.sku}</p>
          <p className="font-semibold text-sage-primary">{productPreview.name}</p>
          <p className="mt-1 text-sm text-sage-muted">{productPreview.desc}</p>
          <p className="mt-3 text-lg font-semibold text-sage-primary">{productPreview.priceDisplay}</p>
        </div>

        {guestStep === 'exists' ? (
          <div className="mt-6">
            <p className="text-sm text-sage-primary text-center">
              该邮箱 <strong>{email}</strong> 已注册
            </p>
            <p className="mt-2 text-xs text-sage-muted text-center">
              是否直接使用此邮箱登录并完成购买？
            </p>
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
            <p className="mt-3 text-xs text-sage-muted leading-relaxed">
              若邮箱尚未注册，继续即表示同意以此邮箱创建账号并接收订单通知。
            </p>
            {emailError && <p className="mt-2 text-sm text-red-600">{emailError}</p>}
            <button type="submit" disabled={guestLoading} className="shop-btn-primary mt-6 w-full">
              {guestLoading ? '处理中…' : '继续解锁'}
            </button>
          </form>
        )}
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

  const amountDisplay = order.currency?.toUpperCase() === 'USD'
    ? `$${(order.amountCents / 100).toFixed(2)}`
    : `¥${(order.amountCents / 100).toFixed(2)}`;

  if (isReportDigitalCheckout) {
    return (
      <main className="shop-page safe-bottom mx-auto flex min-h-[60vh] max-w-md flex-1 flex-col items-center justify-center py-16 text-center px-4">
        <CheckoutStepper current="payment" requiresShipping={false} />
        <h1 className="font-serif text-2xl text-sage-primary">正在解锁报告</h1>
        <p className="mt-2 text-sm text-sage-muted">{order.title}</p>
        <p className="mt-1 text-lg font-semibold text-sage-primary">{amountDisplay}</p>
        {payError ? (
          <>
            <p className="mt-4 text-sm text-red-600">{payError}</p>
            <button
              type="button"
              className="shop-btn-primary mt-6 px-8"
              onClick={() => {
                autoFlowOrderRef.current = null;
                payingRef.current = false;
                setFlowPhase('idle');
                setPayError(null);
                void runReportAutoCheckout(
                  orderNo,
                  fulfillment?.requiresShipping ?? false,
                  shippingDone,
                );
              }}
            >
              重试
            </button>
          </>
        ) : (
          <p className="mt-6 text-sm text-sage-primary">
            {flowPhase === 'shipping' ? '正在确认收货信息…' : flowPhase === 'done' ? '解锁成功，正在返回…' : '模拟支付处理中…'}
          </p>
        )}
      </main>
    );
  }

  const needsShippingStep = fulfillment?.requiresShipping && !shippingDone;
  const mixedCartOrder = Boolean(cartItems && cartItems.length > 1 && fulfillment?.requiresShipping);
  if (needsShippingStep) {
    return (
      <main className="shop-page safe-bottom mx-auto w-full max-w-md flex-1 py-8">
        <CheckoutStepper current="shipping" requiresShipping />
        {mixedCartOrder ? (
          <p className="mb-4 text-sm text-sage-muted leading-relaxed">
            订单含数字商品与实体商品。请填写收货地址，实体商品将按此地址发货；数字商品支付后自动交付，无需邮寄。
          </p>
        ) : null}
        <ShippingForm
          orderNo={orderNo}
          productTitle={order.title}
          coupleEligible={coupleEligible}
          couple={coupleShipping}
          onCoupleChange={handleCoupleChange}
          requireWrist={fulfillment?.requiresWristSize}
          onSaved={() => setShippingDone(true)}
        />
      </main>
    );
  }

  return (
    <main className="shop-page safe-bottom mx-auto flex min-h-[60vh] max-w-md flex-1 flex-col items-center justify-center py-16 text-center">
      <CheckoutStepper current="payment" requiresShipping={fulfillment?.requiresShipping ?? false} />
      <h1 className="font-serif text-2xl text-sage-primary mt-6">确认支付</h1>
      <p className="mt-2 text-sm text-sage-muted">{order.title}</p>
      <p className="mt-1 text-lg font-semibold text-sage-primary">{amountDisplay}</p>
      <p className="mt-3 text-sm text-sage-muted">订单号：{orderNo}</p>
      {payError && <p className="mt-4 text-sm text-red-600">{payError}</p>}
      <button
        type="button"
        disabled={flowPhase === 'paying'}
        onClick={() => void completePayment(orderNo)}
        className="shop-btn-primary mt-8 px-8"
      >
        {flowPhase === 'paying' ? '处理中…' : '模拟支付（完成订单）'}
      </button>
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
