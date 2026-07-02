'use client';

import { useState, useEffect, useCallback } from 'react';
import type { PlanType } from '@/lib/plan-types';
import { startAppCheckout } from '@/lib/shop-checkout';
import { planToReportSku } from '@/lib/reading-sync';

const READING_ID_KEY = 'ziwei:lastReadingId';
const PLAN_KEY = 'ziwei:lastPurchasedPlan';

function useShopPayments(): boolean {
  if (process.env.NEXT_PUBLIC_USE_SHOP_PAYMENTS === 'false') return false;
  if (process.env.NEXT_PUBLIC_USE_SHOP_PAYMENTS === 'true') return true;
  if (typeof window === 'undefined') return true;
  return window.location.hostname.endsWith('orasage.com');
}

export interface PaymentFlowState {
  unlocked: boolean;
  purchasedPlan: PlanType | null;
  shopOrderNo: string | null;
}

export function usePaymentFlow(mode: 'single' | 'couple' = 'single') {
  const shopPayments = useShopPayments();
  const [state, setState] = useState<PaymentFlowState>({
    unlocked: false,
    purchasedPlan: null,
    shopOrderNo: null,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('paid') !== '1') return;
    const orderNo = params.get('order');
    if (!orderNo) return;
    const storedPlan = sessionStorage.getItem(PLAN_KEY) as PlanType | null;
    setState((prev) => ({
      ...prev,
      shopOrderNo: orderNo,
      unlocked: true,
      purchasedPlan: prev.purchasedPlan ?? storedPlan ?? 'advanced',
    }));
    sessionStorage.removeItem(PLAN_KEY);
    const url = new URL(window.location.href);
    url.searchParams.delete('paid');
    url.searchParams.delete('order');
    window.history.replaceState({}, '', url.pathname + url.search);
  }, []);

  const openDirectPayment = useCallback(async (plan: PlanType) => {
    setState((prev) => ({ ...prev, purchasedPlan: plan }));
    if (!shopPayments) {
      window.alert('请登录后通过商城完成购买');
      return;
    }
    const readingId = sessionStorage.getItem(READING_ID_KEY) || undefined;
    const returnBase = `${window.location.origin}/chart?paid=1`;
    try {
      sessionStorage.setItem(PLAN_KEY, plan);
      const result = await startAppCheckout({
        sku: planToReportSku(plan),
        planType: plan,
        readingId,
        recommendationContext: `紫微${plan}报告`,
        successUrl: returnBase,
      });
      if (result.checkoutUrl) {
        window.location.href = result.checkoutUrl;
      } else {
        const returnUrl = encodeURIComponent(`${returnBase}&order=${encodeURIComponent(result.orderNo)}`);
        window.location.href = `https://shop.orasage.com/checkout?order=${encodeURIComponent(result.orderNo)}&return=${returnUrl}`;
      }
    } catch (err) {
      console.error('[ziwei/pay]', err);
      window.alert(err instanceof Error ? err.message : '结账失败');
    }
  }, [shopPayments]);

  const setUnlocked = useCallback((v: boolean) => {
    setState((prev) => ({ ...prev, unlocked: v }));
  }, []);

  const setPurchasedPlan = useCallback((plan: PlanType | null) => {
    setState((prev) => ({ ...prev, purchasedPlan: plan }));
  }, []);

  return {
    ...state,
    openDirectPayment,
    setUnlocked,
    setPurchasedPlan,
    shopPayments,
    mode,
  } as const;
}

export function saveLastReadingId(readingId: string) {
  try {
    sessionStorage.setItem(READING_ID_KEY, readingId);
  } catch { /* ignore */ }
}

export function getLastReadingId(): string | null {
  try {
    return sessionStorage.getItem(READING_ID_KEY);
  } catch {
    return null;
  }
}
