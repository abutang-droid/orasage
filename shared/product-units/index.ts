/** 商品物理量：数据库存公制，前台按 locale 格式化展示 */

import { normalizeShopLocale } from '../shop-locale/index.ts';

export type ProductDimensions = {
  weightGrams?: number | null;
  beadDiameterMm?: number | null;
  wristCmMin?: number | null;
  wristCmMax?: number | null;
  lengthMm?: number | null;
};

export type ProductSpecRow = {
  key: string;
  label: string;
  value: string;
};

const METRIC_LOCALES = new Set(['zh-cn', 'zh-tw', 'zh']);

function normLocale(locale: string): string {
  return normalizeShopLocale(locale).toLowerCase();
}

/** 中文系用公制为主；en/pt-BR 附英制换算 */
export function usesImperialSecondary(locale: string): boolean {
  const norm = normLocale(locale);
  return !METRIC_LOCALES.has(norm) && !norm.startsWith('zh-');
}

function ozFromGrams(grams: number): number {
  return grams / 28.3495;
}

function inchesFromMm(mm: number): number {
  return mm / 25.4;
}

function inchesFromCm(cm: number): number {
  return cm / 2.54;
}

function fmtNum(n: number, digits: number): string {
  const rounded = Number(n.toFixed(digits));
  return String(rounded);
}

export function formatWeightGrams(grams: number | null | undefined, locale: string): string | null {
  if (grams == null || grams <= 0) return null;
  const base = `${grams} g`;
  if (!usesImperialSecondary(locale)) return base;
  return `${base} (${fmtNum(ozFromGrams(grams), 1)} oz)`;
}

export function formatLengthMm(mm: number | null | undefined, locale: string): string | null {
  if (mm == null || mm <= 0) return null;
  const base = `${fmtNum(mm, mm >= 10 ? 0 : 1)} mm`;
  if (!usesImperialSecondary(locale)) return base;
  return `${base} (${fmtNum(inchesFromMm(mm), 2)} in)`;
}

export function formatWristRangeCm(
  min: number | null | undefined,
  max: number | null | undefined,
  locale: string,
): string | null {
  if (min == null && max == null) return null;
  if (min != null && max != null && min > 0 && max > 0) {
    const base = `${fmtNum(min, 1)}–${fmtNum(max, 1)} cm`;
    if (!usesImperialSecondary(locale)) return base;
    return `${base} (${fmtNum(inchesFromCm(min), 1)}–${fmtNum(inchesFromCm(max), 1)} in)`;
  }
  const single = min ?? max;
  if (single == null || single <= 0) return null;
  const base = `${fmtNum(single, 1)} cm`;
  if (!usesImperialSecondary(locale)) return base;
  return `${base} (${fmtNum(inchesFromCm(single), 1)} in)`;
}

const SPEC_LABELS: Record<string, Record<string, string>> = {
  material: { 'zh-CN': '材质', 'zh-TW': '材質', en: 'Material', 'pt-BR': 'Material' },
  color: { 'zh-CN': '颜色', 'zh-TW': '顏色', en: 'Color', 'pt-BR': 'Cor' },
  element: { 'zh-CN': '五行', 'zh-TW': '五行', en: 'Element', 'pt-BR': 'Elemento' },
  weight: { 'zh-CN': '重量', 'zh-TW': '重量', en: 'Weight', 'pt-BR': 'Peso' },
  beadDiameter: { 'zh-CN': '珠径', 'zh-TW': '珠徑', en: 'Bead size', 'pt-BR': 'Diâmetro da conta' },
  wrist: { 'zh-CN': '适合腕围', 'zh-TW': '適合腕圍', en: 'Wrist fit', 'pt-BR': 'Circunferência do pulso' },
  length: { 'zh-CN': '链长', 'zh-TW': '鏈長', en: 'Length', 'pt-BR': 'Comprimento' },
  packaging: { 'zh-CN': '包装', 'zh-TW': '包裝', en: 'Packaging', 'pt-BR': 'Embalagem' },
};

function specLabel(key: keyof typeof SPEC_LABELS, locale: string): string {
  const norm = normalizeShopLocale(locale);
  return SPEC_LABELS[key][norm] ?? SPEC_LABELS[key].en ?? key;
}

export type ProductSpecInput = ProductDimensions & {
  material?: string | null;
  color?: string | null;
  element?: string | null;
  packaging?: string | null;
};

/** 将结构化字段转为 PDP 规格行（CMS specList 缺失时的兜底） */
export function buildProductSpecRows(input: ProductSpecInput, locale: string): ProductSpecRow[] {
  const rows: ProductSpecRow[] = [];

  if (input.material?.trim()) {
    rows.push({ key: 'material', label: specLabel('material', locale), value: input.material.trim() });
  }
  if (input.color?.trim()) {
    rows.push({ key: 'color', label: specLabel('color', locale), value: input.color.trim() });
  }
  if (input.element?.trim()) {
    rows.push({ key: 'element', label: specLabel('element', locale), value: input.element.trim() });
  }

  const weight = formatWeightGrams(input.weightGrams, locale);
  if (weight) rows.push({ key: 'weight', label: specLabel('weight', locale), value: weight });

  const bead = formatLengthMm(input.beadDiameterMm, locale);
  if (bead) rows.push({ key: 'beadDiameter', label: specLabel('beadDiameter', locale), value: bead });

  const wrist = formatWristRangeCm(input.wristCmMin, input.wristCmMax, locale);
  if (wrist) rows.push({ key: 'wrist', label: specLabel('wrist', locale), value: wrist });

  const length = formatLengthMm(input.lengthMm, locale);
  if (length) rows.push({ key: 'length', label: specLabel('length', locale), value: length });

  if (input.packaging?.trim()) {
    rows.push({ key: 'packaging', label: specLabel('packaging', locale), value: input.packaging.trim() });
  }

  return rows;
}

/** 运费估算辅助：超重国际件附加费（分）；国内仍按 shop-fulfillment flat rate */
export function weightShippingSurchargeCents(
  weightGrams: number | null | undefined,
  countryCode: string,
): number {
  const code = (countryCode || 'CN').toUpperCase();
  const domestic = code === 'CN' || code === 'HK' || code === 'MO' || code === 'TW';
  if (domestic || !weightGrams || weightGrams <= 500) return 0;
  const blocks = Math.ceil((weightGrams - 500) / 500);
  return blocks * 500;
}
