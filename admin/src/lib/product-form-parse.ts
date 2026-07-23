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
    if (formData.get(`attachment_clear_${i}`) === 'on') continue;
    const name = String(formData.get(`attachment_name_${i}`) ?? '').trim();
    const url = String(formData.get(`attachment_url_${i}`) ?? '').trim();
    if (name && url) attachments.push({ name, url });
  }
  return attachments.length > 0 ? attachments : null;
}

/** 解析附件：优先新上传文件，其次保留已有 URL */
export async function parseAttachmentsFromFormAsync(
  formData: FormData,
  sku: string,
  uploadFile: (file: File, alt: string) => Promise<string>,
): Promise<Array<{ name: string; url: string }> | null> {
  const attachments: Array<{ name: string; url: string }> = [];
  for (let i = 0; i < 10; i += 1) {
    if (formData.get(`attachment_clear_${i}`) === 'on') continue;

    const name = String(formData.get(`attachment_name_${i}`) ?? '').trim();
    const file = formData.get(`attachment_file_${i}`);
    if (file instanceof File && file.size > 0) {
      const url = await uploadFile(file, name || `${sku} 附件 ${i + 1}`);
      attachments.push({ name: name || file.name, url });
      continue;
    }

    const urlFromForm = String(formData.get(`attachment_url_${i}`) ?? '').trim();
    const existingUrl = String(formData.get(`attachment_existing_url_${i}`) ?? '').trim();
    const url = urlFromForm || existingUrl;
    if (name && url) attachments.push({ name, url });
  }
  return attachments.length > 0 ? attachments : null;
}

type ProductKind = 'standard' | 'digital' | 'service' | 'diy' | 'combo';
type ProductVisibility = 'public' | 'unlisted' | 'app_only';

/**
 * 解析商品表单。
 * 关键：visibility / kind 仅在表单显式提交时写入；缺失时不填默认值，
 * 避免属性/媒体等局部表单 PATCH 把计费商品（app_only）改成 public 暴露到商城目录。
 */
