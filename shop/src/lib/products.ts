export type ProductCategory = 'crystal' | 'report' | 'service';

export interface Product {
  sku: string;
  name: string;
  element?: string;
  desc: string;
  priceCents: number;
  category: ProductCategory;
}

export const products: Product[] = [
  { sku: 'crystal-wood', name: '绿幽灵手串', element: '木', desc: '招财旺运 · 五行补木', priceCents: 12800, category: 'crystal' },
  { sku: 'crystal-fire', name: '红玛瑙手串', element: '火', desc: '补火平衡 · 增强活力', priceCents: 9800, category: 'crystal' },
  { sku: 'crystal-earth', name: '黄水晶手串', element: '土', desc: '稳固根基 · 聚财守正', priceCents: 10800, category: 'crystal' },
  { sku: 'crystal-metal', name: '白水晶手串', element: '金', desc: '净化能量 · 清晰思绪', priceCents: 8800, category: 'crystal' },
  { sku: 'crystal-water', name: '黑曜石手串', element: '水', desc: '辟邪护身 · 吸收负能量', priceCents: 11800, category: 'crystal' },
  { sku: 'report-bazi', name: '八字深度报告', desc: '完整命盘解析 · PDF 交付', priceCents: 6800, category: 'report' },
  { sku: 'report-ziwei', name: '紫微斗数报告', desc: '十二宫详解 · 流年运势', priceCents: 7800, category: 'report' },
  { sku: 'report-tarot', name: '塔罗深度解读', desc: '牌阵详解 · 行动建议', priceCents: 4800, category: 'report' },
  { sku: 'service-consult', name: '能量咨询 30 分钟', desc: '一对一命理师在线答疑', priceCents: 19800, category: 'service' },
];

export function getProduct(sku: string) {
  return products.find((p) => p.sku === sku) ?? null;
}

export function formatPrice(cents: number) {
  return `¥${(cents / 100).toFixed(2)}`;
}

export const categoryLabels: Record<ProductCategory, string> = {
  crystal: '水晶手串',
  report: '数字报告',
  service: '能量咨询',
};
