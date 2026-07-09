'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createProduct, updateProduct, updateOrderStatus, createOrderShipment, saveHomepageProducts, saveBillingSlotEntries, deleteBillingSlot, saveTagGroup, saveTag, saveCategory, saveProductLinks, createDiyBead, updateDiyBead, saveDiyConfig, updateContactMessage } from '@/lib/api';
import { parseProductFormPayload } from '@/lib/product-form-parse';
import { upsertProductImage } from '@/lib/cms-api';
import { getAdminToken } from '@/lib/auth';

export async function saveProductAction(formData: FormData) {
  const payload = parseProductFormPayload(formData);
  const isEdit = formData.get('isEdit') === '1';

  if (!payload.sku || !payload.name || !payload.description || payload.priceCents < 0) {
    throw new Error('请填写完整商品信息');
  }
  if (payload.kind === 'combo' && (!payload.comboItems || payload.comboItems.length === 0)) {
    throw new Error('组合商品至少选择一个子商品');
  }

  if (isEdit) {
    const { sku, ...patch } = payload;
    await updateProduct(sku, patch);
  } else {
    await createProduct(payload);
  }

  const imageFile = formData.get('image');
  let imageError: string | null = null;
  if (imageFile instanceof File && imageFile.size > 0) {
    const token = await getAdminToken();
    if (!token) {
      imageError = '未登录，主图未上传';
    } else {
      try {
        await upsertProductImage(payload.sku, imageFile, token);
      } catch (err) {
        imageError = err instanceof Error ? err.message : '主图上传失败';
      }
    }
  }

  revalidatePath('/products');
  revalidatePath(`/products/${encodeURIComponent(payload.sku)}/edit`);
  revalidatePath('/');

  const editPath = `/products/${encodeURIComponent(payload.sku)}/edit`;
  if (imageError) {
    redirect(`${editPath}?image_err=${encodeURIComponent(imageError)}`);
  }
  redirect(isEdit ? editPath : '/products');
}

export async function saveDiyBeadAction(formData: FormData) {
  const code = String(formData.get('code') ?? '').trim();
  const name = String(formData.get('name') ?? '').trim();
  const element = String(formData.get('element') ?? '').trim();
  const material = String(formData.get('material') ?? '').trim();
  const beadType = String(formData.get('beadType') ?? 'crystal') as 'crystal' | 'spacer' | 'disc';
  const diameterMm = Number(formData.get('diameterMm') ?? 0);
  const thicknessRaw = String(formData.get('thicknessMm') ?? '').trim();
  const priceCents = Math.round(Number(formData.get('priceYuan') ?? 0) * 100);
  const priceUsdRaw = String(formData.get('priceUsd') ?? '').trim();
  const imageUrl = String(formData.get('imageUrl') ?? '').trim();
  const colors = String(formData.get('colors') ?? '').trim();
  const stock = Number(formData.get('stock') ?? 999);
  const sortOrder = Number(formData.get('sortOrder') ?? 0);
  const active = formData.get('active') === 'on';
  const isEdit = formData.get('isEdit') === '1';

  if (!code || !name || !material || diameterMm <= 0 || priceCents < 0) {
    throw new Error('请填写完整珠子信息');
  }

  const payload = {
    code,
    name,
    element: element || null,
    material,
    beadType,
    diameterMm,
    thicknessMm: beadType === 'disc' && thicknessRaw ? Number(thicknessRaw) : null,
    priceCents,
    priceCentsUsd: priceUsdRaw ? Math.round(Number(priceUsdRaw) * 100) : null,
    imageUrl: imageUrl || null,
    colors: colors || null,
    stock: Number.isFinite(stock) ? stock : 999,
    sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0,
    active,
  };

  let errorMsg: string | null = null;
  try {
    if (isEdit) {
      const { code: _code, ...patch } = payload;
      await updateDiyBead(code, patch);
    } else {
      await createDiyBead(payload);
    }
    revalidatePath('/beads');
  } catch (err) {
    errorMsg = err instanceof Error ? err.message : '保存失败';
  }
  if (errorMsg) {
    redirect(`/beads?bead_err=${encodeURIComponent(errorMsg)}`);
  }
  redirect('/beads?bead=ok');
}

