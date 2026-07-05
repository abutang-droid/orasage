'use client';

import { useCallback, useState } from 'react';
import { startAppCheckout } from '@/lib/shop-checkout';
import { TAROT_REPORT_SKU } from '@/lib/tarot-products';

const AUTH_URL = process.env.NEXT_PUBLIC_AUTH_URL || 'https://auth.orasage.com';

function useShopPayments(): boolean {
  if (process.env.NEXT_PUBLIC_USE_SHOP_PAYMENTS === 'false') return false;
  if (process.env.NEXT_PUBLIC_USE_SHOP_PAYMENTS === 'true') return true;
  if (typeof window === 'undefined') return true;
  return window.location.hostname.endsWith('orasage.com');
}

export function tarotLoginUrl(returnPath?: string) {
  const href = returnPath ?? (typeof window !== 'undefined' ? window.location.href : 'https://tarot.orasage.com/reading');
  return `${AUTH_URL}/login?redirect=${encodeURIComponent(href)}`;
}

export function useTarotPaymentFlow() {
  const shopPayments = useShopPayments();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const unlockReading = useCallback(async () => {
    setError(null);
    if (!shopPayments) {
      window.location.href = `https://shop.orasage.com?sku=${encodeURIComponent(TAROT_REPORT_SKU)}`;
      return;
    }
    setLoading(true);
    const returnBase = `${window.location.origin}/reading?paid=1`;
    try {
      const result = await startAppCheckout({
        sku: TAROT_REPORT_SKU,
        recommendationContext: '塔罗深度解读',
        successUrl: returnBase,
        cancelUrl: `${window.location.origin}/reading`,
      });
      if (result.checkoutUrl) {
        window.location.href = result.checkoutUrl;
        return;
      }
      const returnUrl = encodeURIComponent(`${returnBase}&order=${encodeURIComponent(result.orderNo)}`);
      window.location.href = `https://shop.orasage.com/checkout?order=${encodeURIComponent(result.orderNo)}&return=${returnUrl}`;
    } catch (err) {
      const msg = err instanceof Error ? err.message : '结账失败';
      if (msg.includes('登录') || msg.includes('401')) {
        window.location.href = tarotLoginUrl();
        return;
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [shopPayments]);

  return { loading, error, unlockReading, loginUrl: tarotLoginUrl };
}
