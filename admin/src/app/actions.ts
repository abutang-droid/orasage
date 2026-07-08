'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createProduct, updateProduct, updateOrderStatus, createOrderShipment, saveHomepageProducts, saveBaziRecommendProducts, saveZiweiRecommendProducts, saveTarotBillingSkus, saveTarotDailyRecommendProducts, createDiyBead, updateDiyBead, saveDiyConfig } from '@/lib/api';
import { upsertProductImage } from '@/lib/cms-api';
import { getAdminToken } from '@/lib/auth';

export async function saveProductAction(formData: FormData) {
  const sku = String(formData.get('sku') ?? '').trim();
  const name = String(formData.get('name') ?? '').trim();
  const description = String(formData.get('description') ?? '').trim();
  const element = String(formData.get('element') ?? '').trim();
  const category = String(formData.get('category') ?? 'crystal') as 'crystal' | 'report' | 'service';
  const priceCents = Math.round(Number(formData.get('priceYuan') ?? 0) * 100);
  const priceCentsUsd = Math.round(Number(formData.get('priceUsd') ?? 0) * 100);
  const sortOrder = Number(formData.get('sortOrder') ?? 0);
  const active = formData.get('active') === 'on';
  const requiresShipping = formData.get('requiresShipping') === 'on';
  const isEdit = formData.get('isEdit') === '1';

  if (!sku || !name || !description || priceCents < 0 || priceCentsUsd < 0) {
    throw new Error('请填写完整商品信息');
  }

  const payload = {
    sku,
    name,
    description,
    element: element || null,
    category,
    priceCents,
    priceCentsUsd: priceCentsUsd > 0 ? priceCentsUsd : null,
    sortOrder,
    active,
    requiresShipping,
  };

  if (isEdit) {
    const { sku: _sku, ...patch } = payload;
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
        await upsertProductImage(sku, imageFile, token);
      } catch (err) {
        imageError = err instanceof Error ? err.message : '主图上传失败';
      }
    }
  }

  revalidatePath('/products');
  revalidatePath('/');

  if (imageError) {
    redirect(`/products?image_err=${encodeURIComponent(imageError)}&sku=${encodeURIComponent(sku)}`);
  }
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

const BAZI_ELEMENTS = ['木', '火', '土', '金', '水'] as const;

export async function saveBaziRecommendProductsAction(formData: FormData) {
  const items: Record<string, { sku: string; priceCents: number | null; priceCentsUsd: number | null }> = {};
  for (const element of BAZI_ELEMENTS) {
    const sku = String(formData.get(`bazi_rec_${element}`) ?? '').trim();
    if (!sku) continue;
    const priceYuan = String(formData.get(`bazi_rec_price_cny_${element}`) ?? '').trim();
    const priceUsd = String(formData.get(`bazi_rec_price_usd_${element}`) ?? '').trim();
    items[element] = {
      sku,
      priceCents: priceYuan ? Math.round(Number(priceYuan) * 100) : null,
      priceCentsUsd: priceUsd ? Math.round(Number(priceUsd) * 100) : null,
    };
  }
  await saveBaziRecommendProducts(items);
  revalidatePath('/products');
}

const ZIWEI_REC_SLOTS = 6;

export async function saveZiweiRecommendProductsAction(formData: FormData) {
  const skus: string[] = [];
  for (let i = 0; i < ZIWEI_REC_SLOTS; i += 1) {
    const sku = String(formData.get(`ziwei_rec_${i}`) ?? '').trim();
    if (sku) skus.push(sku);
  }
  let errorMsg: string | null = null;
  try {
    await saveZiweiRecommendProducts(skus);
    revalidatePath('/products');
  } catch (err) {
    errorMsg = err instanceof Error ? err.message : '保存失败';
  }
  if (errorMsg) {
    redirect(`/products?ziwei_rec_err=${encodeURIComponent(errorMsg)}`);
  }
  redirect('/products?ziwei_rec=ok');
}

const TAROT_REC_SLOTS = 6;

const TAROT_BILLING_SKU_FIELDS = [
  { key: 'dailyOverageSku', form: 'tarot_daily_overage_sku', label: '每日运势超额加抽' },
  { key: 'threeCardReportSku', form: 'tarot_three_report_sku', label: '三牌阵 · 仅报告' },
  { key: 'threeCardBundleSku', form: 'tarot_three_bundle_sku', label: '三牌阵 · 报告+法器' },
] as const;

export async function saveTarotBillingConfigAction(formData: FormData) {
  const dailyOverageSku = String(formData.get('tarot_daily_overage_sku') ?? '').trim();
  const threeCardReportSku = String(formData.get('tarot_three_report_sku') ?? '').trim();
  const threeCardBundleSku = String(formData.get('tarot_three_bundle_sku') ?? '').trim();
  const recommendSkus: string[] = [];
  for (let i = 0; i < TAROT_REC_SLOTS; i += 1) {
    const sku = String(formData.get(`tarot_rec_${i}`) ?? '').trim();
    if (sku) recommendSkus.push(sku);
  }
  let errorMsg: string | null = null;
  try {
    if (!dailyOverageSku || !threeCardReportSku || !threeCardBundleSku) {
      throw new Error('请选择三个计费 SKU');
    }
    await saveTarotBillingSkus({ dailyOverageSku, threeCardReportSku, threeCardBundleSku });
    await saveTarotDailyRecommendProducts(recommendSkus);
    revalidatePath('/products');
  } catch (err) {
    errorMsg = err instanceof Error ? err.message : '保存失败';
  }
  if (errorMsg) {
    redirect(`/products?tarot_billing_err=${encodeURIComponent(errorMsg)}`);
  }
  redirect('/products?tarot_billing=ok');
}
