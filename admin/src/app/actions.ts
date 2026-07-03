'use server';

import { revalidatePath } from 'next/cache';
import { createProduct, updateProduct, updateOrderStatus, saveHomepageProducts } from '@/lib/api';

export async function saveProductAction(formData: FormData) {
  const sku = String(formData.get('sku') ?? '').trim();
  const name = String(formData.get('name') ?? '').trim();
  const description = String(formData.get('description') ?? '').trim();
  const element = String(formData.get('element') ?? '').trim();
  const category = String(formData.get('category') ?? 'crystal') as 'crystal' | 'report' | 'service';
  const priceCents = Math.round(Number(formData.get('priceYuan') ?? 0) * 100);
  const sortOrder = Number(formData.get('sortOrder') ?? 0);
  const active = formData.get('active') === 'on';
  const isEdit = formData.get('isEdit') === '1';

  if (!sku || !name || !description || priceCents < 0) {
    throw new Error('请填写完整商品信息');
  }

  const payload = {
    sku,
    name,
    description,
    element: element || null,
    category,
    priceCents,
    sortOrder,
    active,
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

export async function saveHomepageProductsAction(formData: FormData) {
  const skus: string[] = [];
  for (let i = 0; i < 6; i += 1) {
    const sku = String(formData.get(`slot_${i}`) ?? '').trim();
    if (sku) skus.push(sku);
  }
  await saveHomepageProducts(skus);
  revalidatePath('/products');
}
