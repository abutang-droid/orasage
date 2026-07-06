'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createProduct, updateProduct, updateOrderStatus, createOrderShipment, saveHomepageProducts, saveBaziRecommendProducts, saveZiweiRecommendProducts, saveTarotBillingSkus, saveTarotDailyRecommendProducts } from '@/lib/api';

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

  revalidatePath('/products');
  revalidatePath('/');
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
