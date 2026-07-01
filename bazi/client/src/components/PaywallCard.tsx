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

// ─── 墨金设计令牌 ───
const GOLD      = "#C4A04E";
const GOLD_LIT  = "#D4B86A";
const HEADING   = "#EDE8D8";
const MUTED     = "#6E6858";
const BG_CARD   = "#15122A";
const BORDER    = "rgba(196,160,78,0.18)";
const SANS      = "'Noto Sans SC', 'PingFang SC', sans-serif";
const SERIF     = "'Noto Serif SC', serif";

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
        background: "linear-gradient(180deg, rgba(196,160,78,0.04) 0%, rgba(10,8,21,0.5) 100%)",
        border: "1px solid rgba(196,160,78,0.12)",
      }}
    >
      <p style={{ color: MUTED, fontSize: "0.75rem", textAlign: "center", marginBottom: "0.75rem" }}>
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
              background: plan.highlight ? "#0F0C20" : BG_CARD,
              border: plan.highlight ? `1px solid ${GOLD}` : `1px solid ${BORDER}`,
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
                    color: plan.highlight ? GOLD_LIT : HEADING,
                    fontFamily: SANS,
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
                      color: "#0A0815",
                      fontFamily: SANS,
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
              <p style={{ color: plan.highlight ? "rgba(255,255,255,0.5)" : MUTED, fontSize: "0.75rem", marginTop: "0.25rem" }}>
                {t(plan.descKey)}
              </p>
            </div>
            <span style={{ color: GOLD, fontFamily: SERIF, fontSize: "1rem", fontWeight: 700 }}>
              {plan.price}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
