import { describe, expect, it } from "vitest";
import { derivePaywallStatus, selectedPlanReady } from "./paywall-gating";
import type { PlanProductInfo } from "./plan-products";

const priced: PlanProductInfo[] = [
  { type: "basic", sku: "report-bazi-basic", name: "基础", desc: "", priceDisplay: "¥68" },
  { type: "advanced", sku: "report-bazi-advanced", name: "进阶", desc: "", priceDisplay: "¥168", highlight: true },
  { type: "premium", sku: "report-bazi-premium", name: "尊享", desc: "", priceDisplay: "¥298" },
];

describe("paywall gating (T1-04)", () => {
  it("loading 时 CTA 不可用", () => {
    expect(selectedPlanReady("loading", priced, "advanced")).toBe(false);
  });

  it("plans 为空时不可用", () => {
    expect(selectedPlanReady("empty", [], "advanced")).toBe(false);
    expect(derivePaywallStatus(false, false, [])).toBe("empty");
  });

  it("请求失败时不可用", () => {
    expect(selectedPlanReady("error", priced, "advanced")).toBe(false);
  });

  it("所选 SKU 不在列表时不可用", () => {
    expect(selectedPlanReady("ready", priced.slice(0, 1), "advanced")).toBe(false);
  });

  it("价格为空时不可用", () => {
    const noPrice = priced.map((p) => ({ ...p, priceDisplay: "" }));
    expect(selectedPlanReady("ready", noPrice, "advanced")).toBe(false);
    expect(derivePaywallStatus(false, false, noPrice)).toBe("error");
  });

  it("就绪且选中方案有名称与价格时可用", () => {
    expect(selectedPlanReady("ready", priced, "advanced")).toBe(true);
    expect(derivePaywallStatus(false, false, priced)).toBe("ready");
  });
});
