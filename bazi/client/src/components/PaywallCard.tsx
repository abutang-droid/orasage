/**
 * PaywallCard — OraSage 计费方案卡片组件
 *
 * 纵向展示 basic / advanced / premium 三个方案，点击调用 onPay() 回调。
 * 墨金配色，纯 UI，不含任何业务逻辑。
 *
 * Props:
 *   onPay(planType)  — 点击方案按钮时触发
 *   mode             — "single"（默认）或 "couple"，影响方案名/描述/价格
 *   className        — 可选外部 class
 */

import type { PlanType } from "@shared/types";
import { useMemo } from "react";
import { useT } from "@/lib/i18n";
import { usePriceFetcher } from "@/lib/priceFetcher";
import {
  GOLD, GOLD_LIGHT, HEADING, BODY_CLR, MUTED_CLR, BG_CARD, BG_PAGE, SERIF_F, SANS_F, CARD_BORDER,
} from "@/theme";

interface PlanConfig {
  type: PlanType;
  price: string;
  highlight?: boolean;
  nameKey: string;
  descKey: string;
}

const SINGLE_PLANS: PlanConfig[] = [
  { type: "basic",    price: "", nameKey: "plan.basic.name",    descKey: "plan.basic.desc" },
  { type: "advanced", price: "", nameKey: "plan.advanced.name", descKey: "plan.advanced.desc", highlight: true },
  { type: "premium",  price: "", nameKey: "plan.premium.name",  descKey: "plan.premium.desc" },
];

const COUPLE_PLANS: PlanConfig[] = [
  { type: "basic",    price: "", nameKey: "plan.couple.basic.name",    descKey: "plan.couple.basic.desc" },
  { type: "advanced", price: "", nameKey: "plan.couple.advanced.name", descKey: "plan.couple.advanced.desc", highlight: true },
  { type: "premium",  price: "", nameKey: "plan.couple.premium.name",  descKey: "plan.couple.premium.desc" },
];

interface PaywallCardProps {
  onPay: (planType: PlanType) => void;
  mode?: "single" | "couple";
  className?: string;
}

export function PaywallCard({ onPay, mode = "single", className }: PaywallCardProps) {
  const { t } = useT();
  const { prices, loading } = usePriceFetcher();

  const planList: PlanConfig[] = useMemo(() => {
    const base = mode === "couple" ? COUPLE_PLANS : SINGLE_PLANS;
    if (!prices) return base;
    return base.map(p => ({
      ...p,
      price: prices[p.type]?.[mode] ?? p.price,
    }));
  }, [mode, prices]);

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
        {planList.map((plan) => (
          <button
            key={plan.type}
            type="button"
            onClick={() => onPay(plan.type)}
            style={{
              width: "100%",
              borderRadius: 12,
              padding: "0.75rem 1rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: plan.highlight ? BG_CARD : BG_PAGE,
              border: plan.highlight ? `1px solid ${GOLD}` : `1px solid ${CARD_BORDER}`,
              transition: "all 0.15s ease",
              cursor: "pointer",
              outline: "none",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span
                  style={{
                    color: plan.highlight ? GOLD_LIGHT : HEADING,
                    fontFamily: SANS_F,
                    fontSize: "0.875rem",
                    fontWeight: 700,
                  }}
                >
                  {t(plan.nameKey)}
                </span>
                {plan.highlight && (
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
              <p style={{ color: plan.highlight ? BODY_CLR : MUTED_CLR, fontSize: "0.75rem", marginTop: "0.25rem" }}>
                {t(plan.descKey)}
              </p>
            </div>
            <span style={{ color: GOLD, fontFamily: SERIF_F, fontSize: "1rem", fontWeight: 700 }}>
              {plan.price}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