export async function saveDiyConfigAction(formData: FormData) {
  const lengthCorrectionMm = Number(formData.get('lengthCorrectionMm') ?? 3);
  const minOrderYuan = Number(formData.get('minOrderYuan') ?? 99);
  const fitToleranceMm = Number(formData.get('fitToleranceMm') ?? 8);
  const wristEaseMm = Number(formData.get('wristEaseMm') ?? 10);

  let errorMsg: string | null = null;
  try {
    await saveDiyConfig({
      lengthCorrectionMm,
      minOrderCents: Math.round(minOrderYuan * 100),
      fitToleranceMm,
      wristEaseMm,
    });
    revalidatePath('/beads');
  } catch (err) {
    errorMsg = err instanceof Error ? err.message : '保存失败';
  }
  if (errorMsg) {
    redirect(`/beads?config_err=${encodeURIComponent(errorMsg)}`);
  }
  redirect('/beads?config=ok');
}

export async function updateOrderStatusAction(formData: FormData) {
  const orderNo = String(formData.get('orderNo') ?? '');
  const status = String(formData.get('status') ?? '');
  if (!orderNo || !status) throw new Error('参数不完整');
  await updateOrderStatus(orderNo, status);
  revalidatePath('/orders');
  revalidatePath('/');
}

export async function updateContactMessageAction(formData: FormData) {
  const id = Number(formData.get('id') ?? 0);
  const status = String(formData.get('status') ?? '').trim();
  const adminNote = String(formData.get('adminNote') ?? '').trim();
  if (!Number.isInteger(id) || id <= 0 || !status) throw new Error('参数不完整');
  await updateContactMessage(id, { status, adminNote });
  revalidatePath('/messages');
}

export async function createShipmentAction(formData: FormData) {
  const orderNo = String(formData.get('orderNo') ?? '');
  const carrier = String(formData.get('carrier') ?? '').trim();
  const trackingNo = String(formData.get('trackingNo') ?? '').trim();
  const note = String(formData.get('note') ?? '').trim();
  if (!orderNo || !carrier || !trackingNo) throw new Error('请填写承运商与运单号');
  await createOrderShipment(orderNo, { carrier, trackingNo, note: note || undefined });
  revalidatePath('/orders');
  revalidatePath('/');
}

export async function saveHomepageProductsAction(formData: FormData) {
  const skus: string[] = [];
  for (let i = 0; i < 6; i += 1) {
    const sku = String(formData.get(`slot_${i}`) ?? '').trim();
    if (sku) skus.push(sku);
  }
  await saveHomepageProducts(skus);
  revalidatePath('/products');
}

/* ── 应用计费槽位（R6）────────────────────────────── */

const SLOT_ENTRY_ROWS = 6;

export async function saveBillingSlotAction(formData: FormData) {
  const app = String(formData.get('app') ?? '').trim();
  const key = String(formData.get('key') ?? '').trim();
  if (!app || !key) throw new Error('缺少 app 或 key');

  const entries: Array<{
    sku: string;
    priceOverrideCents: number | null;
    priceOverrideUsdCents: number | null;
  }> = [];
  for (let i = 0; i < SLOT_ENTRY_ROWS; i += 1) {
    const sku = String(formData.get(`entry_sku_${i}`) ?? '').trim();
    if (!sku) continue;
    const cny = String(formData.get(`entry_cny_${i}`) ?? '').trim();
    const usd = String(formData.get(`entry_usd_${i}`) ?? '').trim();
    entries.push({
      sku,
      priceOverrideCents: cny ? Math.round(Number(cny) * 100) : null,
      priceOverrideUsdCents: usd ? Math.round(Number(usd) * 100) : null,
    });
  }

  let errorMsg: string | null = null;
  try {
    await saveBillingSlotEntries(app, key, entries);
    revalidatePath('/billing');
  } catch (err) {
    errorMsg = err instanceof Error ? err.message : '保存失败';
  }
  if (errorMsg) {
    redirect(`/billing?err=${encodeURIComponent(errorMsg)}`);
  }
  redirect('/billing?saved=ok');
}

