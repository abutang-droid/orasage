'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useRef, useState, Suspense, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@orasage/ui/button';
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
  const t = useTranslations('checkout');
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
    if (!res.ok) throw new Error(data.error || t('saveShippingFailed'));
    setShippingDone(true);
  }, [coupleShipping]);

  const completePayment = useCallback(async (targetOrderNo: string) => {
    if (payingRef.current) {
      throw new Error(t('payInProgress'));
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
      if (!res.ok) throw new Error(data.error || t('payFailed'));
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
      setPayError(err instanceof Error ? err.message : t('payFailed'));
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
      setPayError(err instanceof Error ? err.message : t('checkoutFailed'));
    }
  }, [submitMockShipping, completePayment]);

  useEffect(() => {
    if (orderNo) {
      let cancelled = false;
      void (async () => {
        try {
          const res = await fetch(`/api/orders/${encodeURIComponent(orderNo)}`, { credentials: 'include' });
          const data = await res.json().catch(() => ({}));
          if (!res.ok) throw new Error(data.error || t('loadOrderFailed'));
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
          if (!cancelled) setLoadError(err instanceof Error ? err.message : t('loadFailed'));
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
          if (!res.ok) throw new Error(data.error || t('loadProductFailed'));
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
          if (!cancelled) setLoadError(err instanceof Error ? err.message : t('loadFailed'));
          if (!cancelled) setLoading(false);
        }
      })();
      return () => { cancelled = true; };
    }

    setLoadError(t('missingOrderOrSku'));
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
      if (!res.ok) throw new Error(data.error || t('createOrderFailed'));

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
      setEmailError(err instanceof Error ? err.message : t('createOrderFailed'));
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
      setEmailError(t('emailRequired'));
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
      if (!res.ok) throw new Error(data.error || t('emailVerifyFailed'));

      if (data.exists) {
        setGuestStep('exists');
        return;
      }

      await startOrderFromSku();
    } catch (err) {
      setEmailError(err instanceof Error ? err.message : t('emailVerifyFailed'));
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
      if (!res.ok) throw new Error(data.error || t('bindFailed'));
      await startOrderFromSku();
    } catch (err) {
      setEmailError(err instanceof Error ? err.message : t('bindFailed'));
    } finally {
      setGuestLoading(false);
    }
  }

  if (loading) {
    return (
      <main className="shop-page p-16 text-center text-sage-muted">
        {isReportDigitalCheckout ? t('loadingReport') : t('loading')}
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
      return <main className="shop-page p-16 text-center text-sage-muted">{t('preparing')}</main>;
    }

    return (
      <main className="shop-page safe-bottom mx-auto w-full max-w-md flex-1 py-8 px-4">
        <CheckoutStepper current="contact" requiresShipping={false} />
        <h1 className="font-serif text-2xl text-sage-primary text-center mt-6">{t('confirmPurchase')}</h1>
        <div className="mt-6 rounded-xl border border-sage-border bg-white/60 p-5">
          <p className="text-xs text-sage-muted mb-1">{productPreview.sku}</p>
          <p className="font-semibold text-sage-primary">{productPreview.name}</p>
          <p className="mt-1 text-sm text-sage-muted">{productPreview.desc}</p>
          <p className="mt-3 text-lg font-semibold text-sage-primary">{productPreview.priceDisplay}</p>
        </div>

        {guestStep === 'exists' ? (
          <div className="mt-6">
            <p className="text-sm text-sage-primary text-center">
              {t('emailRegistered')} <strong>{email}</strong>
            </p>
            <p className="mt-2 text-xs text-sage-muted text-center">
              {t('emailRegisteredHint')}
            </p>
            {emailError && <p className="mt-3 text-sm text-red-600 text-center">{emailError}</p>}
            <div className="mt-6 flex flex-col gap-3">
              <Button
                type="button"
                disabled={guestLoading}
                loading={guestLoading}
                onClick={() => void handleBindExisting()}
                className="w-full"
              >
                {guestLoading ? t('processing') : t('useEmail')}
              </Button>
              <button
                type="button"
                disabled={guestLoading}
                onClick={() => { setGuestStep('email'); setEmailError(null); }}
                className="w-full py-2.5 text-sm text-sage-muted underline"
              >
                {t('reenterEmail')}
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={(e) => void handleEmailSubmit(e)} className="mt-6">
            <label className="block text-sm text-sage-muted mb-2">
              {t('emailLabel')}
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
              {t('emailConsent')}
            </p>
            {emailError && <p className="mt-2 text-sm text-red-600">{emailError}</p>}
            <Button type="submit" disabled={guestLoading} loading={guestLoading} className="mt-6 w-full">
              {guestLoading ? t('processing') : t('continueUnlock')}
            </Button>
          </form>
        )}
      </main>
    );
  }

  if (loadError || !order) {
    return (
      <main className="shop-page safe-bottom mx-auto flex min-h-[60vh] max-w-md flex-1 flex-col items-center justify-center py-16 text-center">
        <p className="text-sm text-red-600">{loadError ?? t('orderNotFound')}</p>
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
        <h1 className="font-serif text-2xl text-sage-primary">{t('unlockReport')}</h1>
        <p className="mt-2 text-sm text-sage-muted">{order.title}</p>
        <p className="mt-1 text-lg font-semibold text-sage-primary">{amountDisplay}</p>
        {payError ? (
          <>
            <p className="mt-4 text-sm text-red-600">{payError}</p>
            <Button
              type="button"
              className="mt-6 px-8"
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
              {t('retry')}
            </Button>
          </>
        ) : (
          <p className="mt-6 text-sm text-sage-primary">
            {flowPhase === 'shipping' ? t('confirmingShipping') : flowPhase === 'done' ? t('unlockSuccess') : t('mockPayProcessing')}
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
            {t('mixedCartNote')}
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
      <h1 className="font-serif text-2xl text-sage-primary mt-6">{t('confirmPay')}</h1>
      <p className="mt-2 text-sm text-sage-muted">{order.title}</p>
      <p className="mt-1 text-lg font-semibold text-sage-primary">{amountDisplay}</p>
      <p className="mt-3 text-sm text-sage-muted">{t('orderNo', { orderNo })}</p>
      {payError && <p className="mt-4 text-sm text-red-600">{payError}</p>}
      <Button
        type="button"
        disabled={flowPhase === 'paying'}
        loading={flowPhase === 'paying'}
        onClick={() => void completePayment(orderNo)}
        className="mt-8 px-8"
      >
        {flowPhase === 'paying' ? t('processing') : t('mockPay')}
      </Button>
    </main>
  );
}

function CheckoutFallback() {
  const t = useTranslations('checkout');
  return <main className="shop-page p-16 text-center text-sage-muted">{t('loadingGeneric')}</main>;
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<CheckoutFallback />}>
      <CheckoutContent />
    </Suspense>
  );
}
