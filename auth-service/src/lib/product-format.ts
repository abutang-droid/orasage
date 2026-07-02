import type { products } from "../db/schema.ts";

export type ProductRow = typeof products.$inferSelect;

export const ELEMENT_TO_SKU: Record<string, string> = {
  木: "crystal-wood",
  火: "crystal-fire",
  土: "crystal-earth",
  金: "crystal-metal",
  水: "crystal-water",
};

export const CATEGORY_LABELS: Record<string, string> = {
  crystal: "水晶手串",
  report: "数字报告",
  service: "能量咨询",
};

export function formatProduct(p: ProductRow) {
  return {
    id: p.id,
    sku: p.sku,
    name: p.name,
    element: p.element,
    desc: p.description,
    description: p.description,
    priceCents: p.priceCents,
    priceDisplay: `¥${(p.priceCents / 100).toFixed(2)}`,
    category: p.category,
    categoryLabel: CATEGORY_LABELS[p.category] ?? p.category,
    active: p.active,
    sortOrder: p.sortOrder,
    shopUrl: `https://shop.orasage.com?sku=${encodeURIComponent(p.sku)}`,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  };
}
