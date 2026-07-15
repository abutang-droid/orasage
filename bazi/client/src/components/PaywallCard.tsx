/**
 * PaywallCard — OraSage 计费方案卡片组件
 *
 * 三档商品独立卡片：选中态 + 「解锁报告」跳转 shop 结账。
 * T1-04：产品 loading/error/empty/price 未就绪时禁用 CTA。
 */

import type { PlanType } from "@shared/types";
import { useCallback, useEffect, useState } from "react";
import { useT } from "@/lib/i18n";
import { fetchBaziPlanProducts, type PlanProductInfo } from "@/lib/plan-products";
import {
  derivePaywallStatus,
  selectedPlanReady,
  type PaywallFetchStatus,
} from "@/lib/paywall-gating";
import {
  GOLD, GOLD_LIGHT, HEADING, BODY_CLR, MUTED_CLR, SERIF_F, SANS_F,
} from "@/theme";

const TIER_KEYS: Record<PlanType, string> = {
  basic: "plan.tier.basic",
  advanced: "plan.tier.advanced",
  premium: "plan.tier.premium",
};

const TIER_HINTS = ["数字报告", "报告 + 手串", "完整礼盒"] as const;

/** 卡片底色/边框 — 不依赖 surface 变量，确保三档都清晰可见 */
const PLAN_CARD_BG = "rgb(var(--popover))";
const PLAN_CARD_BORDER = "rgba(184, 148, 63, 0.38)";
const PLAN_CARD_BORDER_SELECTED = "rgb(196, 160, 78)";
const PLAN_CARD_BG_SELECTED = "rgba(196, 160, 78, 0.10)";

interface PaywallCardProps {
  selectedPlan: PlanType | null;
  onSelectPlan: (planType: PlanType) => void;
  onPay: (plan?: PlanType) => void;
  payLoading?: boolean;
  mode?: "single" | "couple";
  className?: string;
}

