/**
 * usePaymentFlow — OraSage 支付流程 Hook
 *
 * 优先走 shop 内网结账（orasage.com 生态），legacy WC iframe 作为回退。
 */

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import type { PlanType } from "@shared/types";
import { trpc } from "@/lib/trpc";
import { useT } from "@/lib/i18n";
import { startAppCheckout } from "@/lib/shop-checkout";
import { planToReportSku } from "@/lib/reading-sync";

const READING_ID_KEY = "bazi:lastReadingId";
const PLAN_KEY = "bazi:lastPurchasedPlan";

const PRODUCT_ID_MAP: Record<string, { single: number; couple: number }> = {
  basic:    { single: 342, couple: 342 },
  advanced: { single: 486, couple: 2226 },
  premium:  { single: 488, couple: 3591 },
};

function useShopPayments(): boolean {
  if (import.meta.env.VITE_USE_SHOP_PAYMENTS === "false") return false;
  if (import.meta.env.VITE_USE_SHOP_PAYMENTS === "true") return true;
  if (typeof window === "undefined") return true;
  return window.location.hostname.endsWith("orasage.com");
}

export interface PaymentFlowState {
  unlocked: boolean;
  purchasedPlan: PlanType | null;
  wooOrderId: string | null;
  shopOrderNo: string | null;
  buyerEmail: string;
  buyerName: string;
}

export interface PushReportParams {
  planType: PlanType;
  wooOrderId?: string;
  shopOrderNo?: string;
  readingId?: string;
  reportContent: string;
  name: string;
}

export function usePaymentFlow(mode: "single" | "couple" = "single") {
  const { t } = useT();
  const shopPayments = useShopPayments();

  const planNameMap: Record<string, string> = mode === "couple"
    ? {
        basic: t('plan.couple.basic.name'),
        advanced: t('plan.couple.advanced.name'),
        premium: t('plan.couple.premium.name'),
      }
    : {
        basic: t('plan.basic.name'),
        advanced: t('plan.advanced.name'),
        premium: t('plan.premium.name'),
      };

  const [state, setState] = useState<PaymentFlowState>({
    unlocked: false,
    purchasedPlan: null,
    wooOrderId: null,
    shopOrderNo: null,
    buyerEmail: '',
    buyerName: '',
  });

  const buyPlanMutation = trpc.bazi.buyPlan.useMutation({
    onSuccess: (data) => {
      console.log("[OraSage] buyPlan SUCCESS:", data);
    },
    onError: (err) => {
      console.error("[OraSage] buyPlan failed:", err.message);
    },
  });

  // Shop 支付回跳 ?paid=1&order=OS-xxx
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("paid") !== "1") return;
    const orderNo = params.get("order");
    if (!orderNo) return;
    const storedPlan = sessionStorage.getItem(PLAN_KEY) as PlanType | null;
    setState((prev) => ({
      ...prev,
      shopOrderNo: orderNo,
      unlocked: true,
      purchasedPlan: prev.purchasedPlan ?? storedPlan ?? "advanced",
    }));
    sessionStorage.removeItem(PLAN_KEY);
    toast.success(t('plan.paid_success', '支付成功，正在生成报告…'));
    const url = new URL(window.location.href);
    url.searchParams.delete("paid");
    url.searchParams.delete("order");
    window.history.replaceState({}, "", url.pathname + url.search);
  }, [t]);

  // Legacy WooCommerce postMessage
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (event.data?.action !== "WP_PAYMENT_SUCCESS") return;
      const incomingOrderId = event.data?.orderId || event.data?.order_id;
      const incomingEmail = event.data?.email || '';
      const incomingName = event.data?.name || '';
      if (incomingOrderId) {
        setState(prev => ({
          ...prev,
          wooOrderId: String(incomingOrderId),
          buyerEmail: incomingEmail,
          buyerName: incomingName,
          unlocked: true,
        }));
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  const openDirectPayment = useCallback(async (plan: PlanType) => {
    setState(prev => ({ ...prev, purchasedPlan: plan }));

    if (shopPayments) {
      const readingId = sessionStorage.getItem(READING_ID_KEY) || undefined;
      const returnBase = `${window.location.origin}${window.location.pathname}?paid=1`;
      try {
        sessionStorage.setItem(PLAN_KEY, plan);
        const result = await startAppCheckout({
          sku: planToReportSku(plan),
          planType: plan,
          readingId,
          recommendationContext: `八字${planNameMap[plan] || plan}报告`,
          successUrl: returnBase,
        });
        if (result.checkoutUrl) {
          window.location.href = result.checkoutUrl;
        } else {
          const returnUrl = encodeURIComponent(`${returnBase}&order=${encodeURIComponent(result.orderNo)}`);
          window.location.href = `https://shop.orasage.com/checkout?order=${encodeURIComponent(result.orderNo)}&return=${returnUrl}`;
        }
      } catch (err) {
        toast.error(err instanceof Error ? err.message : t('checkout.error', '结账失败'));
      }
      return;
    }

    const entry = PRODUCT_ID_MAP[plan];
    const pid = (entry ? entry[mode] : 342).toString();
    window.parent.postMessage({ action: 'OPEN_WP_PAYMENT', productId: pid }, '*');
    try {
      if (window.top && window.top !== window.parent) {
        window.top.postMessage({ action: 'OPEN_WP_PAYMENT', productId: pid }, '*');
      }
    } catch { /* ignore */ }
  }, [mode, shopPayments, planNameMap, t]);

  const handlePlanSelect = useCallback((plan: PlanType, orderId?: string) => {
    setState(prev => ({
      ...prev,
      unlocked: true,
      purchasedPlan: plan,
      wooOrderId: orderId ? String(orderId) : prev.wooOrderId,
    }));
    toast.success(`${t('plan.selected_prefix', '已选择')} ${planNameMap[plan] || plan}${t('plan.selected_suffix', '，正在生成报告…')}`);
  }, [t, planNameMap]);

  const pushReportToWordPress = useCallback((params: PushReportParams) => {
    const readingId = params.readingId || sessionStorage.getItem(READING_ID_KEY) || undefined;
    buyPlanMutation.mutate({
      planType: params.planType,
      wooOrderId: params.wooOrderId || state.wooOrderId || undefined,
      shopOrderNo: params.shopOrderNo || state.shopOrderNo || undefined,
      readingId,
      reportContent: params.reportContent,
      email: state.buyerEmail,
      name: state.buyerName || params.name,
    } as any);
  }, [buyPlanMutation, state.buyerEmail, state.buyerName, state.wooOrderId, state.shopOrderNo]);

  const setUnlocked = useCallback((v: boolean) => {
    setState(prev => ({ ...prev, unlocked: v }));
  }, []);

  const setPurchasedPlan = useCallback((plan: PlanType | null) => {
    setState(prev => ({ ...prev, purchasedPlan: plan }));
  }, []);

  const setWooOrderId = useCallback((id: string | null) => {
    setState(prev => ({ ...prev, wooOrderId: id }));
  }, []);

  const setShopOrderNo = useCallback((id: string | null) => {
    setState(prev => ({ ...prev, shopOrderNo: id }));
  }, []);

  return {
    ...state,
    openDirectPayment,
    handlePlanSelect,
    pushReportToWordPress,
    setUnlocked,
    setPurchasedPlan,
    setWooOrderId,
    setShopOrderNo,
    shopPayments,
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
