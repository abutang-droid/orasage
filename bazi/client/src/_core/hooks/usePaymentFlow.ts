/**
 * usePaymentFlow — OraSage 支付流程 Hook
 *
 * 封装完整支付流：
 *   1. openDirectPayment(planType) → 发送 OPEN_WP_PAYMENT 触发 WordPress 计费弹窗
 *   2. 监听 WP_PAYMENT_SUCCESS postMessage → 解锁内容 + 获取 email/name
 *   3. 报告生成后 pushReportToWordPress() → 后端生成 HTML + 推送用户中心
 *
 * 适用场景：单人结果页、双人合盘、其他付费内容页
 */

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import type { PlanType } from "@shared/types";
import { trpc } from "@/lib/trpc";
import { useT } from "@/lib/i18n";

/** WooCommerce 产品 ID 映射（单人 / 双人） */
const PRODUCT_ID_MAP: Record<string, { single: number; couple: number }> = {
  basic:    { single: 342, couple: 342 },
  advanced: { single: 486, couple: 2226 },
  premium:  { single: 488, couple: 3591 },
};

export interface PaymentFlowState {
  /** 是否已解锁付费内容 */
  unlocked: boolean;
  /** 当前已购方案 */
  purchasedPlan: PlanType | null;
  /** WooCommerce 订单 ID */
  wooOrderId: string | null;
  /** 买家邮箱 */
  buyerEmail: string;
  /** 买家名称 */
  buyerName: string;
}

export interface PushReportParams {
  planType: PlanType;
  wooOrderId: string;
  reportContent: string;
  name: string;
}

export function usePaymentFlow(mode: "single" | "couple" = "single") {
  const { t } = useT();

  const planNameMap: Record<string, string> = {
    basic: t('plan.basic.name'),
    advanced: t('plan.advanced.name'),
    premium: t('plan.premium.name'),
  };

  const [state, setState] = useState<PaymentFlowState>({
    unlocked: false,
    purchasedPlan: null,
    wooOrderId: null,
    buyerEmail: '',
    buyerName: '',
  });

  /** tRPC mutation：服务端生成 HTML + 推送到 WordPress 用户中心 */
  const buyPlanMutation = trpc.bazi.buyPlan.useMutation({
    onSuccess: (data) => {
      console.log("[OraSage] buyPlan SUCCESS:", data);
      if (data?.report_url) {
        console.log("[OraSage] Report saved at:", data.report_url);
      }
    },
    onError: (err) => {
      console.error("[OraSage] buyPlan failed:", err.message);
    },
  });

  // ── 监听支付成功信号 ──
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (event.data?.action !== "WP_PAYMENT_SUCCESS") return;
      const incomingOrderId = event.data?.orderId || event.data?.order_id;
      const incomingEmail = event.data?.email || '';
      const incomingName = event.data?.name || '';
      console.log("[OraSage] WP_PAYMENT_SUCCESS received, orderId:", incomingOrderId, "email:", incomingEmail);
      if (incomingOrderId) {
        setState(prev => ({
          ...prev,
          wooOrderId: String(incomingOrderId),
          buyerEmail: incomingEmail,
          buyerName: incomingName,
          unlocked: true,
        }));
      } else {
        console.warn("[OraSage] WP_PAYMENT_SUCCESS received but no orderId in data:", JSON.stringify(event.data));
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  // ── 直接调起支付 ──
  const openDirectPayment = useCallback((plan: PlanType) => {
    const entry = PRODUCT_ID_MAP[plan];
    const pid = (entry ? entry[mode] : 342).toString();
    setState(prev => ({ ...prev, purchasedPlan: plan }));
    window.parent.postMessage({ action: 'OPEN_WP_PAYMENT', productId: pid }, '*');
    try {
      if (window.top && window.top !== window.parent) {
        window.top.postMessage({ action: 'OPEN_WP_PAYMENT', productId: pid }, '*');
      }
    } catch (e) { /* ignore cross-origin */ }
  }, []);

  // ── 方案选择（弹窗模式） ──
  const handlePlanSelect = useCallback((plan: PlanType, orderId?: string) => {
    setState(prev => ({
      ...prev,
      unlocked: true,
      purchasedPlan: plan,
      wooOrderId: orderId ? String(orderId) : prev.wooOrderId,
    }));
    toast.success(`${t('plan.selected_prefix', '已选择')} ${planNameMap[plan] || plan}${t('plan.selected_suffix', '，正在生成报告…')}`);
  }, [t, planNameMap]);

  // ── 报告生成后推送到 WordPress ──
  const pushReportToWordPress = useCallback((params: PushReportParams) => {
    buyPlanMutation.mutate({
      planType: params.planType,
      wooOrderId: params.wooOrderId,
      reportContent: params.reportContent,
      email: state.buyerEmail,
      name: state.buyerName || params.name,
    } as any);
  }, [buyPlanMutation, state.buyerEmail, state.buyerName]);

  // ── 手动设置解锁状态 ──
  const setUnlocked = useCallback((v: boolean) => {
    setState(prev => ({ ...prev, unlocked: v }));
  }, []);

  const setPurchasedPlan = useCallback((plan: PlanType | null) => {
    setState(prev => ({ ...prev, purchasedPlan: plan }));
  }, []);

  const setWooOrderId = useCallback((id: string | null) => {
    setState(prev => ({ ...prev, wooOrderId: id }));
  }, []);

  return {
    ...state,
    openDirectPayment,
    handlePlanSelect,
    pushReportToWordPress,
    setUnlocked,
    setPurchasedPlan,
    setWooOrderId,
  } as const;
}
