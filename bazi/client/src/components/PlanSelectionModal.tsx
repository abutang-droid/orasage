import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import type { PlanType } from "@shared/types";
import { PLAN_OPTIONS, COUPLE_PLAN_OPTIONS } from "@shared/types";
import { useT } from "@/lib/i18n";
import { usePriceFetcher } from "@/lib/priceFetcher";

import {
  GOLD, GOLD_LIGHT, GOLD_DIM, GOLD_FAINT, GOLD_GHOST,
  HEADING, BODY_CLR, MUTED_CLR, BG_PAGE, BG_CARD, BORDER_CLR, SERIF_F, SANS_F,
} from "@/theme";

const SERIF = SERIF_F;
const SANS = SANS_F;

interface PlanSelectionModalProps {
  open: boolean;
  onClose: () => void;
  onSelectPlan: (planType: PlanType, orderId?: string) => void;
  mode?: "single" | "couple";
}

export function PlanSelectionModal({ open, onClose, onSelectPlan, mode = "single" }: PlanSelectionModalProps) {
  const { t } = useT();
  const { prices } = usePriceFetcher();
  const [selectedPlan, setSelectedPlan] = useState<PlanType | null>(null);
  const [purchasing, setPurchasing] = useState(false);

  // 根据 mode 选择基础方案数组，并用 fetched prices 合并动态价格
  const baseOptions = mode === "couple" ? COUPLE_PLAN_OPTIONS : PLAN_OPTIONS;
  const displayOptions = useMemo(() => {
    if (!prices) return baseOptions;
    return baseOptions.map(p => ({
      ...p,
      priceLabel: prices[p.type]?.[mode] ?? p.priceLabel,
    }));
  }, [prices, mode, baseOptions]);

  const WP_HOST_DOMAIN = "https://www.c2.pub";
  const WP_HOST_DOMAINS = ["https://www.c2.pub", "https://c2.pub", "http://www.c2.pub"];
  const productIdMap: Record<string, number> = {
    basic: 342,
    advanced: mode === "single" ? 486 : 2226,
    premium: mode === "single" ? 488 : 3591,
  };

  // 监听来自父页面的支付成功信号
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      console.log("[OraSage] postMessage received:", event.data?.action, "origin:", event.origin);

      // 放宽 origin 校验：允许 WordPress 父页面、本域、开发环境
      const allowedHosts = [
        "c2.pub",
        "www.c2.pub",
        window.location.hostname,
      ];
      const originHost = (() => {
        try { return new URL(event.origin).hostname; } catch { return ""; }
      })();
      const isAllowed = allowedHosts.some(h => originHost === h || originHost.endsWith("." + h));
      const isDev = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";

      if (!isAllowed && !isDev && event.origin !== window.location.origin && event.origin !== "null") {
        // "null" origin 常见于 sandboxed iframe，也放行
        console.warn("[OraSage] Ignoring postMessage from unknown origin:", event.origin);
        return;
      }

      if (event.data.action === "WP_PAYMENT_SUCCESS") {
        const orderId = event.data.orderId;
        console.log("[OraSage] WP_PAYMENT_SUCCESS received, orderId:", orderId, "selectedPlan:", selectedPlan, "origin:", event.origin);
        // 先调用后端验证订单
        fetch(`/api/trpc/verifyWooOrder?input=${encodeURIComponent(JSON.stringify({ orderId, planType: selectedPlan }))}`)
          .then(res => res.json())
          .then((data: any) => {
            const result = data?.result?.data ?? data;
            console.log("[OraSage] verifyWooOrder result:", result);
            setPurchasing(false);
            if (result?.verified) {
              toast.success(t('plan.success'), { duration: 3000, position: "top-center" });
            } else {
              toast.error("订单状态：" + (result?.error || "未知"), { duration: 3000 });
            }
            // 把 orderId 传给父组件，用于后续推送报告
            if (selectedPlan) onSelectPlan(selectedPlan, String(orderId));
            onClose();
          })
          .catch((err) => {
            console.error("[OraSage] verifyWooOrder fetch failed:", err);
            setPurchasing(false);
            // 网络错误也不阻塞用户——已支付就应该解锁
            toast.error("订单验证网络异常，但内容已解锁", { duration: 3000 });
            if (selectedPlan) onSelectPlan(selectedPlan, String(orderId));
          })
          .catch((err) => {
            console.error("[OraSage] verifyWooOrder fetch failed:", err);
            setPurchasing(false);
            // 网络错误也不阻塞用户——已支付就应该解锁
            toast.error("订单验证网络异常，但内容已解锁", { duration: 3000 });
            if (selectedPlan) onSelectPlan(selectedPlan, String(orderId));
            onClose();
          });
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [selectedPlan, onSelectPlan, onClose, t]);

  if (!open) return null;

  const handlePurchase = (planType: PlanType) => {
    setSelectedPlan(planType);
    setPurchasing(true);
    const id = (productIdMap[planType] || 342).toString();
    console.log("[OraSage] Sending OPEN_WP_PAYMENT", { action: "OPEN_WP_PAYMENT", productId: id, planType, mode });
    // 发送给 window.parent（WordPress 父页面）
    window.parent.postMessage({ action: "OPEN_WP_PAYMENT", productId: id }, "*");
    // 也发给所有父级 window，确保消息能穿透多层 iframe 嵌套
    try {
      if (window.top && window.top !== window.parent) {
        window.top.postMessage({ action: "OPEN_WP_PAYMENT", productId: id }, "*");
      }
    } catch (e) { /* ignore cross-origin */ }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={onClose}
      style={{
        background: "rgba(14,12,9,0.65)",
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)",
      }}
    >
      {/* ── Modal 主体 ── */}
      <div
        className="flex flex-col w-full mx-auto"
        style={{
          maxWidth: "440px",
          maxHeight: "90vh",
          overflowY: "auto",
          background: BG_CARD,
          borderRadius: "20px",
          border: `1px solid ${BORDER_CLR}`,
          boxShadow: "0 8px 48px rgba(46,41,91,0.15)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 头部 */}
        <div className="flex items-center justify-between px-6 pt-6 pb-2">
          <h2
            className="text-base font-bold tracking-widest"
            style={{ color: HEADING, fontFamily: SERIF, letterSpacing: "0.15em" }}
          >
            {t('paywall.unlock')}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded-full transition-colors"
            style={{ color: MUTED_CLR, background: "transparent" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = GOLD_GHOST; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* 副标题 */}
        <p className="px-6 pb-4 text-xs" style={{ color: MUTED_CLR, letterSpacing: "0.08em" }}>
          {t('paywall.select_plan')}
        </p>

        {/* 分隔线 */}
        <div style={{ height: "1px", background: `linear-gradient(to right, transparent, ${GOLD_FAINT} 30%, ${GOLD_FAINT} 70%, transparent)` }} />

        {/* 方案列表 */}
        <div className="flex flex-col px-5 py-4" style={{ gap: "0.75rem" }}>
          {displayOptions.map((plan) => (
            <div
              key={plan.type}
              className="relative flex flex-col rounded-xl overflow-hidden transition-all duration-200"
              style={{
                border: `1px solid ${selectedPlan === plan.type ? GOLD : GOLD_FAINT}`,
                background: selectedPlan === plan.type ? "rgba(196,160,78,0.04)" : BG_CARD,
                boxShadow: selectedPlan === plan.type
                  ? `0 0 0 1px ${GOLD}, 0 4px 16px rgba(196,160,78,0.12)`
                  : "0 1px 4px rgba(46,41,91,0.04)",
              }}
            >
              {/* Popular 标签 */}
              {plan.popular && (
                <div
                  className="absolute top-0 right-0 px-3 py-1 text-[10px] font-bold tracking-wider"
                  style={{
                    background: `linear-gradient(135deg, ${GOLD} 0%, ${GOLD_LIGHT} 100%)`,
                    color: "#ffffff",
                    borderRadius: "0 0 0 10px",
                    fontFamily: SANS,
                    letterSpacing: "0.12em",
                  }}
                >
                  {t('plan.popular')}
                </div>
              )}

              {/* 卡片内容 */}
              <div className="px-4 py-4">
                {/* 方案名称 + 价格 */}
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-sm font-bold" style={{ color: HEADING, fontFamily: SERIF }}>
                      {plan.name}
                    </h3>
                    <p className="text-[10px] mt-px" style={{ color: MUTED_CLR, letterSpacing: "0.08em" }}>
                      {plan.description}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-black" style={{ color: GOLD }}>{plan.priceLabel}</span>
                  </div>
                </div>

                {/* 特性列表 */}
                <div className="flex flex-col gap-1">
                  {plan.features.map((feat, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      <span className="text-xs" style={{ color: BODY_CLR }}>{feat}</span>
                    </div>
                  ))}
                  {plan.disableFeatures?.map((feat, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="rgba(93,89,115,0.35)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                      <span className="text-xs" style={{ color: MUTED_CLR, textDecoration: "line-through" }}>{feat}</span>
                    </div>
                  ))}
                </div>

                {/* 购买按钮 */}
                <button
                  type="button"
                  disabled={purchasing}
                  onClick={() => handlePurchase(plan.type)}
                  className="w-full mt-3 py-2.5 rounded-lg text-sm font-bold tracking-widest transition-all duration-200 active:scale-[0.98] disabled:opacity-50"
                  style={{
                    background: selectedPlan === plan.type
                      ? `linear-gradient(135deg, ${GOLD} 0%, ${GOLD_LIGHT} 100%)`
                      : GOLD_GHOST,
                    color: selectedPlan === plan.type ? "#FFFFFF" : GOLD_DIM,
                    border: selectedPlan === plan.type ? "none" : `1px solid ${GOLD_FAINT}`,
                    fontFamily: SERIF,
                    letterSpacing: "0.18em",
                    boxShadow: selectedPlan === plan.type
                      ? `0 4px 16px rgba(196,160,78,0.35)`
                      : "none",
                  }}
                >
                  {purchasing && selectedPlan === plan.type ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                      </svg>
                      {t('plan.processing')}
                    </span>
                  ) : (
                    plan.buttonLabel
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* 底部提示 */}
        <div className="px-6 pb-5 flex items-start gap-2">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={MUTED_CLR} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ marginTop: "0.125rem", flexShrink: 0 }}>
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
          <p className="text-[10px] leading-relaxed" style={{ color: MUTED_CLR }}>
            {t('paywall.secure')}
          </p>
        </div>
      </div>
    </div>
  );
}
