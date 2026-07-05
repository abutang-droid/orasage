/**
 * PaywallCard — OraSage 计费方案卡片组件
 *
 * 纵向展示 basic / advanced / premium 三个方案，先选中再点支付。
 */

import type { PlanType } from "@shared/types";
import { useEffect, useState } from "react";
import { useT } from "@/lib/i18n";
import { fetchBaziPlanProducts, type PlanProductInfo } from "@/lib/plan-products";
import {
  GOLD, GOLD_LIGHT, HEADING, BODY_CLR, MUTED_CLR, BG_CARD, BG_PAGE, SERIF_F, SANS_F, CARD_BORDER,
} from "@/theme";

interface PaywallCardProps {
  selectedPlan: PlanType | null;
  onSelectPlan: (planType: PlanType) => void;
  onPay: () => void;
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
  const { t } = useT();
  const [plans, setPlans] = useState<PlanProductInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void fetchBaziPlanProducts(mode).then((list) => {
      if (!cancelled) {
        setPlans(list);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [mode]);

  return (
    <div
      className={className}
      style={{
        borderRadius: 12,
        padding: "1.25rem 1.25rem 1rem",
        background: `linear-gradient(180deg, rgba(184,148,63,0.06) 0%, ${BG_PAGE} 100%)`,
        border: `1px solid ${CARD_BORDER}`,
      }}
    >
      <p style={{ color: MUTED_CLR, fontSize: "0.75rem", textAlign: "center", marginBottom: "0.75rem" }}>
        {t('paywall.subtitle')}
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {plans.map((plan) => {
          const isSelected = selectedPlan === plan.type;
          const isHighlight = plan.highlight;
          return (
            <button
              key={plan.type}
              type="button"
              onClick={() => onSelectPlan(plan.type)}
              style={{
                width: "100%",
                borderRadius: 12,
                padding: "0.75rem 1rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: isSelected ? BG_CARD : isHighlight ? BG_CARD : BG_PAGE,
                border: isSelected
                  ? `2px solid ${GOLD}`
                  : isHighlight
                    ? `1px solid ${GOLD}`
                    : `1px solid ${CARD_BORDER}`,
                transition: "all 0.15s ease",
                cursor: "pointer",
                outline: "none",
              }}
            >
              <div style={{ textAlign: "left" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span
                    style={{
                      color: isHighlight || isSelected ? GOLD_LIGHT : HEADING,
                      fontFamily: SANS_F,
                      fontSize: "0.875rem",
                      fontWeight: 700,
                    }}
                  >
                    {plan.name || t(`plan.${mode === 'couple' ? 'couple.' : ''}${plan.type}.name`)}
                  </span>
                  {isHighlight && (
                    <span
                      style={{
                        background: GOLD,
                        color: "#ffffff",
                        fontFamily: SANS_F,
                        fontSize: "0.625rem",
                        fontWeight: 600,
                        padding: "0.125rem 0.5rem",
                        borderRadius: 999,
                      }}
                    >
                      {t('plan.popular')}
                    </span>
                  )}
                </div>
                <p style={{ color: BODY_CLR, fontSize: "0.75rem", marginTop: "0.25rem" }}>
                  {plan.desc || t(`plan.${mode === 'couple' ? 'couple.' : ''}${plan.type}.desc`)}
                </p>
              </div>
              <span style={{ color: GOLD, fontFamily: SERIF_F, fontSize: "1rem", fontWeight: 700 }}>
                {loading ? '…' : plan.priceDisplay}
              </span>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        disabled={!selectedPlan || payLoading}
        onClick={onPay}
        style={{
          width: "100%",
          marginTop: "0.75rem",
          borderRadius: 12,
          padding: "0.75rem 1rem",
          background: selectedPlan ? GOLD : "rgba(184,148,63,0.25)",
          color: "#ffffff",
          fontFamily: SERIF_F,
          fontSize: "0.875rem",
          fontWeight: 700,
          letterSpacing: "0.12em",
          border: "none",
          cursor: selectedPlan && !payLoading ? "pointer" : "not-allowed",
          opacity: payLoading ? 0.7 : 1,
        }}
      >
        {payLoading ? t('checkout.loading', '正在跳转…') : t('paywall.pay', '去支付')}
      </button>
    </div>
  );
}
