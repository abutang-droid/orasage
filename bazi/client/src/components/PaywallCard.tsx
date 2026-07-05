/**
 * PaywallCard — OraSage 计费方案卡片组件
 *
 * 三档商品卡片：先选中，再点「解锁报告」跳转 shop 结账。
 */

import type { PlanType } from "@shared/types";
import { useEffect, useState } from "react";
import { useT } from "@/lib/i18n";
import { fetchBaziPlanProducts, type PlanProductInfo } from "@/lib/plan-products";
import {
  GOLD, GOLD_LIGHT, HEADING, BODY_CLR, MUTED_CLR, BG_CARD, BG_PAGE, SERIF_F, SANS_F, CARD_BORDER, GOLD_FAINT,
} from "@/theme";

const TIER_KEYS: Record<PlanType, string> = {
  basic: "plan.tier.basic",
  advanced: "plan.tier.advanced",
  premium: "plan.tier.premium",
};

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
        borderRadius: 16,
        padding: "1.25rem 1rem 1rem",
        background: `linear-gradient(180deg, rgba(184,148,63,0.08) 0%, ${BG_PAGE} 100%)`,
        border: `1px solid ${GOLD_FAINT}`,
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
        {t('paywall.choose_tier', '选择报告方案')}
      </p>
      <p style={{ color: MUTED_CLR, fontSize: "0.75rem", textAlign: "center", marginBottom: "0.875rem" }}>
        {mode === "couple" ? t('paywall.couple.subtitle') : t('paywall.subtitle')}
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
        {plans.map((plan, index) => {
          const isSelected = selectedPlan === plan.type;
          const isHighlight = plan.highlight;
          const tierLabel = t(TIER_KEYS[plan.type]);
          const displayName = plan.name || t(`plan.${mode === 'couple' ? 'couple.' : ''}${plan.type}.name`);
          const displayDesc = plan.desc || t(`plan.${mode === 'couple' ? 'couple.' : ''}${plan.type}.desc`);

          return (
            <button
              key={plan.type}
              type="button"
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
                background: isSelected
                  ? `linear-gradient(135deg, rgba(184,148,63,0.14) 0%, ${BG_CARD} 100%)`
                  : BG_CARD,
                border: isSelected
                  ? `2px solid ${GOLD}`
                  : `1px solid ${isHighlight ? GOLD_FAINT : CARD_BORDER}`,
                boxShadow: isSelected
                  ? "0 4px 16px rgba(184,148,63,0.18)"
                  : "0 1px 4px rgba(0,0,0,0.04)",
                transition: "all 0.15s ease",
                cursor: "pointer",
                outline: "none",
              }}
            >
              {/* 选中指示 */}
              <div
                aria-hidden
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  border: `2px solid ${isSelected ? GOLD : CARD_BORDER}`,
                  background: isSelected ? GOLD : "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
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
                    background: isSelected ? "rgba(184,148,63,0.12)" : "rgba(0,0,0,0.04)",
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
                      {t('plan.popular')}
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
              </div>

              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <span style={{
                  color: GOLD,
                  fontFamily: SERIF_F,
                  fontSize: "1.0625rem",
                  fontWeight: 700,
                  whiteSpace: "nowrap",
                }}>
                  {loading ? "…" : plan.priceDisplay}
                </span>
                <p style={{ color: MUTED_CLR, fontSize: "0.625rem", marginTop: "0.125rem" }}>
                  {index === 0 ? "数字报告" : index === 1 ? "报告 + 手串" : "完整礼盒"}
                </p>
              </div>
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
          marginTop: "0.875rem",
          borderRadius: 14,
          padding: "0.875rem 1rem",
          background: selectedPlan
            ? `linear-gradient(135deg, ${GOLD} 0%, ${GOLD_LIGHT} 100%)`
            : "rgba(184,148,63,0.2)",
          color: "#ffffff",
          fontFamily: SERIF_F,
          fontSize: "0.9375rem",
          fontWeight: 700,
          letterSpacing: "0.14em",
          border: "none",
          boxShadow: selectedPlan ? "0 4px 14px rgba(184,148,63,0.35)" : "none",
          cursor: selectedPlan && !payLoading ? "pointer" : "not-allowed",
          opacity: payLoading ? 0.75 : 1,
        }}
      >
        {payLoading
          ? t('paywall.unlocking', '正在解锁…')
          : t('paywall.unlock_report', '解锁报告')}
      </button>
    </div>
  );
}
