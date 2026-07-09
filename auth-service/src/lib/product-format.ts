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
import { buildProductSpecRows, type ProductSpecRow } from "../../../shared/product-units/index.ts";

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
    materialI18n: p.materialI18n ?? null,
    colorI18n: p.colorI18n ?? null,
    packagingI18n: p.packagingI18n ?? null,
    attachments: p.attachments ?? null,
  };
}

function localizedAttributes(p: ProductRow, locale: string) {
  const material = pickLocalized(p.materialI18n, locale, p.material ?? "");
  const color = pickLocalized(p.colorI18n, locale, p.color ?? "");
  const packaging = pickLocalized(p.packagingI18n, locale, p.packaging ?? "");
  return {
    material: material || null,
    color: color || null,
    packaging: packaging || null,
  };
}

export function formatProduct(p: ProductRow, options?: { locale?: string }) {
  const locale = options?.locale ?? "zh-CN";
  const currency: ShopCurrency = currencyForLocale(locale);
  const resolvedCents = resolvePriceCents(
    { priceCents: p.priceCents, priceCentsUsd: p.priceCentsUsd },
    currency,
  );
  const attrs = localizedAttributes(p, locale);
  const specs: ProductSpecRow[] = buildProductSpecRows(
    {
      ...attrs,
      element: p.element,
      weightGrams: p.weightGrams,
      beadDiameterMm: p.beadDiameterMm,
      wristCmMin: p.wristCmMin,
      wristCmMax: p.wristCmMax,
      lengthMm: p.lengthMm,
    },
    locale,
  );

  return {
    id: p.id,
    sku: p.sku,
    name: pickLocalized(p.nameI18n, locale, p.name),
    element: p.element,
    material: attrs.material,
    color: attrs.color,
    packaging: attrs.packaging,
    weightGrams: p.weightGrams,
    beadDiameterMm: p.beadDiameterMm,
    wristCmMin: p.wristCmMin,
    wristCmMax: p.wristCmMax,
    lengthMm: p.lengthMm,
    attachments: p.attachments ?? [],
    specs,
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
