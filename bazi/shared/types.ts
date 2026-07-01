/**
 * Unified type exports
 * Import shared types from this single entry point.
 */

export type * from "../drizzle/schema";
export * from "./_core/errors";

// ─── 付费方案类型 ─────────────────────────────────────────────────────────────

export type PlanType = "basic" | "advanced" | "premium";

export interface PlanOption {
  type: PlanType;
  name: string;
  nameEn: string;
  price: string;
  priceLabel: string;
  description: string;
  features: string[];
  disableFeatures?: string[];
  buttonLabel: string;
  popular?: boolean;
}

export const PLAN_OPTIONS: PlanOption[] = [
  {
    type: "basic",
    name: "OraSage 深度解读",
    nameEn: "Deep Reading",
    price: "9.9",
    priceLabel: "$9.99",
    description: "AI 深度命理解读报告",
    features: [ "AI 深度解读报告（7章节）", "命盘详细分析", "流年大运推演", "PDF 下载" ],
    buttonLabel: "立即购买",
  },
  {
    type: "advanced",
    name: "定制专属能量手串",
    nameEn: "Energy Bracelet",
    price: "99",
    priceLabel: "$99",
    description: "根据五行定制专属手串",
    features: [
      "基础版全部功能",
      "五行定制能量手串",
      "专属能量激活指南",
      "精美礼盒包装",
    ],
    buttonLabel: "立即购买",
    popular: true,
  },
  {
    type: "premium",
    name: "定制终极能量礼盒",
    nameEn: "Ultimate Kit",
    price: "299",
    priceLabel: "$299",
    description: "全套命理能量礼盒",
    features: [
      "进阶版全部功能",
      "终极能量手串（礼盒版）",
      "能量激活指南（精装）",
      "专属命理顾问 1v1",
      "石印章、檀香等配件",
      "红木珍藏礼盒",
    ],
    buttonLabel: "立即购买",
  },
];

/** 双人合盘专用付费方案（包含手串双条） */
export const COUPLE_PLAN_OPTIONS: PlanOption[] = [
  {
    type: "basic",
    name: "双人合盘深度解读",
    nameEn: "Couple Deep Reading",
    price: "9.9",
    priceLabel: "$9.99",
    description: "双人完整合盘解读报告",
    features: [ "双人 AI 合盘报告（7章节）", "五行互补分析", "感情/婚姻详细解读", "PDF 下载" ],
    buttonLabel: "立即购买",
  },
  {
    type: "advanced",
    name: "定制双人能量手串",
    nameEn: "Couple Bracelet Set",
    price: "198",
    priceLabel: "$198",
    description: "为两人各定制一条能量手串",
    features: [
      "基础版全部功能",
      "两条五行定制手串",
      "双人能量激活指南",
      "精美礼盒包装",
    ],
    buttonLabel: "立即购买",
    popular: true,
  },
  {
    type: "premium",
    name: "定制终极能量礼盒（双人版）",
    nameEn: "Ultimate Couple Kit",
    price: "598",
    priceLabel: "$598",
    description: "双人全套命理能量礼盒",
    features: [
      "进阶版全部功能",
      "双条终极能量手串（礼盒版）",
      "双人能量激活指南（精装）",
      "专属命理顾问 1v1",
      "石印章、檀香等配件",
      "红木珍藏礼盒",
    ],
    buttonLabel: "立即购买",
  },
];

// ─── 手串推荐类型 ─────────────────────────────────────────────────────────────

export interface BraceletData {
  wuXing: string;
  material: string;
  spec: string;
  effect: string;
  description: string;
  scene: string;
  energyGuide: string;
}

export interface BraceletRecommendation {
  bracelet: BraceletData;
  reason: string;
  deficiencyWx: string;
  deficiencyCount: number;
}