export function PaywallCard({
  selectedPlan,
  onSelectPlan,
  onPay,
  payLoading = false,
  mode = "single",
  className,
}: PaywallCardProps) {
  const { t, locale } = useT();
  const [plans, setPlans] = useState<PlanProductInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [status, setStatus] = useState<PaywallFetchStatus>("loading");

  const loadPlans = useCallback(() => {
    let cancelled = false;
    setLoading(true);
    setFetchError(false);
    setStatus("loading");
    void fetchBaziPlanProducts(mode, locale)
      .then((list) => {
        if (cancelled) return;
        setPlans(list);
        setLoading(false);
        const next = derivePaywallStatus(false, false, list);
        setStatus(next);
        if (next === "error" || next === "empty") setFetchError(true);
      })
      .catch(() => {
        if (cancelled) return;
        setPlans([]);
        setLoading(false);
        setFetchError(true);
        setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [mode, locale]);

  useEffect(() => loadPlans(), [loadPlans]);

  const canCheckout = selectedPlanReady(status, plans, selectedPlan) && !payLoading;

  const statusMessage = (() => {
    if (payLoading) return t("paywall.unlocking", "正在解锁…");
    if (status === "loading") return t("paywall.loading_plans", "正在加载方案价格…");
    if (status === "error" || status === "empty") {
      return t("paywall.plans_error", "方案价格加载失败，请重试");
    }
    if (!selectedPlan) return t("paywall.select_plan", "请先选择方案");
    if (!canCheckout) return t("paywall.price_unavailable", "所选方案价格暂不可用");
    return null;
  })();

  return (
    <div
      className={className}
      data-testid="bazi-paywall"
      style={{
        borderRadius: 16,
        padding: "1.25rem 1rem 1rem",
        background: "linear-gradient(180deg, rgba(184,148,63,0.10) 0%, rgb(var(--popover)) 100%)",
        border: "1px solid rgba(184, 148, 63, 0.32)",
        boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
      }}
    >
      <p style={{
        color: HEADING,
        fontFamily: SERIF_F,
        fontSize: "0.9375rem",
        fontWeight: 700,
        textAlign: "center",
        marginBottom: "0.25rem",
        letterSpacing: "0.06em",
      }}>
        {t("paywall.choose_tier", "选择报告方案")}
      </p>
      <p style={{ color: MUTED_CLR, fontSize: "0.75rem", textAlign: "center", marginBottom: "0.875rem" }}>
        {mode === "couple" ? t("paywall.couple.subtitle") : t("paywall.subtitle")}
      </p>

      <div role="radiogroup" aria-label={t("paywall.choose_tier", "选择报告方案")} style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
        {plans.map((plan, index) => {
          const isSelected = selectedPlan === plan.type;
          const isHighlight = plan.highlight;
          const tierLabel = t(TIER_KEYS[plan.type], plan.type);
          const displayName = plan.name || t(`plan.${mode === "couple" ? "couple." : ""}${plan.type}.name`);
          const displayDesc = plan.desc || t(`plan.${mode === "couple" ? "couple." : ""}${plan.type}.desc`);

          return (
            <button
              key={plan.type}
              type="button"
              role="radio"
              aria-checked={isSelected}
              data-plan={plan.type}
              disabled={status === "loading"}
              onClick={() => onSelectPlan(plan.type)}
              style={{
                width: "100%",
                borderRadius: 14,
                padding: "0.875rem 0.875rem 0.875rem 0.75rem",
                display: "grid",
                gridTemplateColumns: "auto 1fr auto",
                gap: "0.75rem",
                alignItems: "center",
                textAlign: "left",
                background: isSelected ? PLAN_CARD_BG_SELECTED : PLAN_CARD_BG,
                border: isSelected
                  ? `2px solid ${PLAN_CARD_BORDER_SELECTED}`
                  : `1.5px solid ${isHighlight ? PLAN_CARD_BORDER_SELECTED : PLAN_CARD_BORDER}`,
                boxShadow: isSelected
                  ? "0 4px 16px rgba(196,160,78,0.22)"
                  : "0 1px 6px rgba(0,0,0,0.05)",
                transition: "all 0.15s ease",
                cursor: status === "loading" ? "wait" : "pointer",
                outline: "none",
              }}
            >
              <div
                aria-hidden
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  border: `2px solid ${isSelected ? GOLD : PLAN_CARD_BORDER}`,
                  background: isSelected ? GOLD : PLAN_CARD_BG,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  boxSizing: "border-box",
                }}
              >
                {isSelected ? (
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#fff" }} />
                ) : null}
              </div>

              <div style={{ minWidth: 0 }}>
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "0.375rem" }}>
                  <span style={{
                    fontSize: "0.625rem",
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    color: isSelected || isHighlight ? GOLD : MUTED_CLR,
                    background: isSelected ? "rgba(184,148,63,0.16)" : "rgba(184,148,63,0.08)",
                    border: `1px solid ${PLAN_CARD_BORDER}`,
                    padding: "0.125rem 0.5rem",
                    borderRadius: 999,
                    fontFamily: SANS_F,
                  }}>
                    {tierLabel}
                  </span>
                  <span style={{
                    color: isSelected || isHighlight ? GOLD_LIGHT : HEADING,
                    fontFamily: SANS_F,
                    fontSize: "0.875rem",
                    fontWeight: 700,
                  }}>
                    {displayName}
                  </span>
                  {isHighlight ? (
                    <span style={{
                      background: GOLD,
                      color: "#ffffff",
                      fontFamily: SANS_F,
                      fontSize: "0.625rem",
                      fontWeight: 600,
                      padding: "0.125rem 0.5rem",
                      borderRadius: 999,
                    }}>
                      {t("plan.popular")}
                    </span>
                  ) : null}
                </div>
                <p style={{
                  color: BODY_CLR,
                  fontSize: "0.75rem",
                  marginTop: "0.35rem",
                  lineHeight: 1.5,
                }}>
                  {displayDesc}
                </p>
                <p style={{ color: MUTED_CLR, fontSize: "0.625rem", marginTop: "0.25rem" }}>
                  {plan.sku}
                </p>
              </div>

              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <span style={{
                  color: GOLD,
                  fontFamily: SERIF_F,
                  fontSize: "1.0625rem",
                  fontWeight: 700,
                  whiteSpace: "nowrap",
                }}>
                  {loading ? "…" : (plan.priceDisplay || "—")}
                </span>
                <p style={{ color: MUTED_CLR, fontSize: "0.625rem", marginTop: "0.125rem" }}>
                  {TIER_HINTS[index] ?? ""}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {statusMessage ? (
        <p
          role="status"
          aria-live="polite"
          data-testid="bazi-paywall-status"
          style={{
            color: fetchError ? "var(--os-color-status-error, #dc2626)" : MUTED_CLR,
            fontSize: "0.75rem",
            textAlign: "center",
            marginTop: "0.75rem",
          }}
        >
          {statusMessage}
        </p>
      ) : null}

      {fetchError ? (
        <button
          type="button"
          data-testid="bazi-paywall-retry"
          onClick={() => loadPlans()}
          style={{
            width: "100%",
            marginTop: "0.5rem",
            borderRadius: 12,
            padding: "0.625rem 1rem",
            background: "transparent",
            color: HEADING,
            fontFamily: SANS_F,
            fontSize: "0.8125rem",
            fontWeight: 600,
            border: `1px solid ${PLAN_CARD_BORDER}`,
            cursor: "pointer",
          }}
        >
          {t("paywall.retry", "重新加载价格")}
        </button>
      ) : null}

      <button
        type="button"
        data-testid="bazi-paywall-unlock"
        disabled={!canCheckout}
        aria-disabled={!canCheckout}
        onClick={() => {
          if (!canCheckout) return;
          onPay(selectedPlan ?? undefined);
        }}
        style={{
          width: "100%",
          marginTop: "0.875rem",
          borderRadius: 14,
          padding: "0.875rem 1rem",
          background: canCheckout
            ? `linear-gradient(135deg, ${GOLD} 0%, ${GOLD_LIGHT} 100%)`
            : "rgba(184,148,63,0.2)",
          color: "#ffffff",
          fontFamily: SERIF_F,
          fontSize: "0.9375rem",
          fontWeight: 700,
          letterSpacing: "0.14em",
          border: "none",
          boxShadow: canCheckout ? "0 4px 14px rgba(184,148,63,0.35)" : "none",
          cursor: canCheckout ? "pointer" : "not-allowed",
          opacity: payLoading ? 0.75 : 1,
        }}
      >
        {payLoading ? t("paywall.unlocking", "正在解锁…") : t("paywall.unlock", "解锁报告")}
      </button>
    </div>
  );
}
