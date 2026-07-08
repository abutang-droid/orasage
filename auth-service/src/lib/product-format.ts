import type { products } from "../db/schema.ts";
import {
  currencyForLocale,
  detectShopLocale,
  formatShopPrice,
  resolvePriceCents,
  type ShopCurrency,
} from "../../../shared/shop-locale/index.ts";
import { inferRequiresShipping, inferRequiresWristSize } from "../../../shared/shop-fulfillment/index.ts";
import { pickLocalized } from "./product-i18n.ts";

export type ProductRow = typeof products.$inferSelect;

export const ELEMENT_TO_SKU: Record<string, string> = {
  木: "crystal-wood",
  火: "crystal-fire",
  土: "crystal-earth",
  金: "crystal-metal",
  水: "crystal-water",
};

export const CATEGORY_LABELS: Record<string, Record<string, string>> = {
  crystal: {
    "zh-CN": "水晶手串",
    "zh-TW": "水晶手串",
    en: "Crystal Bracelets",
    "pt-BR": "Pulseiras de Cristal",
  },
  report: {
    "zh-CN": "数字报告",
    "zh-TW": "數位報告",
    en: "Digital Reports",
    "pt-BR": "Relatórios Digitais",
  },
  service: {
    "zh-CN": "能量咨询",
    "zh-TW": "能量諮詢",
    en: "Energy Consultations",
    "pt-BR": "Consultas de Energia",
  },
};

function categoryLabel(category: string, locale: string): string {
  const labels = CATEGORY_LABELS[category];
  if (!labels) return category;
  const norm = detectShopLocale({ queryLocale: locale });
  return labels[norm] ?? labels["zh-CN"] ?? labels.en ?? category;
}

export function resolveProductLocale(req?: {
  queryLocale?: string | null;
  acceptLanguage?: string | null;
  cookieLocale?: string | null;
}): string {
  return detectShopLocale(req);
}

export function formatAdminProduct(p: ProductRow) {
  const base = formatProduct(p);
  return {
    ...base,
    nameI18n: p.nameI18n ?? null,
    descriptionI18n: p.descriptionI18n ?? null,
  };
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
    name: pickLocalized(p.nameI18n, locale, p.name),
    element: p.element,
    desc: pickLocalized(p.descriptionI18n, locale, p.description),
    description: pickLocalized(p.descriptionI18n, locale, p.description),
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
    categoryLabel: categoryLabel(p.category, locale),
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
