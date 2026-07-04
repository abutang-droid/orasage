export type ProductFulfillment = {
  category: string;
  sku: string;
  requiresShipping?: boolean | null;
};

/** 实体商品是否需要收货地址（DB 字段优先，否则按分类/SKU 推断） */
export function inferRequiresShipping(product: ProductFulfillment): boolean {
  if (product.requiresShipping != null) return product.requiresShipping;
  if (product.category === 'crystal') return true;
  if (product.category === 'service') return false;
  if (/-advanced$|-premium$/.test(product.sku)) return true;
  return false;
}

/** 手串类商品需填写手腕周长 */
export function inferRequiresWristSize(product: ProductFulfillment): boolean {
  if (!inferRequiresShipping(product)) return false;
  return product.category === 'crystal' || product.sku.includes('-advanced');
}

export type ShippingRecipient = {
  name: string;
  phone: string;
  address: string;
  wristCm?: string;
};

export type ShippingPayload = {
  recipients: ShippingRecipient[];
};

export function formatShippingAddress(payload: ShippingPayload): string {
  return JSON.stringify(payload);
}

export function parseShippingAddress(raw: string | null | undefined): ShippingPayload | null {
  if (!raw?.trim()) return null;
  try {
    const parsed = JSON.parse(raw) as ShippingPayload;
    if (Array.isArray(parsed.recipients) && parsed.recipients.length > 0) {
      return parsed;
    }
  } catch {
    // legacy plain-text address
    return {
      recipients: [{ name: '', phone: '', address: raw.trim() }],
    };
  }
  return null;
}

export function formatShippingDisplay(raw: string | null | undefined): string {
  const payload = parseShippingAddress(raw);
  if (!payload) return '';
  return payload.recipients
    .map((r, i) => {
      const parts = [
        r.name,
        r.phone,
        r.address,
        r.wristCm ? `手腕 ${r.wristCm}cm` : '',
      ].filter(Boolean);
      const label = payload.recipients.length > 1 ? `第${i + 1}位: ` : '';
      return label + parts.join(' · ');
    })
    .join(' | ');
}

export function validateShippingPayload(
  payload: ShippingPayload,
  options: { requireWrist?: boolean; recipientCount?: number },
): string | null {
  const count = options.recipientCount ?? 1;
  if (payload.recipients.length < count) {
    return `请填写 ${count} 位收货人信息`;
  }
  for (let i = 0; i < count; i += 1) {
    const r = payload.recipients[i];
    const prefix = count > 1 ? `第${i + 1}位` : '';
    if (!r.name?.trim()) return prefix ? `${prefix}请填写收货人姓名` : '请填写收货人姓名';
    if (!r.phone?.trim()) return prefix ? `${prefix}请填写联系电话` : '请填写联系电话';
    if (!r.address?.trim()) return prefix ? `${prefix}请填写收货地址` : '请填写收货地址';
    if (options.requireWrist && !r.wristCm?.trim()) {
      return prefix ? `${prefix}请填写手腕周长` : '请填写手腕周长';
    }
  }
  return null;
}