export function parseProductFormPayload(formData: FormData) {
  const sku = String(formData.get('sku') ?? '').trim();
  const name = String(formData.get('name') ?? '').trim();
  const description = String(formData.get('description') ?? '').trim();
  const element = String(formData.get('element') ?? '').trim();
  const material = String(formData.get('material') ?? '').trim();
  const color = String(formData.get('color') ?? '').trim();
  const packaging = String(formData.get('packaging') ?? '').trim();
  const hasCategory = formData.has('category');
  const category = hasCategory
    ? String(formData.get('category') ?? 'crystal').trim()
    : undefined;
  const hasKind = formData.has('kind');
  const kind = hasKind
    ? (String(formData.get('kind') ?? 'standard') as ProductKind)
    : undefined;
  const hasVisibility = formData.has('visibility');
  const visibility = hasVisibility
    ? (String(formData.get('visibility') ?? 'public') as ProductVisibility)
    : undefined;
  const slug = String(formData.get('slug') ?? '').trim();
  const comboUseComponentSum = formData.get('comboUseComponentSum') === '1';
  const comboItemsRaw = String(formData.get('comboItemsJson') ?? '').trim();
  let comboItems: Array<{ componentSku: string; quantity: number }> | undefined;
  if (kind === 'combo' && comboItemsRaw) {
    try {
      const parsed = JSON.parse(comboItemsRaw) as Array<{ componentSku?: string; quantity?: number }>;
      comboItems = parsed
        .filter((item) => item.componentSku?.trim())
        .map((item) => ({
          componentSku: String(item.componentSku).trim(),
          quantity: Math.max(1, Number(item.quantity) || 1),
        }));
    } catch {
      comboItems = undefined;
    }
  }
  // 单一列价：USDT；兼容旧表单 priceYuan/priceUsd
  const hasPriceField =
    formData.has('priceUsdt') || formData.has('priceUsd') || formData.has('priceYuan');
  const priceUsdtRaw = String(formData.get('priceUsdt') ?? formData.get('priceUsd') ?? '').trim();
  const priceYuanRaw = String(formData.get('priceYuan') ?? '').trim();
  let priceCentsUsd: number | null = priceUsdtRaw ? Math.round(Number(priceUsdtRaw) * 100) : null;
  let priceCents = priceYuanRaw ? Math.round(Number(priceYuanRaw) * 100) : 0;
  if (priceCentsUsd != null && priceCentsUsd >= 0) {
    const cnyRate = Number(process.env.CNY_TO_USD_RATE ?? '7.2') || 7.2;
    priceCents = Math.round(priceCentsUsd * cnyRate);
  } else if (priceCents > 0) {
    const cnyRate = Number(process.env.CNY_TO_USD_RATE ?? '7.2') || 7.2;
    priceCentsUsd = Math.max(50, Math.round(priceCents / cnyRate));
  }

  const saleUsdtRaw = String(formData.get('salePriceUsdt') ?? formData.get('salePriceUsd') ?? '').trim();
  const saleYuanRaw = String(formData.get('salePriceYuan') ?? '').trim();
  const saleStartsRaw = String(formData.get('saleStartsAt') ?? '').trim();
  const saleEndsRaw = String(formData.get('saleEndsAt') ?? '').trim();
  let salePriceCentsUsd = saleUsdtRaw ? Math.round(Number(saleUsdtRaw) * 100) : null;
  let salePriceCents = saleYuanRaw ? Math.round(Number(saleYuanRaw) * 100) : null;
  if (salePriceCentsUsd != null && salePriceCentsUsd >= 0) {
    const cnyRate = Number(process.env.CNY_TO_USD_RATE ?? '7.2') || 7.2;
    salePriceCents = Math.round(salePriceCentsUsd * cnyRate);
  }
  const hasSortOrder = formData.has('sortOrder');
  const sortOrder = hasSortOrder ? Number(formData.get('sortOrder') ?? 0) : undefined;
  // 完整商品表单带 active_present；未带则不改上架状态（避免局部表单误下架）
  const hasActiveField = formData.has('active_present') || formData.has('active');
  const active = formData.get('active') === 'on';
  const hasRequiresShipping = formData.has('requiresShipping_present') || formData.has('requiresShipping');
  const requiresShipping =
    kind === 'combo' ? false : formData.get('requiresShipping') === 'on';

  const tagIds = formData
    .getAll('tagIds')
    .map((v) => Number(v))
    .filter((n) => Number.isInteger(n) && n > 0);
  const hasTagIds = formData.has('tagIds') || formData.has('tagIds_present');

  const stockRaw = parseOptionalNumber(formData.get('stock'));

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
    kind,
    visibility,
    comboUseComponentSum: kind === 'combo' ? comboUseComponentSum : undefined,
    comboItems: kind === 'combo' ? comboItems : undefined,
    stock: formData.has('stock')
      ? stockRaw != null && stockRaw >= 0
        ? Math.round(stockRaw)
        : null
      : undefined,
    lowStockAt: formData.has('lowStockAt')
      ? parseOptionalNumber(formData.get('lowStockAt'))
      : undefined,
    slug: formData.has('slug') ? slug || null : undefined,
    seoTitleI18n: parseI18nMapFromForm(formData, 'seo_title_i18n'),
    seoDescI18n: parseI18nMapFromForm(formData, 'seo_desc_i18n'),
    tagIds: hasTagIds ? tagIds : undefined,
    priceCents: hasPriceField ? priceCents : undefined,
    priceCentsUsd: hasPriceField
      ? priceCentsUsd != null && priceCentsUsd >= 0
        ? priceCentsUsd
        : null
      : undefined,
    salePriceCents: formData.has('salePriceUsdt') || formData.has('salePriceUsd') || formData.has('salePriceYuan')
      ? salePriceCents != null && salePriceCents >= 0
        ? salePriceCents
        : null
      : undefined,
    salePriceCentsUsd:
      formData.has('salePriceUsdt') || formData.has('salePriceUsd') || formData.has('salePriceYuan')
        ? salePriceCentsUsd != null && salePriceCentsUsd >= 0
          ? salePriceCentsUsd
          : null
        : undefined,
    saleStartsAt: formData.has('saleStartsAt')
      ? saleStartsRaw
        ? new Date(saleStartsRaw)
        : null
      : undefined,
    saleEndsAt: formData.has('saleEndsAt')
      ? saleEndsRaw
        ? new Date(saleEndsRaw)
        : null
      : undefined,
    sortOrder,
    active: hasActiveField ? active : undefined,
    requiresShipping: (hasRequiresShipping || kind === 'combo') ? requiresShipping : undefined,
  };
}
