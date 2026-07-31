/**
 * Paywall CTA 门槛（T1-04）
 * 不改 SKU/价格/结账函数；仅根据产品加载态决定是否允许进入结账。
 */

import type { PlanType } from "@shared/types";
import type { PlanProductInfo } from "@/lib/plan-products";

export type PaywallFetchStatus = "loading" | "ready" | "error" | "empty";

export function selectedPlanReady(
  status: PaywallFetchStatus,
  plans: PlanProductInfo[],
  selectedPlan: PlanType | null,
): boolean {
  if (status !== "ready") return false;
  if (!selectedPlan) return false;
  const plan = plans.find((p) => p.type === selectedPlan);
  if (!plan) return false;
  if (!plan.priceDisplay?.trim()) return false;
  if (!plan.name?.trim()) return false;
  return true;
}

export function derivePaywallStatus(
  loading: boolean,
  error: boolean,
  plans: PlanProductInfo[],
): PaywallFetchStatus {
  if (loading) return "loading";
  if (error) return "error";
  if (plans.length === 0) return "empty";
  const anyPriced = plans.some((p) => p.priceDisplay?.trim());
  if (!anyPriced) return "error";
  return "ready";
}
