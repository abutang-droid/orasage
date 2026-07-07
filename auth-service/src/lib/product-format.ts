import type { products } from "../db/schema.ts";
import {
  currencyForLocale,
  detectShopLocale,
  formatShopPrice,
  resolvePriceCents,
  type ShopCurrency,
} from "../../../shared/shop-locale/index.ts";
import { inferRequiresShipping, inferRequiresWristSize } from "../../../shared/shop-fulfillment/index.ts";

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

export function resolveProductLocale(req?: {
  queryLocale?: string | null;
  acceptLanguage?: string | null;
  cookieLocale?: string | null;
}): string {
  return detectShopLocale(req);
}

export function formatProduct(p: ProductRow, options?: { locale?: string }) {
  const locale = options?.locale ?? "zh-CN";
  const currency: ShopCurrency = currencyForLocale(locale);
  const resolvedCents = resolvePriceCents(
    { priceCents: p.priceCents, priceCentsUsd: p.priceCentsUsd },
    currency,
  );

  return {
    id: p.id,
    sku: p.sku,
    name: p.name,
    element: p.element,
    desc: p.description,
    description: p.description,
    priceCents: p.priceCents,
    priceCentsUsd: p.priceCentsUsd,
    currency,
    priceCentsResolved: resolvedCents,
    priceDisplay: formatShopPrice(resolvedCents, currency),
    priceDisplayCny: formatShopPrice(p.priceCents, "cny"),
    priceDisplayUsd: formatShopPrice(
      resolvePriceCents({ priceCents: p.priceCents, priceCentsUsd: p.priceCentsUsd }, "usd"),
      "usd",
    ),
    category: p.category,
    categoryLabel: CATEGORY_LABELS[p.category] ?? p.category,
    requiresShipping: inferRequiresShipping({
      category: p.category,
      sku: p.sku,
      requiresShipping: p.requiresShipping,
    }),
    requiresWristSize: inferRequiresWristSize({
      category: p.category,
      sku: p.sku,
      requiresShipping: p.requiresShipping,
    }),
    active: p.active,
    sortOrder: p.sortOrder,
    shopUrl: `https://shop.orasage.com/product/${encodeURIComponent(p.sku)}`,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  };
}
