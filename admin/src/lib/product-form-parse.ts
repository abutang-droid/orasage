import { parseI18nMapFromForm } from './product-i18n-form';

function parseOptionalNumber(raw: FormDataEntryValue | null): number | null {
  const text = String(raw ?? '').trim();
  if (!text) return null;
  const n = Number(text);
  return Number.isFinite(n) ? n : null;
}

function parseAttachmentsFromForm(formData: FormData): Array<{ name: string; url: string }> | null {
  const attachments: Array<{ name: string; url: string }> = [];
  for (let i = 0; i < 10; i += 1) {
    const name = String(formData.get(`attachment_name_${i}`) ?? '').trim();
    const url = String(formData.get(`attachment_url_${i}`) ?? '').trim();
    if (name && url) attachments.push({ name, url });
  }
  return attachments.length > 0 ? attachments : null;
}

export function parseProductFormPayload(formData: FormData) {
  const sku = String(formData.get('sku') ?? '').trim();
  const name = String(formData.get('name') ?? '').trim();
  const description = String(formData.get('description') ?? '').trim();
  const element = String(formData.get('element') ?? '').trim();
  const material = String(formData.get('material') ?? '').trim();
  const color = String(formData.get('color') ?? '').trim();
  const packaging = String(formData.get('packaging') ?? '').trim();
  const category = String(formData.get('category') ?? 'crystal') as 'crystal' | 'report' | 'service';
  const priceCents = Math.round(Number(formData.get('priceYuan') ?? 0) * 100);
  const priceUsdRaw = String(formData.get('priceUsd') ?? '').trim();
  const priceCentsUsd = priceUsdRaw ? Math.round(Number(priceUsdRaw) * 100) : null;
  const sortOrder = Number(formData.get('sortOrder') ?? 0);
  const active = formData.get('active') === 'on';
  const requiresShipping = formData.get('requiresShipping') === 'on';

  return {
    sku,
    name,
    nameI18n: parseI18nMapFromForm(formData, 'name_i18n'),
    description,
    descriptionI18n: parseI18nMapFromForm(formData, 'description_i18n'),
    element: element || null,
    material: material || null,
    materialI18n: parseI18nMapFromForm(formData, 'material_i18n'),
    color: color || null,
    colorI18n: parseI18nMapFromForm(formData, 'color_i18n'),
    weightGrams: parseOptionalNumber(formData.get('weightGrams')),
    beadDiameterMm: parseOptionalNumber(formData.get('beadDiameterMm')),
    wristCmMin: parseOptionalNumber(formData.get('wristCmMin')),
    wristCmMax: parseOptionalNumber(formData.get('wristCmMax')),
    lengthMm: parseOptionalNumber(formData.get('lengthMm')),
    packaging: packaging || null,
    packagingI18n: parseI18nMapFromForm(formData, 'packaging_i18n'),
    attachments: parseAttachmentsFromForm(formData),
    category,
    priceCents,
    priceCentsUsd: priceCentsUsd != null && priceCentsUsd >= 0 ? priceCentsUsd : null,
    sortOrder,
    active,
    requiresShipping,
  };
}