export async function deleteBillingSlotAction(formData: FormData) {
  const app = String(formData.get('app') ?? '').trim();
  const key = String(formData.get('key') ?? '').trim();
  if (!app || !key) throw new Error('缺少 app 或 key');
  await deleteBillingSlot(app, key);
  revalidatePath('/billing');
  redirect('/billing?saved=ok');
}

/* ── 标签与分类（R2 / Q3）──────────────────────────── */

const I18N_LOCALES = ['zh-CN', 'zh-TW', 'en', 'pt-BR'] as const;

function labelI18nFromForm(formData: FormData, prefix: string): Record<string, string> {
  const map: Record<string, string> = {};
  for (const code of I18N_LOCALES) {
    const value = String(formData.get(`${prefix}_${code}`) ?? '').trim();
    if (value) map[code] = value;
  }
  return map;
}

export async function saveTagGroupAction(formData: FormData) {
  const code = String(formData.get('code') ?? '').trim();
  const labelI18n = labelI18nFromForm(formData, 'label');
  if (!code || !labelI18n['zh-CN']) throw new Error('请填写编码与中文名');
  const sortOrder = Number(formData.get('sortOrder') ?? 0);
  await saveTagGroup({ code, labelI18n, sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0 });
  revalidatePath('/shop/tags');
  redirect('/shop/tags?saved=ok');
}

export async function saveTagAction(formData: FormData) {
  const groupId = Number(formData.get('groupId') ?? 0);
  const code = String(formData.get('code') ?? '').trim();
  const labelI18n = labelI18nFromForm(formData, 'label');
  if (!groupId || !code || !labelI18n['zh-CN']) throw new Error('请填写分组、编码与中文名');
  const sortOrder = Number(formData.get('sortOrder') ?? 0);
  const active = formData.get('active') === 'on';
  await saveTag({
    groupId,
    code,
    labelI18n,
    sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0,
    active,
  });
  revalidatePath('/shop/tags');
  redirect('/shop/tags?saved=ok');
}

export async function saveCategoryAction(formData: FormData) {
  const code = String(formData.get('code') ?? '').trim();
  const labelI18n = labelI18nFromForm(formData, 'label');
  if (!code || !labelI18n['zh-CN']) throw new Error('请填写编码与中文名');
  const sortOrder = Number(formData.get('sortOrder') ?? 0);
  const active = formData.get('active') === 'on';
  await saveCategory({
    code,
    labelI18n,
    sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0,
    active,
  });
  revalidatePath('/shop/categories');
  revalidatePath('/products');
  redirect('/shop/categories?saved=ok');
}

/* ── 商品关联页面（R5）──────────────────────────────── */

const LINK_ROWS = 8;

export async function saveProductLinksAction(formData: FormData) {
  const sku = String(formData.get('sku') ?? '').trim();
  if (!sku) throw new Error('缺少 SKU');
  const links: Array<{
    kind: string;
    title: string;
    url: string;
    sourceName?: string | null;
    locale?: string | null;
  }> = [];
  for (let i = 0; i < LINK_ROWS; i += 1) {
    const title = String(formData.get(`link_title_${i}`) ?? '').trim();
    const url = String(formData.get(`link_url_${i}`) ?? '').trim();
    if (!title || !url) continue;
    links.push({
      kind: String(formData.get(`link_kind_${i}`) ?? 'media').trim() || 'media',
      title,
      url,
      sourceName: String(formData.get(`link_source_${i}`) ?? '').trim() || null,
      locale: String(formData.get(`link_locale_${i}`) ?? '').trim() || null,
    });
  }
  await saveProductLinks(sku, links);
  revalidatePath(`/products/${encodeURIComponent(sku)}/edit`);
  redirect(`/products/${encodeURIComponent(sku)}/edit?links=ok`);
}
